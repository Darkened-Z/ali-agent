import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { runCampaignSlice } from "@/lib/campaignSender";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Sends the next slice of a campaign. The admin page keeps calling this while it's open;
 * the daily cron (/api/cron/email) picks up anything left when nobody is watching.
 */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = z.object({ id: z.string() }).parse(await req.json());

  const result = await runCampaignSlice(id, 45_000);
  if (!result.campaign) return Response.json({ error: "Campaign not found" }, { status: 404 });
  return Response.json(result, { status: result.failed ? 502 : 200 });
}
