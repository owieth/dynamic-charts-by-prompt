import { defineCatalog } from '@json-render/core';
import { schema } from '@json-render/react/schema';
import { shadcnComponentDefinitions } from '@json-render/shadcn/catalog';
import { z } from 'zod';
import {
  areaChartSchema,
  barChartSchema,
  dataTableSchema,
  doughnutChartSchema,
  lineChartSchema,
  pieChartSchema,
  radarChartSchema,
} from './chart-schemas';

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
      description:
        'Section heading. Use level h1 for page title, h2 for sections, h3/h4 for card headers.',
    },
    Text: {
      ...Text,
      description: 'Text content. Set muted: true for secondary text.',
    },
    Badge: {
      ...Badge,
      description: 'Small status label for indicators or highlights.',
    },
    Table,

    DashboardHeader: {
      props: z.object({
        title: z.string(),
        subtitle: z.string().nullable(),
      }),
      description:
        'Dashboard title and subtitle. Use at the very top of every dashboard to summarize its purpose.',
      example: {
        title: 'Renewable Energy Projects Overview',
        subtitle:
          'Key metrics and trends across global renewable energy installations',
      },
    },

    MetricCard: {
      props: z.object({
        label: z.string(),
        value: z.string(),
        description: z.string().nullable(),
        trend: z.enum(['up', 'down', 'neutral']).nullable(),
        change: z.string().nullable(),
      }),
      description:
        "KPI metric display. Use for summary numbers. Optional trend ('up'|'down'|'neutral') and change (e.g. '+12%') show a colored arrow indicator.",
      example: {
        label: 'Total Projects',
        value: '206',
        description: 'Across 22 countries',
        trend: 'up',
        change: '+12%',
      },
    },

    BarChart: {
      props: barChartSchema,
      description:
        'Bar chart. Use dataQuery for a single series or dataQueries (array) with datasetLabels for multi-series overlays (e.g. capacity + count by year). Each query in dataQueries produces one dataset with a distinct color. All queries should share the same groupBy for aligned labels. Set top-level backgroundColor/borderColor to override default palette colors. Use computedFields in dataQuery for derived metrics: ratio (numerator/denominator per group), running_total (cumulative sum), pct_of_total (percentage of total).',
      example: {
        title: 'Projects by Country (Top 10)',
        dataQuery: {
          source: 'projects',
          filter: null,
          groupBy: 'Country',
          aggregate: 'count',
          valueField: null,
          sort: 'desc',
          limit: 10,
          computedFields: null,
        },
        dataQueries: null,
        datasetLabel: 'Projects',
        datasetLabels: null,
        labels: null,
        datasets: null,
        showLegend: true,
        yFormat: 'number',
        stacked: false,
        indexAxis: 'x',
        backgroundColor: null,
        borderColor: null,
        borderWidth: null,
        fill: null,
      },
    },

    LineChart: {
      props: lineChartSchema,
      description:
        "Line chart for trends. Use dataQuery for a single series or dataQueries (array) with datasetLabels for multi-series overlays. Use a date field (e.g. 'CoD:year') as groupBy. Set top-level backgroundColor/borderColor to override default colors. Use computedFields for running_total to show cumulative trends.",
      example: {
        title: 'Projects by Year',
        dataQuery: {
          source: 'projects',
          filter: null,
          groupBy: 'CoD:year',
          aggregate: 'count',
          valueField: null,
          sort: 'asc',
          limit: null,
          computedFields: null,
        },
        dataQueries: null,
        datasetLabel: 'Projects',
        datasetLabels: null,
        labels: null,
        datasets: null,
        showLegend: true,
        yFormat: 'number',
        backgroundColor: null,
        borderColor: null,
        borderWidth: null,
        fill: null,
      },
    },

    PieChart: {
      props: pieChartSchema,
      description:
        'Pie chart for proportional distribution. Use dataQuery with groupBy for slices. Set top-level backgroundColor to override default slice colors (use an array for per-slice colors). Use computedFields with pct_of_total to show percentage labels.',
      example: {
        title: 'Projects by Technology',
        dataQuery: {
          source: 'projects',
          filter: null,
          groupBy: 'Technology',
          aggregate: 'count',
          valueField: null,
          sort: 'desc',
          limit: null,
          computedFields: null,
        },
        dataQueries: null,
        datasetLabel: 'Projects',
        datasetLabels: null,
        labels: null,
        datasets: null,
        showLegend: true,
        yFormat: null,
        backgroundColor: null,
        borderColor: null,
        borderWidth: null,
        fill: null,
      },
    },

    DoughnutChart: {
      props: doughnutChartSchema,
      description:
        'Doughnut chart — pie with center hole. Use dataQuery for part-to-whole breakdowns. Set top-level backgroundColor to override default slice colors.',
    },

    AreaChart: {
      props: areaChartSchema,
      description:
        'Area chart with filled regions. Use dataQuery for a single series or dataQueries (array) with datasetLabels for multi-series overlays. Set top-level backgroundColor/borderColor to override default colors. Use computedFields with running_total to show cumulative area charts.',
      example: {
        title: 'Cumulative Capacity by Year',
        dataQuery: {
          source: 'projects',
          filter: null,
          groupBy: 'CoD:year',
          aggregate: 'sum',
          valueField: 'Capacity (kW)',
          sort: 'asc',
          limit: null,
          computedFields: null,
        },
        dataQueries: null,
        datasetLabel: 'Capacity (kW)',
        datasetLabels: null,
        labels: null,
        datasets: null,
        showLegend: true,
        stacked: false,
        yFormat: 'number',
        backgroundColor: null,
        borderColor: null,
        borderWidth: null,
        fill: null,
      },
    },

    RadarChart: {
      props: radarChartSchema,
      description:
        'Radar chart for multi-metric comparison. Use dataQuery for a single series or dataQueries (array) with datasetLabels for multi-series overlays. Set top-level backgroundColor/borderColor to override default colors.',
    },

    DataTable: {
      props: dataTableSchema,
      description:
        'Sortable data table showing raw project rows. Specify columns to display, optional filter, sort, limit, and pageSize for pagination. Use this when the user wants to see individual records rather than aggregated charts.',
      example: {
        title: 'Top 10 Projects by Capacity',
        columns: ['Project Name', 'Country', 'Technology', 'Capacity (kW)', 'CoD'],
        source: 'projects',
        filter: null,
        sortBy: 'Capacity (kW)',
        sortDir: 'desc',
        limit: 10,
        pageSize: 10,
      },
    },
  },
  actions: {},
});
