'use client';

import { useRef } from 'react';
import type { Chart } from 'chart.js';
import type { AreaChartProps } from '@/lib/chart-schemas';
import {
  ZOOM_OPTIONS,
  basePlugins,
  mapDatasets,
  yAxisConfig,
} from '@/lib/chart-utils';
import { useChartData } from '@/lib/use-chart-data';
import { Line } from 'react-chartjs-2';
import { ChartExportButton } from '@/components/chart-export-button';

export function AreaChart({ props }: { props: AreaChartProps }) {
  const chartRef = useRef<Chart<'line'> | null>(null);
  const resolved = useChartData(props);
  const stacked = props.stacked ?? false;
  return (
    <div className="group relative size-full">
      <Line
        ref={chartRef}
        data={{
          labels: resolved.labels,
          datasets: mapDatasets(resolved.datasets, {
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          }),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
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
