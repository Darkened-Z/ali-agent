// Mock data used across the demo. Swap for Supabase queries in production.
// Prices and deals mirror the Fonehouse catalogue in ./plans.ts (GBP, UK).

export type ChannelBadge = "wa" | "web";
export type ConvStatus = "bot" | "human" | "waiting" | "closed";

export type Conversation = {
  id: string;
  name: string;
  phone: string;
  city: string;
  channel: ChannelBadge;
  status: ConvStatus;
  time: string;
  preview: string;
  isNew?: boolean;
  score?: number;
  source?: string;
  firstSeen?: string;
  tags?: string[];
  timeline?: { time: string; who: string; what: string }[];
  messages?: {
    from: "client" | "bot" | "agent";
    text: string;
    time: string;
    meta?: string;
    priceCard?: { label: string; price: string; info: string; cta: string };
  }[];
};

export const conversations: Conversation[] = [
  {
    id: "c1", name: "Amelia Clarke", phone: "+44 7712 448291", city: "London · Camden",
    channel: "wa", status: "bot", time: "14:32",
    preview: "Have you got the iPhone 17 256GB in stock?", isNew: true,
    score: 82, source: "Meta ad · iPhone 17 launch", firstSeen: "Aug 22, 11:42",
    tags: ["iPhone 17", "256 GB", "Vodafone", "Delivery"],
    timeline: [
      { time: "14:32", who: "Bot", what: "Sent Vodafone tariff card" },
      { time: "14:31", who: "Bot", what: "Confirmed stock — next-day dispatch" },
      { time: "14:31", who: "Amelia", what: "Started chat" },
      { time: "Aug 22", who: "Meta", what: "Clicked iPhone 17 launch ad" },
      { time: "Jun 24", who: "Purchase", what: "£62.50 · AirPods Pro 2" },
    ],
    messages: [
      { from: "client", text: "Have you got the iPhone 17 256GB Black in stock? Looking for a Vodafone deal", time: "14:31", meta: "WA" },
      {
        from: "bot",
        text: "Yes — iPhone 17 256 GB Black on Vodafone, £44/mo, £29 upfront, 24 months with 400GB 5G data, unlimited mins & texts. Next-day delivery if you order before 5pm.",
        time: "14:31", meta: "CLAUDE HAIKU · 412ms",
        priceCard: { label: "iPhone 17 · 256 GB · Black · Vodafone", price: "£44.00 / mo", info: "£29 upfront · 24m\n400GB 5G · Unlimited", cta: "Reserve" },
      },
      { from: "client", text: "Any way to spread the upfront?", time: "14:32", meta: "WA" },
      {
        from: "bot",
        text: "Yes — Klarna Pay in 3 splits the £29 into three interest-free payments (£9.66 each), or PayPal Pay in 3. Both are checked at checkout. Want me to send the link?",
        time: "14:32", meta: "CLAUDE HAIKU · 385ms",
      },
    ],
  },
  {
    id: "c2", name: "James Whitfield", phone: "+44 7801 456218", city: "Manchester · Didsbury",
    channel: "wa", status: "bot", time: "14:28",
    preview: "Cheapest SIM-only with unlimited data?",
    score: 64, source: "Direct WhatsApp", firstSeen: "Aug 24, 14:28",
    tags: ["SIM-only", "Unlimited", "Three"],
    messages: [
      { from: "client", text: "Cheapest SIM-only with loads of data on a rolling contract?", time: "14:28", meta: "WA" },
      { from: "bot", text: "Three's rolling 30-day SIM: 60GB 5G, unlimited mins & texts, £10/mo, no upfront. Delivered next day.", time: "14:28", meta: "CLAUDE HAIKU · 298ms" },
    ],
  },
  {
    id: "c3", name: "+44 7900 147822", phone: "+44 7900 147822", city: "Birmingham",
    channel: "web", status: "human", time: "14:21",
    preview: "Want to port from EE, how long does it take?",
    score: 55, source: "Website widget", firstSeen: "Aug 24, 14:19",
    tags: ["MNP", "EE → Vodafone"],
    messages: [
      { from: "client", text: "Want to port my number from EE to Vodafone. How long does it take?", time: "14:19", meta: "WEB" },
      { from: "bot", text: "Usually 1 working day once you send us your PAC. Text PAC to 65075 on EE to get it. Are you pay-monthly or pay-as-you-go?", time: "14:20", meta: "CLAUDE HAIKU · 220ms" },
      { from: "client", text: "Pay monthly. Still on contract till November.", time: "14:21", meta: "WEB" },
      { from: "agent", text: "Handing off — I'll walk you through the ETF and whether it's worth waiting. Give me two minutes.", time: "14:21", meta: "AGENT · Sam" },
    ],
  },
  {
    id: "c4", name: "Priya Patel", phone: "+44 7733 771208", city: "London · Wembley",
    channel: "wa", status: "bot", time: "14:12",
    preview: "Where's order #FH-2098?",
    score: 30, source: "Previous customer", firstSeen: "Aug 15, 09:14",
    tags: ["Order tracking"],
    messages: [
      { from: "client", text: "Where's order #FH-2098?", time: "14:12", meta: "WA" },
      { from: "bot", text: "Order #FH-2098 (Galaxy S25 FE · Jet Black) is out for delivery with DPD. Slot: 15:00–16:00 today. Track: dpd.co.uk/tracking/15501344.", time: "14:12", meta: "CLAUDE HAIKU · 190ms" },
    ],
  },
  {
    id: "c5", name: "Oliver Bennett", phone: "+44 7451 912873", city: "Leeds",
    channel: "web", status: "bot", time: "13:58",
    preview: "Pixel 10 Pro vs iPhone 17 for photography?",
    score: 71, source: "Google ad", firstSeen: "Aug 24, 13:52",
    tags: ["Pixel 10 Pro", "Comparing"],
    messages: [
      { from: "client", text: "Pixel 10 Pro vs iPhone 17 — which is better for photography?", time: "13:58", meta: "WEB" },
      { from: "bot", text: "Both excellent; Pixel edges night mode and computational zoom, iPhone wins video. Cheapest deals right now: Pixel 10 Pro £30/mo on Vodafone, iPhone 17 £42/mo on Three.", time: "13:58", meta: "CLAUDE HAIKU · 245ms",
        priceCard: { label: "Pixel 10 Pro · 128 GB · Obsidian", price: "£30.00 / mo", info: "£19 upfront · Vodafone\n100GB 5G · Unlimited", cta: "Reserve" } },
    ],
  },
  {
    id: "c6", name: "Ellie Robinson", phone: "+44 7305 558109", city: "Glasgow",
    channel: "wa", status: "closed", time: "13:41",
    preview: "Thanks — order confirmed ✓",
    score: 95, source: "Repeat customer", firstSeen: "May 12, 17:20",
    tags: ["Won", "Repeat"],
    messages: [
      { from: "client", text: "Thanks for the price match — order placed ✓", time: "13:41", meta: "WA" },
      { from: "bot", text: "Cheers! Order #FH-2101 confirmed. Dispatch email en route.", time: "13:41", meta: "CLAUDE HAIKU · 178ms" },
    ],
  },
  {
    id: "c7", name: "Daniel O'Connor", phone: "+44 7411 556720", city: "Bristol",
    channel: "wa", status: "human", time: "13:12",
    preview: "Want to upgrade early — still 3 months on contract",
    score: 48, source: "Direct WhatsApp", firstSeen: "Aug 24, 13:11",
    tags: ["Upgrade", "Early exit"],
    messages: [
      { from: "client", text: "Want to upgrade early. Still 3 months left on my contract.", time: "13:12", meta: "WA" },
      { from: "agent", text: "Sure — send me your current network + monthly, I'll price the early upgrade against your remaining months.", time: "13:12", meta: "AGENT · Sam" },
    ],
  },
];

