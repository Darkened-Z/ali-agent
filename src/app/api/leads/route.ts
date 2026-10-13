import { z } from "zod";
import { addLeadToDb, readDb, writeDb, type LeadStatus } from "@/lib/store";
import { getSupabaseAdmin } from "@/lib/supabase";

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
  const db = readDb();
  return Response.json({ leads: db.leads });
}

export async function POST(req: Request) {
  try {
    const body = CreateLeadSchema.parse(await req.json());
    const lead = addLeadToDb(body);

    const sb = getSupabaseAdmin();
    if (sb) {
      await sb.from("leads").upsert({
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        city: lead.city,
        interest: lead.interest,
        network: lead.network ?? "any",
        best_time: lead.bestTime ?? "any",
        source: lead.source,
        score: lead.score,
        status: lead.status,
        updated: lead.updated,
      });
    }

    return Response.json({ lead }, { status: 201 });
  } catch (e) {
    return Response.json(
      { error: "Invalid lead data", detail: String(e) },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = PatchLeadSchema.parse(await req.json());
    const db = readDb();
    const target = db.leads.find(l => l.id === body.id);
    if (!target) {
      return Response.json({ error: "Lead not found" }, { status: 404 });
    }
    if (body.status) target.status = body.status as LeadStatus;
    if (body.score !== undefined) target.score = body.score;
    if (body.interest) target.interest = body.interest;
    target.updated = new Date().toTimeString().slice(0, 5);
    writeDb(db);

    const sb = getSupabaseAdmin();
    if (sb) {
      await sb
        .from("leads")
        .update({
          status: target.status,
          score: target.score,
          interest: target.interest,
          updated: target.updated,
        })
        .eq("id", target.id);
    }

    return Response.json({ lead: target });
  } catch (e) {
    return Response.json(
      { error: "Invalid update payload", detail: String(e) },
      { status: 400 }
    );
  }
}
