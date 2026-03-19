import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { gateway } from "@ai-sdk/gateway";
import { buildUserPrompt } from "@json-render/core";
import { catalog } from "@/lib/catalog";
import { sampleDataContext } from "@/lib/sample-data";

export const maxDuration = 60;

const CUSTOM_RULES = [
  "Start every dashboard with a horizontal Stack (direction: horizontal, gap: lg) of MetricCard components showing key numbers. Use 3–5 metrics.",
  "Below the metrics row, use a Grid with columns: 2 for side-by-side charts. Use columns: 1 for full-width charts.",
  "Always wrap each chart inside a Card with a clear, descriptive title.",
  "For bar+line combos: put the volume metric (revenue, sales) as a BarChart AND the trend metric (expenses, growth) as a separate LineChart in a second Card.",
  "Use rgba colors with 0.7–0.85 alpha for bar fills and solid rgb colors for line borders.",
  "For AreaChart, use low-alpha fills (0.2–0.3) with solid border colors.",
  "Always set showLegend: true and provide a descriptive title for every chart.",
  "Set yFormat: 'currency-k' on charts with monetary data.",
  "Use ONLY the sample data provided below — do not invent numbers.",
  "Format metric values with $ and K/M suffixes (e.g. '$6.85M', '$890K').",
  "Prefer distinct colors: blue (#3b82f6), orange (#f97316), green (#22c55e), violet (#8b5cf6), rose (#f43f5e), amber (#f59e0b).",
];

const SYSTEM_PROMPT =
  catalog.prompt({ customRules: CUSTOM_RULES }) +
  "\n\n---\n\n" +
  sampleDataContext;

function getModel() {
  if (process.env.ANTHROPIC_API_KEY) {
    return anthropic(process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6");
  }
  return gateway(process.env.AI_GATEWAY_MODEL ?? "anthropic/claude-sonnet-4.5");
}

export async function POST(req: Request) {
  const { prompt, context } = await req.json();
  if (!prompt?.trim()) {
    return Response.json({ message: "Missing prompt" }, { status: 400 });
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

  // Consume textStream manually — this keeps the async context alive
  // unlike toTextStreamResponse() which may lose the connection in Next.js.
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async pull(controller) {
      try {
        for await (const chunk of result.textStream) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // If nothing was sent yet, the client sees an empty body.
        // Encode the error as text so useUIStream's catch block picks it up.
        controller.error(new Error(msg));
      }
    },
  });

  return new Response(stream, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
