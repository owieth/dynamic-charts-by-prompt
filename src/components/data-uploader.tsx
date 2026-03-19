'use client';

import type { DatasetInfo, Row } from '@/lib/data-context';
import { buildDatasetInfo } from '@/lib/data-context';
import { cn } from '@/lib/utils';
import { useCallback, useRef, useState } from 'react';

interface UploadedDataset {
  name: string;
  rows: Row[];
  info: DatasetInfo;
}

interface DataUploaderProps {
  datasets: UploadedDataset[];
  onAdd: (dataset: UploadedDataset) => void;
  onRemove: (name: string) => void;
}

function sanitizeName(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toLowerCase();
}

function parseCSV(text: string): Row[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  // Simple CSV parser handling quoted fields
  function splitRow(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  const headers = splitRow(lines[0]);
  const rows: Row[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitRow(lines[i]);
    if (values.length === 0) continue;

    const row: Row = {};
    for (let j = 0; j < headers.length; j++) {
      const raw = values[j] ?? '';
      // Try to parse as number
      const num = Number(raw);
      row[headers[j]] = raw !== '' && !isNaN(num) ? num : raw;
    }
    rows.push(row);
  }

  return rows;
}

function parseJSON(text: string): Row[] {
  const parsed = JSON.parse(text);

  // Handle array of objects directly
  if (Array.isArray(parsed)) {
    return parsed.filter(
      item => typeof item === 'object' && item !== null && !Array.isArray(item)
    );
  }

  // Handle object with a single array property (e.g. { "data": [...] })
  if (typeof parsed === 'object' && parsed !== null) {
    for (const key of Object.keys(parsed)) {
      if (Array.isArray(parsed[key])) {
        return parsed[key].filter(
          (item: unknown) =>
            typeof item === 'object' && item !== null && !Array.isArray(item)
        );
      }
    }
  }

  return [];
}

export type { UploadedDataset };

export function DataUploader({ datasets, onAdd, onRemove }: DataUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      const reader = new FileReader();

      reader.onload = () => {
        try {
          const text = reader.result as string;
          let rows: Row[];

          if (file.name.endsWith('.csv') || file.name.endsWith('.tsv')) {
            rows = parseCSV(text);
          } else if (file.name.endsWith('.json')) {
            rows = parseJSON(text);
          } else {
            setError('Unsupported file type. Use CSV or JSON.');
            return;
          }

          if (rows.length === 0) {
            setError('No valid rows found in file.');
            return;
          }

          const name = sanitizeName(file.name);
          const info = buildDatasetInfo(name, rows);
          onAdd({ name, rows, info });
        } catch (err) {
          setError(
            err instanceof Error ? err.message : 'Failed to parse file.'
          );
        }
      };

      reader.onerror = () => {
        setError('Failed to read file.');
      };

      reader.readAsText(file);
    },
    [onAdd]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // Reset so the same file can be re-uploaded
      e.target.value = '';
    },
    [processFile]
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="px-4 pt-4 pb-1 flex items-center justify-between">
        <span className="text-[10px] text-ink-dim uppercase tracking-[0.15em]">
          Datasets
        </span>
      </div>

      {/* Drop zone */}
      <div className="px-4">
        <button
          type="button"
          className={cn(
            'w-full border-2 border-dashed rounded px-3 py-4 text-center transition-colors duration-150 ease-out cursor-pointer',
            dragOver
              ? 'border-accent bg-accent/5 text-accent'
              : 'border-border/60 text-ink-dim hover:border-ink-muted hover:text-ink-muted'
          )}
          onDragOver={e => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-1.5">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 3v10M6 7l4-4 4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 14v2a1 1 0 001 1h12a1 1 0 001-1v-2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xs">
              Drop CSV or JSON file here
            </span>
          </div>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.tsv,.json"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 px-3 py-2 text-xs text-danger border border-danger/30 bg-danger/5">
          {error}
        </div>
      )}

      {/* Uploaded datasets */}
      {datasets.length > 0 && (
        <div className="px-4 flex flex-col gap-1">
          {datasets.map(ds => (
            <div
              key={ds.name}
              className="flex items-center justify-between gap-2 px-3 py-2 bg-surface rounded text-xs"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-ink truncate font-medium">
                  {ds.name}
                </span>
                <span className="text-ink-dim">
                  {ds.info.rowCount} rows, {ds.info.fields.length} fields
                </span>
              </div>
              <button
                onClick={() => onRemove(ds.name)}
                className="size-6 shrink-0 flex items-center justify-center text-ink-dim hover:text-danger transition-colors duration-200 ease-out"
                aria-label={`Remove ${ds.name} dataset`}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 3l6 6M9 3l-6 6"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Built-in dataset indicator */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 px-3 py-2 text-xs text-ink-dim">
          <div className="size-1.5 rounded-full bg-accent/60" />
          <span>projects (built-in)</span>
        </div>
      </div>
    </div>
  );
}
