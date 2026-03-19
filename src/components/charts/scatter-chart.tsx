'use client';

import type { ScatterChartProps } from '@/lib/chart-schemas';
import { ZOOM_OPTIONS, basePlugins } from '@/lib/chart-utils';
import { Scatter } from 'react-chartjs-2';

export function ScatterChart({ props }: { props: ScatterChartProps }) {
  const datasets = (props.datasets ?? []).map(ds => ({
    label: ds.label,
    data: ds.data,
    backgroundColor: ds.backgroundColor ?? undefined,
    borderColor: ds.borderColor ?? undefined,
    borderWidth: ds.borderWidth ?? 1,
    pointStyle: ds.pointStyle ?? ('circle' as const),
    pointRadius: ds.pointRadius ?? 4,
  }));

  return (
    <Scatter
      data={{ datasets }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { ...basePlugins(props), zoom: ZOOM_OPTIONS },
        scales: {
          x: {
            title: {
              display: !!props.xLabel,
              text: props.xLabel ?? '',
            },
          },
          y: {
            title: {
              display: !!props.yLabel,
              text: props.yLabel ?? '',
            },
          },
        },
      }}
    />
  );
}
