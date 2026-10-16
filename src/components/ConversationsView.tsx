"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  conversations as initialConversations,
  team as initialTeam,
  type Conversation,
  type ConvStatus,
} from "@/lib/mockData";

type ExtendedConversation = Conversation & { assignee?: string };

const renderBold = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part
  );

const TEMPLATES = [
  "Sending the Klarna Pay-in-3 checkout link now — takes ~2 min. Which delivery slot works best tomorrow?",
  "To port your number, text PAC to 65075 (free) and reply here with your 9-character code.",
  "Order confirmed! Your parcel ships today via DPD Next-Day — you'll get a 1-hour slot SMS by 9am.",
  "I've checked with our pricing desk and we can match that tariff for you today. Ready to reserve?",
];

export function ConversationsView() {
  const [list, setList] = useState<ExtendedConversation[]>(initialConversations);
  const [teamList, setTeamList] = useState(initialTeam);
  const [stats, setStats] = useState({ handledToday: 47, escalatedToday: 3 });
  const [activeId, setActiveId] = useState<string>(initialConversations[0].id);
  const [threadOpen, setThreadOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [replyText, setReplyText] = useState<string>("");
  const [noteMode, setNoteMode] = useState<boolean>(false);
  const [showAssignMenu, setShowAssignMenu] = useState<boolean>(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [sendError, setSendError] = useState("");

  const searchRef = useRef<HTMLInputElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.conversations) && data.conversations.length > 0) {
        setList(data.conversations);
      }
      if (data.stats) {
        setStats({
          handledToday: data.stats.handledToday,
          escalatedToday: data.stats.escalatedToday,
        });
      }
      if (Array.isArray(data.team)) {
        setTeamList(data.team);
      }
    } catch {
      // keep existing state
    }
  }, []);

  useEffect(() => {
    loadConversations();
    const onUpdate = () => loadConversations();
    window.addEventListener("ali-store-updated", onUpdate);
    // New customer messages arrive server-side; refresh the inbox while the tab is visible.
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") loadConversations();
    }, 5000);
    return () => {
      window.removeEventListener("ali-store-updated", onUpdate);
      clearInterval(timer);
    };
  }, [loadConversations]);

  // ⌘K / Ctrl+K shortcut to focus search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const active =
    list.find(c => c.id === activeId) || list[0] || initialConversations[0];

  useEffect(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [active?.id, active?.messages?.length]);

  const filters = [
    { key: "all", label: "All", count: list.length },
    { key: "bot", label: "Bot", count: list.filter(c => c.status === "bot").length },
    { key: "waiting", label: "Waiting", count: list.filter(c => c.status === "waiting").length },
    { key: "human", label: "With agent", count: list.filter(c => c.status === "human").length },
    { key: "closed", label: "Closed", count: list.filter(c => c.status === "closed").length },
  ];

  const visible = list.filter(c => {
    const matchesStatus = filter === "all" || c.status === filter;
    if (!matchesStatus) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.preview.toLowerCase().includes(q) ||
      (c.tags || []).some(t => t.toLowerCase().includes(q))
    );
  });

  const updateConvStatus = async (status: ConvStatus) => {
    if (!active) return;
    const res = await fetch("/api/conversations", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ conversationId: active.id, status }),
    });
    if (res.ok) {
      await loadConversations();
      window.dispatchEvent(new Event("ali-store-updated"));
    }
  };

  const assignAgent = async (assignee: string) => {
    setShowAssignMenu(false);
    if (!active) return;
    const res = await fetch("/api/conversations", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ conversationId: active.id, assignee }),
    });
    if (res.ok) {
      await loadConversations();
      window.dispatchEvent(new Event("ali-store-updated"));
    }
  };

  const sendReply = async () => {
    const t = replyText.trim();
    if (!t || !active || sending) return;
    setSending(true);
    setSendError("");
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          conversationId: active.id,
          text: t,
          from: "agent",
          isNote: noteMode,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok || data.deliveryError) {
        setReplyText("");
        setNoteMode(false);
        await loadConversations();
        window.dispatchEvent(new Event("ali-store-updated"));
      }
      if (data.deliveryError) setSendError(data.deliveryError);
      else if (!res.ok) setSendError(data.error || "Couldn't send that message.");
    } finally {
      setSending(false);
    }
  };

  const suggestedReply = TEMPLATES[0];

  return (
    <div className="dash-main">
      <div className="dash-head">
        <h2>
          Conversations
          <span>
            Today · {stats.handledToday} handled · {stats.escalatedToday} escalated
          </span>
        </h2>
        <div className="dash-search">
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, phone or message"
          />
          {search ? (
            <button
              onClick={() => setSearch("")}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--muted)",
                cursor: "pointer",
                fontSize: 11,
              }}
            >
              ×
            </button>
          ) : (
            <kbd>⌘K</kbd>
          )}
        </div>
      </div>

      <div className={"dash-work" + (threadOpen ? " thread-open" : "")}>
        <div className="col">
          <div className="conv-filters">
            {filters.map(f => (
              <button
                key={f.key}
                className={"chip " + (filter === f.key ? "on" : "")}
                onClick={() => setFilter(f.key)}
              >
                {f.label} <span className="mono" style={{ opacity: 0.7 }}>{f.count}</span>
              </button>
            ))}
          </div>
          <div className="conv-list">
            {visible.map(c => (
              <button
                key={c.id}
                className={"conv " + (active.id === c.id ? "active" : "")}
                onClick={() => {
                  setActiveId(c.id);
                  setThreadOpen(true);
                }}
              >
                <div className="conv-top">
                  <span className="conv-name">{c.name}</span>
                  <span className="conv-time">{c.time}</span>
                </div>
                <div className="conv-msg">{c.preview}</div>
                <div className="conv-meta">
                  <span className="conv-channel">
                    {c.channel === "wa" ? "WhatsApp" : "Web Chat"}{c.city ? ` · ${c.city}` : ""}
                  </span>
                  <span style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    {c.status === "waiting" && <span className="status-badge waiting">Waiting</span>}
                    {c.status === "human" && <span className="status-badge human">Agent</span>}
                    {c.isNew && <span className="status-badge new">New</span>}
                  </span>
                </div>
              </button>
            ))}
            {visible.length === 0 && (
              <div style={{ padding: 24, fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
                No conversations match that filter.
              </div>
            )}
          </div>
        </div>

        <div className="col">
          <div className="thread-head">
            <button className="btn sm mobile-only" onClick={() => setThreadOpen(false)} aria-label="Back to conversations">
              ← Back
            </button>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="thread-title" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {active.name}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 3, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span className={"badge " + (active.channel === "wa" ? "wa" : "web")}>
                  {active.channel === "wa" ? "WhatsApp" : "Web chat"}
                </span>
                <span className="mono" style={{ whiteSpace: "nowrap" }}>{active.phone}</span>
                {active.city && <span>· {active.city}</span>}
                {active.status === "waiting" && (
                  <span style={{ color: "var(--warn)", fontWeight: 600 }}>· Waiting for an agent</span>
                )}
              </div>
            </div>

            <div className="thread-actions">
              <button
                className="btn primary"
                onClick={() => updateConvStatus(active.status === "human" ? "bot" : "human")}
              >
                {active.status === "human" ? "Hand back to bot" : "Take over"}
              </button>
              <button
                className="btn"
                onClick={() => updateConvStatus(active.status === "waiting" ? "bot" : "waiting")}
              >
                {active.status === "waiting" ? "Resume bot" : "Pause bot"}
              </button>
              {active.status !== "closed" && (
                <button className="btn" onClick={() => updateConvStatus("closed")}>
                  Resolve
                </button>
              )}
              <button
                className="btn ghost"
                title="Delete this conversation"
                onClick={async () => {
                  if (!confirm(`Delete conversation with ${active.name}?`)) return;
                  await fetch(`/api/conversations?id=${encodeURIComponent(active.id)}`, { method: "DELETE" });
                  await loadConversations();
                  window.dispatchEvent(new Event("ali-store-updated"));
                }}
              >
                Delete
              </button>
            </div>
          </div>

          <div className="thread" ref={threadRef}>
            <div className="stamp">Today · {active.time}</div>
            {active.messages?.map((m, i) => (
              <div key={i} className={"msg from-" + m.from}>
                <div className="msg-bubble">
                  {renderBold(m.text)}
                  {m.priceCard && (
                    <div className="price-card">
                      <div style={{ minWidth: 0 }}>
                        <div className="label">{m.priceCard.label}</div>
                        <div className="price" style={{ margin: "6px 0 4px" }}>{m.priceCard.price}</div>
                        <div className="info">{m.priceCard.info.split("\n").join(" · ")}</div>
                      </div>
                      <button
                        className="btn primary sm"
                        onClick={() => {
                          setReplyText(`Reserved ${m.priceCard?.label} (${m.priceCard?.price}) — sending checkout link now.`);
                          composerRef.current?.focus();
                        }}
                      >
                        {m.priceCard.cta}
                      </button>
                    </div>
                  )}
                </div>
                <div className="msg-meta">
                  {m.time}
                  {m.meta ? " · " + m.meta : ""}
                </div>
                {m.failed && (
                  <div className="msg-meta" style={{ color: "var(--danger)", fontFamily: "inherit", maxWidth: 360 }}>
                    {m.failed}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="composer" style={{ position: "relative" }}>
            <div className="composer-suggest">
              <span style={{ color: "var(--muted)", flexShrink: 0 }}>Suggested</span>
              <strong>&ldquo;{suggestedReply}&rdquo;</strong>
              <button
                className="btn sm"
                style={{ marginLeft: "auto", flexShrink: 0 }}
                onClick={() => {
                  setReplyText(suggestedReply);
                  composerRef.current?.focus();
                }}
              >
                Use
              </button>
            </div>

            {showTemplateMenu && (
              <div
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: "var(--r-2)",
                  background: "var(--paper-2)",
                  padding: 6,
                  display: "grid",
                  gap: 4,
                }}
              >
                {TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setReplyText(tpl);
                      setShowTemplateMenu(false);
                      composerRef.current?.focus();
                    }}
                    style={{
                      textAlign: "left",
                      padding: "7px 9px",
                      background: "var(--paper)",
                      border: "1px solid var(--line)",
                      borderRadius: "var(--r-1)",
                      fontSize: 12.5,
                      color: "var(--ink)",
                      cursor: "pointer",
                    }}
                  >
                    {tpl}
                  </button>
                ))}
              </div>
            )}

            {sendError && <div className="hint error">{sendError}</div>}
            <div className="composer-input">
              <textarea
                ref={composerRef}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendReply();
                  }
                }}
                placeholder={
                  noteMode
                    ? "Write an internal timeline note for the team… (Enter to save)"
                    : "Reply to the customer. Enter sends, Shift+Enter adds a line."
                }
                style={
                  noteMode
                    ? { borderColor: "var(--warn)", background: "var(--paper-2)" }
                    : undefined
                }
              />
              <button
                className="btn primary"
                onClick={sendReply}
                disabled={!replyText.trim() || sending}
              >
                {noteMode ? "Add note" : "Send"}
              </button>
            </div>
            <div className="composer-tools">
              <button
                type="button"
                onClick={() => setShowTemplateMenu(v => !v)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: showTemplateMenu ? "var(--signal)" : "inherit",
                  font: "inherit",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Templates
              </button>
              <span className="divider" />
              <button
                type="button"
                onClick={() => {
                  setReplyText(prev => `${prev}@Sam `.trimStart());
                  composerRef.current?.focus();
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "inherit",
                  font: "inherit",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Mention
              </button>
              <span className="divider" />
              <button
                type="button"
                onClick={() => setNoteMode(n => !n)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: noteMode ? "var(--warn)" : "inherit",
                  font: "inherit",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {noteMode ? "Internal note: on" : "Internal note"}
              </button>
              <span className="divider" />
              <span style={{ marginLeft: "auto" }}>
                {noteMode ? "Only your team sees notes" : ""}
              </span>
            </div>
          </div>
        </div>

        <aside className="col rail">
          <div>
            <h3>Customer</h3>
            <dl className="kv">
              <dt>Name</dt><dd>{active.name}</dd>
              <dt>Phone</dt><dd><span className="mono">{active.phone}</span></dd>
              <dt>City</dt><dd>{active.city || "UK"}</dd>
              <dt>Channel</dt><dd>{active.channel === "wa" ? "WhatsApp" : "Web Chat"}</dd>
              <dt>Status</dt><dd style={{ textTransform: "capitalize" }}>{active.status}</dd>
              <dt>First seen</dt><dd><span className="mono">{active.firstSeen}</span></dd>
            </dl>
          </div>

          {active.tags && active.tags.length > 0 && (
            <div>
              <h3>Interested in</h3>
              <div className="tags">
                {active.tags.map(t => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3>Quick replies</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                className="btn"
                style={{ justifyContent: "flex-start", width: "100%" }}
                onClick={() => {
                  setReplyText("Sending the secure checkout link now. Which delivery slot works best for you tomorrow?");
                  composerRef.current?.focus();
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Send checkout link
              </button>
              <button
                className="btn"
                style={{ justifyContent: "flex-start", width: "100%" }}
                onClick={() => {
                  setReplyText("To port your number to Three, text PAC to 65075 (free) and reply here with your 9-character code.");
                  composerRef.current?.focus();
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5" />
                </svg>
                Send PAC / porting steps
              </button>
            </div>
          </div>

          {active.timeline && active.timeline.length > 0 && (
            <div>
              <h3>Activity Log</h3>
              <div className="timeline">
                {active.timeline.map((t, i) => (
                  <div key={i} className="row">
                    <div className="time">{t.time}</div>
                    <div className="what">
                      <b>{t.who}</b> · {t.what}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </aside>
      </div>
    </div>
  );
}
