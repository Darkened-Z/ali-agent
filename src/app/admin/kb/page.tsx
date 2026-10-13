"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { kbArticles as initialKbArticles } from "@/lib/mockData";

type KBItem = {
  id: string;
  title: string;
  category: string;
  content?: string;
  updated: string;
  uses: number;
};

export default function KBPage() {
  const [articles, setArticles] = useState<KBItem[]>(initialKbArticles);
  const [selectedId, setSelectedId] = useState<string | null>(initialKbArticles[0]?.id || null);
  const [urlInput, setUrlInput] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Policy");
  const [newContent, setNewContent] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadKb = useCallback(async () => {
    try {
      const res = await fetch("/api/kb", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.kbArticles)) setArticles(data.kbArticles);
    } catch {
      // keep existing
    }
  }, []);

  useEffect(() => {
    loadKb();
  }, [loadKb]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/kb", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "sync" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.kbArticles)) setArticles(data.kbArticles);
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateDoc = async (title: string, category: string, content: string, url?: string) => {
    if (!title.trim()) return;
    const res = await fetch("/api/kb", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, category, content, url }),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.kbArticles)) setArticles(data.kbArticles);
      if (data.article?.id) setSelectedId(data.article.id);
      setNewTitle("");
      setNewContent("");
      setUrlInput("");
      setShowAdd(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    let content = `Uploaded document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    if (["txt", "md", "csv", "json"].includes(ext)) {
      try {
        content = (await file.text()).slice(0, 3000);
      } catch {
        // use fallback summary
      }
    }
    await handleCreateDoc(file.name.replace(/\.[^.]+$/, ""), "Uploaded", content);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/kb?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.kbArticles)) {
        setArticles(data.kbArticles);
        if (selectedId === id) setSelectedId(data.kbArticles[0]?.id || null);
      }
    }
  };

  const totalUses = articles.reduce((s, a) => s + a.uses, 0);
  const selected = articles.find(a => a.id === selectedId) || articles[0];

  return (
    <>
      <div className="page-head">
        <h1>
          Knowledge base
          <span>
            · {articles.length} docs · {totalUses} bot references this month
          </span>
        </h1>
        <div className="actions">
          <button className="btn" onClick={handleSync} disabled={syncing}>
            {syncing ? "Syncing…" : "Sync now"}
          </button>
          <button className="btn" onClick={() => setShowAdd(v => !v)}>
            {showAdd ? "Cancel" : "+ New article"}
          </button>
          <button className="btn primary" onClick={() => fileRef.current?.click()}>
            + Upload file
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.txt,.md,.csv,.json"
            style={{ display: "none" }}
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) handleFileUpload(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {showAdd && (
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--line)",
            background: "var(--paper-2)",
            display: "grid",
            gridTemplateColumns: "1fr 160px 1.6fr auto",
            gap: 10,
            alignItems: "end",
          }}
        >
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>ARTICLE TITLE</label>
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="e.g. eSIM activation guide (iPhone 17)"
              style={{ fontSize: 13, padding: "8px 10px" }}
            />
          </div>
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>CATEGORY</label>
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              style={{ fontSize: 13, padding: "8px 10px" }}
            >
              <option value="Devices">Devices</option>
              <option value="Networks">Networks</option>
              <option value="Porting">Porting</option>
              <option value="Payment">Payment</option>
              <option value="Logistics">Logistics</option>
              <option value="Policy">Policy</option>
              <option value="Plans">Plans</option>
            </select>
          </div>
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>CONTENT SUMMARY (USED BY BOT)</label>
            <input
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="Key facts the AI should quote when customers ask…"
              style={{ fontSize: 13, padding: "8px 10px" }}
            />
          </div>
          <button
            className="btn primary"
            onClick={() => handleCreateDoc(newTitle, newCategory, newContent)}
            disabled={!newTitle.trim()}
            style={{ height: 37 }}
          >
            Save doc
          </button>
        </div>
      )}

      <div className="kb-layout">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th><th>Category</th><th>Updated</th><th>Bot uses</th><th></th>
              </tr>
            </thead>
            <tbody>
              {articles.map(a => (
                <tr
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  style={
                    selected?.id === a.id
                      ? { background: "var(--paper-2)" }
                      : undefined
                  }
                >
                  <td style={{ fontWeight: selected?.id === a.id ? 600 : 400 }}>{a.title}</td>
                  <td><span className="badge">{a.category}</span></td>
                  <td><span className="mono">{a.updated}</span></td>
                  <td><span className="mono">{a.uses}×</span></td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn ghost"
                      style={{ padding: "2px 6px", fontSize: 11 }}
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(a.id);
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {selected && (
            <div
              style={{
                padding: 16,
                border: "1px solid var(--line)",
                background: "var(--paper)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <span className="mono" style={{ fontSize: 11, color: "var(--signal)" }}>
                  {selected.id} · {selected.category.toUpperCase()}
                </span>
                <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
                  Referenced {selected.uses}× by Claude
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
                {selected.title}
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}>
                {selected.content || "Indexed retail policy & pricing article."}
              </div>
            </div>
          )}
        </div>

        <div
          className="kb-upload"
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) handleFileUpload(f);
          }}
        >
          <div
            onClick={() => fileRef.current?.click()}
            style={{ cursor: "pointer" }}
          >
            <strong>Drop files here or click to browse</strong>
            PDF · DOCX · TXT · Markdown
          </div>
          <div style={{ marginTop: 24, fontSize: 12, color: "var(--muted)", paddingTop: 16, borderTop: "1px solid var(--line)" }}>
            Or paste a URL to auto-scrape:
          </div>
          <input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="https://www.fonehouse.co.uk/…"
            onKeyDown={e => {
              if (e.key === "Enter" && urlInput.trim()) {
                handleCreateDoc(
                  `Scraped: ${urlInput.replace(/^https?:\/\//, "").slice(0, 42)}`,
                  "Web Scrape",
                  "",
                  urlInput.trim()
                );
              }
            }}
            style={{
              marginTop: 8,
              width: "100%",
              padding: 8,
              border: "1px solid var(--line-strong)",
              background: "var(--paper)",
              color: "var(--ink)",
              fontFamily: "inherit",
              fontSize: 13,
            }}
          />
          <button
            className="btn primary"
            onClick={() =>
              handleCreateDoc(
                `Scraped: ${urlInput.replace(/^https?:\/\//, "").slice(0, 42)}`,
                "Web Scrape",
                "",
                urlInput.trim()
              )
            }
            disabled={!urlInput.trim()}
            style={{ marginTop: 12, width: "100%", justifyContent: "center" }}
          >
            Import
          </button>
        </div>
      </div>
    </>
  );
}
