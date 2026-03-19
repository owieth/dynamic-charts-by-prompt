import { z } from 'zod';
import { dataQuerySchema } from './data-query';

const datasetSchema = z.object({
  label: z.string(),
  data: z.array(z.number()),
  backgroundColor: z.union([z.string(), z.array(z.string())]).nullable(),
  borderColor: z.union([z.string(), z.array(z.string())]).nullable(),
  borderWidth: z.number().nullable(),
  fill: z.boolean().nullable(),
});

const baseChartSchema = z.object({
  // Static data (used if dataQuery is null)
  labels: z.array(z.string()).nullable(),
  datasets: z.array(datasetSchema).nullable(),
  // Dynamic data (preferred — resolved at render time)
  dataQuery: dataQuerySchema.nullable(),
  dataQueries: z.array(dataQuerySchema).nullable(),
  datasetLabel: z.string().nullable(),
  datasetLabels: z.array(z.string()).nullable(),
  // Display
  title: z.string().nullable(),
  showLegend: z.boolean().nullable(),
  yFormat: z.enum(['number', 'currency-k', 'percent']).nullable(),
  // Style overrides (applied on top of resolved/default colors)
  backgroundColor: z.union([z.string(), z.array(z.string())]).nullable(),
  borderColor: z.union([z.string(), z.array(z.string())]).nullable(),
  borderWidth: z.number().nullable(),
  fill: z.boolean().nullable(),
});

export const lineChartSchema = baseChartSchema;

export const barChartSchema = baseChartSchema.extend({
  stacked: z.boolean().nullable(),
  indexAxis: z.enum(['x', 'y']).nullable(),
});

export const pieChartSchema = baseChartSchema;

export const doughnutChartSchema = baseChartSchema;

export const areaChartSchema = baseChartSchema.extend({
  stacked: z.boolean().nullable(),
});

export const radarChartSchema = baseChartSchema;

export type LineChartProps = z.infer<typeof lineChartSchema>;
export type BarChartProps = z.infer<typeof barChartSchema>;
export type PieChartProps = z.infer<typeof pieChartSchema>;
export type DoughnutChartProps = z.infer<typeof doughnutChartSchema>;
export type AreaChartProps = z.infer<typeof areaChartSchema>;
export type RadarChartProps = z.infer<typeof radarChartSchema>;

export const dataTableSchema = z.object({
  title: z.string().nullable(),
  columns: z.array(z.string()),
  source: z.string(),
  filter: z
    .record(z.string(), z.union([z.string(), z.array(z.string())]))
    .nullable(),
  sortBy: z.string().nullable(),
  sortDir: z.enum(['asc', 'desc']).nullable(),
  limit: z.number().nullable(),
  pageSize: z.number().nullable(),
});

export type DataTableProps = z.infer<typeof dataTableSchema>;
