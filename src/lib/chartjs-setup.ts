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

function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

/** Apply Chart.js defaults from current CSS custom properties. */
export function applyChartTheme() {
  const text = getCSSVar('--chart-text') || '#8a8480';
  const grid = getCSSVar('--chart-grid') || '#1e1e24';
  const tooltipBg = getCSSVar('--chart-tooltip-bg') || '#18181f';
  const tooltipBorder = getCSSVar('--chart-tooltip-border') || '#3f3f48';
  const title = getCSSVar('--chart-title') || '#f4ede4';
  const tooltipBody = getCSSVar('--chart-tooltip-body') || '#a8a29e';

  Chart.defaults.color = text;
  Chart.defaults.borderColor = grid;

  Chart.defaults.scale.grid = { ...Chart.defaults.scale.grid, color: grid };

  Chart.defaults.plugins.tooltip.backgroundColor = tooltipBg;
  Chart.defaults.plugins.tooltip.borderColor = tooltipBorder;
  Chart.defaults.plugins.tooltip.titleColor = title;
  Chart.defaults.plugins.tooltip.bodyColor = tooltipBody;

  Chart.defaults.plugins.title.color = title;
}

// Font & structural defaults (theme-independent)
Chart.defaults.font.family = "'Instrument Sans', ui-sans-serif, sans-serif";
Chart.defaults.font.size = 12;

Chart.defaults.elements.point.radius = 3;
Chart.defaults.elements.point.hoverRadius = 5;
Chart.defaults.elements.point.borderWidth = 2;

Chart.defaults.elements.line.tension = 0.35;

Chart.defaults.elements.bar.borderRadius = 3;

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

Chart.defaults.plugins.legend.labels.boxWidth = 10;
Chart.defaults.plugins.legend.labels.useBorderRadius = true;
Chart.defaults.plugins.legend.labels.borderRadius = 2;
Chart.defaults.plugins.legend.labels.padding = 16;

Chart.defaults.plugins.title.font = {
  ...Chart.defaults.plugins.title.font,
  size: 14,
  weight: 'bold',
};

// Apply initial theme colors
if (typeof window !== 'undefined') {
  applyChartTheme();
}
