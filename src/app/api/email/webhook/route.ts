import { contactId, verifyResendWebhook } from "@/lib/email";
import { markEngaged, suppress } from "@/lib/emailStore";

export const runtime = "nodejs";

/** Resend events: hard bounces and spam complaints are suppressed so the domain's reputation survives. */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyResendWebhook(raw, req.headers)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(raw) as { type?: string; data?: { to?: string[] } };
  const ids = (event.data?.to ?? []).map(contactId);

  if (event.type === "email.opened" || event.type === "email.clicked") {
    return Response.json({ status: "engaged", changed: await markEngaged(ids) });
  }
  const status =
    event.type === "email.bounced"
      ? "bounced"
      : event.type === "email.complained"
      ? "complained"
      : null;
  if (!status) return Response.json({ status: "ignored" });

  const changed = await suppress(ids, status);
  return Response.json({ status, changed });
}
