'use client';

import type { LineChartProps } from '@/lib/chart-schemas';
import {
  ZOOM_OPTIONS,
  basePlugins,
  mapDatasets,
  yAxisConfig,
} from '@/lib/chart-utils';
import { useChartData } from '@/lib/use-chart-data';
import { Line } from 'react-chartjs-2';

export function LineChart({ props }: { props: LineChartProps }) {
  const resolved = useChartData(props);
  return (
    <Line
      data={{
        labels: resolved.labels,
        datasets: mapDatasets(resolved.datasets, {
          borderWidth: 2,
          fill: false,
          tension: 0.4,
        }) as any,
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { ...basePlugins(props), zoom: ZOOM_OPTIONS },
        scales: yAxisConfig(props.yFormat),
      }}
    />
  );
}
