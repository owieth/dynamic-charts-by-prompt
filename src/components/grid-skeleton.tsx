'use client';

import { useGridLayout } from '@/lib/use-grid-layout';
import type { Spec } from '@json-render/core';
import { useMemo } from 'react';
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';

const BREAKPOINTS = { lg: 0 } as const;
const COLS = { lg: 12 } as const;
const MARGIN = [8, 8] as [number, number];

function CellSkeleton() {
  return (
    <div className="size-full flex flex-col gap-3 p-4">
      <div className="h-3 w-1/3 rounded bg-surface-hi animate-pulse" />
      <div className="flex-1 rounded bg-surface-hi/60 animate-pulse" />
      <div className="h-2 w-1/2 rounded bg-surface-hi/40 animate-pulse" />
    </div>
  );
}

interface GridSkeletonProps {
  spec: Spec | null;
}

export function GridSkeleton({ spec }: GridSkeletonProps) {
  const { width, containerRef, mounted } = useContainerWidth();
  const { layout, childKeys } = useGridLayout(spec, false);
  const layouts = useMemo(() => ({ lg: layout }), [layout]);

  if (!spec || childKeys.length === 0) return null;

  return (
    <div ref={containerRef}>
      {mounted && (
        <ResponsiveGridLayout
          layouts={layouts}
          breakpoints={BREAKPOINTS}
          cols={COLS}
          width={width}
          rowHeight={80}
          margin={MARGIN}
          dragConfig={{ enabled: false }}
          resizeConfig={{ enabled: false }}
        >
          {childKeys.map(key => (
            <div key={key} className="overflow-hidden rounded-lg bg-surface/80">
              <CellSkeleton />
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </div>
  );
}
