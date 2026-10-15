import crypto from "crypto";
import { readDb } from "@/lib/store";
import { runCampaignSlice } from "@/lib/campaignSender";

export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  const given = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  return (
    !!secret &&
    given.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected))
  );
}

/** Vercel Cron calls this daily (vercel.json) so capped or abandoned campaigns keep going. */
export async function GET(req: Request) {
  if (!authorized(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const started = Date.now();
  const { campaigns } = await readDb({ lists: ["campaigns"] });
  const results = [];
  for (const c of campaigns.filter(x => x.status === "sending")) {
    const budget = 50_000 - (Date.now() - started);
    if (budget <= 5_000) break;
    const r = await runCampaignSlice(c.id, budget);
    results.push({ id: c.id, sent: r.campaign?.sent, remaining: r.remaining, waiting: !!r.waiting });
  }
  return Response.json({ ran: results });
}
