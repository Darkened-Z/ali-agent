"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ThreeLogo } from "./ThreeLogo";

type PriceCard = { label: string; price: string; info: string; cta: string };
type Msg = {
  from: "client" | "bot";
  text: string;
  time: string;
  meta?: string;
  priceCard?: PriceCard;
};

const CANNED: { match: RegExp; reply: string }[] = [
  { match: /(iphone 18 pro|18 pro)/i, reply: "iPhone 18 Pro · Three Unlimited Airtime · Save up to **£1,035** when you trade in an eligible phone, with **Unlimited 5G data** and next-day DPD delivery." },
  { match: /(iphone 17 pro max|17 pro max)/i, reply: "iPhone 17 Pro Max 256 GB · Vodafone · **£58 / mo** · £129 upfront · 24 months · **400 GB 5G** · Unlimited mins & texts. Next-day delivery if you order before 5pm." },
  { match: /(iphone 17 pro|17 pro)/i, reply: "iPhone 17 Pro 256 GB Silver · Three · **£54 / mo** · £45 upfront · 24 months · **100 GB 5G** · Unlimited mins & texts. Price rises to £56.30 in Apr 2027, £58.60 in Apr 2028." },
  { match: /(iphone 17|iphon 17)/i, reply: "iPhone 17 256 GB · Three · **£42 / mo** · £25 upfront · 24 months · **100 GB 5G** · Unlimited mins & texts." },
  { match: /(sim only|sim-only|simo|23 a month)/i, reply: "Three Unlimited Data SIM: **£23.00 / mo** (24m, includes 12GB EU roaming in 49 destinations; rises to £25.30 Apr 27, £27.60 Apr 28), or Three 60GB Rolling 30-day SIM at **£10 / mo**." },
  { match: /(broadband|home broadband|18 a month)/i, reply: "Three 5G Home Broadband is **£18.00 / mo** on a 24-month plan (plus claim up to **£300** switch credit; rises to £21.50 Apr 27, £25.00 Apr 28). Plug-and-play, no engineer needed." },
  { match: /(refurb|used|second hand)/i, reply: "Refurbished Google Pixels from **£150** (Pixel 7a Good) up to **£490** (Pixel 10 256 GB Excellent). All SIM-free, graded and warranty-backed." },
  { match: /(port|pac|mnp)/i, reply: "Porting takes 1 working day once we have your PAC. Text **PAC to 65075** — reply here with the code and I'll set it up." },
  { match: /(human|agent|person|someone|advisor)/i, reply: "Handing you over now — an advisor will pick this up in under a minute. Anything else you want me to include in the summary?" },
];

const DEFAULT_REPLY =
  "One sec — pulling that up. Meanwhile, are you after a **Pay Monthly phone**, an **Unlimited SIM**, **Home Broadband**, or **switching** your number?";

const SUGGEST = [
  "iPhone 17 on Three",
  "Unlimited SIM £23/mo",
  "Home Broadband £18/mo",
  "Talk to human",
];

const OPENING: Msg[] = [
  {
    from: "bot",
    text: "Hi! Welcome to Three · Ali Agent. Ask me about Pay Monthly phones, Unlimited SIMs, 5G Home Broadband, or switching your number.",
    time: "Just now",
  },
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
      // fallback
    }
  }, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = useCallback(
    async (text: string) => {
      const t = text.trim();
      if (!t || typing) return;
      setInput("");
      const now = new Date().toTimeString().slice(0, 5);
      const nextClient: Msg = { from: "client", text: t, time: now };

      let currentMessages: Msg[] = [];
      setMessages(m => {
        currentMessages = [...m, nextClient];
        return currentMessages;
      });
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
    },
    [messages, sessionId, typing]
  );

  // Listen for custom "ali-open-chat" events from any deal card on the Three storefront
  useEffect(() => {
    const onOpenChat = (e: Event) => {
      const detail = (e as CustomEvent<{ prompt?: string }>).detail;
      setOpen(true);
      if (detail?.prompt) {
        setTimeout(() => {
          send(detail.prompt!);
        }, 80);
      }
    };
    window.addEventListener("ali-open-chat", onOpenChat);
    return () => window.removeEventListener("ali-open-chat", onOpenChat);
  }, [send]);

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
      <button
        className="widget-closed"
        onClick={() => setOpen(true)}
        aria-label="Open chat"
        style={{
          borderRadius: 999,
          padding: "12px 20px 12px 14px",
          background: "#000",
          color: "#fff",
          border: "2px solid #ff8474",
          boxShadow: "0 12px 32px rgba(0,0,0,0.22)",
        }}
      >
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ff7b67, #ffaba9)",
            color: "#000",
            display: "grid",
            placeItems: "center",
          }}
        >
          <ThreeLogo size={20} fill="#000" />
        </span>
        <span className="text">
          Chat with Three AI
          <small style={{ color: "#ffaba9" }}>Live · Replies in ~2 sec</small>
        </span>
      </button>
    );
  }

  return (
    <div
      className="widget-open"
      role="dialog"
      aria-label="Chat"
      style={{
        borderRadius: 24,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.14)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.24)",
      }}
    >
      <div
        className="widget-head"
        style={{
          background: "linear-gradient(90deg, #ff7b67, #ff8474 45%, #ffaba9)",
          color: "#000",
          borderBottom: "none",
          padding: "14px 16px",
        }}
      >
        <div
          className="avatar"
          style={{
            background: "#fff",
            color: "#000",
            borderRadius: "50%",
            width: 34,
            height: 34,
          }}
        >
          <ThreeLogo size={22} fill="#000" />
        </div>
        <div>
          <div className="who" style={{ fontWeight: 700, color: "#000" }}>
            Three · Ali Agent AI
          </div>
          <div className="status" style={{ color: "#000", opacity: 0.8 }}>
            <span className="dot" style={{ background: "#000" }} />
            Online · UK 5G Specialist
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <button
            onClick={resetChat}
            title="Start new chat"
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#000",
              border: "1px solid rgba(0,0,0,0.25)",
              borderRadius: 999,
              padding: "3px 8px",
            }}
          >
            New
          </button>
          <button onClick={() => setOpen(false)} aria-label="Close" style={{ color: "#000", fontSize: 18 }}>
            ×
          </button>
        </div>
      </div>
      <div className="widget-body" ref={bodyRef}>
        {messages.map((m, i) => (
          <div key={i} className={"msg from-" + m.from}>
            <div
              className="msg-bubble"
              style={{
                borderRadius: m.from === "client" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              }}
            >
              {renderBold(m.text)}
              {m.priceCard && (
                <div className="price-card" style={{ marginTop: 8, padding: 8, gap: 8, borderRadius: 12 }}>
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
            <div className="msg-bubble" style={{ opacity: 0.6, borderRadius: 16 }}>typing…</div>
          </div>
        )}
      </div>
      <div className="widget-suggest">
        {SUGGEST.map(s => (
          <button
            key={s}
            onClick={() => send(s)}
            style={{ borderRadius: 999, fontSize: 11, padding: "5px 12px" }}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="widget-foot">
        <input
          placeholder="Ask about phones, SIMs, broadband…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send(input)}
        />
        <button
          className="send"
          onClick={() => send(input)}
          disabled={!input.trim()}
          aria-label="Send"
          style={{ borderRadius: "50%", background: "#000", color: "#fff" }}
        >
          →
        </button>
      </div>
      <div className="widget-brand">THREE UK · POWERED BY ALI AGENT · {sessionId.toUpperCase()}</div>
    </div>
  );
}
