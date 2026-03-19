"use client";

import { Doughnut } from "react-chartjs-2";
import { mapDatasets, basePlugins } from "@/lib/chart-utils";
import { useChartData } from "@/lib/use-chart-data";
import type { DoughnutChartProps } from "@/lib/chart-schemas";

export function DoughnutChart({ props }: { props: DoughnutChartProps }) {
  const resolved = useChartData(props);
  return (
    <Doughnut
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
  );
}
