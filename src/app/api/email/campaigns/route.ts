import crypto from "crypto";
import { z } from "zod";
import { newId, readDb, writeDb, type CampaignRecord } from "@/lib/store";
import { getAdmin, requireAdmin } from "@/lib/auth";
import { isValidEmail, sendBatch, unsubscribeLinks } from "@/lib/email";
import { isSafeUrl, renderEmail } from "@/lib/emailTemplate";
import { audienceOf } from "@/lib/emailStore";

export const runtime = "nodejs";

const Content = z.object({
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(20000),
  ctaLabel: z.string().trim().max(60).optional(),
  ctaUrl: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .refine(u => !u || isSafeUrl(u), "Button link must be a full https:// URL"),
});

const PostSchema = z.discriminatedUnion("action", [
  Content.extend({ action: z.literal("test"), to: z.string().optional() }),
  Content.extend({
    action: z.literal("create"),
    list: z.string().min(1),
    dailyLimit: z.number().int().min(10).max(100000).optional(),
  }),
]);

const PatchSchema = z.object({ id: z.string(), action: z.enum(["pause", "resume"]) });

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await readDb({ lists: ["campaigns"] });
  return Response.json({ campaigns: db.campaigns });
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = PostSchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid campaign" }, { status: 400 });
  }
  const body = parsed.data;

  if (body.action === "test") {
    const to = (body.to?.trim() || admin.email).toLowerCase();
    if (!isValidEmail(to)) return Response.json({ error: "Enter an email for the test send" }, { status: 400 });
    const db = await readDb({ lists: [] });
    const links = unsubscribeLinks("test");
    const email = renderEmail(body, { name: "Test Recipient", email: to }, db.settings.general, links.page);
    try {
      await sendBatch(
        [{ to, ...email, subject: `[TEST] ${email.subject}`, unsubscribeUrl: links.oneClick }],
        `test-${crypto.randomUUID()}`
      );
    } catch (e) {
      return Response.json({ error: String(e instanceof Error ? e.message : e) }, { status: 502 });
    }
    return Response.json({ sentTo: to });
  }

  const db = await readDb({ lists: ["campaigns", "contacts"] });
  const total = audienceOf(db.contacts, body.list).length;
  if (total === 0) {
    return Response.json({ error: "No subscribed contacts in that list" }, { status: 400 });
  }

  const campaign: CampaignRecord = {
    id: newId("EM"),
    subject: body.subject,
    body: body.body,
    ctaLabel: body.ctaLabel || undefined,
    ctaUrl: body.ctaUrl || undefined,
    list: body.list,
    dailyLimit: body.dailyLimit,
    status: "sending",
    total,
    sent: 0,
    cursor: "",
    createdAt: new Date().toISOString(),
    createdBy: admin.email,
  };
  db.campaigns.unshift(campaign);
  await writeDb(db);
  return Response.json({ campaign }, { status: 201 });
}

export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = PatchSchema.parse(await req.json());
  const db = await readDb({ lists: ["campaigns"], ids: { campaigns: [body.id] } });
  const campaign = db.campaigns.find(c => c.id === body.id);
  if (!campaign) return Response.json({ error: "Campaign not found" }, { status: 404 });
  if (campaign.status === "sent") return Response.json({ campaign });

  campaign.status = body.action === "pause" ? "paused" : "sending";
  if (body.action === "resume") campaign.lastError = undefined;
  await writeDb(db);
  return Response.json({ campaign });
}
