import { z } from "zod";
import {
  readDb,
  writeDb,
  getDashboardStats,
  type ConvStatus,
} from "@/lib/store";
import { getAdmin, requireAdmin } from "@/lib/auth";
import { sendWhatsApp } from "@/lib/whatsapp";

export const runtime = "nodejs";

const PostActionSchema = z.object({
  conversationId: z.string().min(1),
  text: z.string().min(1).max(4000),
  from: z.enum(["agent", "bot", "client"]).default("agent"),
  agentName: z.string().optional(),
  isNote: z.boolean().optional(),
});

const PatchConvSchema = z.object({
  conversationId: z.string().min(1),
  status: z.enum(["bot", "human", "waiting", "closed"]).optional(),
  assignee: z.string().optional(),
  tag: z.string().optional(),
});

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await readDb();
  const stats = getDashboardStats(db);
  return Response.json({
    conversations: db.conversations,
    stats,
    team: db.team,
    botEnabled: db.botConfig.botEnabled,
    botModel: db.botConfig.model,
    counts: {
      conversations: db.conversations.filter(c => c.status !== "closed").length,
      leads: db.leads.length,
      broadcasts: db.broadcasts.filter(b => b.status !== "sent").length,
      customPlans: db.customPlans.length,
      customDevices: db.customDevices.length,
    },
  });
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = PostActionSchema.parse(await req.json());
    const db = await readDb();
    const conv = db.conversations.find(c => c.id === body.conversationId);
    if (!conv) {
      return Response.json({ error: "Conversation not found" }, { status: 404 });
    }

    const timeStr = new Date().toTimeString().slice(0, 5);
    const member = db.team.find(t => t.email.toLowerCase() === admin.email);
    const senderName = member?.name.split(" ")[0] || admin.email.split("@")[0];
    let deliveryError: string | undefined;

    if (body.isNote) {
      conv.timeline = conv.timeline || [];
      conv.timeline.unshift({
        time: timeStr,
        who: senderName,
        what: `Note: ${body.text}`,
      });
    } else {
      // Website chat picks agent messages up by polling; WhatsApp has to be pushed.
      if (body.from === "agent" && conv.channel === "wa") {
        const result = await sendWhatsApp(conv.phone, body.text);
        if (!result.ok) deliveryError = result.error;
      }
      conv.messages = conv.messages || [];
      conv.messages.push({
        from: body.from,
        text: body.text,
        time: timeStr,
        meta: body.from === "agent" ? `AGENT · ${senderName}` : body.from.toUpperCase(),
        ...(deliveryError ? { failed: deliveryError } : {}),
      });
      conv.updatedAt = new Date().toISOString();
      conv.preview = body.text;
      conv.time = timeStr;
      conv.isNew = false;

      if (body.from === "agent" && conv.status !== "closed") {
        conv.status = "human";
      }

      conv.timeline = conv.timeline || [];
      conv.timeline.unshift({
        time: timeStr,
        who: body.from === "agent" ? senderName : "Client",
        what: body.from === "agent" ? "Replied to customer" : "Sent message",
      });

      if (member && body.from === "agent") {
        member.handled += 1;
        member.active = "Just now";
      }
    }

    await writeDb(db);
    return Response.json(
      { conversation: conv, stats: getDashboardStats(db), deliveryError },
      { status: deliveryError ? 502 : 200 }
    );
  } catch (e) {
    return Response.json(
      { error: "Invalid message payload", detail: String(e) },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = PatchConvSchema.parse(await req.json());
    const db = await readDb();
    const conv = db.conversations.find(c => c.id === body.conversationId);
    if (!conv) {
      return Response.json({ error: "Conversation not found" }, { status: 404 });
    }

    const timeStr = new Date().toTimeString().slice(0, 5);
    conv.isNew = false;

    if (body.status) {
      conv.status = body.status as ConvStatus;
      conv.timeline = conv.timeline || [];
      const statusLabels: Record<ConvStatus, string> = {
        human: "Human agent took over thread",
        bot: "Handed back to Ali Agent bot",
        waiting: "Paused bot — queued for human",
        closed: "Marked conversation as resolved ✓",
      };
      conv.timeline.unshift({
        time: timeStr,
        who: "Agent",
        what: statusLabels[body.status],
      });
    }

    if (body.assignee !== undefined) {
      conv.assignee = body.assignee;
      conv.timeline = conv.timeline || [];
      conv.timeline.unshift({
        time: timeStr,
        who: "System",
        what: `Assigned to ${body.assignee}`,
      });
    }

    if (body.tag) {
      conv.tags = Array.from(new Set([...(conv.tags || []), body.tag]));
    }

    await writeDb(db);
    return Response.json({
      conversation: conv,
      stats: getDashboardStats(db),
    });
  } catch (e) {
    return Response.json(
      { error: "Invalid conversation update", detail: String(e) },
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
      db.conversations = [];
    } else if (id) {
      db.conversations = db.conversations.filter(c => c.id !== id);
    } else {
      return Response.json({ error: "Missing id or all parameter" }, { status: 400 });
    }
    await writeDb(db);

    return Response.json({
      success: true,
      stats: getDashboardStats(db),
      count: db.conversations.length,
    });
  } catch (e) {
    return Response.json({ error: "Delete failed", detail: String(e) }, { status: 500 });
  }
}

