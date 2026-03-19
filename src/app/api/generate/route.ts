import { buildSystemPrompt, createStreamResponse, getModel } from '@/lib/ai-config';
import type { DatasetInfo } from '@/lib/data-context';
import { buildUserPrompt } from '@json-render/core';
import { streamText } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { prompt, context, customDatasets } = await req.json();
  if (!prompt?.trim()) {
    return Response.json({ message: 'Missing prompt' }, { status: 400 });
  }

  const systemPrompt = buildSystemPrompt(
    (customDatasets as DatasetInfo[] | undefined) ?? undefined
  );

  const userPrompt = buildUserPrompt({
    prompt,
    state: context?.state,
  });

  const result = streamText({
    model: getModel(),
    system: systemPrompt,
    prompt: userPrompt,
    maxOutputTokens: 8192,
    temperature: 0.7,
  });

  return createStreamResponse(result);
}
