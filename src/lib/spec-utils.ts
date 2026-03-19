import type { Spec } from '@json-render/core';

function collectDescendants(spec: Spec, key: string): string[] {
  const el = spec.elements[key];
  if (!el?.children?.length) return [];
  const result: string[] = [];
  for (const child of el.children) {
    result.push(child);
    result.push(...collectDescendants(spec, child));
  }
  return result;
}

export function removeElementFromSpec(spec: Spec, key: string): Spec {
  const keysToRemove = new Set([key, ...collectDescendants(spec, key)]);

  const elements = { ...spec.elements };
  for (const k of keysToRemove) {
    delete elements[k];
  }

  // Remove references from parent children arrays
  for (const [elKey, el] of Object.entries(elements)) {
    if (el.children?.some(c => keysToRemove.has(c))) {
      elements[elKey] = {
        ...el,
        children: el.children.filter(c => !keysToRemove.has(c)),
      };
    }
  }

  return { ...spec, elements };
}
