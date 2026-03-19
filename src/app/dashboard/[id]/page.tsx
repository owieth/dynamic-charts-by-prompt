'use client';

import { ChatPanel } from '@/components/chat-panel';
import { Sidebar } from '@/components/sidebar';
import { DEFAULT_DASHBOARD_ID } from '@/lib/default-dashboard';
import { useChat } from '@/lib/use-chat';
import { useDashboards } from '@/lib/use-dashboards';
import type { Spec } from '@json-render/core';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { use, useCallback, useMemo, useRef, useState } from 'react';

const DashboardRenderer = dynamic(
  () =>
    import('@/components/dashboard-renderer').then(m => m.DashboardRenderer),
  { ssr: false }
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
    initialized,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    renameDashboard,
  } = useDashboards(id);

  const resetLayoutRef = useRef<(() => void) | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initialMessages = useMemo(
    () => activeDashboard?.messages ?? [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeId]
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
  } = useChat({
    api: '/api/chat',
    initialMessages,
    onUpdate: onChatUpdate,
  });

  const displaySpec = chatSpec ?? activeDashboard?.spec ?? null;
  const hasContent = !isSpecEmpty(displaySpec);
  const showExamples = !activeDashboard?.spec && messages.length === 0;

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

  if (!initialized) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-bg">
        <span className="text-sm text-ink-muted">Loading…</span>
      </div>
    );
  }

  return (
    <div className="h-dvh flex">
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block`}>
        <Sidebar
          dashboards={dashboards}
          activeId={activeId}
          onSelect={dashboardId => {
            handleSelectDashboard(dashboardId);
            setSidebarOpen(false);
          }}
          onCreate={handleNewDashboard}
          onRename={renameDashboard}
          onDelete={handleDeleteDashboard}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border/60 px-6 py-4 flex items-center justify-between backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="md:hidden size-8 flex items-center justify-center text-ink-muted hover:text-ink"
              aria-label="Toggle sidebar"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 4h12M2 8h12M2 12h12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
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

          <div className="flex items-center gap-2">
            {hasContent && !isStreaming && (
              <button
                onClick={() => resetLayoutRef.current?.()}
                className="text-xs text-ink-muted hover:text-ink px-3 py-1.5 border border-border hover:border-border-hi transition-colors duration-150"
              >
                Reset layout
              </button>
            )}
            <button
              onClick={handleNewDashboard}
              className="text-xs text-ink-muted hover:text-ink px-3 py-1.5 border border-border hover:border-border-hi transition-colors duration-150"
            >
              + New
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-7xl mx-auto">
            {hasContent ? (
              <DashboardRenderer
                spec={displaySpec}
                loading={isStreaming}
                onResetLayout={reset => {
                  resetLayoutRef.current = reset;
                }}
              />
            ) : isStreaming ? (
              <StreamingPlaceholder />
            ) : (
              <EmptyDashboard />
            )}
          </div>
        </main>
      </div>

      <ChatPanel
        messages={messages}
        isStreaming={isStreaming}
        error={error}
        onSend={send}
        showExamples={showExamples}
      />
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
