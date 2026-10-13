import {
  readDb,
  generateCatalogueReply,
  recordChatExchange,
} from "@/lib/store";

export const runtime = "nodejs";

/**
 * Meta Cloud API Webhook Verification (GET)
 * Example: /api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=ali_agent_verify_a3f9b2&hub.challenge=12345
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const db = readDb();
  const expectedToken =
    process.env.META_WA_VERIFY_TOKEN?.trim() ||
    db.settings.whatsapp.verifyToken ||
    "ali_agent_verify_a3f9b2";

  if (mode === "subscribe" && token === expectedToken) {
    return new Response(challenge || "OK", {
      status: 200,
      headers: { "content-type": "text/plain" },
    });
  }

  return Response.json(
    {
      status: "ready",
      webhook: "Ali Agent WhatsApp Webhook (Meta Cloud API & Twilio)",
      verified: mode === "subscribe" ? false : undefined,
    },
    { status: mode ? 403 : 200 }
  );
}

/**
 * Inbound WhatsApp Message Handler (POST)
 * Supports:
 * 1. Meta Cloud API JSON payload (`entry[0].changes[0].value.messages[0]`)
 * 2. Twilio WhatsApp Webhook (`From`, `Body`, `ProfileName`)
 * 3. Direct Simulator JSON (`{ phone, name, city, text }`) from Settings / Admin
 */
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let phone = "+44 7700 900412";
    let name = "WhatsApp Customer";
    let city = "UK · WhatsApp";
    let text = "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      // Twilio webhook format
      const form = await req.formData();
      phone = String(form.get("From") || phone).replace(/^whatsapp:/i, "");
      name = String(form.get("ProfileName") || phone);
      text = String(form.get("Body") || "");
    } else {
      const body = await req.json();

      // Meta Cloud API format
      const metaValue = body?.entry?.[0]?.changes?.[0]?.value;
      if (metaValue?.messages?.[0]) {
        const msg = metaValue.messages[0];
        const contact = metaValue.contacts?.[0];
        phone = msg.from ? `+${String(msg.from).replace(/^\+/, "")}` : phone;
        name = contact?.profile?.name || phone;
        text = msg.text?.body || "";
      } else {
        // Direct / Simulator JSON format
        phone = body.phone || phone;
        name = body.name || name;
        city = body.city || city;
        text = body.text || "";
      }
    }

    if (!text.trim()) {
      return Response.json({ status: "ignored", reason: "Empty message text" });
    }

    const db = readDb();
    const sessionId = `wa-${phone.replace(/[^0-9]/g, "").slice(-10) || Date.now()}`;
    const smart = generateCatalogueReply(text, db, 1);

    // Optional: If real Meta Cloud API credentials are set in env, dispatch outbound message
    const metaToken = process.env.META_WA_ACCESS_TOKEN?.trim();
    const metaPhoneId = process.env.META_WA_PHONE_NUMBER_ID?.trim();
    let outboundSent = false;

    if (metaToken && metaPhoneId && !phone.includes("900412")) {
      try {
        const waRes = await fetch(
          `https://graph.facebook.com/v20.0/${metaPhoneId}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${metaToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: phone.replace(/[^0-9]/g, ""),
              type: "text",
              text: { body: smart.reply.replace(/\*\*/g, "*") },
            }),
          }
        );
        outboundSent = waRes.ok;
      } catch {
        outboundSent = false;
      }
    }

    const conv = recordChatExchange({
      sessionId,
      channel: "wa",
      userName: name,
      phone,
      city,
      userText: text,
      botText: smart.reply,
      meta: outboundSent ? "WA CLOUD API · SENT" : "CLAUDE HAIKU · WA",
      escalated: smart.escalated,
      escalationReason: smart.escalationReason,
      priceCard: smart.priceCard,
    });

    return Response.json({
      status: "processed",
      conversationId: conv.id,
      reply: smart.reply,
      escalated: smart.escalated,
      outboundSent,
    });
  } catch (e) {
    return Response.json(
      { error: "Webhook processing failed", detail: String(e) },
      { status: 400 }
    );
  }
}
