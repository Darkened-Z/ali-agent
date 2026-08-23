"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { from: "client" | "bot"; text: string; time: string; meta?: string };

const CANNED: { match: RegExp; reply: string }[] = [
  { match: /(iphone 17 pro max|17 pro max)/i, reply: "iPhone 17 Pro Max 256 GB · Vodafone · **£58 / mo** · £129 upfront · 24 months · **400 GB 5G** · Unlimited mins & texts. Next-day delivery if you order before 5pm." },
  { match: /(iphone 17 pro|17 pro)/i, reply: "iPhone 17 Pro 256 GB Silver · Three · **£54 / mo** · £45 upfront · 24 months · **100 GB 5G** · Unlimited mins & texts. Price rises to £56.30 in Apr 2027, £58.60 in Apr 2028." },
  { match: /(iphone 17e|17e)/i, reply: "iPhone 17e 256 GB · Vodafone · **£32 / mo** · £19 upfront · 24 months · **100 GB 5G** · Unlimited mins & texts." },
  { match: /(iphone 17|iphon 17)/i, reply: "iPhone 17 256 GB Black · Vodafone · **£44 / mo** · £29 upfront · 24 months · **400 GB 5G** · Unlimited mins & texts." },
  { match: /(iphone 16e|16e)/i, reply: "iPhone 16e 128 GB Black · Three · **£26 / mo** · £19 upfront · 24 months · **100 GB 5G** · Unlimited." },
  { match: /(iphone 16|iphon 16)/i, reply: "iPhone 16 128 GB Black · Vodafone · **£35 / mo** · £39 upfront · 24 months · **100 GB 5G** · Unlimited. Cheapest Three offer £35 / mo with **Unlimited data**." },
  { match: /(iphone 15|iphon 15)/i, reply: "iPhone 15 128 GB Blue · Vodafone · **£30 / mo** · £19 upfront · 24 months · **100 GB 5G** · Unlimited mins & texts." },
  { match: /(iphone air|air)/i, reply: "iPhone Air 256 GB Space Black · Vodafone · **£44 / mo** · £19 upfront · 24 months · **100 GB 5G** · Unlimited." },
  { match: /(iphone 13|iphon 13)/i, reply: "iPhone 13 5G 128 GB Starlight · Three · **£27 / mo** · £0 upfront · 24 months · **300 GB 5G** · Unlimited. Great back-to-school pick." },
  { match: /(s26 ultra|galaxy s26 ultra)/i, reply: "Galaxy S26 Ultra 256 GB Black · Three · **£46 / mo** · £39 upfront · 24 months · **Unlimited 5G** · Unlimited mins & texts." },
  { match: /(s26\+|s26 plus)/i, reply: "Galaxy S26+ 256 GB Black · Vodafone · **£46 / mo** · £25 upfront · 24 months · **200 GB 5G** · Unlimited." },
  { match: /(s25 fe|s25fe|galaxy s25 fe)/i, reply: "Galaxy S25 FE 128 GB Jet Black · Three · **£28 / mo** · £0 upfront · 24 months · **300 GB 5G** · Unlimited. Free gift included." },
  { match: /(s26|galaxy s26)/i, reply: "Galaxy S26 256 GB Black · Vodafone · **£36 / mo** · £25 upfront · 24 months · **100 GB 5G** · Unlimited." },
  { match: /(s25|galaxy s25)/i, reply: "Galaxy S25 128 GB Silver Shadow · Three · **£28 / mo** · £19 upfront · 24 months · **300 GB 5G** · Unlimited. Free gift on this deal." },
  { match: /(z flip|zflip|flip8|flip7)/i, reply: "Galaxy Z Flip7 256 GB Jet Black · Vodafone · **£39 / mo** · £39 upfront · 24 months · **Unlimited 5G** · Unlimited mins & texts." },
  { match: /(a17|galaxy a17)/i, reply: "Galaxy A17 5G 128 GB Black · Three · **£12 / mo** · £0 upfront · 24 months · **300 GB 5G** · Unlimited. Cheapest 5G phone-and-tariff we've got." },
  { match: /(a26|galaxy a26)/i, reply: "Galaxy A26 256 GB Black · Three · **£17 / mo** · £0 upfront · 24 months · **400 GB 5G** · Unlimited." },
  { match: /(a37|galaxy a37)/i, reply: "Galaxy A37 256 GB Awesome Charcoal · Three · **£26 / mo** · £0 upfront · 24 months · **100 GB 5G** · Unlimited." },
  { match: /(a57|galaxy a57)/i, reply: "Galaxy A57 256 GB Awesome Navy · Vodafone · **£25 / mo** · £19 upfront · 24 months · **100 GB 5G** · Unlimited." },
  { match: /(pixel 11 pro xl)/i, reply: "Pixel 11 Pro XL 256 GB Obsidian · Vodafone · **£68 / mo** · £45 upfront · 24 months · **400 GB 5G** · Unlimited." },
  { match: /(pixel 11 pro)/i, reply: "Pixel 11 Pro 256 GB · Vodafone · **£59 / mo** · £39 upfront · 24 months · **Unlimited 5G** · Unlimited mins & texts. (Olive is currently out of stock.)" },
  { match: /(pixel 11)/i, reply: "Pixel 11 256 GB Hibiscus · Vodafone · **£47 / mo** · £15 upfront · 24 months · **100 GB 5G** · Unlimited." },
  { match: /(pixel 10 pro xl)/i, reply: "Pixel 10 Pro XL 256 GB Obsidian · Three · **£37 / mo** · £49 upfront · 24 months · **Unlimited 5G** · Unlimited." },
  { match: /(pixel 10 pro)/i, reply: "Pixel 10 Pro 128 GB Obsidian · Vodafone · **£30 / mo** · £19 upfront · 24 months · **100 GB 5G** · Unlimited." },
  { match: /(pixel 10a)/i, reply: "Pixel 10a 128 GB Obsidian · Three · **£24 / mo** · £0 upfront · 24 months · **100 GB 5G** · Unlimited." },
  { match: /(pixel 10)/i, reply: "Pixel 10 128 GB Obsidian · Vodafone · **£25 / mo** · £0 upfront · 24 months · **100 GB 5G** · Unlimited mins & texts." },
  { match: /(pixel 9a)/i, reply: "Pixel 9a 128 GB Obsidian · Three · **£19 / mo** · £0 upfront · 24 months · **100 GB 5G** · Unlimited." },
  { match: /(sim only|sim-only|simo)/i, reply: "Cheapest SIM-only right now: Three rolling 30-day, **60 GB 5G**, unlimited mins & texts, **£10 / mo**, no upfront. Or a 24-month at £8 / mo (8 GB) with £25 cashback." },
  { match: /(refurb|used|second hand)/i, reply: "Refurbished Google Pixels from **£150** (Pixel 7a Good) up to **£490** (Pixel 10 256 GB Excellent). All SIM-free, graded and warranty-backed." },
  { match: /(sim free|sim-free|outright|unlocked)/i, reply: "SIM-free from **£79** (Doro Leva E10) up to **£1,656.99** (Samsung Z Fold8 512 GB). Pixel 10 £799, Pixel 10 Pro £999, iPhone 17 £999." },
  { match: /(port|pac|mnp)/i, reply: "Porting takes 1 working day once we have your PAC. Text **PAC to 65075** (EE), 65075 (Three), 65075 (O2) or 65075 (Vodafone) — reply here with the code and I'll set it up." },
  { match: /(klarna|paypal|split|installment|instalment|finance)/i, reply: "You can split the upfront with **Klarna Pay in 3** or **PayPal Pay in 3** at checkout — three interest-free payments, no fee if paid on time." },
  { match: /(delivery|shipping|dispatch|when will|how long)/i, reply: "Order before **5pm Mon–Fri** and it ships next working day via DPD or Royal Mail Tracked 24. Free on every contract." },
  { match: /(price|cost|how much|cheapest)/i, reply: "Which model or plan? Drop the name (e.g. 'iPhone 17', 'SIM only', 'Pixel 10') and I'll pull the current price." },
  { match: /(human|agent|person|someone|advisor)/i, reply: "Handing you over now — an advisor will pick this up in under a minute. Anything else you want me to include in the summary?" },
  { match: /(hello|hi|hey|morning|afternoon|evening)/i, reply: "Hi! What can I help with — a new phone, a SIM-only plan, porting your number, or an order update?" },
];