export const stats = {
  activeNow: 3, queuedToday: 12, handledToday: 47,
  escalatedToday: 3, wonToday: 8, revenueToday: "£12,845",
};

export const shopProducts = [
  { label: "Three · 60GB Rolling SIM", price: "£10 / mo",   desc: "60 GB · Unlimited mins & texts · 30 days", id: "SIM-05231" },
  { label: "Three · 8GB 24m SIM",       price: "£8 / mo",   desc: "8 GB · Unlimited · £25 cashback",         id: "SIM-04120" },
  { label: "iPhone 17 · 256 GB",        price: "£44 / mo",   desc: "Vodafone · 400GB 5G · £29 upfront",       id: "DEV-1082" },
  { label: "Samsung Galaxy S25 FE",     price: "£28 / mo",   desc: "Three · 300GB 5G · £0 upfront",           id: "DEV-1091" },
];

/* ---------- LEADS ---------- */
export type LeadStatus = "hot" | "warm" | "cold" | "won" | "lost";
export const leads = [
  { id: "L-1042", name: "Amelia Clarke",   phone: "+44 7712 448291", city: "London",     interest: "iPhone 17 · 256GB",     source: "Meta ad",   score: 82, status: "hot"  as LeadStatus, updated: "14:32" },
  { id: "L-1041", name: "James Whitfield", phone: "+44 7801 456218", city: "Manchester", interest: "SIM-only unlimited",    source: "WhatsApp",  score: 64, status: "warm" as LeadStatus, updated: "14:28" },
  { id: "L-1040", name: "Oliver Bennett",  phone: "+44 7451 912873", city: "Leeds",      interest: "Pixel 10 Pro",          source: "Google ad", score: 71, status: "hot"  as LeadStatus, updated: "13:58" },
  { id: "L-1039", name: "Ellie Robinson",  phone: "+44 7305 558109", city: "Glasgow",    interest: "Repeat customer",       source: "Direct WA", score: 95, status: "won"  as LeadStatus, updated: "13:41" },
  { id: "L-1038", name: "Daniel O'Connor", phone: "+44 7411 556720", city: "Bristol",    interest: "Early upgrade",         source: "Direct WA", score: 48, status: "warm" as LeadStatus, updated: "13:12" },
  { id: "L-1037", name: "Priya Patel",     phone: "+44 7733 771208", city: "London",     interest: "Order tracking",        source: "Previous",  score: 30, status: "cold" as LeadStatus, updated: "14:12" },
  { id: "L-1036", name: "Callum Reid",     phone: "+44 7402 448920", city: "Edinburgh",  interest: "Galaxy S26",            source: "Meta ad",   score: 66, status: "warm" as LeadStatus, updated: "12:44" },
  { id: "L-1035", name: "Nadia Ahmed",     phone: "+44 7519 918230", city: "London",     interest: "iPad · Business",       source: "Website",   score: 55, status: "warm" as LeadStatus, updated: "12:22" },
  { id: "L-1034", name: "Owen Mitchell",   phone: "+44 7466 661278", city: "Cardiff",    interest: "5× SIM business plan",  source: "Referral",  score: 88, status: "hot"  as LeadStatus, updated: "11:58" },
  { id: "L-1033", name: "Rachel Sheppard", phone: "+44 7844 221094", city: "London",     interest: "iPhone 16e",            source: "Google ad", score: 42, status: "cold" as LeadStatus, updated: "11:30" },
  { id: "L-1032", name: "Sam Nawaz",       phone: "+44 7411 882341", city: "Sheffield",  interest: "Corporate 20-line plan", source: "LinkedIn", score: 78, status: "hot"  as LeadStatus, updated: "10:44" },
  { id: "L-1031", name: "Toby Adams",      phone: "+44 7590 918273", city: "London",     interest: "Refurb Pixel 9",        source: "Website",   score: 22, status: "lost" as LeadStatus, updated: "09:12" },
];

