import type { FieldMetadata } from './file-parser';

interface DataSourceDescription {
  name: string;
  fields: FieldMetadata[];
  rowCount: number;
}

export function buildDataSourcePrompt(
  dataSources: DataSourceDescription[]
): string {
  if (dataSources.length === 0) return '';

  const sections = dataSources.map(ds => {
    const categorical = ds.fields.filter(f => f.type === 'string');
    const numeric = ds.fields.filter(f => f.type === 'number');
    const dates = ds.fields.filter(f => f.type === 'date');

    let section = `## Data Source: ${ds.name}\n\n`;
    section += `${ds.rowCount} rows. Use \`"source": "${ds.name}"\` in dataQuery to query this data.\n\n`;

    if (categorical.length > 0) {
      section += '**Categorical fields (use as groupBy / filter):**\n';
      section += '| Field | Unique Values |\n|-------|---------------|\n';
      for (const f of categorical) {
        section += `| ${f.name} | ${f.uniqueValues ?? '?'} |\n`;
      }
      section += '\n';
    }

    if (numeric.length > 0) {
      section += '**Numeric fields (use as valueField for sum/avg/min/max):**\n';
      section += '| Field |\n|-------|\n';
      for (const f of numeric) {
        section += `| ${f.name} |\n`;
      }
      section += '\n';
    }

    if (dates.length > 0) {
      section += '**Date fields (use with :year or :quarter suffix):**\n';
      section += '| Field |\n|-------|\n';
      for (const f of dates) {
        section += `| ${f.name} |\n`;
      }
      section += '\n';
    }

    return section;
  });

  return (
    '\n\n---\n\n# User-Uploaded Data Sources\n\n' + sections.join('\n')
  );
}
