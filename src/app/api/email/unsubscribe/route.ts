import { verifyUnsubscribeToken } from "@/lib/email";
import { suppress } from "@/lib/emailStore";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

/** RFC 8058 one-click target: Gmail/Yahoo POST here from their own "Unsubscribe" button. */
export async function POST(req: Request) {
  const limited = await rateLimit(req, "unsubscribe", 20, 60);
  if (limited) return limited;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("c") ?? "";
  const token = searchParams.get("t") ?? "";
  if (!id || !verifyUnsubscribeToken(id, token)) {
    return Response.json({ error: "Invalid unsubscribe link" }, { status: 400 });
  }
  await suppress([id], "unsubscribed");
  return Response.json({ unsubscribed: true });
}
