'use client';

import { useRef } from 'react';
import type { Chart } from 'chart.js';
import type { RadarChartProps } from '@/lib/chart-schemas';
import { basePlugins, mapDatasets } from '@/lib/chart-utils';
import { useChartData } from '@/lib/use-chart-data';
import { Radar } from 'react-chartjs-2';
import { ChartExportButton } from '@/components/chart-export-button';

export function RadarChart({ props }: { props: RadarChartProps }) {
  const chartRef = useRef<Chart<'radar'> | null>(null);
  const resolved = useChartData(props);
  return (
    <div className="group relative size-full">
      <Radar
        ref={chartRef}
        data={{
          labels: resolved.labels,
          datasets: mapDatasets(resolved.datasets, {
            borderWidth: 2,
            fill: true,
          }),
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
