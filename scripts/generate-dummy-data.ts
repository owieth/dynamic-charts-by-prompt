/**
 * Generates a dummy projects.json with ~200 realistic renewable energy projects.
 * Distributions match the real dataset's statistical properties.
 *
 * Run: npx tsx scripts/generate-dummy-data.ts
 */

function pick<T>(arr: T[], weights?: number[]): T {
  if (!weights) return arr[Math.floor(Math.random() * arr.length)];
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function logNorm(median: number, spread: number) {
  // Box-Muller for log-normal
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.exp(Math.log(median) + spread * z);
}

function roundTo(n: number, decimals: number) {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

// --- Distributions matching real data ---

const countries = [
  { name: 'Singapore', w: 46 },
  { name: 'Switzerland', w: 46 },
  { name: 'Colombia', w: 25 },
  { name: 'Norway', w: 21 },
  { name: 'Poland', w: 13 },
  { name: 'Germany', w: 10 },
  { name: 'Sweden', w: 8 },
  { name: 'Latvia', w: 7 },
  { name: 'Kenya', w: 6 },
  { name: 'Austria', w: 5 },
  { name: 'Finland', w: 4 },
  { name: 'Ukraine', w: 3 },
  { name: 'Spain', w: 2 },
  { name: 'Romania', w: 2 },
  { name: 'Denmark', w: 1 },
  { name: 'Vietnam', w: 1 },
  { name: 'Georgia', w: 1 },
  { name: 'Cyprus', w: 1 },
  { name: 'Burundi', w: 1 },
  { name: 'Rwanda', w: 1 },
  { name: 'Zimbabwe', w: 1 },
  { name: 'Zambia', w: 1 },
];

const technologies = [
  { name: 'Solar PV', w: 142 },
  { name: 'BESS', w: 40 },
  { name: 'Hydro', w: 15 },
  { name: 'Waste to Energy', w: 3 },
  { name: 'Biomass', w: 2 },
  { name: 'Geothermal', w: 3 },
  { name: 'Wind', w: 1 },
];

const statuses = [
  { name: 'Operational', w: 77 },
  { name: 'Ready to Build', w: 75 },
  { name: 'Development', w: 48 },
  { name: 'Construction', w: 6 },
];

const currencies: Record<string, string> = {
  Singapore: 'SGD',
  Switzerland: 'CHF',
  Colombia: 'COP',
  Norway: 'NOK',
  Poland: 'PLN',
  Kenya: 'USD',
  Burundi: 'USD',
  Rwanda: 'USD',
  Zimbabwe: 'USD',
  Zambia: 'USD',
};
const defaultCurrency = 'EUR';

const codYears = [
  { year: 2019, w: 2 },
  { year: 2021, w: 2 },
  { year: 2022, w: 1 },
  { year: 2023, w: 29 },
  { year: 2024, w: 29 },
  { year: 2025, w: 29 },
  { year: 2026, w: 20 },
  { year: 2027, w: 12 },
  { year: 2028, w: 5 },
  { year: 2029, w: 1 },
  { year: 2030, w: 2 },
];

const financingTypes = [
  { name: 'Debt', w: 20 },
  { name: 'EquityAndDebt', w: 8 },
  { name: 'Equity', w: 6 },
];

const friggDescMap: Record<string, [number, number]> = {
  Excellent: [8, 10],
  Good: [6, 8],
  Fair: [4, 6],
  Poor: [2, 4],
  'Very Poor': [0, 2],
};
const friggDescs = [
  { name: 'Very Poor', w: 91 },
  { name: 'Excellent', w: 20 },
  { name: 'Poor', w: 13 },
  { name: 'Fair', w: 7 },
  { name: 'Good', w: 5 },
];

// Fictional project name parts
const prefixes = [
  'Aurora',
  'Beacon',
  'Cascade',
  'Delta',
  'Echo',
  'Falcon',
  'Glacier',
  'Horizon',
  'Ivory',
  'Jade',
  'Kodiak',
  'Lumen',
  'Mesa',
  'Nova',
  'Orbit',
  'Pinnacle',
  'Quartz',
  'Ridge',
  'Summit',
  'Terra',
  'Unity',
  'Vortex',
  'Zephyr',
  'Alpine',
  'Breeze',
  'Coral',
  'Dune',
  'Ember',
  'Fjord',
  'Grove',
  'Helix',
  'Iris',
  'Kelp',
  'Lotus',
  'Maple',
  'Nexus',
  'Oasis',
  'Prism',
  'Reef',
  'Sage',
  'Tidal',
];
const suffixes = [
  'Energy',
  'Power',
  'Solar',
  'Green',
  'Renewables',
  'Solutions',
  'Systems',
  'Partners',
  'Ventures',
  'Grid',
  'Labs',
  'Works',
  'Holdings',
  'Capital',
  'Industries',
  'Tech',
  'Corp',
  'Group',
];
const qualifiers = [
  'I',
  'II',
  'III',
  'Alpha',
  'Beta',
  'North',
  'South',
  'East',
  'West',
  'Prime',
  'Plus',
  'One',
  'Max',
  'Pro',
  'Flex',
  'Core',
];

const usedNames = new Set<string>();
function genName(): string {
  for (let i = 0; i < 100; i++) {
    const p = pick(prefixes);
    const s = pick(suffixes);
    const q = Math.random() < 0.4 ? ' ' + pick(qualifiers) : '';
    const name = `${p} ${s}${q}`;
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return name;
    }
  }
  return `Project ${usedNames.size + 1}`;
}

function genDate(year: number): string {
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// --- Generate projects ---

const N = 206;
const projects = [];

for (let i = 0; i < N; i++) {
  const country = pick(
    countries.map(c => c.name),
    countries.map(c => c.w)
  );
  const tech = pick(
    technologies.map(t => t.name),
    technologies.map(t => t.w)
  );
  const status = pick(
    statuses.map(s => s.name),
    statuses.map(s => s.w)
  );
  const currency = currencies[country] ?? defaultCurrency;
  const codYear = pick(
    codYears.map(y => y.year),
    codYears.map(y => y.w)
  );
  const cod = genDate(codYear);
  const opLife = Math.round(rand(15, 35));
  const capacity = roundTo(logNorm(600, 2.5), 2);
  const capexPerKw = roundTo(logNorm(1500, 0.8), 2);
  const capex = roundTo(capacity * capexPerKw, 2);
  const opexPerKw = roundTo(logNorm(20, 1), 2);
  const opex = roundTo(capacity * opexPerKw, 2);
  const p50 = roundTo(capacity * rand(800, 1800), 2);

  const hasFrigg = Math.random() < 0.5;
  const friggDesc = hasFrigg
    ? pick(
        friggDescs.map(f => f.name),
        friggDescs.map(f => f.w)
      )
    : null;
  const friggRange = friggDesc ? friggDescMap[friggDesc] : null;
  const friggScore = friggRange
    ? roundTo(rand(friggRange[0], friggRange[1]), 1)
    : 0;

  const hasIRR = Math.random() < 0.55;
  const projectIRR = hasIRR ? roundTo(rand(0.02, 0.18), 4) : 0;
  const irrSpread = hasIRR ? roundTo(rand(0.005, 0.02), 4) : 0;

  const hasFinancing = Math.random() < 0.17;
  const targetFinancing = hasFinancing ? roundTo(logNorm(1500000, 1.2), 2) : 0;
  const financingType = hasFinancing
    ? pick(
        financingTypes.map(f => f.name),
        financingTypes.map(f => f.w)
      )
    : 'Debt';
  const financingCloseDate = hasFinancing
    ? genDate(2025 + Math.floor(Math.random() * 2))
    : null;

  const hasDSCR = Math.random() < 0.2;
  const meanDSCR = hasDSCR ? roundTo(rand(1.15, 1.6), 2) : 0;

  const hasPPA = Math.random() < 0.43;
  const ppaPrice = hasPPA ? roundTo(rand(0.05, 0.5), 2) : 0;

  const createdYear = pick([2023, 2024, 2025], [20, 40, 40]);
  const createdAt =
    genDate(createdYear) +
    `T${String(Math.floor(rand(6, 22))).padStart(2, '0')}:${String(Math.floor(rand(0, 60))).padStart(2, '0')}:${String(Math.floor(rand(0, 60))).padStart(2, '0')}.000Z`;

  projects.push({
    'Project Name': genName(),
    'Project URL': `https://app.example.com/projects/${crypto.randomUUID()}`,
    Country: country,
    Technology: tech,
    Status: status,
    'Capacity (kW)': capacity,
    'Project Currency': currency,
    CoD: cod,
    'Operational Life (years)': opLife,
    'Aggregated Yearly Production (P50)': p50,
    CapEx: capex,
    'CapEx per kW': capexPerKw,
    OpEx: opex,
    'OpEx per kW': opexPerKw,
    'Income Tax Rate': 0,
    'Existing Debt': null,
    'Existing Debt Nominal Value': 0,
    'Existing Debt Interest Rate': 0,
    'Existing Debt Issuance Date': null,
    'Existing Debt Tenure': null,
    'Target Financing': targetFinancing,
    'Target Financing Type': financingType,
    'Target Financing Close Date': financingCloseDate,
    'P50 kWh/yr': p50,
    'P75 kWh/yr': roundTo(p50 * 1.05, 2),
    'P90 kWh/yr': roundTo(p50 * 1.1, 2),
    'P99 kWh/yr': roundTo(p50 * 1.19, 2),
    'StdDev Energy kWh/yr': roundTo(p50 * 0.08, 2),
    'Energy Sold or Traded': p50,
    'PPA Contract Length in Years': 0,
    'PPA Start Date': null,
    'PPA Cap Annually': 0,
    'PPA Price': ppaPrice,
    'Contracted GoO Price': 0,
    'Capacity Payments % (BESS)':
      tech === 'BESS' ? roundTo(rand(0.3, 1), 2) : 0,
    'Frigg Score': friggScore,
    'Frigg Score description': friggDesc,
    'Risk-free rate': roundTo(rand(0.01, 0.04), 4),
    '% Revenue Merchant Sales': roundTo(rand(0, 100), 2),
    'Project IRR': projectIRR,
    'Project IRR Lower 95% CI': hasIRR ? roundTo(projectIRR - irrSpread, 4) : 0,
    'Project IRR Upper 95% CI': hasIRR ? roundTo(projectIRR + irrSpread, 4) : 0,
    'Volatility Project Cash Flows': hasIRR ? roundTo(rand(0.01, 0.5), 4) : 0,
    'Equity IRR': projectIRR,
    'Equity IRR Lower 95% CI': hasIRR ? roundTo(projectIRR - irrSpread, 4) : 0,
    'Equity IRR Upper 95% CI': hasIRR ? roundTo(projectIRR + irrSpread, 4) : 0,
    'Volatility Equity Cash Flows': hasIRR ? roundTo(rand(0.01, 0.7), 4) : 0,
    'Suggested Additional Leverage': hasFinancing
      ? roundTo(logNorm(500000, 1), 2)
      : 0,
    'Suggested Tenure': hasDSCR ? `${Math.floor(rand(5, 20))} years` : null,
    'Suggested Interest Rate': hasDSCR ? roundTo(rand(0.03, 0.08), 4) : 0,
    'Mean DSCR': meanDSCR,
    'DSCR Lower CI': hasDSCR ? roundTo(meanDSCR - rand(0, 0.1), 2) : 0,
    'DSCR Upper CI': hasDSCR ? roundTo(meanDSCR + rand(0, 0.1), 2) : 0,
    'DSCR at Risk 95%': hasDSCR ? roundTo(meanDSCR - rand(0.05, 0.2), 2) : 0,
    'Created At': createdAt,
    'Updated At': null,
  });
}

const output = JSON.stringify({ projects }, null, 2);
const fs = require('fs');
fs.writeFileSync('src/lib/projects.json', output);
console.log(
  `Generated ${projects.length} dummy projects → src/lib/projects.json`
);

// Quick stats
const byCountry: Record<string, number> = {};
const byTech: Record<string, number> = {};
const byStatus: Record<string, number> = {};
projects.forEach(p => {
  byCountry[p.Country] = (byCountry[p.Country] || 0) + 1;
  byTech[p.Technology] = (byTech[p.Technology] || 0) + 1;
  byStatus[p.Status] = (byStatus[p.Status] || 0) + 1;
});
console.log('Countries:', Object.keys(byCountry).length, byCountry);
console.log('Technologies:', Object.keys(byTech).length, byTech);
console.log('Statuses:', byStatus);
