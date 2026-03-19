"use client";

import { Line } from "react-chartjs-2";
import { ZOOM_OPTIONS, mapDatasets, basePlugins, yAxisConfig } from "@/lib/chart-utils";
import { useChartData } from "@/lib/use-chart-data";
import type { LineChartProps } from "@/lib/chart-schemas";

export function LineChart({ props }: { props: LineChartProps }) {
  const resolved = useChartData(props);
  return (
    <Line
      data={{
        labels: resolved.labels,
        datasets: mapDatasets(resolved.datasets, { borderWidth: 2, fill: false, tension: 0.4 }),
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { ...basePlugins(props), zoom: ZOOM_OPTIONS },
        scales: yAxisConfig(props.yFormat),
      }}
    />
  );
}
