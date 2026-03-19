'use client';

import type { BarChartProps } from '@/lib/chart-schemas';
import {
  ZOOM_OPTIONS,
  basePlugins,
  mapDatasets,
  yAxisConfig,
} from '@/lib/chart-utils';
import { useChartData } from '@/lib/use-chart-data';
import { Bar } from 'react-chartjs-2';

export function BarChart({ props }: { props: BarChartProps }) {
  const resolved = useChartData(props);
  const stacked = props.stacked ?? false;
  return (
    <Bar
      data={{
        labels: resolved.labels,
        datasets: mapDatasets(resolved.datasets, { borderWidth: 1 }) as any,
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: props.indexAxis ?? 'x',
        plugins: { ...basePlugins(props), zoom: ZOOM_OPTIONS },
        scales: {
          x: { stacked },
          y: { stacked, ...yAxisConfig(props.yFormat).y },
        },
      }}
    />
  );
}
