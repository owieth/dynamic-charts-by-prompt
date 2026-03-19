'use client';

import type { FieldMetadata } from '@/lib/file-parser';
import { parseCSV, parseJSON } from '@/lib/file-parser';
import type { UserDataset } from '@/lib/use-user-datasets';
import { useCallback, useRef, useState } from 'react';

type Row = Record<string, unknown>;

const FILE_SIZE_WARN = 5 * 1024 * 1024; // 5MB

interface DataUploaderProps {
  datasets: UserDataset[];
  onAdd: (name: string, rows: Row[], fields: FieldMetadata[]) => void;
  onRemove: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

interface ParsedPreview {
  name: string;
  rows: Row[];
  fields: FieldMetadata[];
  warning?: string;
}

export function DataUploader({
  datasets,
  onAdd,
  onRemove,
  open,
  onClose,
}: DataUploaderProps) {
  const [preview, setPreview] = useState<ParsedPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setError(null);
    setPreview(null);

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'json') {
      setError('Only .csv and .json files are supported.');
      return;
    }

    const warning =
      file.size > FILE_SIZE_WARN
        ? `File is ${(file.size / 1024 / 1024).toFixed(1)}MB. Large files may slow down the browser.`
        : undefined;

    const name = file.name.replace(/\.[^.]+$/, '');

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const result = ext === 'csv' ? parseCSV(text) : parseJSON(text);

        if (result.rows.length === 0) {
          setError('No data rows found in the file.');
          return;
        }

        setPreview({ name, rows: result.rows, fields: result.fields, warning });
      } catch (err) {
        setError(
          `Failed to parse file: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    };
    reader.onerror = () => setError('Failed to read the file.');
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      if (inputRef.current) inputRef.current.value = '';
    },
    [processFile]
  );

  const handleAdd = useCallback(() => {
    if (!preview) return;
    onAdd(preview.name, preview.rows, preview.fields);
    setPreview(null);
  }, [preview, onAdd]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-bg/80"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-medium text-ink">Data Sources</h2>
          <button
            onClick={onClose}
            className="size-7 flex items-center justify-center rounded text-ink-muted hover:text-ink transition-colors duration-200 ease-out"
            aria-label="Close data uploader"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`mb-4 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors duration-200 ease-out ${
            dragOver
              ? 'border-accent bg-accent-dim'
              : 'border-border hover:border-border-hi'
          }`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-ink-muted"
            aria-hidden="true"
          >
            <path
              d="M12 16V4m0 0l-4 4m4-4l4 4M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-sm text-ink-muted">
            Drop a <span className="text-ink">.csv</span> or{' '}
            <span className="text-ink">.json</span> file here
          </p>
          <button
            onClick={() => inputRef.current?.click()}
            className="mt-1 rounded-md bg-surface-hi px-3 py-1.5 text-xs text-ink hover:bg-border transition-colors duration-200 ease-out"
          >
            Browse files
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.json"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload CSV or JSON file"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="mb-4 rounded-md border border-border bg-bg p-3">
            {preview.warning && (
              <p className="mb-2 text-xs text-accent">{preview.warning}</p>
            )}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-ink">
                {preview.name}
              </span>
              <span className="text-xs tabular-nums text-ink-muted">
                {preview.rows.length} rows &middot; {preview.fields.length}{' '}
                fields
              </span>
            </div>
            <div className="mb-3 max-h-28 overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-ink-muted">
                    <th className="pb-1 pr-3 font-normal">Field</th>
                    <th className="pb-1 pr-3 font-normal">Type</th>
                    <th className="pb-1 font-normal">Unique</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.fields.map(f => (
                    <tr key={f.name} className="border-b border-border/40">
                      <td className="py-1 pr-3 text-ink">{f.name}</td>
                      <td className="py-1 pr-3 text-ink-muted">{f.type}</td>
                      <td className="py-1 tabular-nums text-ink-muted">
                        {f.uniqueValues}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={handleAdd}
              className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-bg transition-colors duration-200 ease-out hover:bg-accent/90"
            >
              Add Dataset
            </button>
          </div>
        )}

        {/* Existing datasets */}
        {datasets.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-medium text-ink-muted uppercase tracking-wider">
              Loaded datasets
            </h3>
            <ul className="space-y-1.5">
              {datasets.map(ds => (
                <li
                  key={ds.id}
                  className="flex items-center justify-between rounded-md border border-border bg-bg px-3 py-2"
                >
                  <div>
                    <span className="text-sm text-ink">{ds.name}</span>
                    <span className="ml-2 text-xs tabular-nums text-ink-muted">
                      {ds.rows.length} rows &middot; {ds.fields.length} fields
                    </span>
                  </div>
                  <button
                    onClick={() => onRemove(ds.id)}
                    className="size-6 flex items-center justify-center rounded text-ink-dim hover:text-danger transition-colors duration-200 ease-out"
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
                        d="M1 1l10 10M11 1L1 11"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
