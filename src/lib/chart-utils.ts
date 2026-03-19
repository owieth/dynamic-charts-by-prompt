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
    ...(ds.type ? { type: ds.type } : {}),
    ...(ds.borderDash ? { borderDash: ds.borderDash } : {}),
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

function currencyTickCallback(
  symbol: string
): (v: number | string) => string {
  return (v: number | string) => {
    const n = Number(v);
    if (n >= 1e6) return `${symbol}${(n / 1e6).toFixed(1)}M`;
    if (n >= 1000) return `${symbol}${(n / 1000).toFixed(0)}K`;
    return `${symbol}${n}`;
  };
}

export function yAxisConfig(format: YFormat) {
  if (!format || format === 'number') return {};
  const tickMap: Record<string, (v: number | string) => string> = {
    'currency-k': currencyTickCallback('$'),
    'currency-eur-k': currencyTickCallback('\u20AC'),
    percent: (v: number | string) => `${v}%`,
  };
  return {
    y: {
      ticks: { callback: tickMap[format] },
    },
  };
}
