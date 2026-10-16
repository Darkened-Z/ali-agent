import { z } from "zod";
import { newId, readDb, writeDb } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";
import { fetchPageText } from "@/lib/fetchPage";

export const runtime = "nodejs";

const CreateKbSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().default("General"),
  content: z.string().default(""),
  url: z.string().optional(),
});

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await readDb();
  return Response.json({ kbArticles: db.kbArticles });
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const raw = await req.json();

    // Re-fetch every article that was imported from a link.
    if (raw.action === "sync") {
      const db = await readDb({ lists: ["kbArticles"] });
      const today = new Date().toLocaleDateString("en-GB", { month: "short", day: "2-digit" });
      const failed: string[] = [];
      for (const article of db.kbArticles.filter(a => a.sourceUrl)) {
        try {
          article.content = (await fetchPageText(article.sourceUrl!)).text;
          article.updated = today;
        } catch {
          failed.push(article.title);
        }
      }
      await writeDb(db);
      return Response.json({ kbArticles: db.kbArticles, syncedAt: today, failed });
    }

    const body = CreateKbSchema.parse(raw);
    const db = await readDb({ lists: ["kbArticles"] });
    const id = newId("K");
    const today = new Date().toLocaleDateString("en-GB", {
      month: "short",
      day: "2-digit",
    });

    let content = body.content.trim();
    let sourceUrl: string | undefined;
    if (!content && body.url) {
      try {
        content = (await fetchPageText(body.url.trim())).text;
        sourceUrl = body.url.trim();
      } catch (e) {
        return Response.json(
          { error: `Couldn't import that link: ${e instanceof Error ? e.message : e}` },
          { status: 422 }
        );
      }
      if (!content) {
        return Response.json({ error: "That page had no readable text" }, { status: 422 });
      }
    }

    const article = {
      id,
      title: body.title.trim(),
      category: body.category || "General",
      content,
      ...(sourceUrl ? { sourceUrl } : {}),
      updated: today,
      uses: 0,
    };

    db.kbArticles.unshift(article);
    await writeDb(db);
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
  const denied = await requireAdmin();
  if (denied) return denied;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }
  const db = await readDb();
  db.kbArticles = db.kbArticles.filter(a => a.id !== id);
  await writeDb(db);
  return Response.json({ kbArticles: db.kbArticles });
}
