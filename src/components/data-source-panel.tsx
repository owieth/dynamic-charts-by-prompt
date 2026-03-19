'use client';

import type { DataSourceConfig } from '@/lib/data-sources';
import { fetchDataSource } from '@/lib/data-fetcher';
import { useCallback, useState } from 'react';

interface DataSourcePanelProps {
  configs: DataSourceConfig[];
  onAdd: (config: DataSourceConfig) => void;
  onRemove: (id: string) => void;
  onRefresh: (id: string) => void;
  onClose: () => void;
}

export function DataSourcePanel({
  configs,
  onAdd,
  onRemove,
  onRefresh,
  onClose,
}: DataSourcePanelProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg rounded-lg border border-border/60 bg-[rgb(var(--background))] shadow-lg">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <h2 className="text-sm font-semibold text-balance">Data Sources</h2>
          <button
            onClick={onClose}
            className="size-7 flex items-center justify-center rounded text-ink-muted hover:text-ink transition-colors"
            aria-label="Close data sources panel"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1L13 13M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="max-h-[60dvh] overflow-y-auto p-4">
          <ul className="space-y-2">
            {configs.map(config => (
              <li
                key={config.id}
                className="flex items-center justify-between rounded border border-border/60 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{config.name}</p>
                  <p className="truncate text-xs text-ink-muted">
                    {config.type === 'static'
                      ? 'Built-in'
                      : config.url ?? 'REST'}
                    {config.refreshInterval
                      ? ` / ${Math.round(config.refreshInterval / 1000)}s`
                      : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {config.type === 'rest' && (
                    <button
                      onClick={() => onRefresh(config.id)}
                      className="rounded px-2 py-1 text-xs text-ink-muted hover:text-ink transition-colors"
                      aria-label={`Refresh ${config.name}`}
                    >
                      Refresh
                    </button>
                  )}
                  {config.type !== 'static' && (
                    <button
                      onClick={() => onRemove(config.id)}
                      className="rounded px-2 py-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                      aria-label={`Remove ${config.name}`}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {showForm ? (
            <AddSourceForm
              onAdd={config => {
                onAdd(config);
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 w-full rounded border border-dashed border-border/60 px-3 py-2 text-sm text-ink-muted hover:text-ink hover:border-border transition-colors"
            >
              + Add REST data source
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface AddSourceFormProps {
  onAdd: (config: DataSourceConfig) => void;
  onCancel: () => void;
}

function AddSourceForm({ onAdd, onCancel }: AddSourceFormProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [transform, setTransform] = useState('');
  const [refreshInterval, setRefreshInterval] = useState('');
  const [headerKey, setHeaderKey] = useState('');
  const [headerValue, setHeaderValue] = useState('');
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const buildConfig = useCallback((): DataSourceConfig => {
    const id = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return {
      id: id || `source-${Date.now()}`,
      name,
      type: 'rest',
      url,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      refreshInterval: refreshInterval
        ? parseInt(refreshInterval, 10) * 1000
        : undefined,
      transform: transform || undefined,
    };
  }, [name, url, transform, refreshInterval, headers]);

  const handleAddHeader = useCallback(() => {
    if (!headerKey.trim()) return;
    setHeaders(prev => ({ ...prev, [headerKey.trim()]: headerValue }));
    setHeaderKey('');
    setHeaderValue('');
  }, [headerKey, headerValue]);

  const handleRemoveHeader = useCallback((key: string) => {
    setHeaders(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleTest = useCallback(async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const config = buildConfig();
      const rows = await fetchDataSource(config);
      setTestResult(`Connected: ${rows.length} rows`);
    } catch (err) {
      setTestResult(
        `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      setIsTesting(false);
    }
  }, [buildConfig]);

  const handleSubmit = useCallback(() => {
    if (!name.trim() || !url.trim()) return;
    onAdd(buildConfig());
  }, [name, url, buildConfig, onAdd]);

  const inputClass =
    'w-full rounded border border-border/60 bg-transparent px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-dim focus:border-accent focus:outline-none';

  return (
    <div className="mt-3 space-y-3 rounded border border-border/60 p-3">
      <div>
        <label className="mb-1 block text-xs text-ink-muted">Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="My API data"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-ink-muted">URL</label>
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://api.example.com/data"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-ink-muted">
          Transform path (optional, e.g. &quot;data.items&quot;)
        </label>
        <input
          type="text"
          value={transform}
          onChange={e => setTransform(e.target.value)}
          placeholder="data.items"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-ink-muted">
          Refresh interval in seconds (optional)
        </label>
        <input
          type="number"
          min="0"
          value={refreshInterval}
          onChange={e => setRefreshInterval(e.target.value)}
          placeholder="30"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-ink-muted">
          Headers (optional)
        </label>
        {Object.entries(headers).map(([key, val]) => (
          <div key={key} className="mb-1 flex items-center gap-1 text-xs">
            <span className="truncate text-ink-muted">
              {key}: {val}
            </span>
            <button
              onClick={() => handleRemoveHeader(key)}
              className="shrink-0 text-red-400 hover:text-red-300"
              aria-label={`Remove header ${key}`}
            >
              x
            </button>
          </div>
        ))}
        <div className="flex gap-1">
          <input
            type="text"
            value={headerKey}
            onChange={e => setHeaderKey(e.target.value)}
            placeholder="Key"
            className={`${inputClass} flex-1`}
          />
          <input
            type="text"
            value={headerValue}
            onChange={e => setHeaderValue(e.target.value)}
            placeholder="Value"
            className={`${inputClass} flex-1`}
          />
          <button
            onClick={handleAddHeader}
            className="shrink-0 rounded border border-border/60 px-2 py-1 text-xs text-ink-muted hover:text-ink transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {testResult && (
        <p
          className={`text-xs ${testResult.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}
        >
          {testResult}
        </p>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          onClick={handleTest}
          disabled={!url.trim() || isTesting}
          className="rounded border border-border/60 px-3 py-1.5 text-xs text-ink-muted hover:text-ink disabled:opacity-40 transition-colors"
        >
          {isTesting ? 'Testing...' : 'Test connection'}
        </button>
        <button
          onClick={onCancel}
          className="rounded px-3 py-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || !url.trim()}
          className="rounded bg-accent px-3 py-1.5 text-xs text-white disabled:opacity-40 transition-colors"
        >
          Add source
        </button>
      </div>
    </div>
  );
}
