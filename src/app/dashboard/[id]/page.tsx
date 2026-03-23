'use client';

import { ChatPanel } from '@/components/chat-panel';
import { Sidebar } from '@/components/sidebar';
import { DEFAULT_DASHBOARD_ID } from '@/lib/default-dashboard';
import { removeElementFromSpec } from '@/lib/spec-utils';
import { useTheme } from '@/lib/theme-context';
import { useChat } from '@/lib/use-chat';
import { useDashboards } from '@/lib/use-dashboards';
import type { Spec } from '@json-render/core';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react';

function usePersistedState(
  key: string,
  defaultValue: boolean
): [boolean, (update: boolean | ((prev: boolean) => boolean)) => void] {
  const [value, setValue] = useState<boolean>(defaultValue);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        setValue(stored === 'true');
      }
    } catch {
      // ignore
    }
  }, [key]);

  const set = useCallback(
    (update: boolean | ((prev: boolean) => boolean)) => {
      setValue(prev => {
        const next = typeof update === 'function' ? update(prev) : update;
        try {
          localStorage.setItem(key, String(next));
        } catch {
          // fail silently
        }
        return next;
      });
    },
    [key]
  );
  return [value, set];
}

const DashboardRenderer = dynamic(
  () =>
    import('@/components/dashboard-renderer').then(m => m.DashboardRenderer),
  { ssr: false, loading: () => <DashboardSkeleton /> }
);

function isSpecEmpty(spec: Spec | null): boolean {
  if (!spec) return true;
  return !spec.root || Object.keys(spec.elements).length === 0;
}

