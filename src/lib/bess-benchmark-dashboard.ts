import type { Spec } from '@json-render/core';

// Color palette by project stage
const COLORS = {
  development: '#d4b896',
  readyToBuild: '#b8860b',
  construction: '#6b5b3e',
  operational: '#3d2b1f',
} as const;

const STAGES = [
  'Development',
  'Ready-to-build',
  'Construction',
  'Operational',
] as const;

const STAGE_COLORS = [
  COLORS.development,
  COLORS.readyToBuild,
  COLORS.construction,
  COLORS.operational,
];

// Deterministic pseudo-random number generator (mulberry32)
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface BessProject {
  name: string;
  stage: string;
  capacityMWh: number;
  capexEurKWh: number;
  opexEurKWhYear: number;
  country: string;
}

function generateProjects(): BessProject[] {
  const rng = seededRandom(42);
  const countries = [
    'Germany',
    'UK',
    'Spain',
    'Italy',
    'France',
    'Netherlands',
    'Poland',
    'Ireland',
    'Belgium',
    'Portugal',
  ];
  const prefixes = [
    'Alpha',
    'Beta',
    'Gamma',
    'Delta',
    'Epsilon',
    'Zeta',
    'Eta',
    'Theta',
    'Iota',
    'Kappa',
    'Lambda',
    'Mu',
    'Nu',
    'Xi',
    'Omicron',
    'Pi',
    'Rho',
    'Sigma',
    'Tau',
    'Upsilon',
    'Phi',
    'Chi',
    'Psi',
    'Omega',
    'Aurora',
    'Boreas',
    'Cirrus',
    'Dynamo',
    'Echo',
    'Flux',
    'Grid',
    'Helix',
    'Ion',
    'Joule',
    'Kelvin',
    'Lumen',
    'Nexus',
    'Ohm',
    'Pulse',
  ];
  return prefixes.map((prefix, i) => {
    const stageIdx = Math.floor(rng() * STAGES.length);
    const capacityMWh = Math.round(50 + rng() * 450);
    const capexEurKWh = Math.round((200 + rng() * 500) * 10) / 10;
    const opexEurKWhYear = Math.round((5 + rng() * 25) * 10) / 10;
    const country = countries[Math.floor(rng() * countries.length)];
    return {
      name: `${prefix} BESS ${i + 1}`,
      stage: STAGES[stageIdx],
      capacityMWh,
      capexEurKWh,
      opexEurKWhYear,
      country,
    };
  });
}

const projects = generateProjects();

// Aggregate CapEx data by project (sorted desc)
const sortedByCapex = [...projects].sort(
  (a, b) => b.capexEurKWh * b.capacityMWh - a.capexEurKWh * a.capacityMWh
);
const capexLabels = sortedByCapex.map(p => p.name);
const capexValues = sortedByCapex.map(
  p => Math.round(p.capexEurKWh * p.capacityMWh)
);
const capexColors = sortedByCapex.map(
  p => STAGE_COLORS[STAGES.indexOf(p.stage as (typeof STAGES)[number])]
);
const capexAvg = Math.round(
  capexValues.reduce((a, b) => a + b, 0) / capexValues.length
);

// Aggregate OpEx data by project (sorted desc)
const sortedByOpex = [...projects].sort(
  (a, b) =>
    b.opexEurKWhYear * b.capacityMWh - a.opexEurKWhYear * a.capacityMWh
);
const opexLabels = sortedByOpex.map(p => p.name);
const opexValues = sortedByOpex.map(
  p => Math.round(p.opexEurKWhYear * p.capacityMWh)
);
const opexColors = sortedByOpex.map(
  p => STAGE_COLORS[STAGES.indexOf(p.stage as (typeof STAGES)[number])]
);
const opexAvg = Math.round(
  opexValues.reduce((a, b) => a + b, 0) / opexValues.length
);

