'use client';

import type { AreaChartProps } from '@/lib/chart-schemas';
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

export function AreaChart({ props }: { props: AreaChartProps }) {
  const resolved = useChartData(props);
  const stacked = props.stacked ?? false;
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
            fill: true,
            tension: 0.4,
          }),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { ...basePlugins(props), zoom: zoomOptions },
          scales: {
            x: { stacked },
            y: { stacked, ...yAxisConfig(props.yFormat).y },
          },
        }}
      />
    </ZoomableChart>
  );
}
