'use client';

import { useRef } from 'react';
import type { Chart } from 'chart.js';
import type { DoughnutChartProps } from '@/lib/chart-schemas';
import { basePlugins, mapDatasets } from '@/lib/chart-utils';
import { useChartData } from '@/lib/use-chart-data';
import { Doughnut } from 'react-chartjs-2';
import { ChartExportButton } from '@/components/chart-export-button';

export function DoughnutChart({ props }: { props: DoughnutChartProps }) {
  const chartRef = useRef<Chart<'doughnut'> | null>(null);
  const resolved = useChartData(props);
  return (
    <div className="group relative size-full">
      <Doughnut
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
