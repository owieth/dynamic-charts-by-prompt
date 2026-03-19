"use client";

import { Line } from "react-chartjs-2";
import { ZOOM_OPTIONS, mapDatasets, basePlugins, yAxisConfig } from "@/lib/chart-utils";
import { useChartData } from "@/lib/use-chart-data";
import type { AreaChartProps } from "@/lib/chart-schemas";

export function AreaChart({ props }: { props: AreaChartProps }) {
  const resolved = useChartData(props);
  const stacked = props.stacked ?? false;
  return (
    <Line
      data={{
        labels: resolved.labels,
        datasets: mapDatasets(resolved.datasets, { borderWidth: 2, fill: true, tension: 0.4 }),
      }}
      options={{
        responsive: true,
        plugins: { ...basePlugins(props), zoom: ZOOM_OPTIONS },
        scales: {
          x: { stacked },
          y: { stacked, ...yAxisConfig(props.yFormat).y },
        },
      }}
    />
  );
}
