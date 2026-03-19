"use client";

import "@/lib/chartjs-setup";
import type { ReactNode } from "react";
import {
  Renderer,
  StateProvider,
  VisibilityProvider,
  ActionProvider,
  type ComponentRenderer,
} from "@json-render/react";
import { registry } from "@/lib/registry";
import { DataProvider } from "@/lib/data-context";
import type { Spec } from "@json-render/core";
import projectsData from "@/lib/projects.json";

interface DashboardRendererProps {
  spec: Spec | null;
  loading: boolean;
}

const fallback: ComponentRenderer = ({ element }) => (
  <div className="rounded border border-border/60 bg-surface px-3 py-2 text-xs text-ink-muted">
    Unknown component: <code>{element.type}</code>
  </div>
);

export function DashboardRenderer({ spec, loading }: DashboardRendererProps): ReactNode {
  if (!spec) return null;

  return (
    <DataProvider projects={projectsData.projects as Record<string, unknown>[]}>
      <StateProvider initialState={{}}>
        <VisibilityProvider>
          <ActionProvider handlers={{}}>
            <Renderer
              spec={spec}
              registry={registry}
              fallback={fallback}
              loading={loading}
            />
          </ActionProvider>
        </VisibilityProvider>
      </StateProvider>
    </DataProvider>
  );
}
