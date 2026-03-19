# Dynamic Charts by Prompt

Generate interactive chart dashboards from natural language prompts, powered by AI.

<!-- TODO: Add screenshot -->

## Features

- **Prompt-driven chart generation** -- describe the dashboard you want in plain text
- **Real-time streaming** -- watch charts render progressively as the AI responds
- **Six chart types** -- Line, Bar, Pie, Doughnut, Area, and Radar
- **Drag-and-drop grid** -- rearrange and resize charts in a responsive dashboard layout
- **Interactive charts** -- zoom, pan, and hover tooltips via Chart.js
- **Schema-validated rendering** -- streamed JSONL is parsed and rendered as a typed component tree

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 15](https://nextjs.org) (App Router, Turbopack) + React 19 |
| AI | [Vercel AI SDK v6](https://sdk.vercel.ai) + Anthropic Claude |
| Charting | [Chart.js 4](https://www.chartjs.org) + react-chartjs-2 + chartjs-plugin-zoom |
| UI Rendering | [@json-render](https://github.com/nicklaros/json-render) (core, react, shadcn) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Validation | [Zod](https://zod.dev) |
| Grid Layout | [react-grid-layout](https://github.com/react-grid-layout/react-grid-layout) |

## Getting Started

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io) 10.6.5+
- An [Anthropic API key](https://console.anthropic.com/settings/keys)

### Installation

```bash
git clone https://github.com/owieth/dynamic-charts-by-prompt.git
cd dynamic-charts-by-prompt
pnpm install
```

### Environment Setup

Create a `.env.local` file in the project root:

```bash
ANTHROPIC_API_KEY=your-api-key-here
```

### Development

```bash
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                # Root layout with Geist font
│   ├── page.tsx                  # Main page with prompt UI and streaming
│   ├── globals.css               # Tailwind v4 + CSS variables
│   └── api/generate/route.ts     # Streaming API route (Anthropic + AI SDK)
├── components/
│   ├── dashboard-renderer.tsx    # Client-side renderer (Chart.js + json-render)
│   ├── grid-dashboard.tsx        # Drag-and-drop resizable grid layout
│   ├── metric-card.tsx           # Metric display card
│   └── charts/
│       ├── line-chart.tsx
│       ├── bar-chart.tsx
│       ├── pie-chart.tsx
│       ├── doughnut-chart.tsx
│       ├── area-chart.tsx
│       └── radar-chart.tsx
└── lib/
    ├── catalog.ts                # json-render catalog definition
    ├── registry.tsx              # Client-side component registry
    ├── chart-schemas.ts          # Zod schemas for chart props
    ├── chartjs-setup.ts          # Chart.js global plugin registration
    ├── sample-data.ts            # Sample datasets for the system prompt
    ├── data-context.tsx          # Data context provider
    ├── data-query.ts             # Data query utilities
    ├── chart-utils.ts            # Chart helper functions
    ├── use-chart-data.ts         # Chart data hook
    └── use-grid-layout.ts        # Grid layout hook
```

## How It Works

1. **Prompt** -- The user types a natural language request describing the desired dashboard.
2. **Stream** -- The API route sends the prompt to Anthropic Claude via the Vercel AI SDK. The model streams back JSONL describing a component tree.
3. **Parse** -- `@json-render/react` incrementally parses the streamed JSONL into a live component tree using the registered catalog.
4. **Render** -- Chart.js components render inside a `react-grid-layout` dashboard that supports drag-and-drop repositioning and resizing.

## Available Chart Types

| Type | Component | Description |
| --- | --- | --- |
| Line | `LineChart` | Trend lines over time or categories |
| Bar | `BarChart` | Categorical comparisons |
| Pie | `PieChart` | Proportional distribution |
| Doughnut | `DoughnutChart` | Proportional distribution (ring variant) |
| Area | `AreaChart` | Filled line charts for volume |
| Radar | `RadarChart` | Multi-axis comparison |

## Contributing

Contributions are welcome. Please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes using [conventional commits](https://www.conventionalcommits.org)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

## License

[MIT](LICENSE)
