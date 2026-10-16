import crypto from "crypto";
import { after } from "next/server";
import { readDb, recordChatExchange, recordCustomerMessage } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";
import { generateBotReply, type ChatTurn } from "@/lib/bot";
import { alertHandoff } from "@/lib/notify";
import { sendWhatsApp } from "@/lib/whatsapp";

export const runtime = "nodejs";

type Inbound = { phone: string; name: string; city: string; text: string };

/** Meta Cloud API webhook verification handshake. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const expected = process.env.META_WA_VERIFY_TOKEN?.trim();

  if (expected && mode === "subscribe" && token === expected && challenge) {
    return new Response(challenge, { status: 200, headers: { "content-type": "text/plain" } });
  }
  return Response.json({ error: "Verification failed" }, { status: 403 });
}

/**
 * Inbound messages from Meta Cloud API (signed with X-Hub-Signature-256), Twilio
 * (signed with X-Twilio-Signature), or the admin Settings simulator (requires a session).
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(raw);
    if (!verifyTwilio(req, params)) {
      return Response.json({ error: "Invalid signature" }, { status: 403 });
    }
    const phone = (params.get("From") || "").replace(/^whatsapp:/i, "");
    const text = params.get("Body") || "";
    if (!phone || !text.trim()) return twiml();

    const { reply } = await handleInbound(
      { phone, name: params.get("ProfileName") || phone, city: "UK · WhatsApp", text },
      "TWILIO"
    );
    return twiml(reply ?? undefined);
  }

  const metaSignature = req.headers.get("x-hub-signature-256");
  if (metaSignature) {
    if (!verifyMeta(raw, metaSignature)) {
      return Response.json({ error: "Invalid signature" }, { status: 403 });
    }
    const value = JSON.parse(raw)?.entry?.[0]?.changes?.[0]?.value;
    const msg = value?.messages?.[0];
    // Delivery/read status callbacks carry no message; acknowledge so Meta doesn't retry.
    if (!msg?.text?.body) return Response.json({ status: "ignored" });

    const phone = `+${String(msg.from).replace(/^\+/, "")}`;
    const result = await handleInbound(
      {
        phone,
        name: value.contacts?.[0]?.profile?.name || phone,
        city: "UK · WhatsApp",
        text: msg.text.body,
      },
      "WA CLOUD"
    );
    const sent = result.reply ? (await sendWhatsApp(phone, result.reply)).ok : false;
    return Response.json({ status: "processed", conversationId: result.conversationId, sent });
  }

  const denied = await requireAdmin();
  if (denied) return denied;

  let body: Partial<Inbound>;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.text?.trim()) {
    return Response.json({ status: "ignored", reason: "Empty message text" });
  }
  const result = await handleInbound(
    {
      phone: body.phone || "+44 7700 900412",
      name: body.name || "WhatsApp Customer",
      city: body.city || "UK · WhatsApp",
      text: body.text,
    },
    "SIMULATOR"
  );
  return Response.json({ status: "processed", ...result });
}

/** Returns the bot's reply, or null when a person has the thread and the bot should stay quiet. */
async function handleInbound(msg: Inbound, channelLabel: string) {
  const sessionId = `wa-${msg.phone.replace(/[^0-9]/g, "").slice(-10)}`;
  const db = await readDb({
    lists: ["kbArticles", "conversations"],
    ids: { conversations: [sessionId] },
  });
  const thread = db.conversations.find(c => c.id === sessionId);

  if (thread && (thread.status === "human" || thread.status === "waiting")) {
    const conv = await recordCustomerMessage({
      sessionId,
      channel: "wa",
      userName: msg.name,
      phone: msg.phone,
      city: msg.city,
      text: msg.text,
    });
    return { conversationId: conv.id, reply: null, escalated: false };
  }

  const history: ChatTurn[] = (thread?.messages ?? [])
    .slice(-20)
    .map(m => ({ role: m.from === "client" ? "user" : "assistant", content: m.text }));
  const reply = await generateBotReply({
    db,
    turns: [...history, { role: "user", content: msg.text }],
  });

  const conv = await recordChatExchange({
    sessionId,
    channel: "wa",
    userName: msg.name,
    phone: msg.phone,
    city: msg.city,
    userText: msg.text,
    botText: reply.text,
    meta: `${reply.label} · ${channelLabel}`,
    escalated: reply.escalated,
    escalationReason: reply.escalationReason,
    priceCard: reply.priceCard,
  });
  if (reply.escalated) {
    after(() => alertHandoff(db.settings, conv, reply.escalationReason ?? "Escalated", msg.text));
  }
  return { conversationId: conv.id, reply: reply.text, escalated: reply.escalated };
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

function verifyMeta(raw: string, header: string): boolean {
  const secret = process.env.META_APP_SECRET?.trim();
  if (!secret) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");
  return safeEqual(expected, header);
}

// https://www.twilio.com/docs/usage/webhooks/webhooks-security
function verifyTwilio(req: Request, params: URLSearchParams): boolean {
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const header = req.headers.get("x-twilio-signature");
  if (!token || !header) return false;

  // Behind Vercel's proxy req.url can differ from the URL Twilio signed, so prefer the configured public origin.
  const reqUrl = new URL(req.url);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const url = appUrl ? new URL(reqUrl.pathname + reqUrl.search, appUrl).toString() : req.url;

  const payload = [...params.keys()]
    .filter((k, i, all) => all.indexOf(k) === i)
    .sort()
    .reduce((acc, key) => acc + params.getAll(key).map(v => key + v).join(""), url);
  const expected = crypto.createHmac("sha1", token).update(payload).digest("base64");
  return safeEqual(expected, header);
}

function twiml(reply?: string) {
  const escaped = reply
    ?.replace(/\*\*/g, "*")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const body = escaped ? `<Message>${escaped}</Message>` : "";
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`, {
    headers: { "content-type": "text/xml" },
  });
}
