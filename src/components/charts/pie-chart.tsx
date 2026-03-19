"use client";

import { Pie } from "react-chartjs-2";
import { mapDatasets, basePlugins } from "@/lib/chart-utils";
import { useChartData } from "@/lib/use-chart-data";
import type { PieChartProps } from "@/lib/chart-schemas";

export function PieChart({ props }: { props: PieChartProps }) {
  const resolved = useChartData(props);
  return (
    <Pie
      data={{
        labels: resolved.labels,
        datasets: mapDatasets(resolved.datasets, { borderWidth: 1 }),
      }}
      options={{
        responsive: true,
        plugins: basePlugins(props),
      }}
    />
  );
}