// Scatter data: group by stage
const scatterByStage = STAGES.map((stage, i) => ({
  label: stage,
  data: projects
    .filter(p => p.stage === stage)
    .map(p => ({ x: p.capacityMWh, y: p.capexEurKWh })),
  backgroundColor: STAGE_COLORS[i],
  borderColor: null,
  pointStyle: 'circle' as const,
  pointRadius: 5,
}));

// Horizontal bar: CapEx/kWh by project (top 15)
const top15Capex = [...projects]
  .sort((a, b) => b.capexEurKWh - a.capexEurKWh)
  .slice(0, 15);
const hbarLabels = top15Capex.map(p => p.name);
const hbarValues = top15Capex.map(p => p.capexEurKWh);
const hbarColors = top15Capex.map(
  p => STAGE_COLORS[STAGES.indexOf(p.stage as (typeof STAGES)[number])]
);

// Summary metrics
const totalCapacity = projects.reduce((s, p) => s + p.capacityMWh, 0);
const avgCapex =
  Math.round(
    (projects.reduce((s, p) => s + p.capexEurKWh, 0) / projects.length) * 10
  ) / 10;
const avgOpex =
  Math.round(
    (projects.reduce((s, p) => s + p.opexEurKWhYear, 0) / projects.length) * 10
  ) / 10;

// Table rows for summary
const tableColumns = [
  'Project',
  'Stage',
  'Country',
  'Capacity (MWh)',
  'CapEx (EUR/kWh)',
  'OpEx (EUR/kWh/yr)',
];
const tableRows = projects
  .sort((a, b) => b.capacityMWh - a.capacityMWh)
  .slice(0, 10)
  .map(p => [
    p.name,
    p.stage,
    p.country,
    String(p.capacityMWh),
    String(p.capexEurKWh),
    String(p.opexEurKWhYear),
  ]);

export const BESS_DASHBOARD_ID = 'bess-benchmark';

