'use client';

import { createContext, useContext, type ReactNode } from 'react';

type Row = Record<string, unknown>;

interface DataSources {
  projects: Row[];
}

const DataContext = createContext<DataSources>({ projects: [] });

export function DataProvider({
  projects,
  children,
}: {
  projects: Row[];
  children: ReactNode;
}) {
  return (
    <DataContext.Provider value={{ projects }}>{children}</DataContext.Provider>
  );
}

export function useDataSource(source: string): Row[] {
  const ctx = useContext(DataContext);
  if (source === 'projects') return ctx.projects;
  return [];
}
