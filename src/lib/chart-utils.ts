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

type YFormat = 'number' | 'currency-k' | 'percent' | null;

export function yAxisConfig(format: YFormat) {
  if (!format || format === 'number') return {};
  return {
    y: {
      ticks: {
        callback:
          format === 'currency-k'
            ? (v: number | string) => {
                const n = Number(v);
                return n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;
              }
            : (v: number | string) => `${v}%`,
      },
    },
  };
}
