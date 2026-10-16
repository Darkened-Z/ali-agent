"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ThreeLogo } from "./ThreeLogo";

type PriceCard = { label: string; price: string; info: string; cta: string };
type Msg = {
  from: "client" | "bot" | "agent";
  text: string;
  time: string;
  meta?: string;
  priceCard?: PriceCard;
};

const SUGGEST = [
  "iPhone 17 on Three",
  "Unlimited SIM £23/mo",
  "Home Broadband £18/mo",
  "Talk to human",
];

const SESSION_RE = /^web-[0-9a-f-]{36}$/i;
const newSessionId = () => "web-" + crypto.randomUUID();
const POLL_MS = 4000;

const OPENING: Msg[] = [
  {
    from: "bot",
    text: "Hi! Welcome to Three · ProxyTech. Ask me about Pay Monthly phones, Unlimited SIMs, 5G Home Broadband, or switching your number.",
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
  const serverCount = useRef(0);
  const handoffShown = useRef(false);

  // Restore this visitor's thread after a reload, then keep picking up staff replies.
  useEffect(() => {
    if (!SESSION_RE.test(sessionId)) return;
    let cancelled = false;
    serverCount.current = 0;
    fetch(`/api/chat/session?id=${encodeURIComponent(sessionId)}&after=0`, { cache: "no-store" })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (cancelled || !data) return;
        serverCount.current = data.total;
        if (data.messages.length) {
          setMessages([
            ...OPENING,
            ...data.messages.map((m: Msg) => ({ ...m, meta: m.from === "agent" ? "ADVISOR" : undefined })),
          ]);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    if (!open || !SESSION_RE.test(sessionId)) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/chat/session?id=${encodeURIComponent(sessionId)}&after=${serverCount.current}`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const data = await res.json();
        serverCount.current = data.total;
        const fromStaff: Msg[] = data.messages
          .filter((m: Msg) => m.from === "agent")
          .map((m: Msg) => ({ ...m, meta: "ADVISOR" }));
        if (fromStaff.length) setMessages(m => [...m, ...fromStaff]);
      } catch {
        // next tick retries
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [open, sessionId]);

  useEffect(() => {
    try {
      let sid = localStorage.getItem("ali-widget-session");
      if (!sid || !SESSION_RE.test(sid)) {
        sid = newSessionId();
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
        .filter(m => m.text.trim() && m.meta !== "NOT SENT")
        .slice(-30)
        .map(m => ({
          role: m.from === "client" ? ("user" as const) : ("assistant" as const),
          content: m.text.slice(0, 4000),
        }));

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sessionId, messages: history }),
        });

        if (res.status === 429) throw new Error((await res.json()).error);
        if (!res.ok || !res.body) throw new Error("Sorry, I couldn't connect just now — please try again.");

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
            } else if (event === "done" && data.handoff) {
              const show = !handoffShown.current;
              handoffShown.current = true;
              serverCount.current += 1;
              setMessages(m =>
                show
                  ? m.map((msg, i) => (i === index ? { ...msg, text: data.notice, meta: "ADVISOR" } : msg))
                  : m.filter((_, i) => i !== index)
              );
            } else if (event === "done") {
              serverCount.current += 2;
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
      } catch (err) {
        const reply =
          err instanceof Error && err.message ? err.message : "Sorry, I couldn't connect just now — please try again.";
        setMessages(m => {
          const last = m[m.length - 1];
          const note: Msg = { from: "bot", text: reply, time: now, meta: "NOT SENT" };
          return last?.from === "bot" && last.text === "" ? [...m.slice(0, -1), note] : [...m, note];
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
    const nextSid = newSessionId();
    handoffShown.current = false;
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
            Three · ProxyTech AI
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
      <div className="widget-brand">THREE UK · POWERED BY PROXYTECH · {sessionId.toUpperCase()}</div>
    </div>
  );
}
