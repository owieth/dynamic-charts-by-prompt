'use client';

import { useMemo } from 'react';
import { useDataSource } from './data-context';
import {
  resolveQuery,
  resolveMultiQuery,
  type DataQuery,
  type ResolvedChartData,
} from './data-query';

interface ChartProps {
  labels?: string[] | null;
  datasets?:
    | {
        label: string;
        data: number[];
        backgroundColor: string | string[] | null;
        borderColor: string | string[] | null;
        borderWidth: number | null;
        fill: boolean | null;
      }[]
    | null;
  dataQuery?: DataQuery | null;
  dataQueries?: DataQuery[] | null;
  datasetLabel?: string | null;
  datasetLabels?: string[] | null;
  backgroundColor?: string | string[] | null;
  borderColor?: string | string[] | null;
  borderWidth?: number | null;
  fill?: boolean | null;
}

export function useChartData(props: ChartProps): ResolvedChartData {
  const projects = useDataSource('projects');

  return useMemo(() => {
    const applyOverrides = (
      datasets: ResolvedChartData['datasets']
    ): ResolvedChartData['datasets'] =>
      datasets.map(ds => ({
        ...ds,
        backgroundColor: props.backgroundColor ?? ds.backgroundColor,
        borderColor: props.borderColor ?? ds.borderColor,
        borderWidth: props.borderWidth ?? ds.borderWidth,
        fill: props.fill ?? ds.fill,
      }));

    // Prefer dataQueries (multi-series) if provided
    if (props.dataQueries && props.dataQueries.length > 0) {
      const resolved = resolveMultiQuery(
        projects,
        props.dataQueries,
        props.datasetLabels ?? undefined
      );
      return { ...resolved, datasets: applyOverrides(resolved.datasets) };
    }

    // Single dataQuery
    if (props.dataQuery) {
      const resolved = resolveQuery(
        projects,
        props.dataQuery,
        props.datasetLabel ?? undefined
      );
      return { ...resolved, datasets: applyOverrides(resolved.datasets) };
    }

    // Fall back to static labels/datasets
    return {
      labels: props.labels ?? [],
      datasets: applyOverrides(
        (props.datasets ?? []).map(ds => ({
          label: ds.label,
          data: ds.data,
          backgroundColor: ds.backgroundColor,
          borderColor: ds.borderColor,
          borderWidth: ds.borderWidth,
          fill: ds.fill,
        }))
      ),
    };
  }, [
    projects,
    props.dataQuery,
    props.dataQueries,
    props.datasetLabel,
    props.datasetLabels,
    props.labels,
    props.datasets,
    props.backgroundColor,
    props.borderColor,
    props.borderWidth,
    props.fill,
  ]);
}
