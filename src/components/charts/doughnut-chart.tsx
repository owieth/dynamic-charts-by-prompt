'use client';

import type { DoughnutChartProps } from '@/lib/chart-schemas';
import { basePlugins, mapDatasets } from '@/lib/chart-utils';
import { useChartData } from '@/lib/use-chart-data';
import { Doughnut } from 'react-chartjs-2';

export function DoughnutChart({ props }: { props: DoughnutChartProps }) {
  const resolved = useChartData(props);
  return (
    <Doughnut
      data={{
        labels: resolved.labels,
        datasets: mapDatasets(resolved.datasets, { borderWidth: 1 }),
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: basePlugins(props),
      }}
    />
  );
}
