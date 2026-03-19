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

    MetricCard: {
      props: z.object({
        label: z.string(),
        value: z.string(),
        description: z.string().nullable(),
      }),
      description:
        "KPI metric display. Use for summary numbers (e.g. label='Total Projects', value='206', description='Across 22 countries').",
      example: {
        label: 'Total Projects',
        value: '206',
        description: 'Across 22 countries',
      },
    },

    BarChart: {
      props: barChartSchema,
      description:
        'Bar chart. ALWAYS use dataQuery to pull data from the projects source. Set groupBy for categories, aggregate for the operation, valueField for numeric fields. Use sort/limit to control output. Set top-level backgroundColor/borderColor to override default palette colors (e.g. backgroundColor: "rgba(59,130,246,0.8)" for solid blue, or an array for per-bar colors).',
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
        },
        datasetLabel: 'Projects',
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
        "Line chart for trends. Use dataQuery with a date field (e.g. 'CoD:year') as groupBy. Set top-level backgroundColor/borderColor to override default colors.",
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
        },
        datasetLabel: 'Projects',
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
        'Pie chart for proportional distribution. Use dataQuery with groupBy for slices. Set top-level backgroundColor to override default slice colors (use an array for per-slice colors).',
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
        },
        datasetLabel: 'Projects',
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
        'Area chart with filled regions. Use dataQuery for cumulative trends. Set top-level backgroundColor/borderColor to override default colors.',
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
        },
        datasetLabel: 'Capacity (kW)',
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
        'Radar chart for multi-metric comparison. Use dataQuery to compare groups. Set top-level backgroundColor/borderColor to override default colors.',
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
