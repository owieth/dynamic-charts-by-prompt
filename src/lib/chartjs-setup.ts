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

// Warm instrument theme
Chart.defaults.color = '#8a8480';
Chart.defaults.borderColor = '#1e1e24';
Chart.defaults.font.family = "'Instrument Sans', ui-sans-serif, sans-serif";
Chart.defaults.font.size = 12;

// Grid lines — subtle
Chart.defaults.scale.grid = { ...Chart.defaults.scale.grid, color: '#1e1e24' };

// Points — small, clean
Chart.defaults.elements.point.radius = 3;
Chart.defaults.elements.point.hoverRadius = 5;
Chart.defaults.elements.point.borderWidth = 2;

// Lines — smooth
Chart.defaults.elements.line.tension = 0.35;

// Bar — slight rounding
Chart.defaults.elements.bar.borderRadius = 3;

// Tooltip — polished
Chart.defaults.plugins.tooltip.backgroundColor = '#18181f';
Chart.defaults.plugins.tooltip.borderColor = '#3f3f48';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.titleColor = '#f4ede4';
Chart.defaults.plugins.tooltip.bodyColor = '#a8a29e';
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
Chart.defaults.plugins.title.color = '#f4ede4';
Chart.defaults.plugins.title.font = {
  ...Chart.defaults.plugins.title.font,
  size: 14,
  weight: 'bold',
};
