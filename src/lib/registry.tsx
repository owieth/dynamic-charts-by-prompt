"use client";

import { defineRegistry } from "@json-render/react";
import { shadcnComponents } from "@json-render/shadcn";
import { catalog } from "./catalog";
import { LineChart } from "@/components/charts/line-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { PieChart } from "@/components/charts/pie-chart";
import { DoughnutChart } from "@/components/charts/doughnut-chart";
import { AreaChart } from "@/components/charts/area-chart";
import { RadarChart } from "@/components/charts/radar-chart";
import { MetricCard } from "@/components/metric-card";
import type {
  LineChartProps,
  BarChartProps,
  PieChartProps,
  DoughnutChartProps,
  AreaChartProps,
  RadarChartProps,
} from "./chart-schemas";

// Pick only the shadcn renderers that match our lean catalog
const { Card, Stack, Grid, Heading, Text, Badge, Separator, Tabs, Table } =
  shadcnComponents;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    MetricCard: ({ props }: { props: { label: string; value: string; description: string | null } }) => (
      <MetricCard props={props} />
    ),
    LineChart: ({ props }: { props: LineChartProps }) => <LineChart props={props} />,
    BarChart: ({ props }: { props: BarChartProps }) => <BarChart props={props} />,
    PieChart: ({ props }: { props: PieChartProps }) => <PieChart props={props} />,
    DoughnutChart: ({ props }: { props: DoughnutChartProps }) => <DoughnutChart props={props} />,
    AreaChart: ({ props }: { props: AreaChartProps }) => <AreaChart props={props} />,
    RadarChart: ({ props }: { props: RadarChartProps }) => <RadarChart props={props} />,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
});

export { registry };
