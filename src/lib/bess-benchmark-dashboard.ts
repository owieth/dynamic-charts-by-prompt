import type { Spec } from '@json-render/core';

export const BESS_DASHBOARD_ID = 'bess-benchmark';

// ── Project data ────────────────────────────────────────────────
interface BessProject {
  name: string;
  country: string;
  status: 'Development' | 'Ready-to-build' | 'Construction' | 'Operational';
  capex: number; // total EUR
  opex: number; // total EUR/yr
  capacity: number; // MW
}

const STATUS_COLORS: Record<string, string> = {
  Development: '#d4b896',
  'Ready-to-build': '#b8860b',
  Construction: '#6b5b3e',
  Operational: '#3d2b1f',
};

const HIGHLIGHT_COLOR = '#e63946';

const projects: BessProject[] = [
  // Finland (highlighted)
  {
    name: 'Honkakero',
    country: 'Finland',
    status: 'Development',
    capex: 42_000_000,
    opex: 840_000,
    capacity: 60,
  },
  {
    name: 'Pekosenniemi',
    country: 'Finland',
    status: 'Development',
    capex: 35_000_000,
    opex: 700_000,
    capacity: 50,
  },
  // Germany
  {
    name: 'Lausitz BESS',
    country: 'Germany',
    status: 'Operational',
    capex: 78_000_000,
    opex: 1_560_000,
    capacity: 100,
  },
  {
    name: 'Schwarze Pumpe',
    country: 'Germany',
    status: 'Construction',
    capex: 52_000_000,
    opex: 1_040_000,
    capacity: 70,
  },
  {
    name: 'Emsland Storage',
    country: 'Germany',
    status: 'Ready-to-build',
    capex: 44_000_000,
    opex: 880_000,
    capacity: 55,
  },
  {
    name: 'Rhein-Ruhr',
    country: 'Germany',
    status: 'Development',
    capex: 62_000_000,
    opex: 1_240_000,
    capacity: 80,
  },
  {
    name: 'Brandenburg Hub',
    country: 'Germany',
    status: 'Construction',
    capex: 48_000_000,
    opex: 960_000,
    capacity: 65,
  },
  // UK
  {
    name: 'Minety Phase 1',
    country: 'UK',
    status: 'Operational',
    capex: 90_000_000,
    opex: 1_800_000,
    capacity: 120,
  },
  {
    name: 'Pillswood',
    country: 'UK',
    status: 'Operational',
    capex: 72_000_000,
    opex: 1_440_000,
    capacity: 98,
  },
  {
    name: 'Bramley',
    country: 'UK',
    status: 'Construction',
    capex: 56_000_000,
    opex: 1_120_000,
    capacity: 75,
  },
  {
    name: 'Cowley',
    country: 'UK',
    status: 'Ready-to-build',
    capex: 38_000_000,
    opex: 760_000,
    capacity: 50,
  },
  {
    name: 'Kenfig',
    country: 'UK',
    status: 'Development',
    capex: 82_000_000,
    opex: 1_640_000,
    capacity: 110,
  },
  // Spain
  {
    name: 'Talayuela',
    country: 'Spain',
    status: 'Operational',
    capex: 45_000_000,
    opex: 900_000,
    capacity: 60,
  },
  {
    name: 'Sevilla Sur',
    country: 'Spain',
    status: 'Construction',
    capex: 68_000_000,
    opex: 1_360_000,
    capacity: 90,
  },
  {
    name: 'Aragon Grid',
    country: 'Spain',
    status: 'Ready-to-build',
    capex: 37_000_000,
    opex: 740_000,
    capacity: 48,
  },
  {
    name: 'Navarra Energy',
    country: 'Spain',
    status: 'Development',
    capex: 55_000_000,
    opex: 1_100_000,
    capacity: 72,
  },
  // Italy
  {
    name: 'Brindisi',
    country: 'Italy',
    status: 'Operational',
    capex: 58_000_000,
    opex: 1_160_000,
    capacity: 75,
  },
  {
    name: 'Sardinia BESS',
    country: 'Italy',
    status: 'Construction',
    capex: 42_000_000,
    opex: 840_000,
    capacity: 55,
  },
  {
    name: 'Puglia Storage',
    country: 'Italy',
    status: 'Ready-to-build',
    capex: 33_000_000,
    opex: 660_000,
    capacity: 42,
  },
  // France
  {
    name: 'Dunkerque',
    country: 'France',
    status: 'Operational',
    capex: 50_000_000,
    opex: 1_000_000,
    capacity: 65,
  },
  {
    name: 'Fos-sur-Mer',
    country: 'France',
    status: 'Construction',
    capex: 64_000_000,
    opex: 1_280_000,
    capacity: 85,
  },
  {
    name: 'Bordeaux Grid',
    country: 'France',
    status: 'Development',
    capex: 40_000_000,
    opex: 800_000,
    capacity: 52,
  },
  // Netherlands
  {
    name: 'Vlissingen',
    country: 'Netherlands',
    status: 'Operational',
    capex: 30_000_000,
    opex: 600_000,
    capacity: 40,
  },
  {
    name: 'Eemshaven',
    country: 'Netherlands',
    status: 'Ready-to-build',
    capex: 46_000_000,
    opex: 920_000,
    capacity: 60,
  },
  // Ireland
  {
    name: 'Shannonbridge',
    country: 'Ireland',
    status: 'Operational',
    capex: 36_000_000,
    opex: 720_000,
    capacity: 50,
  },
  {
    name: 'Louth Storage',
    country: 'Ireland',
    status: 'Construction',
    capex: 28_000_000,
    opex: 560_000,
    capacity: 35,
  },
  // Belgium
  {
    name: 'Bastogne',
    country: 'Belgium',
    status: 'Ready-to-build',
    capex: 32_000_000,
    opex: 640_000,
    capacity: 40,
  },
  {
    name: 'Antwerp Grid',
    country: 'Belgium',
    status: 'Development',
    capex: 54_000_000,
    opex: 1_080_000,
    capacity: 70,
  },
  // Poland
  {
    name: 'Gdansk BESS',
    country: 'Poland',
    status: 'Development',
    capex: 38_000_000,
    opex: 760_000,
    capacity: 50,
  },
  {
    name: 'Wroclaw Hub',
    country: 'Poland',
    status: 'Ready-to-build',
    capex: 29_000_000,
    opex: 580_000,
    capacity: 38,
  },
  // Sweden
  {
    name: 'Lulea Storage',
    country: 'Sweden',
    status: 'Development',
    capex: 44_000_000,
    opex: 880_000,
    capacity: 58,
  },
  {
    name: 'Malmo Grid',
    country: 'Sweden',
    status: 'Construction',
    capex: 35_000_000,
    opex: 700_000,
    capacity: 45,
  },
  // Portugal
  {
    name: 'Sines BESS',
    country: 'Portugal',
    status: 'Operational',
    capex: 41_000_000,
    opex: 820_000,
    capacity: 55,
  },
  {
    name: 'Algarve Grid',
    country: 'Portugal',
    status: 'Development',
    capex: 26_000_000,
    opex: 520_000,
    capacity: 32,
  },
  // Greece
  {
    name: 'Ptolemaida',
    country: 'Greece',
    status: 'Construction',
    capex: 48_000_000,
    opex: 960_000,
    capacity: 62,
  },
  {
    name: 'Thessaloniki',
    country: 'Greece',
    status: 'Ready-to-build',
    capex: 34_000_000,
    opex: 680_000,
    capacity: 44,
  },
  // Austria
  {
    name: 'Mellach',
    country: 'Austria',
    status: 'Operational',
    capex: 39_000_000,
    opex: 780_000,
    capacity: 50,
  },
  // Denmark
  {
    name: 'Esbjerg',
    country: 'Denmark',
    status: 'Ready-to-build',
    capex: 43_000_000,
    opex: 860_000,
    capacity: 56,
  },
  // Romania
  {
    name: 'Cernavoda',
    country: 'Romania',
    status: 'Development',
    capex: 31_000_000,
    opex: 620_000,
    capacity: 40,
  },
];

