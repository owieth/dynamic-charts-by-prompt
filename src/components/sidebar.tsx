'use client';

import { DEFAULT_DASHBOARD_ID } from '@/lib/default-dashboard';
import type { Dashboard } from '@/lib/use-dashboards';
import { cn } from '@/lib/utils';
import { useCallback, useRef, useState } from 'react';

interface SidebarProps {
  dashboards: Dashboard[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function Sidebar({
  dashboards,
  activeId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sorted = [...dashboards].sort((a, b) => b.updatedAt - a.updatedAt);

  const startRename = useCallback((id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
    setTimeout(() => inputRef.current?.select(), 0);
  }, []);

  const commitRename = useCallback(() => {
    if (editingId && editValue.trim()) {
      onRename(editingId, editValue.trim());
    }
    setEditingId(null);
  }, [editingId, editValue, onRename]);

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-bg flex flex-col h-full">
      <div className="px-4 py-4 border-b border-border/60 flex items-center justify-between">
        <span className="text-xs text-ink-muted uppercase tracking-[0.15em] font-medium">
          Dashboards
        </span>
        <button
          onClick={onCreate}
          className="size-7 flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-hi transition-colors duration-150"
          aria-label="New dashboard"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M7 1v12M1 7h12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {sorted.map(dashboard => {
          const isActive = dashboard.id === activeId;
          const isEditing = editingId === dashboard.id;
          const isDefault = dashboard.id === DEFAULT_DASHBOARD_ID;
          const isConfirmingDelete = confirmDeleteId === dashboard.id;

          return (
            <div
              key={dashboard.id}
              className={cn(
                'group relative px-4 py-2.5 cursor-pointer transition-colors duration-100',
                isActive
                  ? 'bg-surface-hi border-l-2 border-accent'
                  : 'border-l-2 border-transparent hover:bg-surface/60'
              )}
              onClick={() => {
                if (!isEditing) onSelect(dashboard.id);
              }}
            >
              <div className="flex items-center justify-between gap-2">
                {isEditing ? (
                  <input
                    ref={inputRef}
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitRename();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="flex-1 bg-surface border border-border px-2 py-0.5 text-sm text-ink outline-none focus:border-accent"
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className={cn(
                      'text-sm truncate',
                      isActive ? 'text-ink' : 'text-ink-muted'
                    )}
                    onDoubleClick={e => {
                      e.stopPropagation();
                      startRename(dashboard.id, dashboard.name);
                    }}
                  >
                    {dashboard.name}
                  </span>
                )}

                {!isEditing && !isDefault && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        startRename(dashboard.id, dashboard.name);
                      }}
                      className="size-6 flex items-center justify-center text-ink-dim hover:text-ink"
                      aria-label="Rename dashboard"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M8.5 1.5l2 2L4 10H2v-2z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    {isConfirmingDelete ? (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onDelete(dashboard.id);
                          setConfirmDeleteId(null);
                        }}
                        className="text-[10px] text-danger hover:text-danger/80 px-1"
                      >
                        confirm
                      </button>
                    ) : (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setConfirmDeleteId(dashboard.id);
                          setTimeout(() => setConfirmDeleteId(null), 3000);
                        }}
                        className="size-6 flex items-center justify-center text-ink-dim hover:text-danger"
                        aria-label="Delete dashboard"
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
                    )}
                  </div>
                )}
              </div>

              <span className="text-[10px] text-ink-dim mt-0.5 block">
                {timeAgo(dashboard.updatedAt)}
              </span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
