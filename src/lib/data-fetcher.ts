import type { DataSourceConfig } from './data-sources';
import projectsData from './projects.json';

type Row = Record<string, unknown>;

interface CacheEntry {
  data: Row[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function applyTransform(data: unknown, transform: string): Row[] {
  const parts = transform.split('.');
  let current: unknown = data;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return [];
    current = (current as Record<string, unknown>)[part];
  }
  if (!Array.isArray(current)) return [];
  return current as Row[];
}

export async function fetchDataSource(
  config: DataSourceConfig
): Promise<Row[]> {
  if (config.type === 'static' && config.id === 'projects') {
    return projectsData.projects as Row[];
  }

  if (config.type !== 'rest' || !config.url) {
    return [];
  }

  const cached = cache.get(config.id);
  const interval = config.refreshInterval ?? 0;
  if (cached && interval > 0 && Date.now() - cached.timestamp < interval) {
    return cached.data;
  }

  const response = await fetch(config.url, {
    headers: config.headers ?? {},
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${config.name}: ${response.status} ${response.statusText}`
    );
  }

  const json: unknown = await response.json();

  let rows: Row[];
  if (config.transform) {
    rows = applyTransform(json, config.transform);
  } else if (Array.isArray(json)) {
    rows = json as Row[];
  } else {
    rows = [];
  }

  cache.set(config.id, { data: rows, timestamp: Date.now() });
  return rows;
}

export function clearCache(sourceId?: string): void {
  if (sourceId) {
    cache.delete(sourceId);
  } else {
    cache.clear();
  }
}
