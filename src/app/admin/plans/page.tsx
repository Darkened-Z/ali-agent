"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { phoneDeals, simOnlyPlans, type Network } from "@/lib/plans";

type Kind = "All" | "Contract" | "SIM only";
const kinds: Kind[] = ["All", "Contract", "SIM only"];

type Row = {
  id: string;
  network: Network;
  title: string;
  sub: string;
  monthly: number;
  monthlyLabel: string;
  contractLabel: string;
  extraRight: string;
  kind: "Contract" | "SIM only";
  tag?: string;
};

const contractRows: Row[] = phoneDeals.map(d => ({
  id: d.id,
  network: d.network,
  title: `${d.model} · ${d.storageGb} GB`,
  sub: `${d.colour} · ${d.dataGb === "unlimited" ? "Unlimited" : d.dataGb + "GB"}${d.fiveG ? " 5G" : ""} · Unlimited mins & texts`,
  monthly: d.monthly,
  monthlyLabel: `£${d.monthly.toFixed(d.monthly % 1 ? 2 : 0)} / mo`,
  contractLabel: `${d.contractMonths}m · £${d.upfront} upfront`,
  extraRight: d.totalCost ? `Total £${d.totalCost.toLocaleString()}` : "",
  kind: "Contract",
  tag: d.tags?.[0],
}));

const simRows: Row[] = simOnlyPlans.map(p => ({
  id: p.id,
  network: p.network,
  title: `${p.network} · ${p.contractMonths === 1 ? "Rolling 30-day SIM" : `${p.contractMonths}-month SIM`}`,
  sub: `${p.dataGb === "unlimited" ? "Unlimited" : p.dataGb + "GB"}${p.fiveG ? " 5G" : ""} · Unlimited mins & texts`,
  monthly: p.monthly,
  monthlyLabel: `£${p.monthly.toFixed(p.monthly % 1 ? 2 : 0)} / mo`,
  contractLabel: p.contractMonths === 1 ? "Rolling · £0 upfront" : `${p.contractMonths}m · £0 upfront`,
  extraRight: p.cashback ? `£${p.cashback} cashback` : "",
  kind: "SIM only",
  tag: "sim-only",
}));

const baseRows: Row[] = [...contractRows, ...simRows];
const networks: (Network | "All")[] = ["All", "Three", "Vodafone", "Talkmobile", "EE", "O2", "SMARTY"];

