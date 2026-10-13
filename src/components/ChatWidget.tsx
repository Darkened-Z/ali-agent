"use client";

import { useEffect, useRef, useState } from "react";

type PriceCard = { label: string; price: string; info: string; cta: string };
type Msg = {
  from: "client" | "bot";
  text: string;
  time: string;
  meta?: string;
  priceCard?: PriceCard;
};

const CANNED: { match: RegExp; reply: string }[] = [
  { match: /(iphone 17 pro max|17 pro max)/i, reply: "iPhone 17 Pro Max 256 GB · Vodafone · **£58 / mo** · £129 upfront · 24 months · **400 GB 5G** · Unlimited mins & texts. Next-day delivery if you order before 5pm." },
  { match: /(iphone 17 pro|17 pro)/i, reply: "iPhone 17 Pro 256 GB Silver · Three · **£54 / mo** · £45 upfront · 24 months · **100 GB 5G** · Unlimited mins & texts. Price rises to £56.30 in Apr 2027, £58.60 in Apr 2028." },
  { match: /(iphone 17e|17e)/i, reply: "iPhone 17e 256 GB · Vodafone · **£32 / mo** · £19 upfront · 24 months · **100 GB 5G** · Unlimited mins & texts." },
  { match: /(iphone 17|iphon 17)/i, reply: "iPhone 17 256 GB Black · Vodafone · **£44 / mo** · £29 upfront · 24 months · **400 GB 5G** · Unlimited mins & texts." },
  { match: /(sim only|sim-only|simo)/i, reply: "Cheapest SIM-only right now: Three rolling 30-day, **60 GB 5G**, unlimited mins & texts, **£10 / mo**, no upfront. Or a 24-month at £8 / mo (8 GB) with £25 cashback." },
  { match: /(refurb|used|second hand)/i, reply: "Refurbished Google Pixels from **£150** (Pixel 7a Good) up to **£490** (Pixel 10 256 GB Excellent). All SIM-free, graded and warranty-backed." },
  { match: /(port|pac|mnp)/i, reply: "Porting takes 1 working day once we have your PAC. Text **PAC to 65075** — reply here with the code and I'll set it up." },
  { match: /(human|agent|person|someone|advisor)/i, reply: "Handing you over now — an advisor will pick this up in under a minute. Anything else you want me to include in the summary?" },
];

const DEFAULT_REPLY =
  "One sec — pulling that up. Meanwhile, are you after a **new phone**, a **SIM-only plan**, or **porting** your number?";

const SUGGEST = ["Cheapest iPhone 17 deal", "SIM only unlimited", "Refurbished Pixel", "Talk to human"];

const OPENING: Msg[] = [
  { from: "bot", text: "Hey — I'm Ali Agent. What can I help with today?", time: "Just now" },
];

export function ChatWidget({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<Msg[]>(OPENING);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>("web-demo");
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      let sid = localStorage.getItem("ali-widget-session");
      if (!sid) {
        sid = "web-" + Math.random().toString(36).slice(2, 8);
        localStorage.setItem("ali-widget-session", sid);
      }
      setSessionId(sid);
    } catch {
      // fallback to default sessionId
    }
  }, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const resetChat = () => {
    const nextSid = "web-" + Math.random().toString(36).slice(2, 8);
    try {
      localStorage.setItem("ali-widget-session", nextSid);
    } catch {
      // ignore
    }
    setSessionId(nextSid);
    setMessages(OPENING);
  };

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || typing) return;
    setInput("");
    const now = new Date().toTimeString().slice(0, 5);
    const nextClient: Msg = { from: "client", text: t, time: now };
    setMessages(m => [...m, nextClient]);
    setTyping(true);

    const history = [...messages, nextClient]
      .filter(m => m.from === "client" || m.from === "bot")
      .map(m => ({
        role: m.from === "client" ? ("user" as const) : ("assistant" as const),
        content: m.text,
      }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId, messages: history }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      let index = -1;
      setMessages(m => {
        index = m.length;
        return [...m, { from: "bot", text: "", time: now, meta: "STREAMING…" }];
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
            setMessages(m =>
              m.map((msg, i) =>
                i === index
                  ? {
                      ...msg,
                      meta: data.meta || `CLAUDE HAIKU · ${data.latencyMs}ms`,
                      priceCard: data.priceCard,
                    }
                  : msg
              )
            );
            window.dispatchEvent(new Event("ali-store-updated"));
          } else if (event === "error") {
            throw new Error(data.message);
          }
        }
      }
    } catch {
      const hit = CANNED.find(c => c.match.test(t));
      const reply = hit ? hit.reply : DEFAULT_REPLY;
      setMessages(m => {
        const last = m[m.length - 1];
        if (last?.from === "bot" && last.text === "") {
          return [...m.slice(0, -1), { from: "bot", text: reply, time: now, meta: "FALLBACK · CANNED" }];
        }
        return [...m, { from: "bot", text: reply, time: now, meta: "FALLBACK · CANNED" }];
      });
      setTyping(false);
    }
  };

  const renderBold = (t: string) => {
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
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <button
            onClick={resetChat}
            title="Start new chat"
            style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}
          >
            New
          </button>
          <button onClick={() => setOpen(false)} aria-label="Close">×</button>
        </div>
      </div>
      <div className="widget-body" ref={bodyRef}>
        {messages.map((m, i) => (
          <div key={i} className={"msg from-" + m.from}>
            <div className="msg-bubble">
              {renderBold(m.text)}
              {m.priceCard && (
                <div className="price-card" style={{ marginTop: 8, padding: 8, gap: 8 }}>
                  <div>
                    <div className="label" style={{ fontSize: 9 }}>{m.priceCard.label}</div>
                    <div className="price" style={{ fontSize: 14 }}>{m.priceCard.price}</div>
                  </div>
                  <div className="info" style={{ fontSize: 10 }}>
                    {m.priceCard.info.split("\n").map((l, j) => <div key={j}>{l}</div>)}
                  </div>
                </div>
              )}
            </div>
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
      <div className="widget-brand">POWERED BY ALI AGENT · SESSION {sessionId.toUpperCase()}</div>
    </div>
  );
}
