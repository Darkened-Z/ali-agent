import { z } from "zod";
import { newId, readDb, writeDb } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const InviteMemberSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.string().default("Agent"),
});

const PatchMemberSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  role: z.string().optional(),
  email: z.string().email().optional(),
});

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await readDb();
  return Response.json({ team: db.team });
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = InviteMemberSchema.parse(await req.json());
    const db = await readDb();
    const id = newId("T");

    const member = {
      id,
      name: body.name.trim(),
      role: body.role.trim() || "Agent",
      email: body.email.trim().toLowerCase(),
      active: "Invited · just now",
      handled: 0,
    };

    db.team.push(member);
    await writeDb(db);
    return Response.json({ member, team: db.team }, { status: 201 });
  } catch (e) {
    return Response.json(
      { error: "Invalid team member payload", detail: String(e) },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = PatchMemberSchema.parse(await req.json());
    const db = await readDb();
    const member = db.team.find(t => t.id === body.id);
    if (!member) {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }
    if (body.name) member.name = body.name.trim();
    if (body.role) member.role = body.role.trim();
    if (body.email) member.email = body.email.trim().toLowerCase();
    await writeDb(db);
    return Response.json({ member, team: db.team });
  } catch (e) {
    return Response.json(
      { error: "Invalid team update", detail: String(e) },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }
  const db = await readDb();
  db.team = db.team.filter(t => t.id !== id);
  await writeDb(db);
  return Response.json({ team: db.team });
}
