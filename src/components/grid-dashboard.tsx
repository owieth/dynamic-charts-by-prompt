'use client';

import { useGridLayout } from '@/lib/use-grid-layout';
import type { Spec } from '@json-render/core';
import {
  Renderer,
  type ComponentRegistry,
  type ComponentRenderer,
} from '@json-render/react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Layout, ResponsiveLayouts } from 'react-grid-layout';
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';

interface GridDashboardProps {
  spec: Spec;
  loading: boolean;
  registry: ComponentRegistry;
  fallback: ComponentRenderer;
  onResetLayout?: (reset: () => void) => void;
}

const BREAKPOINTS = { lg: 0 } as const;
const COLS = { lg: 12 } as const;
const MARGIN = [16, 16] as [number, number];
const RESIZE_HANDLES = ['se'] as const;

function CellSkeleton() {
  return (
    <div className="size-full flex flex-col gap-3 p-4">
      <div className="h-3 w-1/3 rounded bg-surface-hi animate-pulse" />
      <div className="flex-1 rounded bg-surface-hi/60 animate-pulse" />
      <div className="h-2 w-1/2 rounded bg-surface-hi/40 animate-pulse" />
    </div>
  );
}

export function GridDashboard({
  spec,
  loading,
  registry,
  fallback,
  onResetLayout,
}: GridDashboardProps) {
  const { width, containerRef, mounted } = useContainerWidth();
  const readyKeys = useRef(new Set<string>());

  const {
    layout,
    layoutVersion,
    childKeys,
    onLayoutChange,
    resetLayout,
    isDraggable,
    isResizable,
  } = useGridLayout(spec, loading);

  // Track which keys have been in the spec long enough to be "ready"
  // A key is ready once it appeared in a previous render cycle (i.e. its
  // element existed before the current streaming tick).
  useEffect(() => {
    if (!loading) {
      // When streaming ends, mark all current keys as ready
      readyKeys.current = new Set(childKeys);
    }
  }, [loading, childKeys]);

  // During streaming, keys from the previous layout are considered ready
  const prevKeysRef = useRef(new Set<string>());
  useEffect(() => {
    // After each render, store current keys for next comparison
    const timer = setTimeout(() => {
      prevKeysRef.current = new Set(childKeys);
    }, 0);
    return () => clearTimeout(timer);
  }, [childKeys]);

  useEffect(() => {
    onResetLayout?.(resetLayout);
  }, [onResetLayout, resetLayout]);

  const subSpecs = useMemo(() => {
    const map = new Map<string, Spec>();
    for (const key of childKeys) {
      map.set(key, { root: key, elements: spec.elements });
    }
    return map;
  }, [childKeys, spec.elements]);

  const handleLayoutChange = useCallback(
    (currentLayout: Layout, _allLayouts: ResponsiveLayouts) =>
      onLayoutChange(currentLayout),
    [onLayoutChange]
  );

  const layouts = useMemo(() => ({ lg: layout }), [layout]);

  const dragConfig = useMemo(
    () => ({
      enabled: isDraggable,
      handle: '.drag-handle',
      bounded: false,
      threshold: 3,
    }),
    [isDraggable]
  );

  const resizeConfig = useMemo(
    () => ({ enabled: isResizable, handles: RESIZE_HANDLES }),
    [isResizable]
  );

  if (childKeys.length === 0) {
    return (
      <Renderer
        spec={spec}
        registry={registry}
        fallback={fallback}
        loading={loading}
      />
    );
  }

  return (
    <div ref={containerRef} className="dashboard-grid rounded-lg p-2">
      {mounted && (
        <ResponsiveGridLayout
          key={layoutVersion}
          layouts={layouts}
          breakpoints={BREAKPOINTS}
          cols={COLS}
          width={width}
          rowHeight={80}
          dragConfig={dragConfig}
          resizeConfig={resizeConfig}
          onLayoutChange={handleLayoutChange}
          margin={MARGIN}
        >
          {childKeys.map(key => {
            const subSpec = subSpecs.get(key);
            if (!subSpec) return null;

            // Show skeleton for items still arriving during streaming
            const isNew = loading && !prevKeysRef.current.has(key);
            const hasElement = !!spec.elements[key];
            const showSkeleton = loading && (isNew || !hasElement);

            return (
              <div
                key={key}
                className="group relative overflow-hidden rounded-lg border border-border bg-surface/80 hover:border-border-hi transition-colors duration-150"
              >
                {isDraggable && (
                  <button
                    type="button"
                    className="drag-handle absolute top-2 right-2 z-10 flex size-6 items-center justify-center rounded opacity-0 transition-opacity duration-150 group-hover:opacity-100 bg-surface-hi/80 text-ink-muted hover:text-ink cursor-grab active:cursor-grabbing"
                    aria-label="Drag to reorder"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle cx="5" cy="3" r="1" fill="currentColor" />
                      <circle cx="9" cy="3" r="1" fill="currentColor" />
                      <circle cx="5" cy="7" r="1" fill="currentColor" />
                      <circle cx="9" cy="7" r="1" fill="currentColor" />
                      <circle cx="5" cy="11" r="1" fill="currentColor" />
                      <circle cx="9" cy="11" r="1" fill="currentColor" />
                    </svg>
                  </button>
                )}
                {loading && (
                  <div className="absolute top-2 left-2 z-10">
                    <div className="size-2 rounded-full bg-accent animate-pulse" />
                  </div>
                )}
                <div className="size-full overflow-auto">
                  {showSkeleton ? (
                    <CellSkeleton />
                  ) : (
                    <Renderer
                      spec={subSpec}
                      registry={registry}
                      fallback={fallback}
                      loading={loading}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </ResponsiveGridLayout>
      )}
    </div>
  );
}
