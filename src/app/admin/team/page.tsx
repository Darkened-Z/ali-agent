"use client";

import { useCallback, useEffect, useState } from "react";
import { team as initialTeam } from "@/lib/mockData";

type Member = {
  id: string;
  name: string;
  role: string;
  email: string;
  active: string;
  handled: number;
};

const ROLES = ["Owner", "Senior agent", "Agent", "Logistics"];

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>(initialTeam);
  const [showInvite, setShowInvite] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Agent");
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadTeam = useCallback(async () => {
    try {
      const res = await fetch("/api/team", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.team)) setMembers(data.team);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const handleInvite = async () => {
    if (!name.trim() || !email.trim()) return;
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, role }),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.team)) setMembers(data.team);
      setName("");
      setEmail("");
      setShowInvite(false);
    }
  };

  const handleUpdateRole = async (id: string, nextRole: string) => {
    const res = await fetch("/api/team", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, role: nextRole }),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.team)) setMembers(data.team);
      setEditingId(null);
    }
  };

  const handleRemove = async (id: string) => {
    const res = await fetch(`/api/team?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.team)) setMembers(data.team);
      setEditingId(null);
    }
  };

  const totalHandled = members.reduce((s, t) => s + t.handled, 0);

  return (
    <>
      <div className="page-head">
        <h1>
          Team
          <span>
            · {members.length} members · {totalHandled} conversations handled today
          </span>
        </h1>
        <div className="actions">
          <button
            className={"btn " + (showPermissions ? "primary" : "")}
            onClick={() => setShowPermissions(v => !v)}
          >
            Roles &amp; permissions
          </button>
          <button
            className="btn primary"
            onClick={() => setShowInvite(v => !v)}
          >
            {showInvite ? "Cancel" : "Add member"}
          </button>
        </div>
      </div>

      {showPermissions && (
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--line)",
            background: "var(--paper-2)",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            fontSize: 12,
          }}
        >
          <div style={{ padding: 12, background: "var(--paper)", border: "1px solid var(--line)" }}>
            <div className="mono" style={{ fontWeight: 700, marginBottom: 4 }}>OWNER</div>
            <div style={{ color: "var(--muted)" }}>Full access: billing, WhatsApp keys, bot prompt deploy, broadcasts &amp; team management.</div>
          </div>
          <div style={{ padding: 12, background: "var(--paper)", border: "1px solid var(--line)" }}>
            <div className="mono" style={{ fontWeight: 700, marginBottom: 4 }}>SENIOR AGENT</div>
            <div style={{ color: "var(--muted)" }}>Take over chats, approve price-match discounts, send broadcasts &amp; edit KB docs.</div>
          </div>
          <div style={{ padding: 12, background: "var(--paper)", border: "1px solid var(--line)" }}>
            <div className="mono" style={{ fontWeight: 700, marginBottom: 4 }}>AGENT</div>
            <div style={{ color: "var(--muted)" }}>Handle assigned WhatsApp &amp; web chats, update lead statuses, and log call notes.</div>
          </div>
          <div style={{ padding: 12, background: "var(--paper)", border: "1px solid var(--line)" }}>
            <div className="mono" style={{ fontWeight: 700, marginBottom: 4 }}>LOGISTICS</div>
            <div style={{ color: "var(--muted)" }}>Manage device stock, DPD/Royal Mail dispatch tracking, and SIM fulfilment.</div>
          </div>
        </div>
      )}

      {showInvite && (
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--line)",
            background: "var(--paper-2)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 180px auto",
            gap: 10,
            alignItems: "end",
          }}
        >
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>FULL NAME</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Bilal Tariq"
              style={{ fontSize: 13, padding: "8px 10px" }}
            />
          </div>
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>WORK EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="bilal@aliagent.co.uk"
              style={{ fontSize: 13, padding: "8px 10px" }}
            />
          </div>
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>ROLE</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              style={{ fontSize: 13, padding: "8px 10px" }}
            >
              {ROLES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <button
            className="btn primary"
            onClick={handleInvite}
            disabled={!name.trim() || !email.trim()}
            style={{ height: 37 }}
          >
            Add member
          </button>
          <p className="hint" style={{ gridColumn: "1 / -1", margin: 0 }}>
            Once added, they create their own login at <span className="mono">/login</span> → “First time? Create your
            account” using this email. Removing them here revokes access.
          </p>
        </div>
      )}

      <div className="page-body">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th><th>Role</th><th>Email</th>
              <th>Last active</th><th>Handled today</th><th></th>
            </tr>
          </thead>
          <tbody>
            {members.map(t => (
              <tr key={t.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600 }}>
                    <span style={{
                      width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                      background: "var(--paper-2)", color: "var(--ink-2)",
                      display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11,
                    }}>
                      {t.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                    </span>
                    {t.name}
                  </div>
                </td>
                <td>
                  {editingId === t.id ? (
                    <select
                      value={t.role}
                      onChange={e => handleUpdateRole(t.id, e.target.value)}
                      className="status-select"
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="badge">{t.role}</span>
                  )}
                </td>
                <td><span className="mono" style={{ fontSize: 12 }}>{t.email}</span></td>
                <td><span className="mono" style={{ fontSize: 12 }}>{t.active}</span></td>
                <td><span className="mono">{t.handled}</span></td>
                <td style={{ textAlign: "right" }}>
                  {editingId === t.id ? (
                    <div style={{ display: "inline-flex", gap: 6 }}>
                      <button className="btn danger" onClick={() => handleRemove(t.id)}>
                        Remove
                      </button>
                      <button className="btn" onClick={() => setEditingId(null)}>
                        Done
                      </button>
                    </div>
                  ) : (
                    <button className="btn ghost" onClick={() => setEditingId(t.id)}>
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
