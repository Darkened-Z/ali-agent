import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  conversations as initialConversations,
  leads as initialLeads,
  kbArticles as initialKbArticles,
  broadcasts as initialBroadcasts,
  team as initialTeam,
  DEFAULT_BOT_PROMPT,
  type Conversation,
  type LeadStatus,
  type BroadcastStatus,
  type ConvStatus,
} from "./mockData";
import {
  phoneDeals,
  simOnlyPlans,
  simFreePhones,
  refurbPhones,
  type PhoneDeal,
  type SimOnlyPlan,
} from "./plans";

export type LeadRecord = {
  id: string;
  name: string;
  phone: string;
  city: string;
  interest: string;
  network?: string;
  bestTime?: string;
  source: string;
  score: number;
  status: LeadStatus;
  updated: string;
};

export type KBArticleRecord = {
  id: string;
  title: string;
  category: string;
  content?: string;
  updated: string;
  uses: number;
};

export type BroadcastRecord = {
  id: string;
  title: string;
  message?: string;
  audienceKey?: string;
   status: BroadcastStatus;
  audience: number;
  sends: string;
};

export type TeamMemberRecord = {
  id: string;
  name: string;
  role: string;
  email: string;
  active: string;
  handled: number;
};

export type PromptVersion = {
  hash: string;
  prompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  savedAt: string;
};

export type BotConfig = {
  botEnabled: boolean;
  prompt: string;
  model: "haiku" | "sonnet" | "opus";
  temperature: number;
  maxTokens: number;
  escalateOn: {
    discount: boolean;
    complaint: boolean;
    human: boolean;
    longConv: boolean;
  };
  hash: string;
  updatedAt: string;
  history: PromptVersion[];
};

export type AppSettings = {
  general: {
    businessName: string;
    contactEmail: string;
    timezone: string;
    websiteDomain: string;
  };
  hours: Record<
    string,
    { open: string; close: string; enabled: boolean }
  >;
  whatsapp: {
    provider: "meta" | "twilio";
    phoneNumberId: string;
    accessToken: string;
    verifyToken: string;
    webhookUrl: string;
  };
  escalation: Record<string, boolean>;
  billing: {
    plan: string;
    monthSpend: string;
    messagesCount: number;
    leadsCount: number;
    renewsOn: string;
  };
};

export type CustomPlanItem = {
  id: string;
  network: PhoneDeal["network"];
  title: string;
  sub: string;
  monthly: number;
  monthlyLabel: string;
  contractLabel: string;
  extraRight: string;
  kind: "Contract" | "SIM only";
  tag?: string;
};

export type CustomDeviceItem = {
  id: string;
  brand: PhoneDeal["brand"];
  name: string;
  variant: string;
  price: string;
  meta: string;
  kind: "New" | "SIM-free" | "Refurbished";
};

export type DatabaseSchema = {
  conversations: (Conversation & { assignee?: string })[];
  leads: LeadRecord[];
  kbArticles: KBArticleRecord[];
  broadcasts: BroadcastRecord[];
  team: TeamMemberRecord[];
  botConfig: BotConfig;
  settings: AppSettings;
  customPlans: CustomPlanItem[];
  customDevices: CustomDeviceItem[];
  lastCatalogueSync: string;
};

const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", ".data")
  : path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function nowHHMM(): string {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
}

function shortDate(): string {
  const d = new Date();
  return d.toLocaleDateString("en-GB", { month: "short", day: "2-digit" });
}

function computeHash(text: string): string {
  return crypto.createHash("sha1").update(text).digest("hex").slice(0, 6);
}

