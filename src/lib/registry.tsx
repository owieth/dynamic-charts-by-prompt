'use client';

import { ChartErrorBoundary } from '@/components/chart-error-boundary';
import { ChartSkeleton } from '@/components/chart-skeleton';
import { AreaChart } from '@/components/charts/area-chart';
import { BarChart } from '@/components/charts/bar-chart';
import { DoughnutChart } from '@/components/charts/doughnut-chart';
import { LineChart } from '@/components/charts/line-chart';
import { PieChart } from '@/components/charts/pie-chart';
import { RadarChart } from '@/components/charts/radar-chart';
import { DataTable } from '@/components/data-table';
import { DashboardHeader } from '@/components/dashboard-header';
import { MetricCard } from '@/components/metric-card';
import { defineRegistry } from '@json-render/react';
import { shadcnComponents } from '@json-render/shadcn';
import type { ReactNode } from 'react';
import { catalog } from './catalog';
import type {
  AreaChartProps,
  BarChartProps,
  DataTableProps,
  DoughnutChartProps,
  LineChartProps,
  PieChartProps,
  RadarChartProps,
} from './chart-schemas';

// Pick only the shadcn renderers that match our lean catalog
const {
  Card,
  Stack,
  // Grid replaced by responsive wrapper below
  Heading,
  Text,
  Badge,
  Separator,
  Tabs,
  Table,
} = shadcnComponents;

const RESPONSIVE_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
  6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
};

const GAP_MAP: Record<string, string> = {
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
};

/**
 * Responsive Grid: collapses to 1 column on small screens, then expands
 * at `md` and `lg` breakpoints based on the requested column count.
 */
function Grid({
  props,
  children,
}: {
  props: { columns?: number; gap?: string };
  children?: ReactNode;
}) {
  const n = Math.max(1, Math.min(6, props.columns ?? 1));
  const cols = RESPONSIVE_COLS[n] ?? 'grid-cols-1';
  const gap = GAP_MAP[props.gap ?? 'md'] ?? 'gap-3';

  return <div className={`grid ${cols} ${gap}`}>{children}</div>;
}

interface ChartPropsBase {
  labels?: string[] | null;
  datasets?: unknown[] | null;
  dataQuery?: unknown | null;
  dataQueries?: unknown[] | null;
}

function withSkeleton<P extends ChartPropsBase>(
  Chart: (p: { props: P }) => ReactNode
) {
  return function ChartWithSkeleton({ props }: { props: P }) {
    const hasData =
      (props.labels && props.labels.length > 0) ||
      (props.datasets && props.datasets.length > 0) ||
      props.dataQuery ||
      (props.dataQueries && props.dataQueries.length > 0);

    if (!hasData) return <ChartSkeleton />;
    return (
      <ChartErrorBoundary>
        <div className="relative h-full min-h-[200px]">
          <Chart props={props} />
        </div>
      </ChartErrorBoundary>
    );
  };
}

const { registry } = defineRegistry(catalog, {
  components: {
    Card,
    Stack,
    Grid,
    Heading,
    Text,
    Badge,
    Separator,
    Tabs,
    Table,
    DashboardHeader: ({
      props,
    }: {
      props: { title: string; subtitle: string | null };
    }) => <DashboardHeader props={props} />,
    MetricCard: ({
      props,
    }: {
      props: {
        label: string;
        value: string;
        description: string | null;
        trend: 'up' | 'down' | 'neutral' | null;
        change: string | null;
      };
    }) => <MetricCard props={props} />,
    LineChart: withSkeleton<LineChartProps>(LineChart),
    BarChart: withSkeleton<BarChartProps>(BarChart),
    PieChart: withSkeleton<PieChartProps>(PieChart),
    DoughnutChart: withSkeleton<DoughnutChartProps>(DoughnutChart),
    AreaChart: withSkeleton<AreaChartProps>(AreaChart),
    RadarChart: withSkeleton<RadarChartProps>(RadarChart),
    DataTable: ({ props }: { props: DataTableProps }) => (
      <DataTable props={props} />
    ),
  } as any,
});

export { registry };
