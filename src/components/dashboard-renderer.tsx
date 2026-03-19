'use client';

import { GridDashboard } from '@/components/grid-dashboard';
import '@/lib/chartjs-setup';
import { DataProvider, type DataSources } from '@/lib/data-context';
import projectsData from '@/lib/projects.json';
import { registry } from '@/lib/registry';
import type { Spec } from '@json-render/core';
import {
  ActionProvider,
  StateProvider,
  VisibilityProvider,
  type ComponentRenderer,
} from '@json-render/react';
import type { ReactNode } from 'react';

interface DashboardRendererProps {
  spec: Spec | null;
  loading: boolean;
  customDataSources?: DataSources;
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
  customDataSources,
  onResetLayout,
  onRemoveItem,
}: DashboardRendererProps): ReactNode {
  if (!spec) return null;

  const sources: DataSources = {
    projects: projectsData.projects as Record<string, unknown>[],
    ...customDataSources,
  };

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