const DEFAULT_KB_CONTENT: Record<string, string> = {
  "K-01": "Three 5G covers 65%+ of the UK outdoor population. Customers can check postcode coverage at three.co.uk/discover/network/coverage-checker.",
  "K-02": "iPhone 17 starts at £31.95/mo (£345 upfront) on Vodafone or £42/mo (£25 upfront) on Three. iPhone 17 Pro from £54/mo on Three; iPhone 17 Pro Max from £58/mo on Vodafone.",
  "K-03": "To port a UK mobile number, text PAC to 65075 (free on EE, O2, Vodafone, Three). PAC codes are valid for 30 days. Porting completes within 1 working day.",
  "K-04": "Upfront costs over £15 can be split into 3 interest-free monthly instalments using Klarna Pay in 3 or PayPal Pay in 3 at checkout.",
  "K-05": "Orders placed before 17:00 Mon–Fri ship same day via DPD Next-Day or Royal Mail Tracked 24 with a 1-hour delivery slot SMS.",
  "K-06": "All new Samsung handsets carry a 24-month UK manufacturer warranty covering hardware defects and battery faults.",
  "K-07": "All distance orders include a 14-day cooling-off period from delivery. Handsets must be returned in like-new condition with original packaging.",
  "K-08": "Business accounts ordering 5+ SIMs get 10% off monthly line rental and a dedicated account manager.",
  "K-09": "Refurbished grades: Excellent (mint screen, 85%+ battery), Good (light micro-scratches, 80%+ battery), Fair (visible wear, 100% functional). All include 12-month warranty.",
  "K-10": "Call center hours: Mon–Sat 10:00–22:00 BST. Outside hours, Ali Agent AI handles all chats and queues escalations for the morning shift.",
};

function createSeedDb(): DatabaseSchema {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const hours: AppSettings["hours"] = {};
  for (const d of days) {
    hours[d] = {
      open: d === "Sunday" ? "" : "10:00",
      close: d === "Sunday" ? "" : "22:00",
      enabled: d !== "Sunday",
    };
  }

  return {
    conversations: structuredClone(initialConversations),
    leads: structuredClone(initialLeads),
    kbArticles: initialKbArticles.map(a => ({
      ...a,
      content: DEFAULT_KB_CONTENT[a.id] ?? `${a.title} — standard UK retail policy & pricing guide.`,
    })),
    broadcasts: structuredClone(initialBroadcasts),
    team: structuredClone(initialTeam),
    botConfig: {
      botEnabled: true,
      prompt: DEFAULT_BOT_PROMPT,
      model: "haiku",
      temperature: 0.4,
      maxTokens: 512,
      escalateOn: {
        discount: true,
        complaint: true,
        human: true,
        longConv: false,
      },
      hash: "a3f9b2",
      updatedAt: "Aug 24, 15:42",
      history: [
        {
          hash: "a3f9b2",
          prompt: DEFAULT_BOT_PROMPT,
          model: "haiku",
          temperature: 0.4,
          maxTokens: 512,
          savedAt: "Aug 24, 15:42",
        },
      ],
    },
    settings: {
      general: {
        businessName: "Ali Mobile UK",
        contactEmail: "ali@aliagent.co.uk",
        timezone: "gb",
        websiteDomain: "aliagent.co.uk",
      },
      hours,
      whatsapp: {
        provider: "meta",
        phoneNumberId: "1058827740928374",
        accessToken: "EAAY_demo_token_ali_agent_uk",
        verifyToken: "ali_agent_verify_a3f9b2",
        webhookUrl: "https://ali-agent.vercel.app/api/whatsapp/webhook",
      },
      escalation: {
        "Discount requested": true,
        "Complaint keywords": true,
        "Explicit human request": true,
        "Conversation too long": true,
        "Payment / bank details": true,
      },
      billing: {
        plan: "Ali Agent · Pro plan",
        monthSpend: "£124.80",
        messagesCount: 1247,
        leadsCount: 48,
        renewsOn: "Nov 01",
      },
    },
    customPlans: [],
    customDevices: [],
    lastCatalogueSync: "Aug 24, 14:00",
  };
}

export function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      const seed = createSeedDb();
      fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), "utf8");
      return seed;
    }
    const raw = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
    const seed = createSeedDb();
    return {
      ...seed,
      ...parsed,
      botConfig: { ...seed.botConfig, ...(parsed.botConfig ?? {}) },
      settings: { ...seed.settings, ...(parsed.settings ?? {}) },
    };
  } catch {
    return createSeedDb();
  }
}

