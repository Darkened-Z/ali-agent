"use client";

import { useState } from "react";
import { leads, type LeadStatus } from "@/lib/mockData";

const filters: (LeadStatus | "all")[] = ["all", "hot", "warm", "cold", "won", "lost"];

export default function LeadsPage() {
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const visible = filter === "all" ? leads : leads.filter(l => l.status === filter);

  const scoreColor = (s: number) =>
    s >= 70 ? "var(--signal)" : s >= 40 ? "var(--ink)" : "var(--muted)";

  return (
    <>
      <div className="page-head">
        <h1>Leads<span>· {leads.length} total · {leads.filter(l => l.status === "hot").length} hot</span></h1>
        <div className="actions">
          <button className="btn">Export CSV</button>
          <button className="btn primary">+ New lead</button>
        </div>
      </div>
      <div className="filters-bar">
        {filters.map(f => (
          <button
            key={f}
            className={"chip " + (filter === f ? "on" : "")}
            onClick={() => setFilter(f)}
          >
            {f.toUpperCase()} · {f === "all" ? leads.length : leads.filter(l => l.status === f).length}
          </button>
        ))}
      </div>
      <div className="page-body">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Phone</th><th>City</th>
              <th>Interest</th><th>Source</th><th>Score</th><th>Status</th><th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(l => (
              <tr key={l.id}>
                <td><span className="mono">{l.id}</span></td>
                <td>{l.name}</td>
                <td><span className="mono">{l.phone}</span></td>
                <td>{l.city}</td>
                <td>{l.interest}</td>
                <td>{l.source}</td>
                <td><span className="mono" style={{ color: scoreColor(l.score), fontWeight: 700 }}>{l.score}</span></td>
                <td>
                  <span className={"badge " + (l.status === "hot" ? "new" : l.status === "warm" ? "bot" : l.status === "won" ? "human" : "")}>
                    {l.status.toUpperCase()}
                  </span>
                </td>
                <td><span className="mono">{l.updated}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
