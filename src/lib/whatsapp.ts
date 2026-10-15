export type SendResult = { ok: true } | { ok: false; error: string };

export function whatsappProvider(): "meta" | "twilio" | null {
  if (process.env.META_WA_ACCESS_TOKEN?.trim() && process.env.META_WA_PHONE_NUMBER_ID?.trim()) return "meta";
  if (
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
    process.env.TWILIO_AUTH_TOKEN?.trim() &&
    process.env.TWILIO_WHATSAPP_NUMBER?.trim()
  ) {
    return "twilio";
  }
  return null;
}

const digits = (phone: string) => phone.replace(/[^0-9]/g, "");
// WhatsApp uses *single* asterisks for bold.
const toWhatsAppMarkup = (text: string) => text.replace(/\*\*/g, "*");

// Meta error 131047: more than 24h since the customer's last message; only approved templates are allowed.
const OUTSIDE_WINDOW = new Set([131047, 131026]);

async function sendMeta(to: string, text: string): Promise<SendResult> {
  const res = await fetch(
    `https://graph.facebook.com/v20.0/${process.env.META_WA_PHONE_NUMBER_ID!.trim()}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.META_WA_ACCESS_TOKEN!.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: digits(to),
        type: "text",
        text: { body: toWhatsAppMarkup(text) },
      }),
    }
  );
  if (res.ok) return { ok: true };
  const body = await res.json().catch(() => ({}));
  const code = body?.error?.code;
  if (OUTSIDE_WINDOW.has(code)) {
    return { ok: false, error: "Not delivered: it's been over 24h since the customer's last message, so WhatsApp only allows approved templates." };
  }
  return { ok: false, error: `Not delivered: ${body?.error?.message ?? `WhatsApp API ${res.status}`}` };
}

async function sendTwilio(to: string, text: string): Promise<SendResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID!.trim();
  const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN!.trim()}`).toString("base64");
  const from = process.env.TWILIO_WHATSAPP_NUMBER!.trim().replace(/^whatsapp:/i, "");
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      From: `whatsapp:${from}`,
      To: `whatsapp:+${digits(to)}`,
      Body: toWhatsAppMarkup(text),
    }),
  });
  if (res.ok) return { ok: true };
  const body = await res.json().catch(() => ({}));
  if (body?.code === 63016) {
    return { ok: false, error: "Not delivered: outside WhatsApp's 24h reply window — only approved templates are allowed." };
  }
  return { ok: false, error: `Not delivered: ${body?.message ?? `Twilio ${res.status}`}` };
}

export async function sendWhatsApp(to: string, text: string): Promise<SendResult> {
  const provider = whatsappProvider();
  if (!provider) return { ok: false, error: "Not delivered: WhatsApp isn't connected (set the Meta or Twilio env vars)." };
  try {
    return provider === "meta" ? await sendMeta(to, text) : await sendTwilio(to, text);
  } catch (e) {
    return { ok: false, error: `Not delivered: ${e instanceof Error ? e.message : String(e)}` };
  }
}
