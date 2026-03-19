'use client';

import type { Spec } from '@json-render/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_DASHBOARD_ID,
  DEFAULT_DASHBOARD_SPEC,
} from './default-dashboard';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  spec: Spec | null;
}

export interface Dashboard {
  id: string;
  name: string;
  messages: ChatMessage[];
  spec: Spec | null;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'dashboards';

function createDefaultDashboard(): Dashboard {
  return {
    id: DEFAULT_DASHBOARD_ID,
    name: 'Overview',
    messages: [],
    spec: DEFAULT_DASHBOARD_SPEC,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function loadDashboards(): Dashboard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Dashboard[];
  } catch {
    return [];
  }
}

function saveDashboards(dashboards: Dashboard[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
  } catch {
    // localStorage full — fail silently
  }
}

function reconcileDashboards(loaded: Dashboard[]): Dashboard[] {
  if (loaded.length === 0) {
    loaded = [createDefaultDashboard()];
  }
  const existingDefault = loaded.find(d => d.id === DEFAULT_DASHBOARD_ID);
  if (!existingDefault) {
    loaded = [createDefaultDashboard(), ...loaded];
  } else if (existingDefault.messages.length === 0) {
    loaded = loaded.map(d =>
      d.id === DEFAULT_DASHBOARD_ID ? { ...d, spec: DEFAULT_DASHBOARD_SPEC } : d
    );
  }
  return loaded;
}

export function useDashboards(activeId: string) {
  const [dashboards, setDashboards] = useState<Dashboard[]>(() =>
    reconcileDashboards([createDefaultDashboard()])
  );
  const hydrated = useRef(false);
  const dashboardsRef = useRef(dashboards);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const loaded = loadDashboards();
    if (loaded.length > 0) {
      const reconciled = reconcileDashboards(loaded);
      saveDashboards(reconciled);
      setDashboards(reconciled);
    }
  }, []);
  dashboardsRef.current = dashboards;

  const activeDashboard =
    dashboards.find(d => d.id === activeId) ?? dashboards[0] ?? null;

  const persist = useCallback((next: Dashboard[]) => {
    setDashboards(next);
    saveDashboards(next);
  }, []);

  const createDashboard = useCallback((): Dashboard => {
    const dashboard: Dashboard = {
      id: crypto.randomUUID(),
      name: 'New Dashboard',
      messages: [],
      spec: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const next = [dashboard, ...dashboardsRef.current];
    persist(next);
    return dashboard;
  }, [persist]);

  const updateDashboard = useCallback(
    (
      id: string,
      patch: Partial<Pick<Dashboard, 'name' | 'messages' | 'spec'>>
    ) => {
      const next = dashboardsRef.current.map(d =>
        d.id === id ? { ...d, ...patch, updatedAt: Date.now() } : d
      );
      persist(next);
    },
    [persist]
  );

  const deleteDashboard = useCallback(
    (id: string) => {
      if (id === DEFAULT_DASHBOARD_ID) return;
      const next = dashboardsRef.current.filter(d => d.id !== id);
      persist(next);
    },
    [persist]
  );

  const renameDashboard = useCallback(
    (id: string, name: string) => {
      updateDashboard(id, { name });
    },
    [updateDashboard]
  );

  return {
    dashboards,
    activeDashboard,
    activeId,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    renameDashboard,
  };
}
