import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { shadcnComponentDefinitions } from "@json-render/shadcn/catalog";
import { z } from "zod";
import {
  lineChartSchema,
  barChartSchema,
  pieChartSchema,
  doughnutChartSchema,
  areaChartSchema,
  radarChartSchema,
} from "./chart-schemas";

const { Card, Stack, Grid, Heading, Text, Badge, Separator, Tabs, Table } =
  shadcnComponentDefinitions;

export const catalog = defineCatalog(schema, {
  components: {
    Card,
    Stack,
    Grid,
    Separator,
    Tabs,
    Heading: {
      ...Heading,
      description: "Section heading. Use level h1 for page title, h2 for sections, h3/h4 for card headers.",
    },
    Text: {
      ...Text,
      description: "Text content. Set muted: true for secondary text.",
    },
    Badge: {
      ...Badge,
      description: "Small status label for indicators or highlights.",
    },
    Table,

    MetricCard: {
      props: z.object({
        label: z.string(),
        value: z.string(),
        description: z.string().nullable(),
      }),
      description: "KPI metric display. Use for summary numbers (e.g. label='Total Projects', value='206', description='Across 22 countries').",
      example: { label: "Total Projects", value: "206", description: "Across 22 countries" },
    },

    BarChart: {
      props: barChartSchema,
      description: "Bar chart. ALWAYS use dataQuery to pull data from the projects source. Set groupBy for categories, aggregate for the operation, valueField for numeric fields. Use sort/limit to control output.",
      example: {
        title: "Projects by Country (Top 10)",
        dataQuery: { source: "projects", filter: null, groupBy: "Country", aggregate: "count", valueField: null, sort: "desc", limit: 10 },
        datasetLabel: "Projects",
        labels: null, datasets: null,
        showLegend: true, yFormat: "number", stacked: false, indexAxis: "x",
      },
    },

    LineChart: {
      props: lineChartSchema,
      description: "Line chart for trends. Use dataQuery with a date field (e.g. 'CoD:year') as groupBy.",
      example: {
        title: "Projects by Year",
        dataQuery: { source: "projects", filter: null, groupBy: "CoD:year", aggregate: "count", valueField: null, sort: "asc", limit: null },
        datasetLabel: "Projects",
        labels: null, datasets: null,
        showLegend: true, yFormat: "number",
      },
    },

    PieChart: {
      props: pieChartSchema,
      description: "Pie chart for proportional distribution. Use dataQuery with groupBy for slices.",
      example: {
        title: "Projects by Technology",
        dataQuery: { source: "projects", filter: null, groupBy: "Technology", aggregate: "count", valueField: null, sort: "desc", limit: null },
        datasetLabel: "Projects",
        labels: null, datasets: null,
        showLegend: true, yFormat: null,
      },
    },

    DoughnutChart: {
      props: doughnutChartSchema,
      description: "Doughnut chart — pie with center hole. Use dataQuery for part-to-whole breakdowns.",
    },

    AreaChart: {
      props: areaChartSchema,
      description: "Area chart with filled regions. Use dataQuery for cumulative trends.",
      example: {
        title: "Cumulative Capacity by Year",
        dataQuery: { source: "projects", filter: null, groupBy: "CoD:year", aggregate: "sum", valueField: "Capacity (kW)", sort: "asc", limit: null },
        datasetLabel: "Capacity (kW)",
        labels: null, datasets: null,
        showLegend: true, stacked: false, yFormat: "number",
      },
    },

    RadarChart: {
      props: radarChartSchema,
      description: "Radar chart for multi-metric comparison. Use dataQuery to compare groups.",
    },
  },
  actions: {},
});
