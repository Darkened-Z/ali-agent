import { z } from "zod";
import { readDb, writeDb, updatePromptHash } from "@/lib/store";

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
    })
    .optional(),
});

export async function GET() {
  const db = readDb();
  return Response.json({
    botConfig: db.botConfig,
    repliesToday: 40 + db.conversations.length,
  });
}

export async function PUT(req: Request) {
  try {
    const body = UpdateBotSchema.parse(await req.json());
    const db = readDb();
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

    writeDb(db);
    return Response.json({ botConfig: cfg });
  } catch (e) {
    return Response.json(
      { error: "Invalid bot config", detail: String(e) },
      { status: 400 }
    );
  }
}
