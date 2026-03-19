'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

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
  const value = useMemo(() => sources, [sources]);
  return (
    <DataContext.Provider value={value}>{children}</DataContext.Provider>
  );
}

export function useDataSource(source: string): Row[] {
  const ctx = useContext(DataContext);
  return ctx[source] ?? [];
}
