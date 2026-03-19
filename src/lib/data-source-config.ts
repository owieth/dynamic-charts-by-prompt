import { z } from 'zod';

export const dataSourceConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['static', 'rest']),
  url: z.string().optional(),
  method: z.enum(['GET', 'POST']).optional(),
  headers: z.record(z.string(), z.string()).optional(),
  refreshInterval: z.number().optional(),
  dataPath: z.string().optional(),
});

export type DataSourceConfig = z.infer<typeof dataSourceConfigSchema>;

const STORAGE_KEY = 'data-source-configs';

export function loadDataSourceConfigs(): DataSourceConfig[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return z.array(dataSourceConfigSchema).parse(parsed);
  } catch {
    return [];
  }
}

export function saveDataSourceConfigs(configs: DataSourceConfig[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  } catch {
    // fail silently
  }
}

export function getValueAtPath(obj: unknown, path: string): unknown {
  if (!path) return obj;
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}
