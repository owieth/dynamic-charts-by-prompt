export interface FieldMetadata {
  name: string;
  type: 'string' | 'number' | 'date';
  uniqueValues?: number;
}

type Row = Record<string, unknown>;

interface ParseResult {
  rows: Row[];
  fields: FieldMetadata[];
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}/;

function detectFieldType(
  values: unknown[]
): 'string' | 'number' | 'date' {
  let numCount = 0;
  let dateCount = 0;
  let total = 0;

  for (const v of values) {
    if (v === null || v === undefined || v === '') continue;
    total++;
    const s = String(v);
    if (!isNaN(Number(s)) && s.trim() !== '') {
      numCount++;
    } else if (DATE_RE.test(s)) {
      dateCount++;
    }
  }

  if (total === 0) return 'string';
  if (numCount / total > 0.8) return 'number';
  if (dateCount / total > 0.8) return 'date';
  return 'string';
}

function extractFields(rows: Row[]): FieldMetadata[] {
  if (rows.length === 0) return [];

  const fieldNames = Object.keys(rows[0]);
  return fieldNames.map(name => {
    const values = rows.map(r => r[name]);
    const type = detectFieldType(values);
    const unique = new Set(values.map(v => String(v ?? '')));
    return { name, type, uniqueValues: unique.size };
  });
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }

  fields.push(current.trim());
  return fields;
}

export function parseCSV(text: string): ParseResult {
  const lines = text
    .split(/\r?\n/)
    .filter(line => line.trim() !== '');

  if (lines.length < 2) {
    return { rows: [], fields: [] };
  }

  const headers = parseCSVLine(lines[0]);
  const rows: Row[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Row = {};
    for (let j = 0; j < headers.length; j++) {
      const raw = values[j] ?? '';
      const num = Number(raw);
      row[headers[j]] = raw !== '' && !isNaN(num) && raw.trim() !== '' ? num : raw;
    }
    rows.push(row);
  }

  return { rows, fields: extractFields(rows) };
}

export function parseJSON(text: string): ParseResult {
  const parsed = JSON.parse(text);
  const arr: unknown[] = Array.isArray(parsed) ? parsed : [parsed];

  const rows: Row[] = arr
    .filter((item): item is Record<string, unknown> =>
      typeof item === 'object' && item !== null && !Array.isArray(item)
    );

  return { rows, fields: extractFields(rows) };
}
