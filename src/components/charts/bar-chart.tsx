'use client';

import type { BarChartProps } from '@/lib/chart-schemas';
import {
  ZOOM_OPTIONS,
  basePlugins,
  mapDatasets,
  yAxisConfig,
} from '@/lib/chart-utils';
import { useChartData } from '@/lib/use-chart-data';
import { useZoomReset } from '@/lib/use-zoom-reset';
import { Bar } from 'react-chartjs-2';
import { ZoomableChart } from './zoomable-chart';

export function BarChart({ props }: { props: BarChartProps }) {
  const resolved = useChartData(props);
  const stacked = props.stacked ?? false;
  const { chartRef, isZoomed, zoomOptions, resetZoom } =
    useZoomReset(ZOOM_OPTIONS);

  const datasets = mapDatasets(resolved.datasets, { borderWidth: 1 }).map(
    (mapped, i) => {
      const src = resolved.datasets[i];
      return {
        ...mapped,
        ...(src?.type ? { type: src.type as 'bar' | 'line' } : {}),
        ...(src?.borderDash ? { borderDash: src.borderDash } : {}),
      };
    }
  );

  return (
    <ZoomableChart isZoomed={isZoomed} onReset={resetZoom}>
      <Bar
        ref={chartRef as React.RefObject<never>}
        data={{
          labels: resolved.labels,
          datasets: datasets as Parameters<typeof Bar>[0]['data']['datasets'],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: props.indexAxis ?? 'x',
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