/* ---------- PLANS (SIM-only snapshot — full contract catalogue lives in plans.ts) ---------- */
export const plans = [
  { id: "P-01", network: "Three",      name: "Rolling 60GB",       price: "£10 / mo",  data: "60 GB",          duration: "30 days",  stock: 340 },
  { id: "P-02", network: "Three",      name: "24m SIM · 60GB",     price: "£11 / mo",  data: "60 GB + £60 cb", duration: "24 months", stock: 128 },
  { id: "P-03", network: "Three",      name: "24m SIM · 8GB",      price: "£8 / mo",   data: "8 GB + £25 cb",  duration: "24 months", stock: 264 },
  { id: "P-04", network: "Three",      name: "12m SIM · 15GB",     price: "£6.95 / mo", data: "15 GB",         duration: "12 months", stock: 890 },
  { id: "P-05", network: "Three",      name: "Rolling 6GB",        price: "£6 / mo",   data: "6 GB",           duration: "30 days",  stock: 1200 },
  { id: "P-06", network: "Vodafone",   name: "24m SIM · 100GB",    price: "£14 / mo",  data: "100 GB 5G",      duration: "24 months", stock: 189 },
  { id: "P-07", network: "Talkmobile", name: "24m SIM · 30GB",     price: "£8 / mo",   data: "30 GB",          duration: "24 months", stock: 540 },
  { id: "P-08", network: "SMARTY",     name: "Rolling Unlimited",  price: "£20 / mo",  data: "Unlimited",      duration: "30 days",  stock: 67 },
];

