'use client';

import { useRef } from 'react';
import type { Chart } from 'chart.js';
import type { PieChartProps } from '@/lib/chart-schemas';
import { basePlugins, mapDatasets } from '@/lib/chart-utils';
import { useChartData } from '@/lib/use-chart-data';
import { Pie } from 'react-chartjs-2';
import { ChartExportButton } from '@/components/chart-export-button';

export function PieChart({ props }: { props: PieChartProps }) {
  const chartRef = useRef<Chart<'pie'> | null>(null);
  const resolved = useChartData(props);
  return (
    <div className="group relative size-full">
      <Pie
        ref={chartRef}
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
      <ChartExportButton chartRef={chartRef} title={props.title} />
    </div>
  );
}
