import { createStreamResponse, getModel, SYSTEM_PROMPT } from '@/lib/ai-config';
import { buildUserPrompt } from '@json-render/core';
import { streamText } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ message: 'Missing messages' }, { status: 400 });
  }

  const aiMessages = messages.map((m: { role: string; content: string }) => ({
    role: m.role as 'user' | 'assistant',
    content:
      m.role === 'user' ? buildUserPrompt({ prompt: m.content }) : m.content,
  }));

  const result = streamText({
    model: getModel(),
    system: SYSTEM_PROMPT,
    messages: aiMessages,
    maxOutputTokens: 8192,
    temperature: 0.7,
  });

  return createStreamResponse(result);
}
