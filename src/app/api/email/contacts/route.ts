import { z } from "zod";
import { readDb, writeDb, type ContactRecord } from "@/lib/store";
import { getAdmin, requireAdmin } from "@/lib/auth";
import { contactId, isEmailConfigured, isValidEmail } from "@/lib/email";
import { summarize } from "@/lib/emailStore";

export const runtime = "nodejs";

const ImportSchema = z.object({
  list: z.string().trim().min(1).max(80),
  consent: z.literal(true),
  source: z.string().trim().max(120).default("Spreadsheet import"),
  rows: z
    .array(z.object({ email: z.string().max(320), name: z.string().max(200).default("") }))
    .min(1)
    .max(20000),
});

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await readDb({ lists: ["contacts"] });
  return Response.json({ ...summarize(db.contacts), emailConfigured: isEmailConfigured() });
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = ImportSchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid import", detail: parsed.error.issues[0]?.message },
      { status: 400 }
    );
  }
  const body = parsed.data;

  const incoming = new Map<string, { email: string; name: string }>();
  let invalid = 0;
  for (const row of body.rows) {
    const email = row.email.trim().toLowerCase();
    if (!isValidEmail(email)) {
      invalid += 1;
      continue;
    }
    const id = contactId(email);
    if (!incoming.has(id)) incoming.set(id, { email, name: row.name.trim() });
  }

  const db = await readDb({ lists: ["contacts"], ids: { contacts: [...incoming.keys()] } });
  const existing = new Map(db.contacts.map(c => [c.id, c]));
  const now = new Date().toISOString();
  const consent = `${body.source} · opt-in confirmed by ${admin.email} · ${now.slice(0, 10)}`;
  const added: ContactRecord[] = [];
  let updated = 0;
  let suppressed = 0;

  for (const [id, row] of incoming) {
    const contact = existing.get(id);
    if (contact) {
      if (contact.status !== "subscribed") suppressed += 1;
      if (!contact.lists.includes(body.list)) contact.lists.push(body.list);
      if (!contact.name && row.name) contact.name = row.name;
      contact.updatedAt = now;
      updated += 1;
    } else {
      added.push({
        id,
        email: row.email,
        name: row.name,
        lists: [body.list],
        status: "subscribed",
        consent,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  db.contacts.unshift(...added);
  await writeDb(db);

  return Response.json(
    {
      added: added.length,
      updated,
      suppressed,
      invalid,
      duplicates: body.rows.length - invalid - incoming.size,
    },
    { status: 201 }
  );
}

/** Removes a list. Unsubscribed/bounced contacts are kept so a re-import can't mail them again. */
export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const list = new URL(req.url).searchParams.get("list");
  if (!list) return Response.json({ error: "Missing list" }, { status: 400 });

  const db = await readDb({ lists: ["contacts"] });
  db.contacts = db.contacts.filter(c => {
    if (!c.lists.includes(list)) return true;
    c.lists = c.lists.filter(l => l !== list);
    return c.lists.length > 0 || c.status !== "subscribed";
  });
  await writeDb(db);
  return Response.json(summarize(db.contacts));
}
