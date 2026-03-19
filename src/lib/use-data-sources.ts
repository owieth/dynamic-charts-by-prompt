'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { clearCache, fetchDataSource } from './data-fetcher';
import {
  addDataSource,
  getDataSources,
  removeDataSource,
  type DataSourceConfig,
} from './data-sources';

type Row = Record<string, unknown>;

interface UseDataSourcesResult {
  sources: Record<string, Row[]>;
  configs: DataSourceConfig[];
  addSource: (config: DataSourceConfig) => void;
  removeSource: (id: string) => void;
  refreshSource: (id: string) => void;
  isLoading: boolean;
}

export function useDataSources(): UseDataSourcesResult {
  const [configs, setConfigs] = useState<DataSourceConfig[]>([]);
  const [sources, setSources] = useState<Record<string, Row[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const intervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(
    new Map()
  );

  const fetchSource = useCallback(
    async (config: DataSourceConfig) => {
      try {
        const data = await fetchDataSource(config);
        setSources(prev => ({ ...prev, [config.id]: data }));
      } catch (err) {
        console.error(`Failed to fetch data source "${config.name}":`, err);
      }
    },
    []
  );

  const setupInterval = useCallback(
    (config: DataSourceConfig) => {
      const existing = intervalsRef.current.get(config.id);
      if (existing) clearInterval(existing);

      if (
        config.type === 'rest' &&
        config.refreshInterval &&
        config.refreshInterval > 0
      ) {
        const id = setInterval(() => {
          clearCache(config.id);
          fetchSource(config);
        }, config.refreshInterval);
        intervalsRef.current.set(config.id, id);
      }
    },
    [fetchSource]
  );

  // Load configs and fetch all sources on mount
  useEffect(() => {
    const allConfigs = getDataSources();
    setConfigs(allConfigs);

    setIsLoading(true);
    Promise.all(allConfigs.map(c => fetchSource(c))).finally(() =>
      setIsLoading(false)
    );

    for (const config of allConfigs) {
      setupInterval(config);
    }

    return () => {
      for (const id of intervalsRef.current.values()) {
        clearInterval(id);
      }
      intervalsRef.current.clear();
    };
    // Run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addSource = useCallback(
    (config: DataSourceConfig) => {
      const updated = addDataSource(config);
      setConfigs(updated);
      fetchSource(config);
      setupInterval(config);
    },
    [fetchSource, setupInterval]
  );

  const removeSourceCb = useCallback((id: string) => {
    const updated = removeDataSource(id);
    setConfigs(updated);
    setSources(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    const intervalId = intervalsRef.current.get(id);
    if (intervalId) {
      clearInterval(intervalId);
      intervalsRef.current.delete(id);
    }
    clearCache(id);
  }, []);

  const refreshSource = useCallback(
    (id: string) => {
      const config = configs.find(c => c.id === id);
      if (config) {
        clearCache(id);
        fetchSource(config);
      }
    },
    [configs, fetchSource]
  );

  return { sources, configs, addSource, removeSource: removeSourceCb, refreshSource, isLoading };
}
