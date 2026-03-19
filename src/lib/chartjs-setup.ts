import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

Chart.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

export function applyChartTheme() {
  const inkMuted = getCssVar('--color-ink-muted') || '#8a8480';
  const ink = getCssVar('--color-ink') || '#f4ede4';
  const surface = getCssVar('--color-surface') || '#111116';
  const surfaceHi = getCssVar('--color-surface-hi') || '#18181f';
  const borderColor = getCssVar('--color-border') || '#27272e';
  const borderHi = getCssVar('--color-border-hi') || '#3f3f48';

  // Base colors
  Chart.defaults.color = inkMuted;
  Chart.defaults.borderColor = borderColor;

  // Grid lines
  Chart.defaults.scale.grid = {
    ...Chart.defaults.scale.grid,
    color: borderColor,
  };

  // Tooltip
  Chart.defaults.plugins.tooltip.backgroundColor = surfaceHi;
  Chart.defaults.plugins.tooltip.borderColor = borderHi;
  Chart.defaults.plugins.tooltip.titleColor = ink;
  Chart.defaults.plugins.tooltip.bodyColor = inkMuted;

  // Title
  Chart.defaults.plugins.title.color = ink;
}

// Font defaults (theme-independent)
Chart.defaults.font.family = "'Instrument Sans', ui-sans-serif, sans-serif";
Chart.defaults.font.size = 12;

// Points — small, clean
Chart.defaults.elements.point.radius = 3;
Chart.defaults.elements.point.hoverRadius = 5;
Chart.defaults.elements.point.borderWidth = 2;

// Lines — smooth
Chart.defaults.elements.line.tension = 0.35;

// Bar — slight rounding
Chart.defaults.elements.bar.borderRadius = 3;

// Tooltip — layout
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.padding = {
  top: 8,
  bottom: 8,
  left: 12,
  right: 12,
};
Chart.defaults.plugins.tooltip.cornerRadius = 4;
Chart.defaults.plugins.tooltip.displayColors = true;
Chart.defaults.plugins.tooltip.boxPadding = 4;

// Legend — compact
Chart.defaults.plugins.legend.labels.boxWidth = 10;
Chart.defaults.plugins.legend.labels.useBorderRadius = true;
Chart.defaults.plugins.legend.labels.borderRadius = 2;
Chart.defaults.plugins.legend.labels.padding = 16;

// Title — slightly larger
Chart.defaults.plugins.title.font = {
  ...Chart.defaults.plugins.title.font,
  size: 14,
  weight: 'bold',
};

// Apply initial theme from CSS vars
if (typeof document !== 'undefined') {
  applyChartTheme();
}
