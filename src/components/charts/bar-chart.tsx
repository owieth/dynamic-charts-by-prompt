'use client';

import { useRef } from 'react';
import type { Chart } from 'chart.js';
import type { BarChartProps } from '@/lib/chart-schemas';
import {
  ZOOM_OPTIONS,
  basePlugins,
  mapDatasets,
  yAxisConfig,
} from '@/lib/chart-utils';
import { useChartData } from '@/lib/use-chart-data';
import { Bar } from 'react-chartjs-2';
import { ChartExportButton } from '@/components/chart-export-button';

export function BarChart({ props }: { props: BarChartProps }) {
  const chartRef = useRef<Chart<'bar'> | null>(null);
  const resolved = useChartData(props);
  const stacked = props.stacked ?? false;
  return (
    <div className="group relative size-full">
      <Bar
        ref={chartRef}
        data={{
          labels: resolved.labels,
          datasets: mapDatasets(resolved.datasets, { borderWidth: 1 }),
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
      <ChartExportButton chartRef={chartRef} title={props.title} />
    </div>
  );
}
