'use client';

import type { DataSourceConfig } from '@/lib/data-source-config';
import { cn } from '@/lib/utils';
import { useCallback, useState } from 'react';

interface DataSourceManagerProps {
  configs: DataSourceConfig[];
  remoteStatus: Map<string, { loading: boolean; error: string | null; rowCount: number }>;
  onAdd: (config: DataSourceConfig) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

export function DataSourceManager({
  configs,
  remoteStatus,
  onAdd,
  onRemove,
  onClose,
}: DataSourceManagerProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [dataPath, setDataPath] = useState('');
  const [refreshInterval, setRefreshInterval] = useState('0');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);

      const trimmedName = name.trim();
      const trimmedUrl = url.trim();

      if (!trimmedName) {
        setFormError('Name is required');
        return;
      }
      if (!trimmedUrl) {
        setFormError('URL is required');
        return;
      }

      try {
        new URL(trimmedUrl);
      } catch {
        setFormError('Invalid URL');
        return;
      }

      if (configs.some(c => c.name === trimmedName)) {
        setFormError('A data source with this name already exists');
        return;
      }

      const config: DataSourceConfig = {
        id: crypto.randomUUID(),
        name: trimmedName,
        type: 'rest',
        url: trimmedUrl,
        method: 'GET',
        dataPath: dataPath.trim() || undefined,
        refreshInterval: Math.max(0, parseInt(refreshInterval, 10) || 0) * 1000,
      };

      onAdd(config);
      setName('');
      setUrl('');
      setDataPath('');
      setRefreshInterval('0');
    },
    [name, url, dataPath, refreshInterval, configs, onAdd]
  );

  const restConfigs = configs.filter(c => c.type === 'rest');

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-border/60 flex items-center justify-between">
        <span className="text-xs text-ink-muted uppercase tracking-[0.15em] font-medium">
          Data Sources
        </span>
        <button
          onClick={onClose}
          className="size-7 flex items-center justify-center text-ink-muted hover:text-accent transition-colors duration-200 ease-out"
          aria-label="Close data sources"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 3l8 8M11 3l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Static sources */}
        <div>
          <p className="text-[10px] text-ink-dim uppercase tracking-wider mb-2">
            Built-in
          </p>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-surface/60">
            <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-sm text-ink truncate">projects</span>
            <span className="text-[10px] text-ink-dim ml-auto tabular-nums">static</span>
          </div>
        </div>

        {/* REST sources */}
        {restConfigs.length > 0 && (
          <div>
            <p className="text-[10px] text-ink-dim uppercase tracking-wider mb-2">
              REST APIs
            </p>
            <div className="space-y-1.5">
              {restConfigs.map(config => {
                const status = remoteStatus.get(config.name);
                const isConnected = status && !status.loading && !status.error;
                const hasError = status?.error;
                const isLoading = status?.loading;

                return (
                  <div
                    key={config.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded bg-surface/60 group"
                  >
                    <span
                      className={cn(
                        'size-2 rounded-full shrink-0',
                        isLoading && 'bg-amber-500',
                        isConnected && 'bg-emerald-500',
                        hasError && 'bg-red-500',
                        !status && 'bg-neutral-500'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-ink truncate block">
                        {config.name}
                      </span>
                      {hasError && (
                        <span className="text-[10px] text-red-400 truncate block">
                          {status.error}
                        </span>
                      )}
                      {isConnected && (
                        <span className="text-[10px] text-ink-dim block tabular-nums">
                          {status.rowCount} rows
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => onRemove(config.id)}
                      className="size-5 flex items-center justify-center text-ink-dim hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out shrink-0"
                      aria-label={`Remove ${config.name}`}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M2 2l6 6M8 2l-6 6"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add form */}
        <div>
          <p className="text-[10px] text-ink-dim uppercase tracking-wider mb-2">
            Add REST API
          </p>
          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div>
              <label className="text-[11px] text-ink-muted block mb-1">
                Source Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. users"
                className="w-full bg-surface border border-border/60 rounded px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-dim outline-none focus:border-accent transition-colors duration-200 ease-out"
              />
            </div>
            <div>
              <label className="text-[11px] text-ink-muted block mb-1">
                URL
              </label>
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://api.example.com/data"
                className="w-full bg-surface border border-border/60 rounded px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-dim outline-none focus:border-accent transition-colors duration-200 ease-out"
              />
            </div>
            <div>
              <label className="text-[11px] text-ink-muted block mb-1">
                Data Path
                <span className="text-ink-dim ml-1">(optional)</span>
              </label>
              <input
                type="text"
                value={dataPath}
                onChange={e => setDataPath(e.target.value)}
                placeholder="e.g. data.items"
                className="w-full bg-surface border border-border/60 rounded px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-dim outline-none focus:border-accent transition-colors duration-200 ease-out"
              />
            </div>
            <div>
              <label className="text-[11px] text-ink-muted block mb-1">
                Refresh Interval
                <span className="text-ink-dim ml-1">(seconds, 0 = manual)</span>
              </label>
              <input
                type="number"
                min="0"
                value={refreshInterval}
                onChange={e => setRefreshInterval(e.target.value)}
                className="w-full bg-surface border border-border/60 rounded px-2.5 py-1.5 text-sm text-ink tabular-nums outline-none focus:border-accent transition-colors duration-200 ease-out"
              />
            </div>

            {formError && (
              <p className="text-[11px] text-red-400">{formError}</p>
            )}

            <button
              type="submit"
              className="w-full rounded bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors duration-200 ease-out hover:bg-accent/90"
            >
              Connect
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