// ── Derived data ────────────────────────────────────────────────
const totalProjects = projects.length;
const totalCapacity = projects.reduce((s, p) => s + p.capacity, 0);
const avgCapex = Math.round(
  projects.reduce((s, p) => s + p.capex, 0) / totalProjects
);
const avgOpex = Math.round(
  projects.reduce((s, p) => s + p.opex, 0) / totalProjects
);

// Specific CapEx (EUR/kW)
const specificCapex = projects.map(p =>
  Math.round(p.capex / (p.capacity * 1_000))
);
const avgSpecificCapex = Math.round(
  specificCapex.reduce((a, b) => a + b, 0) / totalProjects
);

// Specific OpEx (EUR/kW/yr)
const specificOpex = projects.map(p =>
  Math.round(p.opex / (p.capacity * 1_000))
);
const avgSpecificOpex = Math.round(
  specificOpex.reduce((a, b) => a + b, 0) / totalProjects
);

// Sort by specific capex descending for the horizontal bar
const capexSorted = projects
  .map((p, i) => ({
    name: p.name,
    value: specificCapex[i],
    isHighlight: p.name === 'Honkakero' || p.name === 'Pekosenniemi',
  }))
  .sort((a, b) => b.value - a.value);

const opexSorted = projects
  .map((p, i) => ({
    name: p.name,
    value: specificOpex[i],
    isHighlight: p.name === 'Honkakero' || p.name === 'Pekosenniemi',
  }))
  .sort((a, b) => b.value - a.value);