const DEFAULT_REPLY =
  "One sec — pulling that up. Meanwhile, are you after a **new phone**, a **SIM-only plan**, or **porting** your number?";

const SUGGEST = ["Cheapest iPhone 17 deal", "SIM only unlimited", "Refurbished Pixel", "Talk to human"];

const OPENING: Msg[] = [
  { from: "bot", text: "Hey — I'm Ali Agent. What can I help with today?", time: "Just now" },
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(OPENING);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t) return;
    setInput("");
    const now = "Just now";
    const nextClient: Msg = { from: "client", text: t, time: now };
    setMessages(m => [...m, nextClient]);
    setTyping(true);

    // Build history for the API — canonical (role, content) with the new user turn included.
    const history = [...messages, nextClient]
      .filter(m => m.from === "client" || m.from === "bot")
      .map(m => ({ role: m.from === "client" ? "user" as const : "assistant" as const, content: m.text }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      // Insert an empty bot bubble we'll stream tokens into.
      let index = -1;
      setMessages(m => {
        index = m.length;
        return [...m, { from: "bot", text: "", time: now, meta: "CLAUDE HAIKU" }];
      });
      setTyping(false);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";
        for (const frame of frames) {
          const lines = frame.split("\n");
          const eventLine = lines.find(l => l.startsWith("event:"));
          const dataLine = lines.find(l => l.startsWith("data:"));
          if (!eventLine || !dataLine) continue;
          const event = eventLine.slice(6).trim();
          const data = JSON.parse(dataLine.slice(5).trim());

          if (event === "token") {
            acc += data.text;
            const snapshot = acc;
            setMessages(m => m.map((msg, i) => (i === index ? { ...msg, text: snapshot } : msg)));
          } else if (event === "done") {
            setMessages(m => m.map((msg, i) =>
              i === index ? { ...msg, meta: `CLAUDE HAIKU · ${data.latencyMs}ms` } : msg
            ));
          } else if (event === "error") {
            throw new Error(data.message);
          }
        }
      }
    } catch (err) {
      // Fallback to canned reply (dev without API key, or transient failure)
      const hit = CANNED.find(c => c.match.test(t));
      const reply = hit ? hit.reply : DEFAULT_REPLY;
      const meta = err instanceof Error && err.message.includes("503") ? "OFFLINE · CANNED" : "FALLBACK · CANNED";
      setMessages(m => {
        // If a streaming bubble was inserted, replace it; otherwise append.
        const last = m[m.length - 1];
        if (last?.from === "bot" && last.text === "") {
          return [...m.slice(0, -1), { from: "bot", text: reply, time: now, meta }];
        }
        return [...m, { from: "bot", text: reply, time: now, meta }];
      });
      setTyping(false);
    }
  };

  const renderBold = (t: string) => {
    // simple **bold** → <strong> for the demo
    const parts = t.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**")
        ? <strong key={i} className="mono">{p.slice(2, -2)}</strong>
        : <span key={i}>{p}</span>
    );
  };

  if (!open) {
    return (
      <button className="widget-closed" onClick={() => setOpen(true)} aria-label="Open chat">
        <span className="dot" aria-hidden="true" />
        <span className="text">
          Chat with us
          <small>Reply in ~30 sec</small>
        </span>
      </button>
    );
  }

  return (
    <div className="widget-open" role="dialog" aria-label="Chat">
      <div className="widget-head">
        <div className="avatar">A</div>
        <div>
          <div className="who">Ali Agent</div>
          <div className="status"><span className="dot" />Online · AI</div>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Close">×</button>
      </div>
      <div className="widget-body" ref={bodyRef}>
        {messages.map((m, i) => (
          <div key={i} className={"msg from-" + m.from}>
            <div className="msg-bubble">{renderBold(m.text)}</div>
            <div className="msg-meta">{m.time}{m.meta ? " · " + m.meta : ""}</div>
          </div>
        ))}
        {typing && (
          <div className="msg from-bot">
            <div className="msg-bubble" style={{ opacity: 0.6 }}>typing…</div>
          </div>
        )}
      </div>
      <div className="widget-suggest">
        {SUGGEST.map(s => (
          <button key={s} onClick={() => send(s)}>{s}</button>
        ))}
      </div>
      <div className="widget-foot">
        <input
          placeholder="Type your message…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send(input)}
        />
        <button className="send" onClick={() => send(input)} disabled={!input.trim()} aria-label="Send">→</button>
      </div>
      <div className="widget-brand">POWERED BY ALI AGENT</div>
    </div>
  );
}
