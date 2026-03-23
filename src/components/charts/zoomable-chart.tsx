'use client';

import type { ReactNode } from 'react';

interface ZoomableChartProps {
  isZoomed: boolean;
  onReset: () => void;
  children: ReactNode;
}

export function ZoomableChart({
  isZoomed,
  onReset,
  children,
}: ZoomableChartProps) {
  return (
    <div className="relative size-full">
      {children}
      {isZoomed && (
        <button
          type="button"
          onClick={onReset}
          className="absolute bottom-2 right-2 z-10 rounded bg-neutral-800/80 px-2 py-1 text-xs text-neutral-200 backdrop-blur-sm transition-opacity hover:bg-neutral-700/90"
          aria-label="Reset zoom"
        >
          Reset zoom
        </button>
      )}
    </div>
  );
}
