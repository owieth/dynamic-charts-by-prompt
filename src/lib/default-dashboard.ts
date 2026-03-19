import type { Spec } from '@json-render/core';

export const DEFAULT_DASHBOARD_ID = 'default-overview';

export const DEFAULT_DASHBOARD_SPEC: Spec = {
  root: 'root',
  elements: {
    root: {
      type: 'Stack',
      props: { direction: 'vertical', gap: 'lg' },
      children: ['metrics-row', 'charts-row-1', 'charts-row-2'],
    },

    // ── Metrics row ──────────────────────────────
    'metrics-row': {
      type: 'Stack',
      props: { direction: 'horizontal', gap: 'lg' },
      children: [
        'metric-projects',
        'metric-capacity',
        'metric-capex',
        'metric-countries',
      ],
    },
    'metric-projects': {
      type: 'MetricCard',
      props: {
        label: 'Total Projects',
        value: '120',
        description: 'Active portfolio projects',
      },
    },
    'metric-capacity': {
      type: 'MetricCard',
      props: {
        label: 'Total Capacity',
        value: '580 MW',
        description: 'Combined across all projects',
      },
    },
    'metric-capex': {
      type: 'MetricCard',
      props: {
        label: 'Total CapEx',
        value: '$6.85M',
        description: 'Capital expenditure',
      },
    },
    'metric-countries': {
      type: 'MetricCard',
      props: {
        label: 'Countries',
        value: '24',
        description: 'Geographic footprint',
      },
    },

    // ── Charts row 1 ─────────────────────────────
    'charts-row-1': {
      type: 'Grid',
      props: { columns: 2 },
      children: ['card-country', 'card-tech'],
    },
    'card-country': {
      type: 'Card',
      props: { title: 'Top 10 Countries by Project Count' },
      children: ['chart-country'],
    },
    'chart-country': {
      type: 'BarChart',
      props: {
        title: 'Top 10 Countries by Project Count',
        dataQuery: {
          source: 'projects',
          groupBy: 'Country',
          aggregate: 'count',
          valueField: null,
          sort: 'desc',
          limit: 10,
          filter: null,
        },
        datasetLabel: 'Projects',
        showLegend: true,
        yFormat: 'number',
        labels: null,
        datasets: null,
      },
    },
    'card-tech': {
      type: 'Card',
      props: { title: 'Technology Breakdown' },
      children: ['chart-tech'],
    },
    'chart-tech': {
      type: 'DoughnutChart',
      props: {
        title: 'Technology Breakdown',
        dataQuery: {
          source: 'projects',
          groupBy: 'Technology',
          aggregate: 'count',
          valueField: null,
          sort: 'desc',
          limit: null,
          filter: null,
        },
        datasetLabel: 'Projects',
        showLegend: true,
        yFormat: null,
        labels: null,
        datasets: null,
      },
    },

    // ── Charts row 2 ─────────────────────────────
    'charts-row-2': {
      type: 'Grid',
      props: { columns: 2 },
      children: ['card-status', 'card-capacity'],
    },
    'card-status': {
      type: 'Card',
      props: { title: 'Projects by Status' },
      children: ['chart-status'],
    },
    'chart-status': {
      type: 'PieChart',
      props: {
        title: 'Projects by Status',
        dataQuery: {
          source: 'projects',
          groupBy: 'Status',
          aggregate: 'count',
          valueField: null,
          sort: 'desc',
          limit: null,
          filter: null,
        },
        datasetLabel: 'Projects',
        showLegend: true,
        yFormat: null,
        labels: null,
        datasets: null,
      },
    },
    'card-capacity': {
      type: 'Card',
      props: { title: 'Capacity by Technology (kW)' },
      children: ['chart-capacity'],
    },
    'chart-capacity': {
      type: 'BarChart',
      props: {
        title: 'Capacity by Technology (kW)',
        dataQuery: {
          source: 'projects',
          groupBy: 'Technology',
          aggregate: 'sum',
          valueField: 'Capacity (kW)',
          sort: 'desc',
          limit: null,
          filter: null,
        },
        datasetLabel: 'Capacity (kW)',
        showLegend: true,
        yFormat: 'number',
        labels: null,
        datasets: null,
        stacked: false,
        indexAxis: 'y',
      },
    },
  },
};
