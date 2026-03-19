'use client';

import type { DataTableProps } from '@/lib/chart-schemas';
import { useDataSource } from '@/lib/data-context';
import { useMemo, useState } from 'react';

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

function formatCell(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'number') return value.toLocaleString();
  return String(value);
}

function isNumeric(value: unknown): boolean {
  return typeof value === 'number' && !Number.isNaN(value);
}

export function DataTable({ props }: { props: DataTableProps }) {
  const data = useDataSource(props.source);
  const [sortCol, setSortCol] = useState<string | null>(
    props.sortBy ?? null
  );
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(
    props.sortDir ?? 'asc'
  );
  const [page, setPage] = useState(0);

  const pageSize = props.pageSize ?? 10;

  const rows = useMemo(() => {
    let filtered = data;

    if (props.filter) {
      filtered = filtered.filter(r => matchesFilter(r, props.filter!));
    }

    if (sortCol) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortCol];
        const bVal = b[sortCol];
        if (isNumeric(aVal) && isNumeric(bVal)) {
          return sortDir === 'asc'
            ? (aVal as number) - (bVal as number)
            : (bVal as number) - (aVal as number);
        }
        const aStr = String(aVal ?? '');
        const bStr = String(bVal ?? '');
        return sortDir === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    if (props.limit) {
      filtered = filtered.slice(0, props.limit);
    }

    return filtered;
  }, [data, props.filter, props.limit, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safeePage = Math.min(page, totalPages - 1);
  const pageRows = rows.slice(
    safeePage * pageSize,
    (safeePage + 1) * pageSize
  );

  function handleSort(col: string) {
    if (sortCol === col) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
    setPage(0);
  }

  function sortIndicator(col: string) {
    if (sortCol !== col) return null;
    return sortDir === 'asc' ? ' \u2191' : ' \u2193';
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border/60">
      {props.title && (
        <div className="px-3 py-2 text-sm font-medium">{props.title}</div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
              {props.columns.map(col => (
                <th
                  key={col}
                  className="cursor-pointer select-none px-3 py-2 text-left font-medium"
                  onClick={() => handleSort(col)}
                >
                  {col}
                  {sortIndicator(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-border/60 transition-colors hover:bg-muted/30"
              >
                {props.columns.map(col => (
                  <td
                    key={col}
                    className={`px-3 py-2 ${isNumeric(row[col]) ? 'tabular-nums' : ''}`}
                  >
                    {formatCell(row[col])}
                  </td>
                ))}
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td
                  colSpan={props.columns.length}
                  className="px-3 py-4 text-center text-muted-foreground"
                >
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
          <span>
            Page {safeePage + 1} of {totalPages} ({rows.length} rows)
          </span>
          <div className="flex gap-2">
            <button
              className="rounded px-2 py-1 hover:bg-muted/50 disabled:opacity-40"
              disabled={safeePage === 0}
              onClick={() => setPage(p => p - 1)}
            >
              Prev
            </button>
            <button
              className="rounded px-2 py-1 hover:bg-muted/50 disabled:opacity-40"
              disabled={safeePage >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