export default function PlansPage() {
  const [customRows, setCustomRows] = useState<Row[]>([]);
  const [lastSynced, setLastSynced] = useState<string>("Aug 24, 14:00");
  const [syncing, setSyncing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const [newKind, setNewKind] = useState<"Contract" | "SIM only">("Contract");
  const [newNetwork, setNewNetwork] = useState<Network>("Three");
  const [newTitle, setNewTitle] = useState("");
  const [newSub, setNewSub] = useState("100GB 5G · Unlimited mins & texts");
  const [newMonthly, setNewMonthly] = useState("29");
  const [newUpfront, setNewUpfront] = useState("0");

  const [kind, setKind] = useState<Kind>("All");
  const [network, setNetwork] = useState<Network | "All">("All");
  const [sort, setSort] = useState<"price-asc" | "price-desc">("price-asc");

  const loadCatalogue = useCallback(async () => {
    try {
      const res = await fetch("/api/catalogue", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.customPlans)) setCustomRows(data.customPlans);
      if (data.lastCatalogueSync) setLastSynced(data.lastCatalogueSync);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadCatalogue();
  }, [loadCatalogue]);

  const allRows = useMemo(() => [...customRows, ...baseRows], [customRows]);

  const visible = useMemo(() => {
    let rows = allRows;
    if (kind !== "All") rows = rows.filter(r => r.kind === kind);
    if (network !== "All") rows = rows.filter(r => r.network === network);
    rows = [...rows].sort((a, b) => (sort === "price-asc" ? a.monthly - b.monthly : b.monthly - a.monthly));
    return rows;
  }, [allRows, kind, network, sort]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/catalogue", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "sync" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.lastCatalogueSync) setLastSynced(data.lastCatalogueSync);
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleAddPlan = async () => {
    if (!newTitle.trim()) return;
    const res = await fetch("/api/catalogue", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "plan",
        kind: newKind,
        network: newNetwork,
        title: newTitle,
        sub: newSub,
        monthly: Number(newMonthly) || 29,
        upfront: Number(newUpfront) || 0,
        contractMonths: newKind === "SIM only" ? 1 : 24,
      }),
    });
    if (res.ok) {
      setNewTitle("");
      setShowAdd(false);
      await loadCatalogue();
      window.dispatchEvent(new Event("ali-store-updated"));
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>
          Plans &amp; SIMs
          <span>
            · {allRows.length} tariffs · synced {lastSynced}
          </span>
        </h1>
        <div className="actions">
          <button className="btn" onClick={handleSync} disabled={syncing}>
            {syncing ? "Syncing…" : "Sync from Fonehouse"}
          </button>
          <button className="btn primary" onClick={() => setShowAdd(v => !v)}>
            {showAdd ? "Cancel" : "+ Add plan"}
          </button>
        </div>
      </div>

      {showAdd && (
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--line)",
            background: "var(--paper-2)",
            display: "grid",
            gridTemplateColumns: "130px 130px 1.2fr 1.2fr 90px 90px auto",
            gap: 10,
            alignItems: "end",
          }}
        >
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>KIND</label>
            <select
              value={newKind}
              onChange={e => setNewKind(e.target.value as "Contract" | "SIM only")}
              style={{ fontSize: 13, padding: "8px 10px" }}
            >
              <option value="Contract">Contract</option>
              <option value="SIM only">SIM only</option>
            </select>
          </div>
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>NETWORK</label>
            <select
              value={newNetwork}
              onChange={e => setNewNetwork(e.target.value as Network)}
              style={{ fontSize: 13, padding: "8px 10px" }}
            >
              <option value="Three">Three</option>
              <option value="Vodafone">Vodafone</option>
              <option value="Talkmobile">Talkmobile</option>
              <option value="EE">EE</option>
              <option value="O2">O2</option>
              <option value="SMARTY">SMARTY</option>
            </select>
          </div>
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>TITLE</label>
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="e.g. iPhone 17 · 512 GB"
              style={{ fontSize: 13, padding: "8px 10px" }}
            />
          </div>
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>SPECS</label>
            <input
              value={newSub}
              onChange={e => setNewSub(e.target.value)}
              style={{ fontSize: 13, padding: "8px 10px" }}
            />
          </div>
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>£ / MO</label>
            <input
              value={newMonthly}
              onChange={e => setNewMonthly(e.target.value)}
              style={{ fontSize: 13, padding: "8px 10px" }}
            />
          </div>
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>£ UPFRONT</label>
            <input
              value={newUpfront}
              onChange={e => setNewUpfront(e.target.value)}
              style={{ fontSize: 13, padding: "8px 10px" }}
            />
          </div>
          <button
            className="btn primary"
            onClick={handleAddPlan}
            disabled={!newTitle.trim()}
            style={{ height: 37 }}
          >
            Save plan
          </button>
        </div>
      )}

      <div className="filters-bar">
        {kinds.map(k => (
          <button key={k} className={"chip " + (kind === k ? "on" : "")} onClick={() => setKind(k)}>
            {k.toUpperCase()} · {k === "All" ? allRows.length : allRows.filter(r => r.kind === k).length}
          </button>
        ))}
        <span style={{ width: 1, background: "var(--line)", alignSelf: "stretch", margin: "0 4px" }} />
        {networks.map(n => (
          <button key={n} className={"chip " + (network === n ? "on" : "")} onClick={() => setNetwork(n)}>
            {n === "All" ? "ALL NETWORKS" : n.toUpperCase()} · {n === "All" ? allRows.length : allRows.filter(r => r.network === n).length}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted)", display: "flex", gap: 4 }}>
          <button className={"chip " + (sort === "price-asc" ? "on" : "")} onClick={() => setSort("price-asc")}>£ LOW → HIGH</button>
          <button className={"chip " + (sort === "price-desc" ? "on" : "")} onClick={() => setSort("price-desc")}>£ HIGH → LOW</button>
        </span>
      </div>

      <div className="page-body">
        <div className="card-grid">
          {visible.map(r => (
            <div key={r.id} className="plan-card">
              <div className="network">
                {r.network}
                {r.tag && r.tag !== "sim-only" && (
                  <span style={{ marginLeft: 8, fontSize: 9, color: "var(--signal)", border: "1px solid var(--signal)", padding: "1px 5px" }}>
                    {r.tag.toUpperCase()}
                  </span>
                )}
              </div>
              <h3>{r.title}</h3>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>{r.sub}</div>
              <div className="price">{r.monthlyLabel}</div>
              <div className="meta">
                <span>{r.contractLabel}</span>
                {r.extraRight && <span style={{ color: "var(--ok)" }}>{r.extraRight}</span>}
              </div>
            </div>
          ))}
          {visible.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", gridColumn: "1 / -1" }}>
              No tariffs match those filters.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