/* ---------- DEVICES (subset — the priced tariffs are in plans.ts) ---------- */
export const devices = [
  { id: "D-1082", brand: "Apple",   name: "iPhone 17",         storage: "256 GB", color: "Black",     price: "£999 SIM-free",  stock: 4 },
  { id: "D-1083", brand: "Apple",   name: "iPhone 17 Pro",     storage: "256 GB", color: "Silver",    price: "£1,099 SIM-free", stock: 2 },
  { id: "D-1084", brand: "Apple",   name: "iPhone 17 Pro Max", storage: "256 GB", color: "Deep Blue", price: "£1,199 SIM-free", stock: 3 },
  { id: "D-1085", brand: "Apple",   name: "iPhone 16",         storage: "128 GB", color: "Ultramarine", price: "£799 SIM-free", stock: 8 },
  { id: "D-1086", brand: "Apple",   name: "iPhone 15",         storage: "128 GB", color: "Blue",      price: "£699 SIM-free",  stock: 5 },
  { id: "D-1091", brand: "Samsung", name: "Galaxy S26 Ultra",  storage: "256 GB", color: "Black",     price: "£1,279 SIM-free", stock: 6 },
  { id: "D-1092", brand: "Samsung", name: "Galaxy S25 FE",     storage: "128 GB", color: "Jet Black", price: "£649 SIM-free",  stock: 12 },
  { id: "D-1093", brand: "Samsung", name: "Galaxy A17 5G",     storage: "128 GB", color: "Black",     price: "£199 SIM-free",  stock: 40 },
  { id: "D-1094", brand: "Samsung", name: "Galaxy Z Flip8",    storage: "512 GB", color: "Pink",      price: "£1,149 SIM-free", stock: 3 },
  { id: "D-1111", brand: "Google",  name: "Pixel 10",          storage: "128 GB", color: "Obsidian",  price: "£799 SIM-free",  stock: 7 },
  { id: "D-1112", brand: "Google",  name: "Pixel 10 Pro",      storage: "128 GB", color: "Obsidian",  price: "£999 SIM-free",  stock: 4 },
  { id: "D-1113", brand: "Google",  name: "Pixel 10a",         storage: "128 GB", color: "Obsidian",  price: "£499 SIM-free",  stock: 15 },
  { id: "D-1121", brand: "Apple",   name: "AirPods Pro 2",     storage: "USB-C",  color: "White",     price: "£229",           stock: 22 },
  { id: "D-1131", brand: "Samsung", name: "Galaxy Buds3",      storage: "—",      color: "Silver",    price: "£179",           stock: 15 },
];

/* ---------- TEAM ---------- */
export const team = [
  { id: "T-01", name: "Operations Lead", role: "Manager",      email: "ops@three.co.uk",    active: "Just now", handled: 0 },
  { id: "T-02", name: "Sam Whittaker",  role: "Senior Agent", email: "sam@three.co.uk",    active: "3 min",    handled: 14 },
  { id: "T-03", name: "Aisha Khan",     role: "Agent",        email: "aisha@three.co.uk",  active: "12 min",   handled: 22 },
  { id: "T-04", name: "Harry Ellis",    role: "Agent",        email: "harry@three.co.uk",  active: "1 hr",     handled: 11 },
  { id: "T-05", name: "Zara Ahmed",     role: "Logistics",    email: "zara@three.co.uk",   active: "3 hr",     handled: 0 },
];