export function writeDb(db: DatabaseSchema): DatabaseSchema {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch {
    // Ignore read-only filesystem errors in serverless environments
  }
  return db;
}

export function getDashboardStats(db = readDb()) {
  const activeNow = db.conversations.filter(c => c.status === "bot" || c.status === "human").length;
  const queuedToday = db.conversations.filter(c => c.status === "waiting").length + db.leads.filter(l => l.status === "hot").length;
  const handledToday = 40 + db.conversations.length;
  const escalatedToday = db.conversations.filter(c => c.status === "human" || c.status === "waiting").length;
  const wonLeads = db.leads.filter(l => l.status === "won").length;
  const wonConvs = db.conversations.filter(c => c.status === "closed").length;
  const wonToday = Math.max(8, wonLeads + wonConvs + 6);
  const revNumber = 12845 + (wonToday - 8) * 420;
  return {
    activeNow,
    queuedToday,
    handledToday,
    escalatedToday,
    wonToday,
    revenueToday: `£${revNumber.toLocaleString("en-GB")}`,
  };
}

export function addLeadToDb(input: {
  name: string;
  phone: string;
  city: string;
  need?: string;
  interest?: string;
  network?: string;
  time?: string;
  source?: string;
}): LeadRecord {
  const db = readDb();
  const nextNum = 1043 + db.leads.length;
  const id = `L-${nextNum}`;

  const needMap: Record<string, string> = {
    sim: "SIM-only plan",
    port: "Number port (PAC)",
    phone: "Phone contract",
    plan: "Early upgrade",
  };
  const netLabel =
    input.network && input.network !== "any"
      ? ` · ${input.network.toUpperCase()}`
      : "";
  const interest =
    input.interest?.trim() ||
    `${needMap[input.need || "phone"] || "Phone enquiry"}${netLabel}`;

  // Score calculation: phone/upgrade/port with specific network scores higher
  let score = 68;
  if (input.need === "phone" || input.need === "plan") score += 12;
  if (input.network && input.network !== "any") score += 6;
  if (input.time === "morning" || input.time === "afternoon") score += 4;
  score = Math.min(96, score);

  const status: LeadStatus = score >= 75 ? "hot" : score >= 45 ? "warm" : "cold";
  const timeStr = nowHHMM();

  const newLead: LeadRecord = {
    id,
    name: input.name.trim(),
    phone: input.phone.trim(),
    city: input.city.trim() || "UK",
    interest,
    network: input.network || "any",
    bestTime: input.time || "any",
    source: input.source || "Lead form",
    score,
    status,
    updated: timeStr,
  };

  db.leads.unshift(newLead);

  // Also create a waiting conversation in the inbox so call-center staff see the callback request immediately
  const convId = `c-${Date.now()}`;
  db.conversations.unshift({
    id: convId,
    name: newLead.name,
    phone: newLead.phone,
    city: newLead.city,
    channel: "web",
    status: "waiting",
    time: timeStr,
    preview: `Callback requested: ${interest} (${input.time || "any time"})`,
    isNew: true,
    score: newLead.score,
    source: newLead.source,
    firstSeen: `${shortDate()}, ${timeStr}`,
    tags: [interest, input.network?.toUpperCase() || "ANY NETWORK"].filter(Boolean),
    timeline: [
      { time: timeStr, who: newLead.name.split(" ")[0], what: `Submitted lead form (${id})` },
    ],
    messages: [
      {
        from: "client",
        text: `Hi, I submitted the callback form for: ${interest}. City: ${newLead.city}. Best time to call: ${input.time || "any time today"}.`,
        time: timeStr,
        meta: "FORM",
      },
      {
        from: "bot",
        text: `Thanks ${newLead.name.split(" ")[0]}! Reference ${id} logged — one of our advisors will call ${newLead.phone} within 30 minutes.`,
        time: timeStr,
        meta: "AUTO-ACK",
      },
    ],
  });

  db.settings.billing.leadsCount += 1;
  writeDb(db);
  return newLead;
}

