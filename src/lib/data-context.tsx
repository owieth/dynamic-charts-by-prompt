'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

type Row = Record<string, unknown>;
type DataSources = Record<string, Row[]>;

const DataContext = createContext<DataSources>({ projects: [] });

interface DataProviderProps {
  projects: Row[];
  additionalSources?: Record<string, Row[]>;
  children: ReactNode;
}

export function DataProvider({
  projects,
  additionalSources,
  children,
}: DataProviderProps) {
  const value = useMemo<DataSources>(() => {
    const sources: DataSources = { projects };
    if (additionalSources) {
      for (const [name, rows] of Object.entries(additionalSources)) {
        sources[name] = rows;
      }
    }
    return sources;
  }, [projects, additionalSources]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useDataSource(source: string): Row[] {
  const ctx = useContext(DataContext);
  return ctx[source] ?? [];
}

export function useAvailableSources(): string[] {
  const ctx = useContext(DataContext);
  return Object.keys(ctx);
}
