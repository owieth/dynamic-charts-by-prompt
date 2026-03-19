'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FieldMetadata } from './file-parser';

type Row = Record<string, unknown>;

export interface UserDataset {
  id: string;
  name: string;
  rows: Row[];
  fields: FieldMetadata[];
  createdAt: number;
}

interface DatasetMeta {
  id: string;
  name: string;
  fields: FieldMetadata[];
  rowCount: number;
  createdAt: number;
}

const STORAGE_KEY = 'user-datasets-meta';

function loadMeta(): DatasetMeta[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMeta(meta: DatasetMeta[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
  } catch {
    // storage full or unavailable
  }
}

export function useUserDatasets() {
  const [datasets, setDatasets] = useState<UserDataset[]>([]);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    // Restore metadata only; rows are kept in memory after upload
    // Previously uploaded datasets are listed but have no rows until re-uploaded
  }, []);

  const addDataset = useCallback(
    (name: string, rows: Row[], fields: FieldMetadata[]) => {
      const id = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const dataset: UserDataset = {
        id,
        name,
        rows,
        fields,
        createdAt: Date.now(),
      };

      setDatasets(prev => {
        const filtered = prev.filter(d => d.id !== id);
        const next = [...filtered, dataset];

        const meta: DatasetMeta[] = next.map(d => ({
          id: d.id,
          name: d.name,
          fields: d.fields,
          rowCount: d.rows.length,
          createdAt: d.createdAt,
        }));
        saveMeta(meta);

        return next;
      });

      return dataset;
    },
    []
  );

  const removeDataset = useCallback((id: string) => {
    setDatasets(prev => {
      const next = prev.filter(d => d.id !== id);
      const meta: DatasetMeta[] = next.map(d => ({
        id: d.id,
        name: d.name,
        fields: d.fields,
        rowCount: d.rows.length,
        createdAt: d.createdAt,
      }));
      saveMeta(meta);
      return next;
    });
  }, []);

  return { datasets, addDataset, removeDataset };
}
