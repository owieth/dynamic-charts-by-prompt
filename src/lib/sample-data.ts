import projectsData from './projects.json';

// Compute portfolio totals dynamically from whatever dataset is loaded
function computeTotals() {
  const p = projectsData.projects;
  const totalCapacity = p.reduce(
    (s, r) => s + ((r['Capacity (kW)'] as number) || 0),
    0
  );
  const totalCapex = p.reduce((s, r) => s + ((r['CapEx'] as number) || 0), 0);
  const friggScores = p.map(r => r['Frigg Score'] as number).filter(v => v > 0);
  const irrs = p
    .map(r => r['Project IRR'] as number)
    .filter(v => v > 0 && v < 1);
  const countries = new Set(p.map(r => r['Country']));
  const techs = new Set(p.map(r => r['Technology']));

  const fmt = (n: number) => {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
    return `$${n.toFixed(0)}`;
  };

  return {
    totalProjects: p.length,
    totalCapacity:
      totalCapacity >= 1e6
        ? `${(totalCapacity / 1e6).toFixed(0)} GW`
        : `${(totalCapacity / 1e3).toFixed(0)} MW`,
    totalCapex: fmt(totalCapex),
    avgFrigg: friggScores.length
      ? (friggScores.reduce((a, b) => a + b, 0) / friggScores.length).toFixed(1)
      : 'N/A',
    avgIRR: irrs.length
      ? `${((irrs.reduce((a, b) => a + b, 0) / irrs.length) * 100).toFixed(1)}%`
      : 'N/A',
    countries: countries.size,
    technologies: techs.size,
  };
}

const totals = computeTotals();

export const sampleDataContext = `
## Data Source: projects

${totals.totalProjects} renewable energy projects. Charts use \`dataQuery\` to query this data at render time.
You NEVER embed raw data — instead, specify a dataQuery and the frontend resolves it.

### Available Fields

**Categorical (use as groupBy / filter):**
| Field | Type | Unique Values |
|-------|------|---------------|
| Country | string | ${totals.countries} countries |
| Technology | string | ${totals.technologies}: Solar PV, BESS, Hydro, Waste to Energy, Biomass, Geothermal, Wind |
| Status | string | 4: Operational, Ready to Build, Development, Construction |
| Project Currency | string | 7: SGD, NOK, CHF, USD, EUR, PLN, COP |
| Frigg Score description | string | 5: Excellent, Good, Fair, Poor, Very Poor |
| Target Financing Type | string | 3: Debt, EquityAndDebt, Equity |

**Numeric (use as valueField for sum/avg/min/max):**
| Field | Description |
|-------|-------------|
| Capacity (kW) | Project capacity in kilowatts |
| CapEx | Total capital expenditure |
| CapEx per kW | CapEx normalized per kW |
| OpEx | Annual operating expenditure |
| Frigg Score | Risk score 0–10 (higher = better) |
| Project IRR | Internal rate of return (decimal, e.g. 0.09 = 9%) |
| Equity IRR | Equity internal rate of return |
| P50 kWh/yr | Expected annual energy production |
| Mean DSCR | Debt service coverage ratio |
| Target Financing | Target financing amount |
| Suggested Additional Leverage | Suggested debt amount |
| Suggested Interest Rate | Suggested debt interest rate |
| PPA Price | Power purchase agreement price |

**Date (use with :year or :quarter suffix for grouping):**
| Field | Description |
|-------|-------------|
| CoD | Commercial operation date (YYYY-MM-DD). Use "CoD:year" to group by year. |
| Created At | Project creation date |

### DataQuery Examples

Bar chart of project count by country (top 10):
\`\`\`json
{ "source": "projects", "filter": null, "groupBy": "Country", "aggregate": "count", "valueField": null, "sort": "desc", "limit": 10 }
\`\`\`

Total capacity by technology:
\`\`\`json
{ "source": "projects", "filter": null, "groupBy": "Technology", "aggregate": "sum", "valueField": "Capacity (kW)", "sort": "desc", "limit": null }
\`\`\`

Projects by commissioning year:
\`\`\`json
{ "source": "projects", "filter": null, "groupBy": "CoD:year", "aggregate": "count", "valueField": null, "sort": "asc", "limit": null }
\`\`\`

Solar PV projects in Singapore by status:
\`\`\`json
{ "source": "projects", "filter": { "Technology": "Solar PV", "Country": "Singapore" }, "groupBy": "Status", "aggregate": "count", "valueField": null, "sort": "desc", "limit": null }
\`\`\`

Average Frigg Score by country (top 10):
\`\`\`json
{ "source": "projects", "filter": null, "groupBy": "Country", "aggregate": "avg", "valueField": "Frigg Score", "sort": "desc", "limit": 10, "computedFields": null }
\`\`\`

### Computed Fields (post-processing)

\`computedFields\` is an optional array applied after aggregation. Each entry has: \`name\` (label), \`type\` ("ratio" | "running_total" | "pct_of_total"), \`field\` (for running_total/pct_of_total, nullable), \`numerator\` and \`denominator\` (for ratio, nullable).

CapEx per kW by technology (ratio of two fields):
\`\`\`json
{ "source": "projects", "filter": null, "groupBy": "Technology", "aggregate": "sum", "valueField": "CapEx", "sort": "desc", "limit": null, "computedFields": [{ "name": "CapEx per kW", "type": "ratio", "field": null, "numerator": "CapEx", "denominator": "Capacity (kW)" }] }
\`\`\`

Cumulative project count by year (running total):
\`\`\`json
{ "source": "projects", "filter": null, "groupBy": "CoD:year", "aggregate": "count", "valueField": null, "sort": "asc", "limit": null, "computedFields": [{ "name": "Cumulative Projects", "type": "running_total", "field": null, "numerator": null, "denominator": null }] }
\`\`\`

Capacity share by technology (percentage of total):
\`\`\`json
{ "source": "projects", "filter": null, "groupBy": "Technology", "aggregate": "sum", "valueField": "Capacity (kW)", "sort": "desc", "limit": null, "computedFields": [{ "name": "Capacity Share (%)", "type": "pct_of_total", "field": null, "numerator": null, "denominator": null }] }
\`\`\`

### Portfolio Totals (for MetricCard components)
Use these pre-computed values for summary metric cards:
- Total Projects: ${totals.totalProjects}
- Total Capacity: ${totals.totalCapacity}
- Total CapEx: ${totals.totalCapex}
- Avg Frigg Score: ${totals.avgFrigg}
- Avg Project IRR: ${totals.avgIRR}
- Countries: ${totals.countries}
- Technologies: ${totals.technologies}
`;
