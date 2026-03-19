'use client';

import type { Chart } from 'chart.js';
import type { RefObject } from 'react';

export function ChartExportButton({
  chartRef,
  title,
}: {
  chartRef: RefObject<Chart | null | undefined>;
  title: string | null;
}) {
  function handleExport() {
    const chart = chartRef.current;
    if (!chart) return;

    const base64 = chart.toBase64Image();
    const link = document.createElement('a');
    link.download = `${title ?? 'chart'}.png`;
    link.href = base64;
    link.click();
  }

  return (
    <button
      type="button"
      aria-label="Export chart as PNG"
      onClick={handleExport}
      className="absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-md bg-surface/80 text-ink-muted opacity-0 backdrop-blur-sm transition-opacity duration-200 ease-out hover:text-ink group-hover:opacity-100"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    </button>
  );
}
