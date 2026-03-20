export const ZOOM_OPTIONS = {
  zoom: {
    wheel: { enabled: true, modifierKey: 'ctrl' as const },
    pinch: { enabled: true },
    mode: 'xy' as const,
  },
  pan: { enabled: true, mode: 'xy' as const },
} as const;

interface DatasetInput {
  label: string;
  data: number[];
  backgroundColor: string | string[] | null;
  borderColor: string | string[] | null;
  borderWidth: number | null;
  fill: boolean | null;
  type?: 'bar' | 'line' | null;
  borderDash?: number[] | null;
}

interface DatasetDefaults {
  borderWidth: number;
  fill?: boolean;
  tension?: number;
}

export function mapDatasets(
  datasets: DatasetInput[] | undefined,
  defaults: DatasetDefaults
) {
  if (!datasets?.length) return [];
  return datasets.map(ds => ({
    label: ds.label,
    data: ds.data,
    backgroundColor: ds.backgroundColor ?? undefined,
    borderColor: ds.borderColor ?? undefined,
    borderWidth: ds.borderWidth ?? defaults.borderWidth,
    ...(defaults.fill !== undefined ? { fill: ds.fill ?? defaults.fill } : {}),
    ...(defaults.tension !== undefined ? { tension: defaults.tension } : {}),
  }));
}

export function basePlugins(props: {
  title: string | null;
  showLegend: boolean | null;
}) {
  return {
    legend: { display: props.showLegend ?? true },
    title: { display: !!props.title, text: props.title ?? '' },
  };
}

type YFormat = 'number' | 'currency-k' | 'currency-eur-k' | 'percent' | null;

function currencyEurKFormatter(v: number | string) {
  const n = Number(v);
  if (n >= 1_000_000) return `\u20AC${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `\u20AC${(n / 1_000).toFixed(0)}K`;
  return `\u20AC${n}`;
}

export function yAxisConfig(format: YFormat) {
  if (!format || format === 'number') return {};
  const callback =
    format === 'currency-k'
      ? (v: number | string) => {
          const n = Number(v);
          return n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;
        }
      : format === 'currency-eur-k'
        ? currencyEurKFormatter
        : (v: number | string) => `${v}%`;
  return { y: { ticks: { callback } } };
}
