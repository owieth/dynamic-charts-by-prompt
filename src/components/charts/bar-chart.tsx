"use client";

import { Bar } from "react-chartjs-2";
import { ZOOM_OPTIONS, mapDatasets, basePlugins, yAxisConfig } from "@/lib/chart-utils";
import { useChartData } from "@/lib/use-chart-data";
import type { BarChartProps } from "@/lib/chart-schemas";

export function BarChart({ props }: { props: BarChartProps }) {
  const resolved = useChartData(props);
  const stacked = props.stacked ?? false;
  return (
    <Bar
      data={{
        labels: resolved.labels,
        datasets: mapDatasets(resolved.datasets, { borderWidth: 1 }),
      }}
      options={{
        responsive: true,
        indexAxis: props.indexAxis ?? "x",
        plugins: { ...basePlugins(props), zoom: ZOOM_OPTIONS },
        scales: {
          x: { stacked },
          y: { stacked, ...yAxisConfig(props.yFormat).y },
        },
      }}
    />
  );
}
