"use client";

import { useCallback, useEffect, useState } from "react";
import { leads as initialLeads, type LeadStatus } from "@/lib/mockData";

type LeadItem = {
  id: string;
  name: string;
  phone: string;
  city: string;
  interest: string;
  source: string;
  score: number;
  status: LeadStatus;
  updated: string;
};

const filters: (LeadStatus | "all")[] = ["all", "hot", "warm", "cold", "won", "lost"];
const statusCycle: LeadStatus[] = ["hot", "warm", "won", "cold", "lost"];

export default function LeadsPage() {
  const [list, setList] = useState<LeadItem[]>(initialLeads);
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [saving, setSaving] = useState(false);

  const loadLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/leads", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.leads)) setList(data.leads);
    } catch {
      // keep existing
    }
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const visible = list.filter(l => {
    if (filter !== "all" && l.status !== filter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      l.id.toLowerCase().includes(q) ||
      l.name.toLowerCase().includes(q) ||
      l.phone.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q) ||
      l.interest.toLowerCase().includes(q)
    );
  });

  const scoreColor = (s: number) =>
    s >= 70 ? "var(--signal)" : s >= 40 ? "var(--ink)" : "var(--muted)";

  const exportCsv = () => {
    const header = ["ID", "Name", "Phone", "City", "Interest", "Source", "Score", "Status", "Updated"];
    const rows = visible.map(l =>
      [l.id, l.name, l.phone, l.city, l.interest, l.source, String(l.score), l.status, l.updated]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `three-uk-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateLead = async () => {
    if (!newName.trim() || !newPhone.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: newName,
          phone: newPhone,
          city: newCity || "London",
          interest: newInterest || "iPhone 17 · 256GB",
          source: "Manual · Admin",
        }),
      });
      if (res.ok) {
        setNewName("");
        setNewPhone("");
        setNewCity("");
        setNewInterest("");
        setShowAdd(false);
        await loadLeads();
        window.dispatchEvent(new Event("ali-store-updated"));
      }
    } finally {
      setSaving(false);
    }
  };

  const setLeadStatus = async (lead: LeadItem, status: LeadStatus) => {
    const res = await fetch("/api/leads", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: lead.id, status }),
    });
    if (res.ok) {
      await loadLeads();
      window.dispatchEvent(new Event("ali-store-updated"));
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>
          Leads
          <span>
            · {list.length} total · {list.filter(l => l.status === "hot").length} hot
          </span>
        </h1>
        <div className="actions">
          <button className="btn" onClick={exportCsv}>Export CSV</button>
          {list.length > 0 && (
            <button
              className="btn ghost"
              onClick={async () => {
                if (!confirm(`Delete all ${list.length} leads? This can't be undone.`)) return;
                await fetch("/api/leads?all=true", { method: "DELETE" });
                await loadLeads();
                window.dispatchEvent(new Event("ali-store-updated"));
              }}
            >
              Delete all
            </button>
          )}
          <button className="btn primary" onClick={() => setShowAdd(v => !v)}>
            {showAdd ? "Cancel" : "Add lead"}
          </button>
        </div>
      </div>

      {showAdd && (
        <div
          style={{
            padding: "16px 28px",
            borderBottom: "1px solid var(--line)",
            background: "var(--paper)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1.2fr auto",
            gap: 10,
            alignItems: "end",
          }}
        >
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>NAME</label>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
            />
          </div>
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>PHONE</label>
            <input
              value={newPhone}
              onChange={e => setNewPhone(e.target.value)}
              placeholder="+44 7700 900123"
            />
          </div>
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>CITY</label>
            <input
              value={newCity}
              onChange={e => setNewCity(e.target.value)}
              placeholder="London"
            />
          </div>
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>INTERESTED IN</label>
            <input
              value={newInterest}
              onChange={e => setNewInterest(e.target.value)}
              placeholder="iPhone 17 · 256GB · Vodafone"
            />
          </div>
          <button
            className="btn primary"
            onClick={handleCreateLead}
            disabled={!newName.trim() || !newPhone.trim() || saving}
            style={{ height: 38 }}
          >
            {saving ? "Saving…" : "Save lead"}
          </button>
        </div>
      )}

      <div className="filters-bar">
        {filters.map(f => (
          <button
            key={f}
            className={"chip " + (filter === f ? "on" : "")}
            onClick={() => setFilter(f)}
          >
            {f[0].toUpperCase() + f.slice(1)}{" "}
            <span className="mono" style={{ opacity: 0.7 }}>
              {f === "all" ? list.length : list.filter(l => l.status === f).length}
            </span>
          </button>
        ))}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name, phone, city or interest"
          style={{ marginLeft: "auto", minWidth: 260 }}
        />
      </div>

      <div className="page-body">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Phone</th><th>City</th>
              <th>Interest</th><th>Source</th><th>Score</th><th>Status</th><th>Updated</th><th aria-label="Actions" />
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
                  <select
                    className={"status-select " + l.status}
                    value={l.status}
                    aria-label={`Status for ${l.name}`}
                    onChange={e => setLeadStatus(l, e.target.value as LeadStatus)}
                  >
                    {statusCycle.map(st => (
                      <option key={st} value={st}>
                        {st[0].toUpperCase() + st.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>
                <td><span className="mono">{l.updated}</span></td>
                <td>
                  <button
                    type="button"
                    className="link-action"
                    title="Delete lead"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!confirm(`Delete lead ${l.name} (${l.id})?`)) return;
                      await fetch(`/api/leads?id=${encodeURIComponent(l.id)}`, { method: "DELETE" });
                      await loadLeads();
                      window.dispatchEvent(new Event("ali-store-updated"));
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
