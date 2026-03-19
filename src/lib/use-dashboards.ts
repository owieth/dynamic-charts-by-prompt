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
const ACTIVE_KEY = 'active-dashboard-id';

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

function loadActiveId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

function saveActiveId(id: string) {
  try {
    localStorage.setItem(ACTIVE_KEY, id);
  } catch {
    // fail silently
  }
}

export function useDashboards() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [activeId, setActiveId] = useState<string>(DEFAULT_DASHBOARD_ID);
  const [initialized, setInitialized] = useState(false);
  const dashboardsRef = useRef(dashboards);
  dashboardsRef.current = dashboards;

  useEffect(() => {
    let loaded = loadDashboards();
    if (loaded.length === 0) {
      loaded = [createDefaultDashboard()];
      saveDashboards(loaded);
    }
    // Ensure default dashboard exists and has latest spec
    const existingDefault = loaded.find(d => d.id === DEFAULT_DASHBOARD_ID);
    if (!existingDefault) {
      loaded = [createDefaultDashboard(), ...loaded];
      saveDashboards(loaded);
    } else if (existingDefault.messages.length === 0) {
      // Refresh spec from code if user hasn't chatted on the default dashboard
      loaded = loaded.map(d =>
        d.id === DEFAULT_DASHBOARD_ID
          ? { ...d, spec: DEFAULT_DASHBOARD_SPEC }
          : d
      );
      saveDashboards(loaded);
    }
    setDashboards(loaded);

    const savedActiveId = loadActiveId();
    if (savedActiveId && loaded.find(d => d.id === savedActiveId)) {
      setActiveId(savedActiveId);
    } else {
      setActiveId(loaded[0].id);
      saveActiveId(loaded[0].id);
    }
    setInitialized(true);
  }, []);

  const activeDashboard =
    dashboards.find(d => d.id === activeId) ?? dashboards[0] ?? null;

  const persist = useCallback((next: Dashboard[]) => {
    setDashboards(next);
    saveDashboards(next);
  }, []);

  const selectDashboard = useCallback((id: string) => {
    setActiveId(id);
    saveActiveId(id);
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
    setActiveId(dashboard.id);
    saveActiveId(dashboard.id);
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
      if (activeId === id) {
        const newActive = next[0]?.id ?? DEFAULT_DASHBOARD_ID;
        setActiveId(newActive);
        saveActiveId(newActive);
      }
    },
    [activeId, persist]
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
    initialized,
    createDashboard,
    selectDashboard,
    updateDashboard,
    deleteDashboard,
    renameDashboard,
  };
}
