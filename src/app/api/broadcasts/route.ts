import { z } from "zod";
import { readDb, writeDb, type BroadcastStatus } from "@/lib/store";

export const runtime = "nodejs";

const AUDIENCE_COUNTS: Record<string, { label: string; count: number }> = {
  london: { label: "London customers", count: 1245 },
  manchester: { label: "Manchester customers", count: 892 },
  hot: { label: "Hot leads · UK-wide", count: 48 },
  buyers: { label: "Past buyers · UK-wide", count: 2104 },
};

const CreateBroadcastSchema = z.object({
  title: z.string().optional(),
  message: z.string().min(1).max(1024),
  audienceKey: z.string().default("london"),
  action: z.enum(["draft", "schedule", "send"]),
  scheduleTime: z.string().optional(),
});

const PatchBroadcastSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["draft", "scheduled", "sent"]),
  sends: z.string().optional(),
});

export async function GET() {
  const db = readDb();
  return Response.json({ broadcasts: db.broadcasts });
}

export async function POST(req: Request) {
  try {
    const body = CreateBroadcastSchema.parse(await req.json());
    const db = readDb();
    const aud = AUDIENCE_COUNTS[body.audienceKey] || {
      label: "Custom audience",
      count: 500,
    };

    const nextNum = db.broadcasts.length + 1;
    const id = `B-${String(nextNum).padStart(2, "0")}`;
    const firstLine = body.message.split(/[.!\n]/)[0].slice(0, 48).trim();
    const title = body.title?.trim() || `${firstLine} — ${aud.label}`;

    const now = new Date();
    const timeStr = `${now.toLocaleDateString("en-GB", {
      month: "short",
      day: "2-digit",
    })}, ${now.toTimeString().slice(0, 5)}`;

    const status: BroadcastStatus =
      body.action === "send"
        ? "sent"
        : body.action === "schedule"
        ? "scheduled"
        : "draft";

    const sends =
      body.action === "send"
        ? timeStr
        : body.action === "schedule"
        ? body.scheduleTime || "Tomorrow, 09:00"
        : "—";

    const record = {
      id,
      title,
      message: body.message,
      audienceKey: body.audienceKey,
      status,
      audience: body.action === "draft" ? 0 : aud.count,
      sends,
    };

    db.broadcasts.unshift(record);
    writeDb(db);
    return Response.json({ broadcast: record, broadcasts: db.broadcasts }, { status: 201 });
  } catch (e) {
    return Response.json(
      { error: "Invalid broadcast payload", detail: String(e) },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = PatchBroadcastSchema.parse(await req.json());
    const db = readDb();
    const item = db.broadcasts.find(b => b.id === body.id);
    if (!item) {
      return Response.json({ error: "Broadcast not found" }, { status: 404 });
    }
    item.status = body.status;
    if (body.status === "sent") {
      const now = new Date();
      item.sends = `${now.toLocaleDateString("en-GB", {
        month: "short",
        day: "2-digit",
      })}, ${now.toTimeString().slice(0, 5)}`;
      if (item.audience === 0) item.audience = 1245;
    } else if (body.sends) {
      item.sends = body.sends;
    }
    writeDb(db);
    return Response.json({ broadcast: item, broadcasts: db.broadcasts });
  } catch (e) {
    return Response.json(
      { error: "Invalid broadcast update", detail: String(e) },
      { status: 400 }
    );
  }
}
