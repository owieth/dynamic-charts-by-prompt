'use client';

import type { RadarChartProps } from '@/lib/chart-schemas';
import { basePlugins, mapDatasets } from '@/lib/chart-utils';
import { useChartData } from '@/lib/use-chart-data';
import { Radar } from 'react-chartjs-2';

export function RadarChart({ props }: { props: RadarChartProps }) {
  const resolved = useChartData(props);
  return (
    <Radar
      data={{
        labels: resolved.labels,
        datasets: mapDatasets(resolved.datasets, {
          borderWidth: 2,
          fill: true,
        }) as any,
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: basePlugins(props),
      }}
    />
  );
}
