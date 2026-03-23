import { z } from 'zod';

// ─── Schema ──────────────────────────────────────────────────

export const computedFieldSchema = z.object({
  name: z.string(),
  type: z.enum(['ratio', 'running_total', 'pct_of_total']),
  field: z.string().nullable(),
  numerator: z.string().nullable(),
  denominator: z.string().nullable(),
});

export type ComputedField = z.infer<typeof computedFieldSchema>;

export const dataQuerySchema = z.object({
  source: z.literal('projects'),
  filter: z
    .record(z.string(), z.union([z.string(), z.array(z.string())]))
    .nullable(),
  groupBy: z.string(),
  aggregate: z.enum(['count', 'sum', 'avg', 'min', 'max']),
  valueField: z.string().nullable(),
  sort: z.enum(['asc', 'desc']).nullable(),
  limit: z.number().nullable(),
  computedFields: z.array(computedFieldSchema).nullable(),
});

export type DataQuery = z.infer<typeof dataQuerySchema>;

// ─── Engine ──────────────────────────────────────────────────

type Row = Record<string, unknown>;

function matchesFilter(
  row: Row,
  filter: Record<string, string | string[]>
): boolean {
  for (const [field, value] of Object.entries(filter)) {
    const cell = String(row[field] ?? '');
    if (Array.isArray(value)) {
      if (!value.includes(cell)) return false;
    } else {
      if (cell !== value) return false;
    }
  }
  return true;
}

function deriveField(row: Row, field: string): string {
  const val = row[field];
  // Support "CoD:year" syntax for date grouping
  if (field.includes(':')) {
    const [base, transform] = field.split(':');
    const raw = String(row[base] ?? '');
    if (transform === 'year' && raw.includes('-')) return raw.split('-')[0];
    if (transform === 'quarter' && raw.includes('-')) {
      const month = parseInt(raw.split('-')[1], 10);
      return `Q${Math.ceil(month / 3)}`;
    }
    return raw;
  }
  return String(val ?? 'unknown');
}

export interface ResolvedChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string | string[] | null;
    borderColor: string | string[] | null;
    borderWidth: number | null;
    fill: boolean | null;
    type?: 'bar' | 'line' | null;
    borderDash?: number[] | null;
  }[];
}

const PALETTE = [
  'rgba(59,130,246,0.8)', // blue
  'rgba(249,115,22,0.8)', // orange
  'rgba(34,197,94,0.8)', // green
  'rgba(139,92,246,0.8)', // violet
  'rgba(244,63,94,0.8)', // rose
  'rgba(245,158,11,0.8)', // amber
  'rgba(14,165,233,0.8)', // sky
  'rgba(168,85,247,0.8)', // purple
  'rgba(236,72,153,0.8)', // pink
  'rgba(20,184,166,0.8)', // teal
];

export function resolveMultiQuery(
  data: Row[],
  queries: DataQuery[],
  datasetLabels?: string[]
): ResolvedChartData {
  const perQuery = queries.map((q, i) =>
    resolveQuery(data, q, datasetLabels?.[i])
  );

  // Merge labels: union preserving order from the first query
  const labelSet = new Set<string>();
  const mergedLabels: string[] = [];
  for (const resolved of perQuery) {
    for (const label of resolved.labels) {
      if (!labelSet.has(label)) {
        labelSet.add(label);
        mergedLabels.push(label);
      }
    }
  }

  // Build one dataset per query, aligned to mergedLabels with 0 for missing
  const datasets: ResolvedChartData['datasets'] = perQuery.map(
    (resolved, i) => {
      const labelToValue = new Map<string, number>();
      resolved.labels.forEach((label, idx) => {
        labelToValue.set(label, resolved.datasets[0]?.data[idx] ?? 0);
      });

      const alignedData = mergedLabels.map(l => labelToValue.get(l) ?? 0);
      const color = PALETTE[i % PALETTE.length];

      return {
        label: resolved.datasets[0]?.label ?? `Series ${i + 1}`,
        data: alignedData,
        backgroundColor: color,
        borderColor: color,
        borderWidth: null,
        fill: null,
      };
    }
  );

  return { labels: mergedLabels, datasets };
}

