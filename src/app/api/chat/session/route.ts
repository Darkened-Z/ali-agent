import { readDb } from "@/lib/store";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const SESSION_RE = /^web-[0-9a-f-]{36}$/i;

/**
 * The widget polls this for its own thread: restores history after a reload and picks up
 * replies typed by staff in the admin inbox. The session id is a random UUID only the widget holds.
 */
export async function GET(req: Request) {
  const limited = await rateLimit(req, "chat-poll", 60, 60);
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") ?? "";
  const after = Math.max(0, Number(searchParams.get("after")) || 0);
  if (!SESSION_RE.test(id)) return Response.json({ error: "Invalid session" }, { status: 400 });

  const db = await readDb({ lists: ["conversations"], ids: { conversations: [id] } });
  const conv = db.conversations.find(c => c.id === id);
  const all = conv?.messages ?? [];
  return Response.json(
    {
      total: all.length,
      status: conv?.status ?? "bot",
      messages: all.slice(after).map(m => ({
        from: m.from,
        text: m.text,
        time: m.time,
        priceCard: m.priceCard,
      })),
    },
    { headers: { "cache-control": "no-store" } }
  );
}
