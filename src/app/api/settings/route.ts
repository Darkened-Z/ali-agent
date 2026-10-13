import { readDb, writeDb, type AppSettings } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const db = readDb();
  return Response.json({ settings: db.settings });
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as Partial<AppSettings>;
    const db = readDb();
    db.settings = {
      ...db.settings,
      ...body,
      general: { ...db.settings.general, ...(body.general ?? {}) },
      hours: { ...db.settings.hours, ...(body.hours ?? {}) },
      whatsapp: { ...db.settings.whatsapp, ...(body.whatsapp ?? {}) },
      escalation: { ...db.settings.escalation, ...(body.escalation ?? {}) },
      billing: { ...db.settings.billing, ...(body.billing ?? {}) },
    };
    writeDb(db);
    return Response.json({ settings: db.settings });
  } catch (e) {
    return Response.json(
      { error: "Failed to save settings", detail: String(e) },
      { status: 400 }
    );
  }
}
