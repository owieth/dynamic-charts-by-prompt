'use client';

import { useRef } from 'react';
import type { Chart } from 'chart.js';
import type { LineChartProps } from '@/lib/chart-schemas';
import {
  ZOOM_OPTIONS,
  basePlugins,
  mapDatasets,
  yAxisConfig,
} from '@/lib/chart-utils';
import { useChartData } from '@/lib/use-chart-data';
import { Line } from 'react-chartjs-2';
import { ChartExportButton } from '@/components/chart-export-button';

export function LineChart({ props }: { props: LineChartProps }) {
  const chartRef = useRef<Chart<'line'> | null>(null);
  const resolved = useChartData(props);
  return (
    <div className="group relative size-full">
      <Line
        ref={chartRef}
        data={{
          labels: resolved.labels,
          datasets: mapDatasets(resolved.datasets, {
            borderWidth: 2,
            fill: false,
            tension: 0.4,
          }),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { ...basePlugins(props), zoom: ZOOM_OPTIONS },
          scales: yAxisConfig(props.yFormat),
        }}
      />
      <ChartExportButton chartRef={chartRef} title={props.title} />
    </div>
  );
}