export default function DashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const {
    dashboards,
    activeDashboard,
    activeId,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    renameDashboard,
  } = useDashboards(id);

  const { theme, toggleTheme } = useTheme();
  const resetLayoutRef = useRef<(() => void) | null>(null);
  const [sidebarOpen, setSidebarOpen] = usePersistedState('sidebar-open', true);
  const [chatOpen, setChatOpen] = usePersistedState('chat-open', true);
  const [copied, setCopied] = useState(false);

  const initialMessages = useMemo(
    () => activeDashboard?.messages ?? [],
    [activeDashboard?.messages]
  );

  const onChatUpdate = useCallback(
    (
      msgs: Parameters<
        NonNullable<Parameters<typeof useChat>[0]['onUpdate']>
      >[0],
      spec: Spec | null
    ) => {
      if (!activeDashboard) return;
      const firstName = msgs.find(m => m.role === 'user')?.text;
      const patch: Parameters<typeof updateDashboard>[1] = {
        messages: msgs,
        spec: spec ?? activeDashboard.spec,
      };
      if (activeDashboard.name === 'New Dashboard' && firstName) {
        const truncated =
          firstName.length > 40
            ? firstName.slice(0, 40).replace(/\s+\S*$/, '') + '…'
            : firstName;
        patch.name = truncated;
      }
      updateDashboard(activeDashboard.id, patch);
    },
    [activeDashboard, updateDashboard]
  );

  const {
    messages,
    spec: chatSpec,
    isStreaming,
    error,
    send,
    stop,
  } = useChat({
    api: '/api/chat',
    initialMessages,
    onUpdate: onChatUpdate,
  });

  const displaySpec = chatSpec ?? activeDashboard?.spec ?? null;
  const hasContent = !isSpecEmpty(displaySpec);

  const handleCopySpec = useCallback(() => {
    if (!displaySpec) return;
    navigator.clipboard.writeText(JSON.stringify(displaySpec, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [displaySpec]);
  const showExamples = !activeDashboard?.spec && messages.length === 0;

  const handleRemoveItem = useCallback(
    (key: string) => {
      if (!displaySpec || !activeDashboard) return;
      const newSpec = removeElementFromSpec(displaySpec, key);
      updateDashboard(activeDashboard.id, { spec: newSpec });
    },
    [displaySpec, activeDashboard, updateDashboard]
  );

  const handleNewDashboard = useCallback(() => {
    const dashboard = createDashboard();
    router.push(`/dashboard/${dashboard.id}`);
  }, [createDashboard, router]);

  const handleSelectDashboard = useCallback(
    (dashboardId: string) => {
      router.push(`/dashboard/${dashboardId}`);
    },
    [router]
  );

  const handleDeleteDashboard = useCallback(
    (dashboardId: string) => {
      deleteDashboard(dashboardId);
      if (dashboardId === id) {
        router.push(`/dashboard/${DEFAULT_DASHBOARD_ID}`);
      }
    },
    [deleteDashboard, id, router]
  );

  return (
    <div className="h-dvh flex">
      <div
        data-print-hide
        className="shrink-0 overflow-hidden transition-[width] duration-200 ease-out"
        style={{ width: sidebarOpen ? 256 : 0 }}
      >
        <Sidebar
          dashboards={dashboards}
          activeId={activeId}
          onSelect={dashboardId => {
            handleSelectDashboard(dashboardId);
          }}
          onCreate={handleNewDashboard}
          onRename={renameDashboard}
          onDelete={handleDeleteDashboard}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border/60 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="size-8 flex items-center justify-center text-ink-muted hover:text-accent transition-colors duration-200 ease-out"
              aria-label="Toggle sidebar"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="7"
                  y="6.5"
                  width="7"
                  height="1.5"
                  rx="0.75"
                  transform="rotate(90 7 6.5)"
                  fill="currentColor"
                />
                <rect
                  x="3"
                  y="4"
                  width="14"
                  height="12"
                  rx="2.8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>

            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
              className="shrink-0"
            >
              <rect
                x="1"
                y="11"
                width="4"
                height="8"
                fill="var(--color-accent)"
              />
              <rect
                x="8"
                y="6"
                width="4"
                height="13"
                fill="var(--color-accent)"
                opacity="0.75"
              />
              <rect
                x="15"
                y="2"
                width="4"
                height="17"
                fill="var(--color-accent)"
                opacity="0.5"
              />
            </svg>
            <span className="font-serif italic text-ink text-base tracking-tight select-none">
              Charts by Prompt
            </span>
          </div>

          <div className="flex items-center gap-2" data-print-hide>
            {displaySpec && (
              <button
                onClick={handleCopySpec}
                className="size-8 flex items-center justify-center text-ink-muted hover:text-accent transition-colors duration-200 ease-out relative"
                aria-label="Copy dashboard JSON"
              >
                {copied ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8.5L6.5 12L13 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <rect
                      x="5.5"
                      y="5.5"
                      width="8"
                      height="9"
                      rx="1.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M10.5 5.5V3a1.5 1.5 0 00-1.5-1.5H3A1.5 1.5 0 001.5 3v7A1.5 1.5 0 003 11.5h2.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                )}
                {copied && (
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] text-accent whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="size-8 flex items-center justify-center text-ink-muted hover:text-accent transition-colors duration-200 ease-out"
              aria-label="Print dashboard"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 6V1.5h8V6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect
                  x="1.5"
                  y="6"
                  width="13"
                  height="6"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M4 10h8v4.5H4V10Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={toggleTheme}
              className="size-8 flex items-center justify-center text-ink-muted hover:text-accent"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.4 3.4l.7.7M11.9 11.9l.7.7M12.6 3.4l-.7.7M4.1 11.9l-.7.7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M14 9.68A6.5 6.5 0 0 1 6.32 2 6.5 6.5 0 1 0 14 9.68Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
            <button
              onClick={() => setChatOpen(o => !o)}
              className="size-8 flex items-center justify-center text-ink-muted hover:text-accent transition-colors duration-200 ease-out"
              aria-label="Toggle chat"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M13.4937 2.79004L13.0291 1.58215C12.9714 1.4322 12.8273 1.33325 12.6667 1.33325C12.506 1.33325 12.3619 1.4322 12.3043 1.58215L11.8397 2.79004C11.772 2.9661 11.6329 3.10523 11.4568 3.17295L10.2489 3.63753C10.0989 3.6952 10 3.83926 10 3.99992C10 4.16058 10.0989 4.30464 10.2489 4.36231L11.4568 4.82689C11.6329 4.89461 11.772 5.03374 11.8397 5.2098L12.3043 6.41769C12.3619 6.56764 12.506 6.66659 12.6667 6.66659C12.8273 6.66659 12.9714 6.56764 13.0291 6.41769L13.4937 5.2098C13.5613 5.03374 13.7005 4.89461 13.8765 4.82689L15.0845 4.36231C15.2344 4.30464 15.3333 4.16058 15.3333 3.99992C15.3333 3.83926 15.2344 3.6952 15.0845 3.63753L13.8765 3.17295C13.7005 3.10523 13.5613 2.9661 13.4937 2.79004Z"
                  fill="currentColor"
                />
                <path
                  d="M8.00131 2.66675L4.00128 2.66675C2.89671 2.66675 2.00128 3.56219 2.00128 4.66675V10.0239C2.00128 11.1285 2.89671 12.0239 4.00128 12.0239H5.7677C5.92432 12.0239 6.07593 12.0791 6.19597 12.1797L7.99845 13.6906L9.82512 12.1772C9.94472 12.0781 10.0951 12.0239 10.2504 12.0239H12.0013C13.1058 12.0239 14.0013 11.1285 14.0013 10.0239V8.67868"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          {hasContent ? (
            <DashboardRenderer
              spec={displaySpec}
              loading={isStreaming}
              onResetLayout={reset => {
                resetLayoutRef.current = reset;
              }}
              onRemoveItem={handleRemoveItem}
            />
          ) : isStreaming ? (
            <StreamingPlaceholder />
          ) : (
            <EmptyDashboard />
          )}
        </main>
      </div>

      <div
        data-print-hide
        className="shrink-0 overflow-hidden transition-[width] duration-200 ease-out"
        style={{ width: chatOpen ? 320 : 0 }}
      >
        <ChatPanel
          messages={messages}
          isStreaming={isStreaming}
          error={error}
          onSend={send}
          onStop={stop}
          showExamples={showExamples}
        />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div
      className="grid grid-cols-12 gap-[8px]"
      style={{ padding: '8px 8px 0' }}
    >
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="col-span-3 rounded-lg bg-surface/80 animate-pulse"
          style={{ height: 168 }}
        />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={`chart-${i}`}
          className="col-span-6 rounded-lg bg-surface/80 animate-pulse"
          style={{ height: 432 }}
        />
      ))}
    </div>
  );
}

function StreamingPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-5">
      <div className="flex items-end gap-1.5 h-8">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="w-1 bg-accent rounded-sm"
            style={{
              height: `${12 + Math.sin(i * 1.2) * 10}px`,
              animation: `pulse-dot 1.2s ease-in-out ${i * 120}ms infinite`,
            }}
          />
        ))}
      </div>
      <p className="text-sm text-ink-muted tracking-wide">
        Building your dashboard…
      </p>
    </div>
  );
}

function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <p className="text-sm text-ink-muted text-pretty text-center max-w-xs leading-relaxed">
        Use the chat panel to describe the dashboard you want, or pick an
        example to get started.
      </p>
      <p className="text-[11px] text-ink-dim tracking-wide">
        Ctrl+scroll to zoom charts &nbsp;·&nbsp; Drag to pan
      </p>
    </div>
  );
}
