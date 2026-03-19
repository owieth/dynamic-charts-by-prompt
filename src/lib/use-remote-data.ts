'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getValueAtPath,
  type DataSourceConfig,
} from './data-source-config';

type Row = Record<string, unknown>;

interface RemoteDataState {
  data: Row[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const cache = new Map<string, { data: Row[]; fetchedAt: number }>();

export function useRemoteData(config: DataSourceConfig | null): RemoteDataState {
  const [state, setState] = useState<RemoteDataState>({
    data: [],
    loading: false,
    error: null,
    lastFetched: null,
  });

  const configRef = useRef(config);
  configRef.current = config;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    const cfg = configRef.current;
    if (!cfg || cfg.type !== 'rest' || !cfg.url) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const res = await fetch(cfg.url, {
        method: cfg.method ?? 'GET',
        headers: cfg.headers,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      const extracted = cfg.dataPath ? getValueAtPath(json, cfg.dataPath) : json;

      if (!Array.isArray(extracted)) {
        throw new Error(
          cfg.dataPath
            ? `Data at path "${cfg.dataPath}" is not an array`
            : 'Response is not an array. Specify a dataPath to extract the array.'
        );
      }

      const rows = extracted as Row[];
      cache.set(cfg.id, { data: rows, fetchedAt: Date.now() });

      setState({
        data: rows,
        loading: false,
        error: null,
        lastFetched: Date.now(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fetch failed';
      setState(prev => ({
        ...prev,
        loading: false,
        error: message,
      }));
    }
  }, []);

  useEffect(() => {
    if (!config || config.type !== 'rest' || !config.url) {
      setState({ data: [], loading: false, error: null, lastFetched: null });
      return;
    }

    const cached = cache.get(config.id);
    if (cached) {
      setState({
        data: cached.data,
        loading: false,
        error: null,
        lastFetched: cached.fetchedAt,
      });
    }

    fetchData();

    if (config.refreshInterval && config.refreshInterval > 0) {
      intervalRef.current = setInterval(fetchData, config.refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [config?.id, config?.url, config?.refreshInterval, fetchData]);

  return state;
}

export function useRemoteDataSources(
  configs: DataSourceConfig[]
): Map<string, RemoteDataState> {
  const restConfigs = configs.filter(c => c.type === 'rest');

  const s0 = useRemoteData(restConfigs[0] ?? null);
  const s1 = useRemoteData(restConfigs[1] ?? null);
  const s2 = useRemoteData(restConfigs[2] ?? null);
  const s3 = useRemoteData(restConfigs[3] ?? null);
  const s4 = useRemoteData(restConfigs[4] ?? null);

  const states = [s0, s1, s2, s3, s4];
  const result = new Map<string, RemoteDataState>();

  for (let i = 0; i < restConfigs.length && i < 5; i++) {
    result.set(restConfigs[i].name, states[i]);
  }

  return result;
}