export function generateCatalogueReply(
  userText: string,
  db = readDb(),
  messageCount = 1
): {
  reply: string;
  escalated: boolean;
  escalationReason?: string;
  priceCard?: { label: string; price: string; info: string; cta: string };
} {
  const t = userText.trim();
  const { escalateOn } = db.botConfig;

  // 1. Check escalation triggers
  if (
    escalateOn.human &&
    /\b(human|agent|person|someone|advisor|manager|speak to|call me)\b/i.test(t)
  ) {
    return {
      reply:
        "Handing you over to a human advisor right now — Sam or Aisha will pick this up in under a minute. Anything else you'd like me to note for them?",
      escalated: true,
      escalationReason: "Explicit human request",
    };
  }

  if (
    escalateOn.discount &&
    /\b(discount|cheaper|price match|best price|knock off|lower the price|deal below)\b/i.test(t)
  ) {
    return {
      reply:
        "I can't discount below our posted Fonehouse tariffs myself, so I'm flagging our retention & deals specialist to check price-match options for you now.",
      escalated: true,
      escalationReason: "Discount requested",
    };
  }

  if (
    escalateOn.complaint &&
    /\b(complain|complaint|refund|broken|faulty|damaged|terrible|angry|cancel my order)\b/i.test(t)
  ) {
    return {
      reply:
        "I'm really sorry to hear that. I've escalated your chat to a senior agent right away so we can sort this out for you immediately.",
      escalated: true,
      escalationReason: "Complaint keywords",
    };
  }

  if (escalateOn.longConv && messageCount >= 10) {
    return {
      reply:
        "We've been going back and forth a few times — let me bring in a human specialist to make sure we get everything sorted for you quickly.",
      escalated: true,
      escalationReason: "10+ messages threshold",
    };
  }

  // 2. Check Knowledge Base articles for policy/logistics/porting/Klarna questions
  if (/\b(port|pac|mnp|keep my number|switch network|65075)\b/i.test(t)) {
    const kb = db.kbArticles.find(k => k.id === "K-03");
    if (kb) kb.uses += 1;
    writeDb(db);
    return {
      reply:
        "Porting takes **1 working day** once we have your PAC. Text **PAC to 65075** (free on EE, O2, Vodafone & Three) — reply here with the code and we'll schedule the switch.",
      escalated: false,
    };
  }

  if (/\b(klarna|paypal|pay in 3|split|upfront|instalment|installment)\b/i.test(t)) {
    const kb = db.kbArticles.find(k => k.id === "K-04");
    if (kb) kb.uses += 1;
    writeDb(db);
    return {
      reply:
        "Yes — you can split any upfront cost into three interest-free payments with **Klarna Pay in 3** or **PayPal Pay in 3** at checkout.",
      escalated: false,
    };
  }

  if (/\b(delivery|shipping|dispatch|dpd|royal mail|next day|track|order #)\b/i.test(t)) {
    const kb = db.kbArticles.find(k => k.id === "K-05");
    if (kb) kb.uses += 1;
    writeDb(db);
    return {
      reply:
        "Order before **5pm Mon–Fri** for free next-working-day delivery via **DPD** or **Royal Mail Tracked 24**, complete with a 1-hour SMS time slot.",
      escalated: false,
    };
  }

  if (/\b(return|cooling off|14 day|warranty)\b/i.test(t)) {
    const kb = db.kbArticles.find(k => k.id === "K-07");
    if (kb) kb.uses += 1;
    writeDb(db);
    return {
      reply:
        "Every order comes with a **14-day cooling-off period** for returns plus a full manufacturer warranty (24 months on new devices, 12 months on refurbished).",
      escalated: false,
    };
  }

  // 3. Match SIM-only queries
  if (/\b(sim only|sim-only|simo|rolling sim)\b/i.test(t)) {
    const p: SimOnlyPlan = simOnlyPlans[3] ?? simOnlyPlans[0]; // Three 60GB rolling £10
    return {
      reply:
        "Our most popular SIM-only is **Three's rolling 30-day SIM** with **60 GB 5G**, unlimited mins & texts for **£10.00 / month** (£0 upfront). Or on a 24-month plan: **£8.00 / month** for **8 GB 5G** with £25 cashback (rises to £9.90 Apr 2027, £11.80 Apr 2028).",
      escalated: false,
      priceCard: {
        label: `Three · Rolling 30-day SIM`,
        price: `£${p.monthly.toFixed(2)} / mo`,
        info: `£0 upfront · 30 days\n60GB 5G · Unlimited`,
        cta: "Reserve SIM",
      },
    };
  }

  // 4. Match Refurbished queries
  if (/\b(refurb|refurbished|second hand|used pixel)\b/i.test(t)) {
    const r = refurbPhones[0];
    return {
      reply: `We stock SIM-free refurbished Google Pixels from **£150** (Pixel 7a 128 GB Good) up to **£490** (Pixel 10 256 GB Excellent). For example, **${r.brand} ${r.model} ${r.storageGb}GB ${r.colour}** (${r.grade}) is **£${r.simFreePrice}** outright.`,
      escalated: false,
      priceCard: {
        label: `${r.brand} ${r.model} · ${r.storageGb} GB (${r.grade})`,
        price: `£${r.simFreePrice}.00`,
        info: `${r.colour} · Refurbished\n12m warranty · SIM-free`,
        cta: "Reserve",
      },
    };
  }

  // 5. Match SIM-free queries
  if (/\b(sim free|sim-free|outright|unlocked)\b/i.test(t)) {
    const sf = simFreePhones[7] ?? simFreePhones[0];
    return {
      reply: `SIM-free outright handsets start at **£79** (Doro Leva E10) up to **£1,656.99** (Galaxy Z Fold8 512 GB). **${sf.brand} ${sf.model} ${sf.storageGb ?? 128}GB** is **£${sf.price}** SIM-free with free next-day delivery.`,
      escalated: false,
    };
  }

  // 6. Match specific handset models from phoneDeals (longest model name first)
  const sortedDeals = [...phoneDeals].sort((a, b) => b.model.length - a.model.length);
  const preferredNet =
    /\bvodafone\b/i.test(t)
      ? "Vodafone"
      : /\bthree\b/i.test(t)
      ? "Three"
      : /\btalkmobile\b/i.test(t)
      ? "Talkmobile"
      : null;

  const modelCandidates = sortedDeals.filter(d =>
    t.toLowerCase().includes(d.model.toLowerCase())
  );

  if (modelCandidates.length > 0) {
    const deal =
      (preferredNet && modelCandidates.find(d => d.network === preferredNet)) ||
      modelCandidates.sort((a, b) => a.monthly - b.monthly)[0];

    const dataLabel = deal.dataGb === "unlimited" ? "Unlimited 5G" : `${deal.dataGb} GB 5G`;
    const riseText = deal.priceRises?.length
      ? ` Price rises to £${deal.priceRises[0].monthly.toFixed(2)} in Apr 2027 and £${(
          deal.priceRises[1]?.monthly ?? deal.priceRises[0].monthly
        ).toFixed(2)} in Apr 2028.`
      : "";

    const kb = db.kbArticles.find(k => k.id === "K-02");
    if (kb) {
      kb.uses += 1;
      writeDb(db);
    }

    return {
      reply: `${deal.model} ${deal.storageGb} GB ${deal.colour} on ${deal.network} — **£${deal.monthly.toFixed(
        2
      )} / month**, £${deal.upfront} upfront, ${deal.contractMonths} months with **${dataLabel}** and unlimited mins & texts.${riseText}`,
      escalated: false,
      priceCard: {
        label: `${deal.model} · ${deal.storageGb} GB · ${deal.colour} · ${deal.network}`,
        price: `£${deal.monthly.toFixed(2)} / mo`,
        info: `£${deal.upfront} upfront · ${deal.contractMonths}m\n${dataLabel} · Unlimited`,
        cta: "Reserve",
      },
    };
  }

  // 7. Match custom KB articles if keywords match
  const customKb = db.kbArticles.find(
    a =>
      a.content &&
      t
        .toLowerCase()
        .split(/\W+/)
        .filter(w => w.length > 3)
        .some(w => a.title.toLowerCase().includes(w))
  );
  if (customKb && customKb.content) {
    customKb.uses += 1;
    writeDb(db);
    return {
      reply: customKb.content,
      escalated: false,
    };
  }

  // 8. Greeting or general fallback
  if (/\b(hello|hi|hey|morning|afternoon|evening)\b/i.test(t)) {
    return {
      reply:
        "Hi! I'm Ali Agent. Are you looking for a **pay-monthly phone** (iPhone 17, Galaxy S26, Pixel 10), a **SIM-only plan** from **£6 / month**, or help **porting your number**?",
      escalated: false,
    };
  }

  return {
    reply:
      "I can quote live UK tariffs across **Three**, **Vodafone**, and **Talkmobile** — try asking for **iPhone 17**, **iPhone 17 Pro**, **Galaxy S26 Ultra**, **Galaxy A17 5G (£12/mo)**, **Pixel 10 Pro**, or **SIM-only** deals!",
    escalated: false,
  };
}

export function recordChatExchange(params: {
  sessionId: string;
  channel: "web" | "wa";
  userName?: string;
  phone?: string;
  city?: string;
  userText: string;
  botText: string;
  meta: string;
  escalated?: boolean;
  escalationReason?: string;
  priceCard?: { label: string; price: string; info: string; cta: string };
}): Conversation {
  const db = readDb();
  const timeStr = nowHHMM();
  let conv = db.conversations.find(c => c.id === params.sessionId);

  if (!conv) {
    conv = {
      id: params.sessionId,
      name:
        params.userName ||
        (params.channel === "wa"
          ? params.phone || "WhatsApp Shopper"
          : `Web Visitor #${params.sessionId.slice(-4).toUpperCase()}`),
      phone: params.phone || "+44 7700 900" + Math.floor(100 + Math.random() * 899),
      city: params.city || "UK · Online",
      channel: params.channel,
      status: params.escalated ? "human" : "bot",
      time: timeStr,
      preview: params.userText,
      isNew: true,
      score: 72,
      source: params.channel === "wa" ? "Direct WhatsApp" : "Website widget",
      firstSeen: `${shortDate()}, ${timeStr}`,
      tags: [params.channel === "wa" ? "WhatsApp" : "Widget"],
      timeline: [
        { time: timeStr, who: "Visitor", what: "Started chat" },
      ],
      messages: [],
    };
    db.conversations.unshift(conv);
  }

  conv.time = timeStr;
  conv.preview = params.userText;
  conv.messages = conv.messages || [];
  conv.messages.push({
    from: "client",
    text: params.userText,
    time: timeStr,
    meta: params.channel.toUpperCase(),
  });
  conv.messages.push({
    from: "bot",
    text: params.botText,
    time: timeStr,
    meta: params.meta,
    ...(params.priceCard ? { priceCard: params.priceCard } : {}),
  });

  if (params.escalated) {
    conv.status = "human";
    conv.timeline = conv.timeline || [];
    conv.timeline.unshift({
      time: timeStr,
      who: "Bot",
      what: `Escalated to human (${params.escalationReason || "Rule match"})`,
    });
  } else {
    conv.timeline = conv.timeline || [];
    conv.timeline.unshift({
      time: timeStr,
      who: "Bot",
      what: "Sent automated reply",
    });
  }

  db.settings.billing.messagesCount += 2;
  writeDb(db);
  return conv;
}

export function updatePromptHash(prompt: string): string {
  return computeHash(prompt);
}

export type { Conversation, ConvStatus, LeadStatus, BroadcastStatus };
