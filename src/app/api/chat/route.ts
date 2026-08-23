import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { DEFAULT_BOT_PROMPT } from "@/lib/mockData";
import { PLAN_CATALOGUE } from "@/lib/planContext";

export const runtime = "nodejs";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 512;

const Body = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      })
    )
    .min(1)
    .max(30),
});

const SYSTEM = `${DEFAULT_BOT_PROMPT}

--- PLAN CATALOGUE (authoritative source; only quote from this list) ---

${PLAN_CATALOGUE}

--- END CATALOGUE ---

RULES:
- Every price, upfront, data allowance, and network you quote MUST come from the catalogue above.
- If a shopper asks for something not in the catalogue, say so and offer the closest match rather than inventing figures.
- Always disclose the April 2027 / April 2028 price rise if the tariff has one — that's Ofcom-mandated.`;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY not set in .env.local" },
      { status: 503 }
    );
  }

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (e) {
    return Response.json({ error: "Invalid request body", detail: String(e) }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const started = Date.now();
        const s = await client.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: SYSTEM,
          messages: body.messages,
        });

        for await (const event of s) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            send("token", { text: event.delta.text });
          }
        }
        const final = await s.finalMessage();
        const elapsed = Date.now() - started;
        send("done", {
          model: MODEL,
          latencyMs: elapsed,
          usage: final.usage,
          stopReason: final.stop_reason,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        send("error", { message: msg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    },
  });
}
