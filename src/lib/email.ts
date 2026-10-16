import crypto from "crypto";

const RESEND_API = "https://api.resend.com";
export const BATCH_SIZE = 100;

export type OutgoingEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  unsubscribeUrl?: string;
  replyTo?: string;
};

export function contactId(email: string): string {
  return "E-" + crypto.createHash("sha1").update(email.trim().toLowerCase()).digest("hex").slice(0, 16);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@<>()",;]+@[^\s@<>()",;]+\.[a-z]{2,}$/i.test(email);
}

function unsubscribeSecret(): string {
  const secret = process.env.UNSUBSCRIBE_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") throw new Error("UNSUBSCRIBE_SECRET is not set");
  return "dev-unsubscribe-secret";
}

export function unsubscribeToken(id: string): string {
  return crypto.createHmac("sha256", unsubscribeSecret()).update(id).digest("hex").slice(0, 32);
}

export function verifyUnsubscribeToken(id: string, token: string): boolean {
  const expected = Buffer.from(unsubscribeToken(id));
  const given = Buffer.from(token);
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}

export function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000").replace(/\/$/, "");
}

export function unsubscribeLinks(id: string) {
  const qs = `c=${encodeURIComponent(id)}&t=${unsubscribeToken(id)}`;
  return {
    page: `${appUrl()}/unsubscribe?${qs}`,
    oneClick: `${appUrl()}/api/email/unsubscribe?${qs}`,
  };
}

function resendConfig() {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!key || !from) throw new Error("Set RESEND_API_KEY and EMAIL_FROM to send email");
  return { key, from };
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());
}

export class ResendError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

/** Resend's batch endpoint; the idempotency key makes a retried batch a no-op instead of a double send. */
export async function sendBatch(emails: OutgoingEmail[], idempotencyKey: string): Promise<void> {
  const { key, from } = resendConfig();
  const res = await fetch(`${RESEND_API}/emails/batch`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(
      emails.map(e => ({
        from,
        to: [e.to],
        subject: e.subject,
        html: e.html,
        text: e.text,
        ...(e.replyTo ? { reply_to: e.replyTo } : {}),
        ...(e.unsubscribeUrl
          ? {
              headers: {
                "List-Unsubscribe": `<${e.unsubscribeUrl}>`,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
              },
            }
          : {}),
      }))
    ),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new ResendError(`Resend ${res.status}: ${detail.slice(0, 300)}`, res.status);
  }
}

// https://docs.svix.com/receiving/verifying-payloads/how-manual
export function verifyResendWebhook(raw: string, headers: Headers): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signatures = headers.get("svix-signature");
  if (!secret || !id || !timestamp || !signatures) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = crypto
    .createHmac("sha256", key)
    .update(`${id}.${timestamp}.${raw}`)
    .digest("base64");
  return signatures.split(" ").some(sig => {
    const value = sig.split(",")[1] ?? "";
    return (
      value.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(value), Buffer.from(expected))
    );
  });
}