export const BESS_DASHBOARD_SPEC: Spec = {
  root: 'root',
  elements: {
    root: {
      type: 'Stack',
      props: { direction: 'vertical', gap: 'lg' },
      children: [
        'header',
        'metrics-row',
        'capex-card',
        'opex-card',
        'scatter-hbar-row',
        'table-card',
      ],
    },

    header: {
      type: 'DashboardHeader',
      props: {
        title: 'BESS Benchmarking Dashboard',
        subtitle: `Comparing ${projects.length} Battery Energy Storage System projects across Europe`,
      },
    },

    'metrics-row': {
      type: 'Stack',
      props: { direction: 'horizontal', gap: 'lg' },
      children: [
        'metric-projects',
        'metric-capacity',
        'metric-capex',
        'metric-opex',
      ],
    },
    'metric-projects': {
      type: 'MetricCard',
      props: {
        label: 'Total Projects',
        value: String(projects.length),
        description: `Across ${new Set(projects.map(p => p.country)).size} countries`,
        trend: null,
        change: null,
      },
    },
    'metric-capacity': {
      type: 'MetricCard',
      props: {
        label: 'Total Capacity',
        value: `${(totalCapacity / 1000).toFixed(1)} GWh`,
        description: 'Combined storage capacity',
        trend: null,
        change: null,
      },
    },
    'metric-capex': {
      type: 'MetricCard',
      props: {
        label: 'Avg CapEx',
        value: `\u20AC${avgCapex}/kWh`,
        description: 'Capital expenditure per kWh',
        trend: null,
        change: null,
      },
    },
    'metric-opex': {
      type: 'MetricCard',
      props: {
        label: 'Avg OpEx',
        value: `\u20AC${avgOpex}/kWh/yr`,
        description: 'Operating expenditure per kWh/year',
        trend: null,
        change: null,
      },
    },

    // CapEx bar chart with average line
    'capex-card': {
      type: 'Card',
      props: { title: 'CapEx by Project (EUR)' },
      children: ['capex-chart'],
    },
    'capex-chart': {
      type: 'BarChart',
      props: {
        title: 'CapEx by Project',
        labels: capexLabels,
        datasets: [
          {
            label: 'CapEx (EUR)',
            data: capexValues,
            backgroundColor: capexColors,
            borderColor: null,
            borderWidth: null,
            fill: null,
            type: null,
            borderDash: null,
          },
          {
            label: 'Average',
            data: capexValues.map(() => capexAvg),
            backgroundColor: 'transparent',
            borderColor: '#e74c3c',
            borderWidth: 2,
            fill: false,
            type: 'line',
            borderDash: [6, 4],
          },
        ],
        dataQuery: null,
        dataQueries: null,
        datasetLabel: null,
        datasetLabels: null,
        showLegend: true,
        yFormat: 'currency-eur-k',
        stacked: false,
        indexAxis: 'x',
        backgroundColor: null,
        borderColor: null,
        borderWidth: null,
        fill: null,
      },
    },

    // OpEx bar chart with average line
    'opex-card': {
      type: 'Card',
      props: { title: 'OpEx by Project (EUR/yr)' },
      children: ['opex-chart'],
    },
    'opex-chart': {
      type: 'BarChart',
      props: {
        title: 'OpEx by Project',
        labels: opexLabels,
        datasets: [
          {
            label: 'OpEx (EUR/yr)',
            data: opexValues,
            backgroundColor: opexColors,
            borderColor: null,
            borderWidth: null,
            fill: null,
            type: null,
            borderDash: null,
          },
          {
            label: 'Average',
            data: opexValues.map(() => opexAvg),
            backgroundColor: 'transparent',
            borderColor: '#e74c3c',
            borderWidth: 2,
            fill: false,
            type: 'line',
            borderDash: [6, 4],
          },
        ],
        dataQuery: null,
        dataQueries: null,
        datasetLabel: null,
        datasetLabels: null,
        showLegend: true,
        yFormat: 'currency-eur-k',
        stacked: false,
        indexAxis: 'x',
        backgroundColor: null,
        borderColor: null,
        borderWidth: null,
        fill: null,
      },
    },

    // Scatter + Horizontal bar row
    'scatter-hbar-row': {
      type: 'Grid',
      props: { columns: 2 },
      children: ['scatter-card', 'hbar-card'],
    },

    'scatter-card': {
      type: 'Card',
      props: { title: 'CapEx vs Capacity by Stage' },
      children: ['scatter-chart'],
    },
    'scatter-chart': {
      type: 'ScatterChart',
      props: {
        title: 'CapEx vs Capacity',
        xLabel: 'Capacity (MWh)',
        yLabel: 'CapEx (EUR/kWh)',
        yFormat: 'number',
        showLegend: true,
        datasets: scatterByStage,
      },
    },

    'hbar-card': {
      type: 'Card',
      props: { title: 'Top 15 — CapEx per kWh (EUR)' },
      children: ['hbar-chart'],
    },
    'hbar-chart': {
      type: 'BarChart',
      props: {
        title: 'CapEx per kWh',
        labels: hbarLabels,
        datasets: [
          {
            label: 'EUR/kWh',
            data: hbarValues,
            backgroundColor: hbarColors,
            borderColor: null,
            borderWidth: null,
            fill: null,
            type: null,
            borderDash: null,
          },
        ],
        dataQuery: null,
        dataQueries: null,
        datasetLabel: null,
        datasetLabels: null,
        showLegend: false,
        yFormat: 'number',
        stacked: false,
        indexAxis: 'y',
        backgroundColor: null,
        borderColor: null,
        borderWidth: null,
        fill: null,
      },
    },

    // Summary table
    'table-card': {
      type: 'Card',
      props: { title: 'Top 10 Projects by Capacity' },
      children: ['summary-table'],
    },
    'summary-table': {
      type: 'Table',
      props: {
        columns: tableColumns,
        rows: tableRows,
      },
    },
  },
};
