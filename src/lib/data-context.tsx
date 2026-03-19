'use client';

import { createContext, useContext, type ReactNode } from 'react';

type Row = Record<string, unknown>;

type DataSources = Record<string, Row[]>;

const DataContext = createContext<DataSources>({});

export function DataProvider({
  sources,
  children,
}: {
  sources: DataSources;
  children: ReactNode;
}) {
  return (
    <DataContext.Provider value={sources}>{children}</DataContext.Provider>
  );
}

export function useDataSource(source: string): Row[] {
  const ctx = useContext(DataContext);
  return ctx[source] ?? [];
}