// Projects by country
const countryMap = new Map<string, number>();
for (const p of projects) {
  countryMap.set(p.country, (countryMap.get(p.country) ?? 0) + 1);
}
const countrySorted = [...countryMap.entries()].sort((a, b) => b[1] - a[1]);

// Scatter data: CapEx vs Capacity, grouped by status
const statusGroups = new Map<string, { x: number; y: number }[]>();
for (let i = 0; i < projects.length; i++) {
  const p = projects[i];
  if (!statusGroups.has(p.status)) statusGroups.set(p.status, []);
  statusGroups.get(p.status)!.push({ x: p.capacity, y: specificCapex[i] });
}

// Table data
const tableLabels = projects.map(p => p.name);

function formatEur(n: number): string {
  if (n >= 1_000_000) return `\u20AC${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `\u20AC${(n / 1_000).toFixed(0)}K`;
  return `\u20AC${n}`;
}

// ── Spec ────────────────────────────────────────────────────────
export const BESS_DASHBOARD_SPEC: Spec = {
  root: 'root',
  elements: {
    root: {
      type: 'Stack',
      props: { direction: 'vertical', gap: 'lg' },
      children: [
        'header',
        'metrics-row',
        'capex-chart',
        'opex-chart',
        'scatter-country-row',
        'data-table',
      ],
    },

    // ── Header ──────────────────────────────────────────────────
    header: {
      type: 'DashboardHeader',
      props: {
        title: 'BESS Project Circuit \u2014 European Benchmark',
        subtitle: `Benchmarking ${totalProjects} battery energy storage projects across Europe`,
      },
    },

    // ── Metrics ─────────────────────────────────────────────────
    'metrics-row': {
      type: 'Stack',
      props: { direction: 'horizontal', gap: 'lg' },
      children: [
        'metric-total',
        'metric-avg-capex',
        'metric-avg-opex',
        'metric-capacity',
      ],
    },
    'metric-total': {
      type: 'MetricCard',
      props: {
        label: 'Total Projects',
        value: String(totalProjects),
        description: `Across ${countryMap.size} countries`,
        trend: null,
        change: null,
      },
    },
    'metric-avg-capex': {
      type: 'MetricCard',
      props: {
        label: 'Avg CapEx',
        value: formatEur(avgCapex),
        description: `${avgSpecificCapex} \u20AC/kW specific`,
        trend: null,
        change: null,
      },
    },
    'metric-avg-opex': {
      type: 'MetricCard',
      props: {
        label: 'Avg OpEx',
        value: formatEur(avgOpex),
        description: `${avgSpecificOpex} \u20AC/kW/yr specific`,
        trend: null,
        change: null,
      },
    },
    'metric-capacity': {
      type: 'MetricCard',
      props: {
        label: 'Total Capacity',
        value: `${totalCapacity.toLocaleString('en')} MW`,
        description: 'Combined installed capacity',
        trend: null,
        change: null,
      },
    },

    // ── CapEx bar chart (horizontal + dashed avg line) ──────────
    'capex-chart': {
      type: 'Card',
      props: { title: 'CapEx Comparison (\u20AC/kW)' },
      children: ['capex-bar'],
    },
    'capex-bar': {
      type: 'BarChart',
      props: {
        title: 'CapEx Comparison (\u20AC/kW)',
        labels: capexSorted.map(p => p.name),
        datasets: [
          {
            label: 'Specific CapEx (\u20AC/kW)',
            data: capexSorted.map(p => p.value),
            backgroundColor: capexSorted.map(p =>
              p.isHighlight ? HIGHLIGHT_COLOR : '#b8860b'
            ),
            borderColor: null,
            borderWidth: null,
            fill: null,
          },
          {
            label: `Average (${avgSpecificCapex} \u20AC/kW)`,
            data: capexSorted.map(() => avgSpecificCapex),
            backgroundColor: null,
            borderColor: '#d4b896',
            borderWidth: 2,
            fill: false,
            type: 'line' as const,
            borderDash: [6, 4],
          },
        ],
        dataQuery: null,
        dataQueries: null,
        datasetLabel: null,
        datasetLabels: null,
        showLegend: true,
        yFormat: null,
        stacked: false,
        indexAxis: 'y',
        backgroundColor: null,
        borderColor: null,
        borderWidth: null,
        fill: null,
      },
    },

    // ── OpEx bar chart (horizontal + dashed avg line) ───────────
    'opex-chart': {
      type: 'Card',
      props: { title: 'OpEx Comparison (\u20AC/kW/yr)' },
      children: ['opex-bar'],
    },
    'opex-bar': {
      type: 'BarChart',
      props: {
        title: 'OpEx Comparison (\u20AC/kW/yr)',
        labels: opexSorted.map(p => p.name),
        datasets: [
          {
            label: 'Specific OpEx (\u20AC/kW/yr)',
            data: opexSorted.map(p => p.value),
            backgroundColor: opexSorted.map(p =>
              p.isHighlight ? HIGHLIGHT_COLOR : '#6b5b3e'
            ),
            borderColor: null,
            borderWidth: null,
            fill: null,
          },
          {
            label: `Average (${avgSpecificOpex} \u20AC/kW/yr)`,
            data: opexSorted.map(() => avgSpecificOpex),
            backgroundColor: null,
            borderColor: '#d4b896',
            borderWidth: 2,
            fill: false,
            type: 'line' as const,
            borderDash: [6, 4],
          },
        ],
        dataQuery: null,
        dataQueries: null,
        datasetLabel: null,
        datasetLabels: null,
        showLegend: true,
        yFormat: null,
        stacked: false,
        indexAxis: 'y',
        backgroundColor: null,
        borderColor: null,
        borderWidth: null,
        fill: null,
      },
    },

    // ── Scatter + Country bar row ───────────────────────────────
    'scatter-country-row': {
      type: 'Grid',
      props: { columns: 2 },
      children: ['card-scatter', 'card-country'],
    },

    'card-scatter': {
      type: 'Card',
      props: { title: 'CapEx vs Capacity' },
      children: ['scatter-capex-capacity'],
    },
    'scatter-capex-capacity': {
      type: 'ScatterChart',
      props: {
        title: 'CapEx vs Capacity',
        xLabel: 'Capacity (MW)',
        yLabel: 'Specific CapEx (\u20AC/kW)',
        datasets: [...statusGroups.entries()].map(([status, points]) => ({
          label: status,
          data: points,
          backgroundColor: STATUS_COLORS[status] ?? '#888',
          borderColor: STATUS_COLORS[status] ?? '#888',
          borderWidth: 1,
          pointStyle: 'circle' as const,
          pointRadius: 5,
        })),
        showLegend: true,
      },
    },

    'card-country': {
      type: 'Card',
      props: { title: 'Projects by Country' },
      children: ['country-bar'],
    },
    'country-bar': {
      type: 'BarChart',
      props: {
        title: 'Projects by Country',
        labels: countrySorted.map(([c]) => c),
        datasets: [
          {
            label: 'Projects',
            data: countrySorted.map(([, n]) => n),
            backgroundColor: '#b8860b',
            borderColor: null,
            borderWidth: null,
            fill: null,
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

    // ── Data table ──────────────────────────────────────────────
    'data-table': {
      type: 'Card',
      props: { title: 'All BESS Projects' },
      children: ['bess-table'],
    },
    'bess-table': {
      type: 'Table',
      props: {
        columns: [
          'Project',
          'Country',
          'Status',
          'Capacity (MW)',
          'CapEx (\u20AC/kW)',
          'OpEx (\u20AC/kW/yr)',
        ],
        rows: projects.map((p, i) => [
          p.name,
          p.country,
          p.status,
          String(p.capacity),
          String(specificCapex[i]),
          String(specificOpex[i]),
        ]),
      },
    },
  },
};
