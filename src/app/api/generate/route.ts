import { createStreamResponse, getModel, SYSTEM_PROMPT } from '@/lib/ai-config';
import { buildUserPrompt } from '@json-render/core';
import { streamText } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { prompt, context } = await req.json();
  if (!prompt?.trim()) {
    return Response.json({ message: 'Missing prompt' }, { status: 400 });
  }

  const userPrompt = buildUserPrompt({
    prompt,
    state: context?.state,
  });

  const result = streamText({
    model: getModel(),
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
    maxOutputTokens: 8192,
    temperature: 0.7,
  });

  return createStreamResponse(result);
}
