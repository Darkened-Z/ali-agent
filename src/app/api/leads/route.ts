import { after } from "next/server";
import { z } from "zod";
import { alertNewLead } from "@/lib/notify";
import { rateLimit } from "@/lib/rateLimit";
import { addLeadToDb, readDb, writeDb, type LeadStatus } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const CreateLeadSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(5).max(40),
  city: z.string().min(1).max(100),
  need: z.string().optional(),
  interest: z.string().optional(),
  network: z.string().optional(),
  time: z.string().optional(),
  source: z.string().optional(),
});

const PatchLeadSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["hot", "warm", "cold", "won", "lost"]).optional(),
  score: z.number().min(0).max(100).optional(),
  interest: z.string().optional(),
});

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await readDb();
  return Response.json({ leads: db.leads });
}

export async function POST(req: Request) {
  const limited = await rateLimit(req, "lead", 5, 600);
  if (limited) return limited;
  try {
    const body = CreateLeadSchema.parse(await req.json());
    const lead = await addLeadToDb(body);
    const { settings } = await readDb({ lists: [] });
    after(() => alertNewLead(settings, lead));

    return Response.json({ lead }, { status: 201 });
  } catch (e) {
    return Response.json(
      { error: "Invalid lead data", detail: String(e) },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = PatchLeadSchema.parse(await req.json());
    const db = await readDb();
    const target = db.leads.find(l => l.id === body.id);
    if (!target) {
      return Response.json({ error: "Lead not found" }, { status: 404 });
    }
    if (body.status) target.status = body.status as LeadStatus;
    if (body.score !== undefined) target.score = body.score;
    if (body.interest) target.interest = body.interest;
    target.updated = new Date().toTimeString().slice(0, 5);
    await writeDb(db);

    return Response.json({ lead: target });
  } catch (e) {
    return Response.json(
      { error: "Invalid update payload", detail: String(e) },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("all") === "true";

    const db = await readDb();
    if (clearAll) {
      db.leads = [];
    } else if (id) {
      db.leads = db.leads.filter(l => l.id !== id);
    } else {
      return Response.json({ error: "Missing id or all parameter" }, { status: 400 });
    }
    await writeDb(db);

    return Response.json({ success: true, count: db.leads.length });
  } catch (e) {
    return Response.json({ error: "Delete failed", detail: String(e) }, { status: 500 });
  }
}

