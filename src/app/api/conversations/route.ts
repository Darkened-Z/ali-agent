import { z } from "zod";
import {
  readDb,
  writeDb,
  getDashboardStats,
  type ConvStatus,
} from "@/lib/store";

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
  const db = readDb();
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
  try {
    const body = PostActionSchema.parse(await req.json());
    const db = readDb();
    const conv = db.conversations.find(c => c.id === body.conversationId);
    if (!conv) {
      return Response.json({ error: "Conversation not found" }, { status: 404 });
    }

    const timeStr = new Date().toTimeString().slice(0, 5);
    const senderName = body.agentName || "Sam";

    if (body.isNote) {
      conv.timeline = conv.timeline || [];
      conv.timeline.unshift({
        time: timeStr,
        who: senderName,
        what: `Note: ${body.text}`,
      });
    } else {
      conv.messages = conv.messages || [];
      conv.messages.push({
        from: body.from,
        text: body.text,
        time: timeStr,
        meta: body.from === "agent" ? `AGENT · ${senderName}` : body.from.toUpperCase(),
      });
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

      // Increment handled count for agent
      const member = db.team.find(t =>
        t.name.toLowerCase().startsWith(senderName.toLowerCase())
      );
      if (member && body.from === "agent") {
        member.handled += 1;
        member.active = "Just now";
      }
    }

    writeDb(db);
    return Response.json({
      conversation: conv,
      stats: getDashboardStats(db),
    });
  } catch (e) {
    return Response.json(
      { error: "Invalid message payload", detail: String(e) },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = PatchConvSchema.parse(await req.json());
    const db = readDb();
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

    writeDb(db);
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
