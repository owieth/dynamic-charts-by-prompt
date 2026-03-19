'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

export type Row = Record<string, unknown>;
export type DataSources = Record<string, Row[]>;

const DataContext = createContext<DataSources>({});

export function DataProvider({
  sources,
  children,
}: {
  sources: DataSources;
  children: ReactNode;
}) {
  return (
    <DataContext.Provider value={sources}>{children}</DataContext.Provider>
  );
}

export function useDataSource(source: string): Row[] {
  const ctx = useContext(DataContext);
  return ctx[source] ?? [];
}

export function useDataSources(): DataSources {
  const ctx = useContext(DataContext);
  return ctx;
}

/** Derive field metadata from a dataset for prompt generation */
export interface FieldMeta {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'unknown';
  uniqueCount: number;
  sample: string[];
}

function inferType(
  values: unknown[]
): 'string' | 'number' | 'date' | 'boolean' | 'unknown' {
  const nonNull = values.filter(v => v != null && v !== '');
  if (nonNull.length === 0) return 'unknown';

  let numberCount = 0;
  let dateCount = 0;
  let boolCount = 0;

  for (const v of nonNull.slice(0, 50)) {
    if (typeof v === 'number' || (typeof v === 'string' && !isNaN(Number(v)) && v.trim() !== '')) {
      numberCount++;
    }
    if (typeof v === 'boolean' || v === 'true' || v === 'false') {
      boolCount++;
    }
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) {
      dateCount++;
    }
  }

  const sample = nonNull.slice(0, 50).length;
  if (boolCount > sample * 0.8) return 'boolean';
  if (dateCount > sample * 0.8) return 'date';
  if (numberCount > sample * 0.8) return 'number';
  return 'string';
}

export function extractFieldMeta(rows: Row[]): FieldMeta[] {
  if (rows.length === 0) return [];

  const fieldNames = new Set<string>();
  for (const row of rows.slice(0, 100)) {
    for (const key of Object.keys(row)) {
      fieldNames.add(key);
    }
  }

  return Array.from(fieldNames).map(name => {
    const values = rows.map(r => r[name]);
    const type = inferType(values);
    const unique = new Set(values.map(v => String(v ?? '')));
    const sample = Array.from(unique).slice(0, 5);
    return { name, type, uniqueCount: unique.size, sample };
  });
}

export interface DatasetInfo {
  name: string;
  rowCount: number;
  fields: FieldMeta[];
}

export function buildDatasetInfo(name: string, rows: Row[]): DatasetInfo {
  return {
    name,
    rowCount: rows.length,
    fields: extractFieldMeta(rows),
  };
}

/** Hook to get all dataset info for prompt generation */
export function useDatasetInfos(): DatasetInfo[] {
  const sources = useDataSources();
  return useMemo(
    () =>
      Object.entries(sources).map(([name, rows]) =>
        buildDatasetInfo(name, rows)
      ),
    [sources]
  );
}
