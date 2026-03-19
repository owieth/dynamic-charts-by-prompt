import { buildSystemPrompt, createStreamResponse, getModel } from '@/lib/ai-config';
import type { DatasetInfo } from '@/lib/data-context';
import { buildUserPrompt } from '@json-render/core';
import { streamText } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, spec, customDatasets } = await req.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ message: 'Missing messages' }, { status: 400 });
  }

  const systemPrompt = buildSystemPrompt(
    (customDatasets as DatasetInfo[] | undefined) ?? undefined
  );

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

  const result = streamText({
    model: getModel(),
    system: systemPrompt,
    messages: aiMessages,
    maxOutputTokens: 8192,
    temperature: 0.7,
  });

  return createStreamResponse(result);
}
