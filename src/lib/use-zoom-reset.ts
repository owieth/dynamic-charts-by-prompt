'use client';

import { useCallback, useRef, useState } from 'react';

type ChartRef = { resetZoom(): void } | null;

export function useZoomReset(baseZoomOptions: typeof import('@/lib/chart-utils').ZOOM_OPTIONS) {
  const chartRef = useRef<ChartRef>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const zoomOptions = {
    zoom: {
      ...baseZoomOptions.zoom,
      onZoomComplete: () => setIsZoomed(true),
    },
    pan: {
      ...baseZoomOptions.pan,
      onPanComplete: () => setIsZoomed(true),
    },
  };

  const resetZoom = useCallback(() => {
    chartRef.current?.resetZoom();
    setIsZoomed(false);
  }, []);

  return { chartRef, isZoomed, zoomOptions, resetZoom };
}
