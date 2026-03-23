'use client';

import type { LineChartProps } from '@/lib/chart-schemas';
import {
  ZOOM_OPTIONS,
  basePlugins,
  mapDatasets,
  yAxisConfig,
} from '@/lib/chart-utils';
import { useChartData } from '@/lib/use-chart-data';
import { useZoomReset } from '@/lib/use-zoom-reset';
import { Line } from 'react-chartjs-2';
import { ZoomableChart } from './zoomable-chart';

export function LineChart({ props }: { props: LineChartProps }) {
  const resolved = useChartData(props);
  const { chartRef, isZoomed, zoomOptions, resetZoom } =
    useZoomReset(ZOOM_OPTIONS);

  return (
    <ZoomableChart isZoomed={isZoomed} onReset={resetZoom}>
      <Line
        ref={chartRef as React.RefObject<never>}
        data={{
          labels: resolved.labels,
          datasets: mapDatasets(resolved.datasets, {
            borderWidth: 2,
            fill: false,
            tension: 0.4,
          }),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { ...basePlugins(props), zoom: zoomOptions },
          scales: yAxisConfig(props.yFormat),
        }}
      />
    </ZoomableChart>
  );
}
