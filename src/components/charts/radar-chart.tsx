"use client";

import { Radar } from "react-chartjs-2";
import { mapDatasets, basePlugins } from "@/lib/chart-utils";
import { useChartData } from "@/lib/use-chart-data";
import type { RadarChartProps } from "@/lib/chart-schemas";

export function RadarChart({ props }: { props: RadarChartProps }) {
  const resolved = useChartData(props);
  return (
    <Radar
      data={{
        labels: resolved.labels,
        datasets: mapDatasets(resolved.datasets, { borderWidth: 2, fill: true }),
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: basePlugins(props),
      }}
    />
  );
}
