import { createStreamResponse, getModel, SYSTEM_PROMPT } from '@/lib/ai-config';
import { buildUserPrompt } from '@json-render/core';
import { streamText } from 'ai';

export const maxDuration = 60;

interface DataSourceMeta {
  name: string;
  fields: { name: string; type: string; uniqueValues?: number }[];
  rowCount: number;
}

function buildUserDataPrompt(dataSources: DataSourceMeta[]): string {
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

  return '\n\n---\n\n# User-Uploaded Data Sources\n\n' + sections.join('\n');
}

export async function POST(req: Request) {
  const { messages, spec, dataSources } = await req.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ message: 'Missing messages' }, { status: 400 });
  }

  const aiMessages = messages.map(
    (m: { role: string; content: string }, i: number) => ({
      role: m.role as 'user' | 'assistant',
      content:
        m.role === 'user'
          ? buildUserPrompt({
              prompt: m.content,
              ...(i === messages.length - 1 && spec
                ? { context: { state: spec } }
                : {}),
            })
          : m.content,
    })
  );

  const userDataPrompt = Array.isArray(dataSources)
    ? buildUserDataPrompt(dataSources)
    : '';

  const result = streamText({
    model: getModel(),
    system: SYSTEM_PROMPT + userDataPrompt,
    messages: aiMessages,
    maxOutputTokens: 8192,
    temperature: 0.7,
  });

  return createStreamResponse(result);
}
