"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_BOT_PROMPT } from "@/lib/mockData";

type PromptVersion = {
  hash: string;
  prompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  savedAt: string;
};

export default function BotPage() {
  const [prompt, setPrompt] = useState(DEFAULT_BOT_PROMPT);
  const [model, setModel] = useState<"haiku" | "sonnet" | "opus">("haiku");
  const [temperature, setTemperature] = useState<number>(0.4);
  const [maxTokens, setMaxTokens] = useState<number>(512);
  const [escalateOn, setEscalateOn] = useState({
    discount: true,
    complaint: true,
    human: true,
    longConv: false,
  });
  const [hash, setHash] = useState("a3f9b2");
  const [updatedAt, setUpdatedAt] = useState("Aug 24, 15:42");
  const [repliesToday, setRepliesToday] = useState(47);
  const [history, setHistory] = useState<PromptVersion[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [testInput, setTestInput] = useState("Have you got iPhone 17 256GB on Vodafone?");
  const [testReply, setTestReply] = useState("");
  const [testing, setTesting] = useState(false);

  const loadBotConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/bot", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const cfg = data.botConfig;
      if (cfg) {
        setPrompt(cfg.prompt);
        setModel(cfg.model || "haiku");
        setTemperature(cfg.temperature ?? 0.4);
        setMaxTokens(cfg.maxTokens || 512);
        if (cfg.escalateOn) setEscalateOn(cfg.escalateOn);
        setHash(cfg.hash || "a3f9b2");
        setUpdatedAt(cfg.updatedAt || "Just now");
        setHistory(cfg.history || []);
        setDirty(false);
      }
      if (data.repliesToday) setRepliesToday(data.repliesToday);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadBotConfig();
  }, [loadBotConfig]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/bot", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt,
          model,
          temperature,
          maxTokens: Number(maxTokens) || 512,
          escalateOn,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const cfg = data.botConfig;
        setHash(cfg.hash);
        setUpdatedAt(cfg.updatedAt);
        setHistory(cfg.history || []);
        setDirty(false);
        window.dispatchEvent(new Event("ali-store-updated"));
      }
    } finally {
      setSaving(false);
    }
  };

  const runPreview = async () => {
    if (!testInput.trim() || testing) return;
    setTesting(true);
    setTestReply("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          previewPrompt: prompt,
          skipRecord: true,
          messages: [{ role: "user", content: testInput }],
        }),
      });
      if (!res.ok || !res.body) throw new Error("Failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const frames = buf.split("\n\n");
        buf = frames.pop() ?? "";
        for (const f of frames) {
          const ev = f.split("\n").find(l => l.startsWith("event:"))?.slice(6).trim();
          const dt = f.split("\n").find(l => l.startsWith("data:"))?.slice(5).trim();
          if (ev === "token" && dt) {
            acc += JSON.parse(dt).text;
            setTestReply(acc);
          }
        }
      }
    } catch {
      setTestReply("Preview failed — check console.");
    } finally {
      setTesting(false);
    }
  };

  const modelLabels: Record<string, string> = {
    haiku: "claude-haiku-4.5",
    sonnet: "claude-sonnet-4.5",
    opus: "claude-opus-4.1",
  };

  return (
    <>
      <div className="page-head">
        <h1>
          Bot prompt
          <span>
            · {modelLabels[model]} · {repliesToday} replies today
          </span>
        </h1>
        <div className="actions">
          <button
            className={"btn " + (showPreview ? "primary" : "")}
            onClick={() => {
              setShowPreview(v => !v);
              setShowHistory(false);
            }}
          >
            Preview
          </button>
          <button
            className={"btn " + (showHistory ? "primary" : "")}
            onClick={() => {
              setShowHistory(v => !v);
              setShowPreview(false);
            }}
          >
            Version history ({history.length})
          </button>
          <button
            className="btn primary"
            disabled={!dirty || saving}
            onClick={handleSave}
          >
            {saving ? "Deploying…" : "Save & deploy"}
          </button>
        </div>
      </div>

      {showPreview && (
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--line)",
            background: "var(--paper-2)",
            display: "grid",
            gap: 10,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
            <input
              value={testInput}
              onChange={e => setTestInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && runPreview()}
              placeholder="Ask the bot a test question…"
              style={{
                padding: "8px 12px",
                border: "1px solid var(--line-strong)",
                background: "var(--paper)",
                color: "var(--ink)",
                fontSize: 13,
              }}
            />
            <button className="btn primary" onClick={runPreview} disabled={testing}>
              {testing ? "Streaming…" : "Run test →"}
            </button>
          </div>
          {testReply && (
            <div
              style={{
                padding: "10px 14px",
                background: "var(--paper)",
                border: "1px solid var(--signal)",
                fontSize: 13,
              }}
            >
              <span className="mono" style={{ fontSize: 10, color: "var(--signal)", display: "block", marginBottom: 4 }}>
                BOT PREVIEW RESPONSE:
              </span>
              {testReply}
            </div>
          )}
        </div>
      )}

      {showHistory && (
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--line)",
            background: "var(--paper-2)",
            display: "grid",
            gap: 8,
          }}
        >
          {history.map(v => (
            <div
              key={v.hash + v.savedAt}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                background: "var(--paper)",
                border: "1px solid var(--line)",
                fontSize: 12,
              }}
            >
              <div>
                <span className="mono" style={{ color: "var(--signal)", marginRight: 10 }}>
                  #{v.hash}
                </span>
                <span>{v.savedAt}</span>
                <span className="mono" style={{ color: "var(--muted)", marginLeft: 10 }}>
                  {v.model} · temp {v.temperature}
                </span>
              </div>
              <button
                className="btn"
                onClick={() => {
                  setPrompt(v.prompt);
                  setModel((v.model as "haiku" | "sonnet" | "opus") || "haiku");
                  setTemperature(v.temperature);
                  setMaxTokens(v.maxTokens);
                  setDirty(true);
                  setShowHistory(false);
                }}
              >
                Restore
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="prompt-layout">
        <textarea
          className="prompt-editor"
          value={prompt}
          onChange={e => {
            setPrompt(e.target.value);
            setDirty(true);
          }}
          spellCheck={false}
        />
        <aside className="prompt-side">
          <div className="setting">
            <label>MODEL</label>
            <select
              value={model}
              onChange={e => {
                setModel(e.target.value as "haiku" | "sonnet" | "opus");
                setDirty(true);
              }}
            >
              <option value="haiku">claude-haiku-4.5 (fast, cheap)</option>
              <option value="sonnet">claude-sonnet-4.5 (smart, escalations)</option>
              <option value="opus">claude-opus-4.1 (edge cases only)</option>
            </select>
          </div>
          <div className="setting">
            <label>TEMPERATURE · {temperature.toFixed(1)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={e => {
                setTemperature(parseFloat(e.target.value));
                setDirty(true);
              }}
            />
          </div>
          <div className="setting">
            <label>MAX OUTPUT TOKENS</label>
            <input
              type="number"
              value={maxTokens}
              onChange={e => {
                setMaxTokens(parseInt(e.target.value, 10) || 512);
                setDirty(true);
              }}
              className="mono"
            />
          </div>
          <div className="setting">
            <label>ESCALATE ON</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={escalateOn.discount}
                  onChange={e => {
                    setEscalateOn(s => ({ ...s, discount: e.target.checked }));
                    setDirty(true);
                  }}
                />{" "}
                Discount request
              </label>
              <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={escalateOn.complaint}
                  onChange={e => {
                    setEscalateOn(s => ({ ...s, complaint: e.target.checked }));
                    setDirty(true);
                  }}
                />{" "}
                Complaint keywords
              </label>
              <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={escalateOn.human}
                  onChange={e => {
                    setEscalateOn(s => ({ ...s, human: e.target.checked }));
                    setDirty(true);
                  }}
                />{" "}
                &quot;human&quot; / &quot;agent&quot; / &quot;someone&quot;
              </label>
              <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={escalateOn.longConv}
                  onChange={e => {
                    setEscalateOn(s => ({ ...s, longConv: e.target.checked }));
                    setDirty(true);
                  }}
                />{" "}
                Long conversations (10+ msgs)
              </label>
            </div>
          </div>
          <div className="setting" style={{ padding: 12, border: "1px solid var(--line)", background: "var(--paper)" }}>
            <label style={{ color: dirty ? "var(--warn)" : "var(--ok)" }}>
              {dirty ? "UNSAVED CHANGES" : `PROMPT HASH · ${hash}`}
            </label>
            <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>
              {dirty
                ? "Click Save & deploy to push this prompt live to the chat widget and WhatsApp bot."
                : `Live since ${updatedAt}. No pending changes.`}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
