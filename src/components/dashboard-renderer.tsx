'use client';

import { GridDashboard } from '@/components/grid-dashboard';
import '@/lib/chartjs-setup';
import { DataProvider } from '@/lib/data-context';
import { registry } from '@/lib/registry';
import type { Spec } from '@json-render/core';
import {
  ActionProvider,
  StateProvider,
  VisibilityProvider,
  type ComponentRenderer,
} from '@json-render/react';
import type { ReactNode } from 'react';

type Row = Record<string, unknown>;

interface DashboardRendererProps {
  spec: Spec | null;
  loading: boolean;
  sources: Record<string, Row[]>;
  onResetLayout?: (reset: () => void) => void;
  onRemoveItem?: (key: string) => void;
}

const fallback: ComponentRenderer = ({ element }) => (
  <div className="rounded border border-border/60 bg-surface px-3 py-2 text-xs text-ink-muted">
    Unknown component: <code>{element.type}</code>
  </div>
);

export function DashboardRenderer({
  spec,
  loading,
  sources,
  onResetLayout,
  onRemoveItem,
}: DashboardRendererProps): ReactNode {
  if (!spec) return null;

  return (
    <DataProvider sources={sources}>
      <StateProvider initialState={{}}>
        <VisibilityProvider>
          <ActionProvider handlers={{}}>
            <GridDashboard
              spec={spec}
              loading={loading}
              registry={registry}
              fallback={fallback}
              onResetLayout={onResetLayout}
              onRemoveItem={onRemoveItem}
            />
          </ActionProvider>
        </VisibilityProvider>
      </StateProvider>
    </DataProvider>
  );
}
