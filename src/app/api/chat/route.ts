import { after } from "next/server";
import { z } from "zod";
import { readDb, recordChatExchange, recordCustomerMessage } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";
import { generateBotReply } from "@/lib/bot";
import { alertHandoff } from "@/lib/notify";
import { rateLimit } from "@/lib/rateLimit";
import { hoursStatus } from "@/lib/hours";

export const runtime = "nodejs";

const SESSION_RE = /^web-[0-9a-f-]{36}$/i;

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

function sse(handler: (send: (event: string, data: unknown) => void) => Promise<void>) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) =>
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      try {
        await handler(send);
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

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (e) {
    return Response.json({ error: "Invalid request body", detail: String(e) }, { status: 400 });
  }

  const isPreview = body.previewPrompt !== undefined || body.skipRecord !== undefined;
  if (isPreview) {
    const denied = await requireAdmin();
    if (denied) return denied;
  } else {
    const limited = await rateLimit(req, "chat", 20, 60);
    if (limited) return limited;
  }

  // Client-supplied, so only accept the widget's own UUID format; anything else gets a fresh session.
  const sessionId =
    body.sessionId && SESSION_RE.test(body.sessionId) ? body.sessionId : `web-${crypto.randomUUID()}`;
  const lastUserMsg = [...body.messages].reverse().find(m => m.role === "user")?.content ?? "";

  const db = await readDb({
    lists: ["kbArticles", "conversations"],
    ids: { conversations: [sessionId] },
  });
  const thread = db.conversations.find(c => c.id === sessionId);

  // A person has this thread: log the message, keep the bot quiet, let the widget poll for the reply.
  if (!isPreview && thread && (thread.status === "human" || thread.status === "waiting")) {
    await recordCustomerMessage({ sessionId, channel: "web", text: lastUserMsg });
    const h = hoursStatus(db.settings);
    return sse(async send => {
      send("done", {
        handoff: true,
        sessionId,
        notice: h.open
          ? "An advisor has this chat and will reply here."
          : `An advisor will reply here ${h.nextOpen ?? "when we reopen"}.`,
      });
    });
  }

  return sse(async send => {
    const started = Date.now();
    const reply = await generateBotReply({
      db,
      turns: body.messages,
      previewPrompt: body.previewPrompt,
      onToken: text => send("token", { text }),
    });
    const elapsed = Date.now() - started;
    const meta = `${reply.label} · ${elapsed}ms`;

    if (!isPreview && lastUserMsg && reply.text) {
      const conv = await recordChatExchange({
        sessionId,
        channel: "web",
        userText: lastUserMsg,
        botText: reply.text,
        meta,
        escalated: reply.escalated,
        escalationReason: reply.escalationReason,
        priceCard: reply.priceCard,
      });
      if (reply.escalated) {
        after(() => alertHandoff(db.settings, conv, reply.escalationReason ?? "Escalated", lastUserMsg));
      }
    }

    send("done", {
      sessionId,
      model: reply.model,
      meta,
      latencyMs: elapsed,
      escalated: reply.escalated,
      priceCard: reply.priceCard,
      warning: reply.warning,
    });
  });
}