function aggregateValues(vals: number[], aggregate: DataQuery['aggregate']): number {
  switch (aggregate) {
    case 'count':
      return vals.length;
    case 'sum':
      return vals.reduce((a, b) => a + b, 0);
    case 'avg':
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    case 'min':
      return Math.min(...vals);
    case 'max':
      return Math.max(...vals);
  }
}

function aggregateField(
  rows: Row[],
  groupBy: string,
  fieldName: string,
  aggregate: DataQuery['aggregate']
): Map<string, number> {
  const groups = new Map<string, number[]>();
  for (const row of rows) {
    const key = deriveField(row, groupBy);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(Number(row[fieldName] ?? 0));
  }
  const result = new Map<string, number>();
  for (const [key, vals] of groups) {
    result.set(key, aggregateValues(vals, aggregate));
  }
  return result;
}

function applyComputedFields(
  entries: [string, number][],
  computedFields: ComputedField[],
  rows: Row[],
  query: DataQuery
): [string, number][] {
  let result = entries;

  for (const cf of computedFields) {
    switch (cf.type) {
      case 'ratio': {
        const numField = cf.numerator;
        const denField = cf.denominator;
        if (!numField || !denField) break;
        const numMap = aggregateField(rows, query.groupBy, numField, query.aggregate);
        const denMap = aggregateField(rows, query.groupBy, denField, query.aggregate);
        result = result.map(([key]) => {
          const num = numMap.get(key) ?? 0;
          const den = denMap.get(key) ?? 0;
          return [key, den !== 0 ? num / den : 0];
        });
        break;
      }
      case 'running_total': {
        let cumulative = 0;
        result = result.map(([key, val]) => {
          cumulative += val;
          return [key, cumulative];
        });
        break;
      }
      case 'pct_of_total': {
        const total = result.reduce((sum, [, val]) => sum + val, 0);
        result = result.map(([key, val]) => [
          key,
          total !== 0 ? (val / total) * 100 : 0,
        ]);
        break;
      }
    }
  }

  return result;
}

export function resolveQuery(
  data: Row[],
  query: DataQuery,
  datasetLabel?: string
): ResolvedChartData {
  // 1. Filter
  let rows = data;
  if (query.filter) {
    rows = rows.filter(r => matchesFilter(r, query.filter!));
  }

  // 2. Group
  const groups = new Map<string, number[]>();
  for (const row of rows) {
    const key = deriveField(row, query.groupBy);
    if (!groups.has(key)) groups.set(key, []);
    const val =
      query.aggregate === 'count'
        ? 1
        : Number(row[query.valueField ?? ''] ?? 0);
    groups.get(key)!.push(val);
  }

  // 3. Aggregate
  let entries: [string, number][] = [];
  for (const [key, vals] of groups) {
    entries.push([key, aggregateValues(vals, query.aggregate)]);
  }

  // 4. Sort
  if (query.sort === 'desc') entries.sort((a, b) => b[1] - a[1]);
  else if (query.sort === 'asc') entries.sort((a, b) => a[1] - b[1]);

  // 5. Limit
  const limited = query.limit ? entries.slice(0, query.limit) : entries;

  // 6. Apply computed fields (post-processing)
  const processed =
    query.computedFields && query.computedFields.length > 0
      ? applyComputedFields(limited, query.computedFields, rows, query)
      : limited;

  // 7. Build chart data
  const labels = processed.map(([k]) => k);
  const values = processed.map(([, v]) => Math.round(v * 100) / 100);

  const needsPerSliceColor = labels.length <= PALETTE.length;

  return {
    labels,
    datasets: [
      {
        label:
          datasetLabel ??
          (query.computedFields?.[0]?.name ??
            `${query.aggregate}(${query.valueField || query.groupBy})`),
        data: values,
        backgroundColor: needsPerSliceColor
          ? labels.map((_, i) => PALETTE[i % PALETTE.length])
          : PALETTE[0],
        borderColor: null,
        borderWidth: null,
        fill: null,
      },
    ],
  };
}
