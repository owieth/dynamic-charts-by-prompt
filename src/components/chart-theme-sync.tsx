'use client';

import { applyChartTheme } from '@/lib/chartjs-setup';
import { useTheme } from '@/lib/theme-context';
import { useEffect } from 'react';

/**
 * Keeps Chart.js global defaults in sync with the active theme.
 * Render this component once inside the client tree (after chartjs-setup is loaded).
 */
export function ChartThemeSync() {
  const { theme } = useTheme();

  useEffect(() => {
    // Small delay so CSS vars have been applied by the class change
    const id = requestAnimationFrame(() => {
      applyChartTheme();
    });
    return () => cancelAnimationFrame(id);
  }, [theme]);

  return null;
}
