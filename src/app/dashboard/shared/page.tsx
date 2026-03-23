'use client';

import { decodeSpec } from '@/lib/share';
import { useDashboards } from '@/lib/use-dashboards';
import type { Spec } from '@json-render/core';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

const DashboardRenderer = dynamic(
  () =>
    import('@/components/dashboard-renderer').then(m => m.DashboardRenderer),
  { ssr: false, loading: () => <SharedSkeleton /> }
);

function SharedDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const encoded = searchParams.get('s');

  const [spec, setSpec] = useState<Spec | null>(null);
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { createDashboard, updateDashboard } = useDashboards('__shared__');

  useEffect(() => {
    if (!encoded) {
      setError('No dashboard data found in the URL.');
      return;
    }

    decodeSpec(encoded).then(result => {
      if (!result) {
        setError(
          'Failed to decode the shared dashboard. The link may be corrupted.'
        );
        return;
      }
      setSpec(result.spec);
      setName(result.name);
    });
  }, [encoded]);

  const handleSave = useCallback(() => {
    if (!spec || !name) return;
    const dashboard = createDashboard();
    updateDashboard(dashboard.id, { name, spec });
    setSaved(true);
    router.push(`/dashboard/${dashboard.id}`);
  }, [spec, name, createDashboard, updateDashboard, router]);

  if (error) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-sm text-ink-muted text-pretty text-center max-w-sm">
          {error}
        </p>
        <a href="/" className="text-sm text-accent hover:underline">
          Go to dashboards
        </a>
      </div>
    );
  }

  if (!spec) {
    return <SharedSkeleton />;
  }

  return (
    <div className="h-dvh flex flex-col">
      <header className="border-b border-border/60 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
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
          <span className="text-xs text-ink-dim px-2 py-0.5 rounded bg-surface border border-border/60">
            Shared: {name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saved}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-accent text-white hover:bg-accent/90 transition-colors duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M8 1v14M1 8h14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            {saved ? 'Saved' : 'Save to my dashboards'}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <DashboardRenderer spec={spec} loading={false} />
      </main>
    </div>
  );
}

function SharedSkeleton() {
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

export default function SharedDashboardPage() {
  return (
    <Suspense fallback={<SharedSkeleton />}>
      <SharedDashboardContent />
    </Suspense>
  );
}
