import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { PLAN_CATALOGUE } from "@/lib/planContext";
import {
  readDb,
  generateCatalogueReply,
  recordChatExchange,
} from "@/lib/store";

export const runtime = "nodejs";

const MODEL_MAP: Record<string, string> = {
  haiku: "claude-haiku-4-5-20251001",
  sonnet: "claude-sonnet-4-5-20250929",
  opus: "claude-opus-4-1-20250805",
};

const Body = z.object({
  sessionId: z.string().optional(),
  previewPrompt: z.string().optional(),
  skipRecord: z.boolean().optional(),
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

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (e) {
    return Response.json(
      { error: "Invalid request body", detail: String(e) },
      { status: 400 }
    );
  }

  const db = readDb();
  const { botConfig, kbArticles } = db;
  const activePrompt = body.previewPrompt?.trim() || botConfig.prompt;
  const modelId = MODEL_MAP[botConfig.model] || MODEL_MAP.haiku;
  const maxTokens = botConfig.maxTokens || 512;
  const temperature = botConfig.temperature ?? 0.4;

  const kbContext = kbArticles
    .map(k => `- [${k.category}] ${k.title}: ${k.content || ""}`)
    .join("\n");

  const systemPrompt = `${activePrompt}

--- KNOWLEDGE BASE ARTICLES ---
${kbContext}

--- PLAN CATALOGUE (authoritative source; only quote from this list) ---

${PLAN_CATALOGUE}

--- END CATALOGUE ---

RULES:
- Every price, upfront, data allowance, and network you quote MUST come from the catalogue above.
- If a shopper asks for something not in the catalogue, say so and offer the closest match rather than inventing figures.
- Always disclose the April 2027 / April 2028 price rise if the tariff has one — that's Ofcom-mandated.`;

  const lastUserMsg =
    [...body.messages].reverse().find(m => m.role === "user")?.content || "";
  const sessionId = body.sessionId || `web-${Date.now()}`;

  // Pre-compute smart catalogue/KB match & escalation check
  const smart = generateCatalogueReply(
    lastUserMsg,
    db,
    body.messages.length
  );

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      const started = Date.now();
      let finalReply = "";
      let usedLabel = `CLAUDE ${botConfig.model.toUpperCase()}`;

      try {
        // If bot is globally paused or escalation triggered immediately, use smart escalation response
        if (!botConfig.botEnabled) {
          finalReply =
            "Our automated assistant is currently paused — I've queued your message for a human advisor who will reply shortly.";
          usedLabel = "QUEUED · HUMAN";
          for (const word of finalReply.split(/(?=\s)/)) {
            send("token", { text: word });
            await new Promise(r => setTimeout(r, 14));
          }
        } else if (apiKey && !smart.escalated) {
          const client = new Anthropic({ apiKey });
          const s = await client.messages.stream({
            model: modelId,
            max_tokens: maxTokens,
            temperature,
            system: systemPrompt,
            messages: body.messages,
          });

          for await (const event of s) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              finalReply += event.delta.text;
              send("token", { text: event.delta.text });
            }
          }
          await s.finalMessage();
        } else {
          // Stream the catalogue + KB grounded reply token-by-token
          finalReply = smart.reply;
          usedLabel = smart.escalated
            ? "ESCALATED · HUMAN"
            : `CATALOGUE AI · ${botConfig.model.toUpperCase()}`;
          const chunks = finalReply.split(/(?=\s)/);
          for (const chunk of chunks) {
            send("token", { text: chunk });
            await new Promise(r => setTimeout(r, 16));
          }
        }

        const elapsed = Date.now() - started;
        const metaLabel = `${usedLabel} · ${elapsed}ms`;

        if (!body.skipRecord && lastUserMsg && finalReply) {
          recordChatExchange({
            sessionId,
            channel: "web",
            userText: lastUserMsg,
            botText: finalReply,
            meta: metaLabel,
            escalated: smart.escalated || !botConfig.botEnabled,
            escalationReason: smart.escalationReason,
            priceCard: smart.priceCard,
          });
        }

        send("done", {
          model: modelId,
          meta: metaLabel,
          latencyMs: elapsed,
          escalated: smart.escalated,
          priceCard: smart.priceCard,
          stopReason: "end_turn",
        });
      } catch (err) {
        // Graceful fallback to smart catalogue reply if Anthropic key is invalid/expired
        finalReply = smart.reply;
        const elapsed = Date.now() - started;
        const metaLabel = `CATALOGUE AI · ${elapsed}ms`;
        send("token", { text: finalReply });
        if (!body.skipRecord && lastUserMsg && finalReply) {
          recordChatExchange({
            sessionId,
            channel: "web",
            userText: lastUserMsg,
            botText: finalReply,
            meta: metaLabel,
            escalated: smart.escalated,
            escalationReason: smart.escalationReason,
            priceCard: smart.priceCard,
          });
        }
        send("done", {
          model: modelId,
          meta: metaLabel,
          latencyMs: elapsed,
          escalated: smart.escalated,
          priceCard: smart.priceCard,
          stopReason: "fallback",
          warning: err instanceof Error ? err.message : String(err),
        });
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
