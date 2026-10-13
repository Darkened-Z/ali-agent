import { z } from "zod";
import { readDb, writeDb } from "@/lib/store";

export const runtime = "nodejs";

const CreateKbSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().default("General"),
  content: z.string().default(""),
  url: z.string().optional(),
});

export async function GET() {
  const db = readDb();
  return Response.json({ kbArticles: db.kbArticles });
}

export async function POST(req: Request) {
  try {
    const raw = await req.json();

    // Handle "sync" action
    if (raw.action === "sync") {
      const db = readDb();
      const today = new Date().toLocaleDateString("en-GB", {
        month: "short",
        day: "2-digit",
      });
      db.kbArticles = db.kbArticles.map(a => ({ ...a, updated: today }));
      writeDb(db);
      return Response.json({ kbArticles: db.kbArticles, syncedAt: today });
    }

    const body = CreateKbSchema.parse(raw);
    const db = readDb();
    const nextNum = db.kbArticles.length + 1;
    const id = `K-${String(nextNum).padStart(2, "0")}`;
    const today = new Date().toLocaleDateString("en-GB", {
      month: "short",
      day: "2-digit",
    });

    let content = body.content.trim();
    if (!content && body.url) {
      content = `Imported from ${body.url} — reference documentation indexed for Ali Agent.`;
    }

    const article = {
      id,
      title: body.title.trim(),
      category: body.category || "General",
      content,
      updated: today,
      uses: 0,
    };

    db.kbArticles.unshift(article);
    writeDb(db);
    return Response.json(
      { article, kbArticles: db.kbArticles },
      { status: 201 }
    );
  } catch (e) {
    return Response.json(
      { error: "Invalid KB article payload", detail: String(e) },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }
  const db = readDb();
  db.kbArticles = db.kbArticles.filter(a => a.id !== id);
  writeDb(db);
  return Response.json({ kbArticles: db.kbArticles });
}
