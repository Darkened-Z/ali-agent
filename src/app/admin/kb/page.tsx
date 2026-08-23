import { kbArticles } from "@/lib/mockData";

export default function KBPage() {
  const totalUses = kbArticles.reduce((s, a) => s + a.uses, 0);
  return (
    <>
      <div className="page-head">
        <h1>Knowledge base<span>· {kbArticles.length} docs · {totalUses} bot references this month</span></h1>
        <div className="actions">
          <button className="btn">Sync now</button>
          <button className="btn primary">+ Upload</button>
        </div>
      </div>
      <div className="kb-layout">
        <div>
          <table className="data-table">
            <thead>
              <tr><th>Title</th><th>Category</th><th>Updated</th><th>Bot uses</th></tr>
            </thead>
            <tbody>
              {kbArticles.map(a => (
                <tr key={a.id}>
                  <td>{a.title}</td>
                  <td><span className="badge">{a.category}</span></td>
                  <td><span className="mono">{a.updated}</span></td>
                  <td><span className="mono">{a.uses}×</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="kb-upload">
          <strong>Drop files here</strong>
          PDF · DOCX · TXT · Markdown
          <div style={{ marginTop: 24, fontSize: 12, color: "var(--muted)", paddingTop: 16, borderTop: "1px solid var(--line)" }}>
            Or paste a URL to auto-scrape:
          </div>
          <input
            placeholder="https://…"
            style={{
              marginTop: 8, width: "100%", padding: 8,
              border: "1px solid var(--line-strong)", background: "var(--paper)",
              color: "var(--ink)", fontFamily: "inherit", fontSize: 13,
            }}
          />
          <button className="btn primary" style={{ marginTop: 12, width: "100%", justifyContent: "center" }}>
            Import
          </button>
        </div>
      </div>
    </>
  );
}
