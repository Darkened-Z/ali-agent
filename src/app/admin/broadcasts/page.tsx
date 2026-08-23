"use client";

import { useState } from "react";
import { broadcasts } from "@/lib/mockData";

export default function BroadcastsPage() {
  const [audience, setAudience] = useState("london");
  const [msg, setMsg] = useState(
    "Hi! iPhone 17 launch offer — free next-day delivery UK-wide till Sunday. Reply INFO for details."
  );

  const scheduled = broadcasts.filter(b => b.status === "scheduled").length;
  const drafts = broadcasts.filter(b => b.status === "draft").length;

  return (
    <>
      <div className="page-head">
        <h1>Broadcasts<span>· {scheduled} scheduled · {drafts} draft</span></h1>
        <div className="actions">
          <button className="btn">Templates</button>
          <button className="btn">History</button>
        </div>
      </div>
      <div className="broadcast-layout">
        <div className="broadcast-list">
          {broadcasts.map(b => (
            <div key={b.id} className="broadcast-item">
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{b.title}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                  {b.audience > 0 ? `${b.audience.toLocaleString()} recipients` : "Draft — no audience set"}
                </div>
              </div>
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <span className={"badge " + (b.status === "scheduled" ? "bot" : b.status === "sent" ? "human" : "")}>
                  {b.status.toUpperCase()}
                </span>
                <div className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{b.sends}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="broadcast-composer">
          <h3>Compose broadcast</h3>
          <div className="form-input">
            <label>AUDIENCE</label>
            <select value={audience} onChange={e => setAudience(e.target.value)}>
              <option value="london">London customers (1,245)</option>
              <option value="manchester">Manchester customers (892)</option>
              <option value="hot">Hot leads · UK-wide (48)</option>
              <option value="buyers">Past buyers · UK-wide (2,104)</option>
            </select>
          </div>
          <div className="form-input">
            <label>MESSAGE · {msg.length} / 1024</label>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={5} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button className="btn">Save draft</button>
            <button className="btn">Schedule</button>
            <button className="btn primary" style={{ marginLeft: "auto" }}>Send now</button>
          </div>
          <div style={{
            fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-jbmono)",
            textTransform: "uppercase", letterSpacing: "0.12em",
            paddingTop: 10, borderTop: "1px solid var(--line)",
          }}>
            META APPROVED TEMPLATES ONLY · SESSION MSGS WITHIN 24H
          </div>
        </div>
      </div>
    </>
  );
}
