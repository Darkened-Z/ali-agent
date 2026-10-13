"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  conversations as initialConversations,
  team as initialTeam,
  type Conversation,
  type ConvStatus,
} from "@/lib/mockData";

type ExtendedConversation = Conversation & { assignee?: string };

const TEMPLATES = [
  "Sending the Klarna Pay-in-3 checkout link now — takes ~2 min. Which delivery slot works best tomorrow?",
  "To port your number, text PAC to 65075 (free) and reply here with your 9-character code.",
  "Order confirmed! Your parcel ships today via DPD Next-Day — you'll get a 1-hour slot SMS by 9am.",
  "I've checked with our pricing desk and we can match that tariff for you today. Ready to reserve?",
];

export function ConversationsView() {
  const router = useRouter();
  const [list, setList] = useState<ExtendedConversation[]>(initialConversations);
  const [teamList, setTeamList] = useState(initialTeam);
  const [stats, setStats] = useState({ handledToday: 47, escalatedToday: 3 });
  const [activeId, setActiveId] = useState<string>(initialConversations[0].id);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [replyText, setReplyText] = useState<string>("");
  const [noteMode, setNoteMode] = useState<boolean>(false);
  const [showAssignMenu, setShowAssignMenu] = useState<boolean>(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);

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
    return () => window.removeEventListener("ali-store-updated", onUpdate);
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
    { key: "all", label: "ALL", count: list.length },
    { key: "bot", label: "BOT", count: list.filter(c => c.status === "bot").length },
    { key: "waiting", label: "WAITING", count: list.filter(c => c.status === "waiting").length },
    { key: "human", label: "HUMAN", count: list.filter(c => c.status === "human").length },
    { key: "closed", label: "CLOSED", count: list.filter(c => c.status === "closed").length },
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
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          conversationId: active.id,
          text: t,
          from: "agent",
          agentName: active.assignee?.split(" ")[0] || "Sam",
          isNote: noteMode,
        }),
      });
      if (res.ok) {
        setReplyText("");
        setNoteMode(false);
        await loadConversations();
        window.dispatchEvent(new Event("ali-store-updated"));
      }
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
            placeholder="Search leads, phones, plan IDs…"
            style={{
              border: "none",
              background: "transparent",
              color: "var(--ink)",
              fontFamily: "inherit",
              fontSize: 12,
              width: "100%",
              outline: "none",
            }}
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
        <button
          className="btn primary"
          onClick={() => router.push("/admin/broadcasts")}
        >
          + New broadcast
        </button>
      </div>

      <div className="dash-work">
        <div className="col">
          <div className="conv-filters">
            {filters.map(f => (
              <button
                key={f.key}
                className={"chip " + (filter === f.key ? "on" : "")}
                onClick={() => setFilter(f.key)}
              >
                {f.label} · {f.count}
              </button>
            ))}
          </div>
          <div className="conv-list">
            {visible.map(c => (
              <button
                key={c.id}
                className={"conv " + (active.id === c.id ? "active" : "")}
                onClick={() => setActiveId(c.id)}
              >
                <div className="conv-top">
                  <span className="conv-name">{c.name}</span>
                  <span className="conv-time">{c.time}</span>
                </div>
                <div className="conv-msg">{c.preview}</div>
                <div className="conv-meta">
                  <span className={"badge " + c.channel}>
                    {c.channel === "wa" ? "WA" : "WEB"}
                  </span>
                  <span
                    className={
                      "badge " + (c.status === "human" ? "human" : c.status === "bot" ? "bot" : "")
                    }
                  >
                    {c.status.toUpperCase()}
                  </span>
                  {c.assignee && (
                    <span className="badge" style={{ fontSize: 9 }}>
                      @{c.assignee.split(" ")[0].toUpperCase()}
                    </span>
                  )}
                  {c.isNew && <span className="badge new">NEW</span>}
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
          <div className="thread-head" style={{ position: "relative" }}>
            <div className="thread-title">
              {active.name} <small>{active.phone} · {active.city}</small>
              {active.assignee && (
                <span className="badge" style={{ marginLeft: 8 }}>
                  ASSIGNED: {active.assignee.toUpperCase()}
                </span>
              )}
            </div>
            <div className="thread-actions">
              <div style={{ position: "relative" }}>
                <button
                  className="btn ghost"
                  onClick={() => setShowAssignMenu(v => !v)}
                >
                  {active.assignee ? `Assigned: ${active.assignee.split(" ")[0]}` : "Assign"}
                </button>
                {showAssignMenu && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "100%",
                      marginTop: 4,
                      background: "var(--paper)",
                      border: "1px solid var(--ink)",
                      zIndex: 30,
                      minWidth: 180,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {teamList.map(m => (
                      <button
                        key={m.id}
                        onClick={() => assignAgent(m.name)}
                        style={{
                          padding: "8px 12px",
                          textAlign: "left",
                          background: "transparent",
                          border: "none",
                          borderBottom: "1px solid var(--line)",
                          cursor: "pointer",
                          fontSize: 12,
                          color: "var(--ink)",
                        }}
                      >
                        {m.name} <span className="mono" style={{ color: "var(--muted)", fontSize: 10 }}>({m.role})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                className="btn"
                onClick={() =>
                  updateConvStatus(active.status === "waiting" ? "bot" : "waiting")
                }
              >
                {active.status === "waiting" ? "Resume bot" : "Pause bot"}
              </button>

              {active.status !== "closed" && (
                <button
                  className="btn"
                  onClick={() => updateConvStatus("closed")}
                >
                  Resolve ✓
                </button>
              )}

              <button
                className="btn primary"
                onClick={() =>
                  updateConvStatus(active.status === "human" ? "bot" : "human")
                }
              >
                {active.status === "human" ? "Hand to bot" : "Take over"}
              </button>
            </div>
          </div>

          <div className="thread" ref={threadRef}>
            <div className="stamp">Today · {active.time}</div>
            {active.messages?.map((m, i) => (
              <div key={i} className={"msg from-" + m.from}>
                <div className="msg-bubble">
                  {m.text}
                  {m.priceCard && (
                    <div className="price-card">
                      <div>
                        <div className="label">{m.priceCard.label}</div>
                        <div className="price">{m.priceCard.price}</div>
                      </div>
                      <div className="info">
                        {m.priceCard.info.split("\n").map((line, j) => (
                          <div key={j}>{line}</div>
                        ))}
                      </div>
                      <button
                        className="btn primary"
                        style={{ padding: "4px 8px", fontSize: 11 }}
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
              </div>
            ))}
          </div>

          <div className="composer" style={{ position: "relative" }}>
            <div className="composer-suggest">
              <span>SUGGESTED REPLY</span>
              <strong>&ldquo;{suggestedReply}&rdquo;</strong>
              <button
                className="btn ghost"
                style={{ marginLeft: "auto" }}
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
                  border: "1px solid var(--line-strong)",
                  background: "var(--paper-2)",
                  padding: 8,
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
                      padding: "6px 8px",
                      background: "var(--paper)",
                      border: "1px solid var(--line)",
                      fontSize: 12,
                      color: "var(--ink)",
                      cursor: "pointer",
                    }}
                  >
                    <span className="mono" style={{ color: "var(--signal)", marginRight: 8 }}>
                      0{i + 1}
                    </span>
                    {tpl}
                  </button>
                ))}
              </div>
            )}

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
                    : "Type a reply, or click / TEMPLATES below. Enter to send, Shift+Enter for newline."
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
                {noteMode ? "Add note →" : "Send →"}
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
                / TEMPLATES
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
                @ MENTION
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
                # NOTE {noteMode ? "(ON)" : ""}
              </button>
              <span className="divider" />
              <span style={{ marginLeft: "auto" }}>
                {noteMode ? "INTERNAL NOTE" : replyText.trim() ? "READY" : "DRAFT"}
              </span>
            </div>
          </div>
        </div>

        <aside className="col rail">
          <div>
            <h3>Lead</h3>
            <dl className="kv">
              <dt>Name</dt><dd>{active.name}</dd>
              <dt>Phone</dt><dd><span className="mono">{active.phone}</span></dd>
              <dt>City</dt><dd>{active.city}</dd>
              <dt>Source</dt><dd>{active.source}</dd>
              <dt>First seen</dt><dd><span className="mono">{active.firstSeen}</span></dd>
            </dl>
          </div>

          {active.tags && (
            <div>
              <h3>Interest</h3>
              <div className="tags">
                {active.tags.map(t => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3>
              Score ·{" "}
              <span
                className="mono"
                style={{ color: (active.score ?? 50) >= 70 ? "var(--signal)" : "var(--muted)" }}
              >
                {(active.score ?? 50) >= 70
                  ? "HOT"
                  : (active.score ?? 50) >= 40
                  ? "WARM"
                  : "COLD"}{" "}
                · {active.score ?? 50}
              </span>
            </h3>
            <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
              {(active.score ?? 50) >= 70
                ? "High-intent phrasing · asked about price and terms · engaged for 4+ minutes"
                : "Casual browsing · early-funnel · no purchase signal yet"}
            </div>
          </div>

          {active.timeline && (
            <div>
              <h3>Timeline</h3>
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
