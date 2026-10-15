import { z } from "zod";
import { getDashboardStats, readDb, writeDb, updatePromptHash } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const UpdateBotSchema = z.object({
  botEnabled: z.boolean().optional(),
  prompt: z.string().min(10).optional(),
  model: z.enum(["haiku", "sonnet", "opus"]).optional(),
  temperature: z.number().min(0).max(1).optional(),
  maxTokens: z.number().min(64).max(4096).optional(),
  escalateOn: z
    .object({
      discount: z.boolean(),
      complaint: z.boolean(),
      human: z.boolean(),
      longConv: z.boolean(),
      payment: z.boolean().optional(),
    })
    .optional(),
});

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await readDb();
  return Response.json({
    botConfig: db.botConfig,
    repliesToday: getDashboardStats(db).handledToday,
  });
}

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = UpdateBotSchema.parse(await req.json());
    const db = await readDb();
    const cfg = db.botConfig;

    if (body.botEnabled !== undefined) cfg.botEnabled = body.botEnabled;
    if (body.prompt !== undefined) cfg.prompt = body.prompt;
    if (body.model !== undefined) cfg.model = body.model;
    if (body.temperature !== undefined) cfg.temperature = body.temperature;
    if (body.maxTokens !== undefined) cfg.maxTokens = body.maxTokens;
    if (body.escalateOn !== undefined) cfg.escalateOn = body.escalateOn;

    const now = new Date();
    const formattedTime = `${now.toLocaleDateString("en-GB", {
      month: "short",
      day: "2-digit",
    })}, ${now.toTimeString().slice(0, 5)}`;

    cfg.hash = updatePromptHash(
      `${cfg.prompt}:${cfg.model}:${cfg.temperature}:${cfg.maxTokens}`
    );
    cfg.updatedAt = formattedTime;

    if (body.prompt !== undefined) {
      cfg.history = [
        {
          hash: cfg.hash,
          prompt: cfg.prompt,
          model: cfg.model,
          temperature: cfg.temperature,
          maxTokens: cfg.maxTokens,
          savedAt: formattedTime,
        },
        ...(cfg.history || []).filter(h => h.hash !== cfg.hash).slice(0, 9),
      ];
    }

    await writeDb(db);
    return Response.json({ botConfig: cfg });
  } catch (e) {
    return Response.json(
      { error: "Invalid bot config", detail: String(e) },
      { status: 400 }
    );
  }
}
