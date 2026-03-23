import type { Spec } from '@json-render/core';

interface SharedDashboard {
  spec: Spec;
  name: string;
}

async function compressToBase64url(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);

  if (typeof CompressionStream === 'undefined') {
    return btoa(String.fromCharCode(...data))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  const cs = new CompressionStream('deflate-raw');
  const writer = cs.writable.getWriter();
  writer.write(data);
  writer.close();

  const chunks: Uint8Array[] = [];
  const reader = cs.readable.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const compressed = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    compressed.set(chunk, offset);
    offset += chunk.length;
  }

  return btoa(String.fromCharCode(...compressed))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function decompressFromBase64url(encoded: string): Promise<string> {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));

  if (typeof DecompressionStream === 'undefined') {
    return new TextDecoder().decode(bytes);
  }

  const ds = new DecompressionStream('deflate-raw');
  const writer = ds.writable.getWriter();
  writer.write(bytes);
  writer.close();

  const chunks: Uint8Array[] = [];
  const reader = ds.readable.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const decompressed = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    decompressed.set(chunk, offset);
    offset += chunk.length;
  }

  return new TextDecoder().decode(decompressed);
}

export async function encodeSpec(spec: Spec, name: string): Promise<string> {
  const payload: SharedDashboard = { spec, name };
  return compressToBase64url(JSON.stringify(payload));
}

export async function decodeSpec(
  encoded: string
): Promise<SharedDashboard | null> {
  try {
    const json = await decompressFromBase64url(encoded);
    const parsed = JSON.parse(json) as SharedDashboard;
    if (!parsed.spec || !parsed.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

export const MAX_SHARE_URL_LENGTH = 8000;
