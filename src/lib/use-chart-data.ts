"use client";

import { useMemo } from "react";
import { useDataSource } from "./data-context";
import { resolveQuery, type DataQuery, type ResolvedChartData } from "./data-query";

interface ChartProps {
  labels?: string[] | null;
  datasets?: {
    label: string;
    data: number[];
    backgroundColor: string | string[] | null;
    borderColor: string | string[] | null;
    borderWidth: number | null;
    fill: boolean | null;
  }[] | null;
  dataQuery?: DataQuery | null;
  datasetLabel?: string | null;
}

export function useChartData(props: ChartProps): ResolvedChartData {
  const projects = useDataSource("projects");

  return useMemo(() => {
    // Prefer dataQuery if provided
    if (props.dataQuery) {
      return resolveQuery(projects, props.dataQuery, props.datasetLabel ?? undefined);
    }

    // Fall back to static labels/datasets
    return {
      labels: props.labels ?? [],
      datasets: (props.datasets ?? []).map((ds) => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: ds.backgroundColor,
        borderColor: ds.borderColor,
        borderWidth: ds.borderWidth,
        fill: ds.fill,
      })),
    };
  }, [projects, props.dataQuery, props.datasetLabel, props.labels, props.datasets]);
}