/* ---------- KNOWLEDGE BASE ---------- */
export const kbArticles = [
  { id: "K-01", title: "Three 5G coverage checker",              category: "Networks", updated: "Aug 22", uses: 84 },
  { id: "K-02", title: "iPhone 17 range · pricing across networks", category: "Devices",  updated: "Aug 24", uses: 142 },
  { id: "K-03", title: "PAC codes and porting timelines (all UK networks)", category: "Porting", updated: "Aug 20", uses: 27 },
  { id: "K-04", title: "Klarna & PayPal Pay in 3 · upfront splits", category: "Payment", updated: "Aug 21", uses: 68 },
  { id: "K-05", title: "DPD / Royal Mail delivery slots",          category: "Logistics", updated: "Aug 23", uses: 213 },
  { id: "K-06", title: "Samsung warranty (UK) — what's covered",    category: "Devices",  updated: "Aug 12", uses: 44 },
  { id: "K-07", title: "14-day cooling-off period · returns",       category: "Policy",   updated: "Aug 05", uses: 19 },
  { id: "K-08", title: "Business SIMs · bulk pricing (5+ lines)",  category: "Plans",    updated: "Aug 18", uses: 8 },
  { id: "K-09", title: "Refurbished grading (Excellent / Good / Fair)", category: "Devices", updated: "Aug 15", uses: 31 },
  { id: "K-10", title: "Store hours + bank holiday cover",          category: "General",  updated: "Aug 24", uses: 6 },
];

/* ---------- BROADCASTS ---------- */
export type BroadcastStatus = "scheduled" | "sent" | "draft";
export const broadcasts = [
  { id: "B-01", title: "iPhone 17 launch — next-day delivery",       status: "scheduled" as BroadcastStatus, audience: 1245, sends: "Aug 25, 10:00" },
  { id: "B-02", title: "Back-to-school offers — 12 deals",           status: "scheduled" as BroadcastStatus, audience: 2810, sends: "Aug 26, 09:00" },
  { id: "B-03", title: "Bank holiday sale — up to £120 off",         status: "sent"      as BroadcastStatus, audience: 4028, sends: "Aug 22, 08:00" },
  { id: "B-04", title: "Weekly leaderboard — best SIM-only plans",   status: "sent"      as BroadcastStatus, audience: 892,  sends: "Aug 21, 18:00" },
  { id: "B-05", title: "Refurbished Pixel stock alert",              status: "draft"     as BroadcastStatus, audience: 0,    sends: "—" },
];

/* ---------- BOT PROMPT ---------- */
export const DEFAULT_BOT_PROMPT = `You are Ali Agent — a friendly, knowledgeable sales assistant for a UK mobile & SIM retailer that resells Fonehouse tariffs. You speak to shoppers on WhatsApp and the website widget.

RESPOND IN ENGLISH. Keep replies short — 1–2 sentences max unless quoting a full tariff or spec. British English (colour, mum, mobile).

WHAT YOU CAN DO
• Quote pay-monthly contracts across EE, O2, Vodafone, Three, Talkmobile, iD, SMARTY — pull the specific tariff from the plans.ts catalogue (monthly, upfront, data, mins, texts, contract length, April price rises)
• Quote SIM-only plans (rolling 30-day, 12-month, 24-month)
• Quote SIM-free (outright) and refurbished-phone prices
• Explain PAC-code porting timelines (usually 1 working day once the PAC lands)
• Offer Klarna Pay in 3 or PayPal Pay in 3 to split the upfront
• Check next-day dispatch (order before 5pm Mon–Fri, DPD / Royal Mail Tracked 24)

WHEN TO HAND OFF TO HUMAN
• Customer asks for a discount below the posted price
• Customer wants to escalate, complain, or return
• Question is outside phones / SIMs / accessories
• Customer explicitly asks for a human ("agent", "someone", "person")
• Early-upgrade quotes that need the current-contract ETF calculating
• After 10 back-and-forth messages without resolution

FORMATTING
• Prices in bold: **£44.00 / month**
• Data volumes in bold: **100 GB 5G**
• Deal name first, then network + monthly + upfront + contract length + data

NEVER
• Promise a discount, delivery time, or stock level you haven't checked
• Ask for card details, bank details, or a full address in chat (payment happens on the website)
• Recommend a competitor's retailer
• Invent a price or an April price-rise — if unsure, hand off
• Forget to disclose April 2027 / April 2028 price rises if the tariff has them`;
