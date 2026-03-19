'use client';

import type { PieChartProps } from '@/lib/chart-schemas';
import { basePlugins, mapDatasets } from '@/lib/chart-utils';
import { useChartData } from '@/lib/use-chart-data';
import { Pie } from 'react-chartjs-2';

export function PieChart({ props }: { props: PieChartProps }) {
  const resolved = useChartData(props);
  return (
    <Pie
      data={{
        labels: resolved.labels,
        datasets: mapDatasets(resolved.datasets, { borderWidth: 1 }) as any,
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: basePlugins(props),
      }}
    />
  );
}
