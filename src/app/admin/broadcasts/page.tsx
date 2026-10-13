"use client";

import { useCallback, useEffect, useState } from "react";
import { broadcasts as initialBroadcasts, type BroadcastStatus } from "@/lib/mockData";

type BroadcastItem = {
  id: string;
  title: string;
  status: BroadcastStatus;
  audience: number;
  sends: string;
};

const BROADCAST_TEMPLATES = [
  {
    title: "iPhone 17 launch — next-day delivery",
    body: "Hi! iPhone 17 256GB is in stock on Three & Vodafone from £31.95/mo with free next-day DPD delivery. Reply INFO to reserve.",
  },
  {
    title: "Three 60GB Rolling SIM — £10/mo",
    body: "Upgrade your SIM: 60GB 5G data, unlimited mins & texts on a 30-day rolling plan for just £10/mo. Reply SIM to switch in 24h.",
  },
  {
    title: "Refurbished Pixel flash drop",
    body: "Fresh batch of Grade-Excellent Google Pixel 10 & Pixel 9a handsets from £150 SIM-free with 12-month warranty. Reply PIXEL for stock list.",
  },
];

export default function BroadcastsPage() {
  const [list, setList] = useState<BroadcastItem[]>(initialBroadcasts);
  const [audience, setAudience] = useState("london");
  const [title, setTitle] = useState("");
  const [msg, setMsg] = useState(
    "Hi! iPhone 17 launch offer — free next-day delivery UK-wide till Sunday. Reply INFO for details."
  );
  const [showTemplates, setShowTemplates] = useState(false);
  const [filterSent, setFilterSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadBroadcasts = useCallback(async () => {
    try {
      const res = await fetch("/api/broadcasts", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.broadcasts)) setList(data.broadcasts);
    } catch {
      // keep existing
    }
  }, []);

  useEffect(() => {
    loadBroadcasts();
  }, [loadBroadcasts]);

  const submitBroadcast = async (action: "draft" | "schedule" | "send") => {
    if (!msg.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/broadcasts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          message: msg,
          audienceKey: audience,
          action,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.broadcasts)) setList(data.broadcasts);
        setTitle("");
        window.dispatchEvent(new Event("ali-store-updated"));
      }
    } finally {
      setBusy(false);
    }
  };

  const sendExisting = async (id: string) => {
    const res = await fetch("/api/broadcasts", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status: "sent" }),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.broadcasts)) setList(data.broadcasts);
      window.dispatchEvent(new Event("ali-store-updated"));
    }
  };

  const scheduled = list.filter(b => b.status === "scheduled").length;
  const drafts = list.filter(b => b.status === "draft").length;
  const visible = filterSent ? list.filter(b => b.status === "sent") : list;

  return (
    <>
      <div className="page-head">
        <h1>
          Broadcasts
          <span>
            · {scheduled} scheduled · {drafts} draft
          </span>
        </h1>
        <div className="actions">
          <button
            className={"btn " + (showTemplates ? "primary" : "")}
            onClick={() => setShowTemplates(v => !v)}
          >
            Templates
          </button>
          <button
            className={"btn " + (filterSent ? "primary" : "")}
            onClick={() => setFilterSent(v => !v)}
          >
            {filterSent ? "Show all" : "History"}
          </button>
        </div>
      </div>

      {showTemplates && (
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--line)",
            background: "var(--paper-2)",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}
        >
          {BROADCAST_TEMPLATES.map((t, i) => (
            <button
              key={i}
              onClick={() => {
                setTitle(t.title);
                setMsg(t.body);
                setShowTemplates(false);
              }}
              style={{
                textAlign: "left",
                padding: 12,
                border: "1px solid var(--line-strong)",
                background: "var(--paper)",
                color: "var(--ink)",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{t.title}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{t.body}</div>
            </button>
          ))}
        </div>
      )}

      <div className="broadcast-layout">
        <div className="broadcast-list">
          {visible.map(b => (
            <div key={b.id} className="broadcast-item">
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{b.title}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                  {b.audience > 0
                    ? `${b.audience.toLocaleString()} recipients`
                    : "Draft — no audience set"}
                </div>
              </div>
              <div
                style={{
                  textAlign: "right",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {b.status !== "sent" && (
                    <button
                      className="btn ghost"
                      style={{ padding: "2px 6px", fontSize: 10 }}
                      onClick={() => sendExisting(b.id)}
                    >
                      Send now →
                    </button>
                  )}
                  <span
                    className={
                      "badge " +
                      (b.status === "scheduled"
                        ? "bot"
                        : b.status === "sent"
                        ? "human"
                        : "")
                    }
                  >
                    {b.status.toUpperCase()}
                  </span>
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
                  {b.sends}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="broadcast-composer">
          <h3>Compose broadcast</h3>
          <div className="form-input" style={{ marginBottom: 8 }}>
            <label>CAMPAIGN TITLE (OPTIONAL)</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Weekend iPhone 17 Promo"
              style={{ fontSize: 13, padding: "8px 10px" }}
            />
          </div>
          <div className="form-input" style={{ marginBottom: 8 }}>
            <label>AUDIENCE</label>
            <select value={audience} onChange={e => setAudience(e.target.value)} style={{ fontSize: 13, padding: "8px 10px" }}>
              <option value="london">London customers (1,245)</option>
              <option value="manchester">Manchester customers (892)</option>
              <option value="hot">Hot leads · UK-wide (48)</option>
              <option value="buyers">Past buyers · UK-wide (2,104)</option>
            </select>
          </div>
          <div className="form-input" style={{ marginBottom: 8 }}>
            <label>MESSAGE · {msg.length} / 1024</label>
            <textarea
              value={msg}
              onChange={e => setMsg(e.target.value)}
              rows={5}
              style={{ fontSize: 13 }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button
              className="btn"
              onClick={() => submitBroadcast("draft")}
              disabled={busy || !msg.trim()}
            >
              Save draft
            </button>
            <button
              className="btn"
              onClick={() => submitBroadcast("schedule")}
              disabled={busy || !msg.trim()}
            >
              Schedule
            </button>
            <button
              className="btn primary"
              style={{ marginLeft: "auto" }}
              onClick={() => submitBroadcast("send")}
              disabled={busy || !msg.trim()}
            >
              Send now
            </button>
          </div>
          <div
            style={{
              fontSize: 10,
              color: "var(--muted)",
              fontFamily: "var(--font-jbmono)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              paddingTop: 10,
              borderTop: "1px solid var(--line)",
            }}
          >
            META APPROVED TEMPLATES ONLY · SESSION MSGS WITHIN 24H
          </div>
        </div>
      </div>
    </>
  );
}
