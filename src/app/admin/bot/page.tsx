"use client";

import { useState } from "react";
import { DEFAULT_BOT_PROMPT } from "@/lib/mockData";

export default function BotPage() {
  const [prompt, setPrompt] = useState(DEFAULT_BOT_PROMPT);
  const [dirty, setDirty] = useState(false);

  return (
    <>
      <div className="page-head">
        <h1>Bot prompt<span>· claude-haiku-4.5 · 47 replies today</span></h1>
        <div className="actions">
          <button className="btn">Preview</button>
          <button className="btn">Version history</button>
          <button className="btn primary" disabled={!dirty}>Save & deploy</button>
        </div>
      </div>
      <div className="prompt-layout">
        <textarea
          className="prompt-editor"
          value={prompt}
          onChange={e => { setPrompt(e.target.value); setDirty(true); }}
          spellCheck={false}
        />
        <aside className="prompt-side">
          <div className="setting">
            <label>MODEL</label>
            <select defaultValue="haiku">
              <option value="haiku">claude-haiku-4.5 (fast, cheap)</option>
              <option value="sonnet">claude-sonnet-5 (smart, escalations)</option>
              <option value="opus">claude-opus-5 (edge cases only)</option>
            </select>
          </div>
          <div className="setting">
            <label>TEMPERATURE · 0.4</label>
            <input type="range" min="0" max="1" step="0.1" defaultValue="0.4" />
          </div>
          <div className="setting">
            <label>MAX OUTPUT TOKENS</label>
            <input type="text" defaultValue="512" className="mono" />
          </div>
          <div className="setting">
            <label>ESCALATE ON</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                <input type="checkbox" defaultChecked /> Discount request
              </label>
              <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                <input type="checkbox" defaultChecked /> Complaint keywords
              </label>
              <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                <input type="checkbox" defaultChecked /> "human" / "agent" / "someone"
              </label>
              <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                <input type="checkbox" /> Long conversations (10+ msgs)
              </label>
            </div>
          </div>
          <div className="setting" style={{ padding: 12, border: "1px solid var(--line)", background: "var(--paper)" }}>
            <label style={{ color: dirty ? "var(--warn)" : "var(--ok)" }}>
              {dirty ? "UNSAVED CHANGES" : "PROMPT HASH · a3f9b2"}
            </label>
            <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>
              {dirty
                ? "Save to deploy to production. Bot uses last-saved version until then."
                : "Live since Aug 09, 15:42. No pending changes."}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
