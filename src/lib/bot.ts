import Anthropic from "@anthropic-ai/sdk";
import { PLAN_CATALOGUE } from "./planContext";
import { generateCatalogueReply, type DatabaseSchema } from "./store";
import { hoursStatus } from "./hours";

export const MODEL_MAP = {
  haiku: "claude-haiku-5-5",
  sonnet: "claude-sonnet-5-5",
  opus: "claude-opus-5-5",
} as const;

// Thinking tokens count against max_tokens; the admin's setting is the reply budget on top of this.
const THINKING_HEADROOM = 2048;

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type BotReply = {
  text: string;
  label: string;
  model: string;
  escalated: boolean;
  escalationReason?: string;
  priceCard?: { label: string; price: string; info: string; cta: string };
  warning?: string;
};

function stableSystem(db: DatabaseSchema, prompt: string): string {
  const kb = db.kbArticles.map(k => `- [${k.category}] ${k.title}: ${k.content || ""}`).join("\n");
  return `${prompt}

--- KNOWLEDGE BASE ARTICLES ---
${kb}

--- PLAN CATALOGUE (authoritative source; only quote from this list) ---

${PLAN_CATALOGUE}

--- END CATALOGUE ---

RULES:
- Every price, upfront, data allowance, and network you quote MUST come from the catalogue above.
- If a shopper asks for something not in the catalogue, say so and offer the closest match rather than inventing figures.
- Always disclose the April 2027 / April 2028 price rise if the tariff has one — that's Ofcom-mandated.`;
}

function hoursNote(db: DatabaseSchema): string {
  const h = hoursStatus(db.settings);
  return h.open
    ? "Our advisors are online right now."
    : `Our advisors are offline right now${h.nextOpen ? ` and back ${h.nextOpen}` : ""}. If the customer needs a person, say an advisor will reply ${h.nextOpen ? h.nextOpen : "when we reopen"} — never promise a faster callback.`;
}

/** The API needs a user turn first; the widget's greeting is an assistant turn, so drop leading assistant turns. */
function normalise(turns: ChatTurn[]): ChatTurn[] {
  const first = turns.findIndex(t => t.role === "user");
  return first === -1 ? [] : turns.slice(first).filter(t => t.content.trim());
}

function offlineHandoff(db: DatabaseSchema, reply: string): string {
  const h = hoursStatus(db.settings);
  if (h.open) return reply;
  return `Thanks — I've passed this to our advisors. We're closed right now${
    h.nextOpen ? ` and back ${h.nextOpen}` : ""
  }, and someone will reply here then.`;
}

/**
 * One brain for every channel: escalation rules first, then Claude (when a key is set),
 * falling back to the rule-based catalogue reply if Claude is unavailable or declines.
 */
export async function generateBotReply(opts: {
  db: DatabaseSchema;
  turns: ChatTurn[];
  previewPrompt?: string;
  onToken?: (text: string) => void;
}): Promise<BotReply> {
  const { db, onToken } = opts;
  const cfg = db.botConfig;
  const turns = normalise(opts.turns);
  const lastUser = [...turns].reverse().find(t => t.role === "user")?.content ?? "";
  const model = MODEL_MAP[cfg.model] ?? MODEL_MAP.haiku;
  const smart = await generateCatalogueReply(lastUser, db, turns.length);

  const finish = (text: string, label: string, extra: Partial<BotReply> = {}): BotReply => {
    onToken?.(text);
    return { text, label, model, escalated: false, ...extra };
  };

  if (!cfg.botEnabled) {
    return finish(offlineHandoff(db, "Thanks — an advisor will reply here shortly."), "QUEUED · HUMAN", {
      escalated: true,
      escalationReason: "Bot paused",
    });
  }
  if (smart.escalated) {
    return finish(offlineHandoff(db, smart.reply), "ESCALATED · HUMAN", {
      escalated: true,
      escalationReason: smart.escalationReason,
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey || turns.length === 0) {
    return finish(smart.reply, "CATALOGUE", { priceCard: smart.priceCard });
  }

  let text = "";
  try {
    const client = new Anthropic({ apiKey });
    const usesFallback = model !== MODEL_MAP.haiku;
    const stream = client.beta.messages.stream({
      model,
      max_tokens: (cfg.maxTokens || 512) + THINKING_HEADROOM,
      output_config: { effort: "low" },
      system: [
        {
          type: "text",
          text: stableSystem(db, opts.previewPrompt?.trim() || cfg.prompt),
          cache_control: { type: "ephemeral" },
        },
        { type: "text", text: hoursNote(db) },
      ],
      messages: turns,
      ...(usesFallback ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
    });

    stream.on("text", delta => {
      text += delta;
      onToken?.(delta);
    });
    const final = await stream.finalMessage();

    if (final.stop_reason === "refusal" || !text.trim()) {
      const fallback = text.trim() ? "" : smart.reply;
      if (fallback) onToken?.(fallback);
      return {
        text: text.trim() ? text : fallback,
        label: "CATALOGUE",
        model,
        escalated: false,
        priceCard: smart.priceCard,
        warning: final.stop_reason === "refusal" ? "Claude declined; catalogue reply used" : undefined,
      };
    }
    return { text, label: `CLAUDE ${cfg.model.toUpperCase()}`, model: final.model, escalated: false };
  } catch (err) {
    if (text.trim()) {
      return { text, label: `CLAUDE ${cfg.model.toUpperCase()}`, model, escalated: false, warning: String(err) };
    }
    return finish(smart.reply, "CATALOGUE", {
      priceCard: smart.priceCard,
      warning: err instanceof Error ? err.message : String(err),
    });
  }
}
