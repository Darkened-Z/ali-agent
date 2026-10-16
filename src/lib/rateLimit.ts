import { getSupabaseAdmin } from "./supabase";

// Local dev only; serverless instances don't share memory, which is why production uses Supabase.
const memory = new Map<string, { start: number; hits: number }>();

function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export async function hit(key: string, max: number, windowSeconds: number): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb.rpc("hit_rate_limit", {
      p_key: key,
      p_window_seconds: windowSeconds,
      p_max: max,
    });
    if (error) {
      // Fail open: a missing migration shouldn't take the shop's chat offline.
      console.error("rate limit check failed", error.message);
      return true;
    }
    return data === true;
  }
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || now - entry.start > windowSeconds * 1000) {
    memory.set(key, { start: now, hits: 1 });
    return true;
  }
  entry.hits += 1;
  return entry.hits <= max;
}

/** Returns a 429 response when the caller is over the limit, otherwise null. */
export async function rateLimit(
  req: Request,
  name: string,
  max: number,
  windowSeconds: number
): Promise<Response | null> {
  const allowed = await hit(`${name}:${clientIp(req)}`, max, windowSeconds);
  if (allowed) return null;
  return Response.json(
    { error: "Too many requests — please wait a moment and try again." },
    { status: 429, headers: { "retry-after": String(windowSeconds) } }
  );
}
