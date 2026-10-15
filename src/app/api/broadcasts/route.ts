import { z } from "zod";
import { newId, readDb, writeDb } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const AUDIENCE_LABELS: Record<string, string> = {
  london: "London customers",
  manchester: "Manchester customers",
  hot: "Hot leads · UK-wide",
  buyers: "Past buyers · UK-wide",
};

// Sending needs Meta-approved templates, so until that's wired up this page only stores drafts.
const CreateDraftSchema = z.object({
  title: z.string().optional(),
  message: z.string().min(1).max(1024),
  audienceKey: z.string().default("london"),
  action: z.literal("draft"),
});

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await readDb({ lists: ["broadcasts"] });
  return Response.json({ broadcasts: db.broadcasts });
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const parsed = CreateDraftSchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json(
      { error: "Only drafts can be saved: WhatsApp broadcasts need Meta-approved templates before anything is sent." },
      { status: 409 }
    );
  }
  const body = parsed.data;
  const db = await readDb({ lists: ["broadcasts"] });
  const label = AUDIENCE_LABELS[body.audienceKey] ?? "Custom audience";
  const firstLine = body.message.split(/[.!\n]/)[0].slice(0, 48).trim();

  const record = {
    id: newId("B"),
    title: body.title?.trim() || `${firstLine} — ${label}`,
    message: body.message,
    audienceKey: body.audienceKey,
    status: "draft" as const,
    audience: 0,
    sends: "—",
  };
  db.broadcasts.unshift(record);
  await writeDb(db);
  return Response.json({ broadcast: record, broadcasts: db.broadcasts }, { status: 201 });
}
