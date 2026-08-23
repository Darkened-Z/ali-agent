"use client";

import { useState } from "react";
import { conversations, type Conversation } from "@/lib/mockData";

const filters = [
  { key: "all", label: "ALL", count: conversations.length },
  { key: "bot", label: "BOT", count: conversations.filter(c => c.status === "bot").length },
  { key: "waiting", label: "WAITING", count: 3 },
  { key: "human", label: "HUMAN", count: conversations.filter(c => c.status === "human").length },
];

export function ConversationsView() {
  const [activeId, setActiveId] = useState<string>(conversations[0].id);
  const [filter, setFilter] = useState<string>("all");
  const active = conversations.find(c => c.id === activeId) as Conversation;

  const visible = filter === "all"
    ? conversations
    : conversations.filter(c => c.status === filter);

  return (
    <div className="dash-main">
      <div className="dash-head">
        <h2>Conversations<span>Today · 47 handled · 3 escalated</span></h2>
        <div className="dash-search">
          <span>Search leads, phones, plan IDs…</span>
          <kbd>⌘K</kbd>
        </div>
        <button className="btn primary">+ New broadcast</button>
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
                className={"conv " + (activeId === c.id ? "active" : "")}
                onClick={() => setActiveId(c.id)}
              >
                <div className="conv-top">
                  <span className="conv-name">{c.name}</span>
                  <span className="conv-time">{c.time}</span>
                </div>
                <div className="conv-msg">{c.preview}</div>
                <div className="conv-meta">
                  <span className={"badge " + c.channel}>{c.channel === "wa" ? "WA" : "WEB"}</span>
                  <span className={"badge " + (c.status === "human" ? "human" : "bot")}>{c.status.toUpperCase()}</span>
                  {c.isNew && <span className="badge new">NEW</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="col">
          <div className="thread-head">
            <div className="thread-title">
              {active.name} <small>{active.phone} · {active.city}</small>
            </div>
            <div className="thread-actions">
              <button className="btn ghost">Assign</button>
              <button className="btn">Pause bot</button>
              <button className="btn primary">Take over</button>
            </div>
          </div>
          <div className="thread">
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
                        {m.priceCard.info.split("\n").map((line, j) => <div key={j}>{line}</div>)}
                      </div>
                      <button className="btn primary" style={{ padding: "4px 8px", fontSize: 11 }}>
                        {m.priceCard.cta}
                      </button>
                    </div>
                  )}
                </div>
                <div className="msg-meta">{m.time}{m.meta ? " · " + m.meta : ""}</div>
              </div>
            ))}
          </div>

          <div className="composer">
            <div className="composer-suggest">
              <span>SUGGESTED REPLY</span>
              <strong>&ldquo;Sending the Klarna Pay-in-3 link now — takes ~2 min to fill. Which delivery slot works best tomorrow?&rdquo;</strong>
              <button className="btn ghost" style={{ marginLeft: "auto" }}>Use</button>
            </div>
            <div className="composer-input">
              <textarea placeholder="Type a reply, or / for templates. Enter to send, Shift+Enter for newline." />
              <button className="btn primary">Send →</button>
            </div>
            <div className="composer-tools">
              <span>/ TEMPLATES</span><span className="divider" />
              <span>@ MENTION</span><span className="divider" />
              <span># NOTE</span><span className="divider" />
              <span style={{ marginLeft: "auto" }}>DRAFT</span>
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
                {active.tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
          )}

          <div>
            <h3>
              Score ·{" "}
              <span className="mono" style={{ color: active.score! >= 70 ? "var(--signal)" : "var(--muted)" }}>
                {active.score! >= 70 ? "HOT" : active.score! >= 40 ? "WARM" : "COLD"} · {active.score}
              </span>
            </h3>
            <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
              {active.score! >= 70
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
                    <div className="what"><b>{t.who}</b> · {t.what}</div>
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
