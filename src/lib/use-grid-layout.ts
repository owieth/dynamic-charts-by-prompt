import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import type { Spec } from "@json-render/core";

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

const COLS = 12;
const STORAGE_PREFIX = "dashboard-layout:";

const CHART_TYPES = new Set([
  "LineChart",
  "BarChart",
  "PieChart",
  "DoughnutChart",
  "AreaChart",
  "RadarChart",
]);

const LAYOUT_CONTAINERS = new Set(["Stack", "Grid"]);

function hashKeys(keys: string[]): string {
  return keys.slice().sort().join("|");
}

function storageKey(keys: string[]): string {
  return STORAGE_PREFIX + hashKeys(keys);
}

function getElementType(spec: Spec, key: string): string {
  return spec.elements[key]?.type ?? "";
}

function hasChartChild(spec: Spec, key: string): boolean {
  const el = spec.elements[key];
  if (!el?.children) return false;
  return el.children.some((c) => CHART_TYPES.has(getElementType(spec, c)));
}

function collectLeafWidgets(spec: Spec, key: string): string[] {
  const type = getElementType(spec, key);
  const el = spec.elements[key];

  if (type === "Card") return [key];
  if (type === "Tabs") return [key];

  if (LAYOUT_CONTAINERS.has(type)) {
    if (!el?.children?.length) return [key];
    return el.children.flatMap((child) => collectLeafWidgets(spec, child));
  }

  return [key];
}

function defaultSize(
  spec: Spec,
  key: string,
): { w: number; h: number } {
  const type = getElementType(spec, key);
  if (type === "MetricCard") return { w: 3, h: 2 };
  if (CHART_TYPES.has(type)) return { w: 6, h: 5 };
  if (type === "Card" && hasChartChild(spec, key)) return { w: 6, h: 5 };
  if (type === "Card") return { w: 6, h: 4 };
  if (type === "Table") return { w: 12, h: 5 };
  if (type === "Tabs") return { w: 12, h: 6 };
  if (type === "Heading") return { w: 12, h: 1 };
  if (type === "Text") return { w: 6, h: 1 };
  return { w: 6, h: 4 };
}

function packLayout(spec: Spec, keys: string[]): LayoutItem[] {
  const layout: LayoutItem[] = [];
  let x = 0;
  let y = 0;
  let rowHeight = 0;

  for (const key of keys) {
    const { w, h } = defaultSize(spec, key);
    if (x + w > COLS) {
      x = 0;
      y += rowHeight;
      rowHeight = 0;
    }
    layout.push({ i: key, x, y, w, h, minW: 2, minH: 1 });
    x += w;
    rowHeight = Math.max(rowHeight, h);
  }

  return layout;
}

function extractGridChildren(spec: Spec): string[] {
  const root = spec.elements[spec.root];
  if (!root?.children?.length) return [];
  return root.children.flatMap((child) => collectLeafWidgets(spec, child));
}

function loadLayout(keys: string[]): LayoutItem[] | null {
  try {
    const raw = localStorage.getItem(storageKey(keys));
    if (!raw) return null;
    const saved = JSON.parse(raw) as LayoutItem[];
    const savedKeys = new Set(saved.map((l) => l.i));
    if (keys.length !== savedKeys.size || keys.some((k) => !savedKeys.has(k)))
      return null;
    return saved;
  } catch {
    return null;
  }
}

function saveLayout(keys: string[], layout: LayoutItem[]) {
  try {
    localStorage.setItem(storageKey(keys), JSON.stringify(layout));
  } catch {
    // storage full — ignore
  }
}

/**
 * Stabilize childKeys — only return a new array reference when the
 * actual set of keys changes, not on every spec mutation during streaming.
 */
function useStableKeys(spec: Spec | null): string[] {
  const [stable, setStable] = useState<string[]>([]);
  const prevHash = useRef("");

  useEffect(() => {
    const keys = spec ? extractGridChildren(spec) : [];
    const hash = keys.join("|");
    if (hash !== prevHash.current) {
      prevHash.current = hash;
      setStable(keys);
    }
  }, [spec]);

  return stable;
}

export function useGridLayout(spec: Spec | null, isStreaming: boolean) {
  const childKeys = useStableKeys(spec);
  const [layout, setLayout] = useState<LayoutItem[]>([]);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const childKeysRef = useRef(childKeys);
  childKeysRef.current = childKeys;

  // Build layout when childKeys change (streaming adds) or streaming ends
  useEffect(() => {
    if (!spec || childKeys.length === 0) {
      setLayout([]);
      return;
    }

    if (isStreaming) {
      setLayout((prev) => {
        const existing = new Map(prev.map((l) => [l.i, l]));
        const newKeys = childKeys.filter((k) => !existing.has(k));
        if (newKeys.length === 0 && prev.length === childKeys.length)
          return prev;

        const kept = childKeys
          .filter((k) => existing.has(k))
          .map((k) => existing.get(k)!);
        const appended = packLayout(spec, newKeys);

        const maxY = kept.reduce((m, l) => Math.max(m, l.y + l.h), 0);
        for (const item of appended) item.y += maxY;

        return [...kept, ...appended];
      });
    } else {
      const saved = loadLayout(childKeys);
      setLayout(saved ?? packLayout(spec, childKeys));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childKeys, isStreaming]);

  // onLayoutChange: only persist to localStorage, do NOT setLayout
  // RGL owns the visual layout internally; we only need to capture
  // the user's arrangement for persistence.
  const onLayoutChange = useCallback(
    (newLayout: readonly LayoutItem[]) => {
      if (!isStreaming && childKeysRef.current.length > 0) {
        saveLayout(childKeysRef.current, [...newLayout]);
      }
    },
    [isStreaming],
  );

  const resetLayout = useCallback(() => {
    if (!spec || childKeys.length === 0) return;
    try {
      localStorage.removeItem(storageKey(childKeys));
    } catch {
      // ignore
    }
    setLayout(packLayout(spec, childKeys));
    setLayoutVersion((v) => v + 1);
  }, [spec, childKeys]);

  return {
    layout,
    layoutVersion,
    childKeys,
    onLayoutChange,
    resetLayout,
    isDraggable: !isStreaming && childKeys.length > 0,
    isResizable: !isStreaming && childKeys.length > 0,
  };
}
