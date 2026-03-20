'use client';

import { GridDashboard } from '@/components/grid-dashboard';
import '@/lib/chartjs-setup';
import { applyChartTheme } from '@/lib/chartjs-setup';
import { DataProvider } from '@/lib/data-context';
import projectsData from '@/lib/projects.json';
import { registry } from '@/lib/registry';
import type { Spec } from '@json-render/core';
import {
  ActionProvider,
  StateProvider,
  VisibilityProvider,
  type ComponentRenderer,
} from '@json-render/react';
import { useEffect, useState, type ReactNode } from 'react';

interface DashboardRendererProps {
  spec: Spec | null;
  loading: boolean;
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
  onResetLayout,
  onRemoveItem,
}: DashboardRendererProps): ReactNode {
  const [, setThemeTick] = useState(0);

  useEffect(() => {
    function handleThemeChange() {
      applyChartTheme();
      setThemeTick(t => t + 1);
    }
    window.addEventListener('theme-change', handleThemeChange);
    return () => window.removeEventListener('theme-change', handleThemeChange);
  }, []);

  if (!spec) return null;

  return (
    <DataProvider projects={projectsData.projects as Record<string, unknown>[]}>
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
