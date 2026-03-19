const STORAGE_KEY = 'data-source-configs';

export interface DataSourceConfig {
  id: string;
  name: string;
  type: 'static' | 'rest';
  url?: string;
  headers?: Record<string, string>;
  refreshInterval?: number;
  transform?: string;
}

export const BUILTIN_PROJECTS_SOURCE: DataSourceConfig = {
  id: 'projects',
  name: 'Projects',
  type: 'static',
};

export function getDataSources(): DataSourceConfig[] {
  if (typeof window === 'undefined') return [BUILTIN_PROJECTS_SOURCE];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const custom: DataSourceConfig[] = raw ? JSON.parse(raw) : [];
    return [
      BUILTIN_PROJECTS_SOURCE,
      ...custom.filter(c => c.id !== 'projects'),
    ];
  } catch {
    return [BUILTIN_PROJECTS_SOURCE];
  }
}

export function addDataSource(config: DataSourceConfig): DataSourceConfig[] {
  if (config.id === 'projects') {
    throw new Error('Cannot override the built-in projects source');
  }
  const existing = getDataSources().filter(
    c => c.id !== config.id && c.id !== 'projects'
  );
  const updated = [...existing, config];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return [BUILTIN_PROJECTS_SOURCE, ...updated];
}

export function removeDataSource(id: string): DataSourceConfig[] {
  if (id === 'projects') {
    throw new Error('Cannot remove the built-in projects source');
  }
  const updated = getDataSources().filter(
    c => c.id !== id && c.id !== 'projects'
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return [BUILTIN_PROJECTS_SOURCE, ...updated];
}
