"use client";

import { useMemo, useState } from "react";
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

const allRows: Row[] = [...contractRows, ...simRows];

const networks: (Network | "All")[] = ["All", "Three", "Vodafone", "Talkmobile", "SIM Free", "Unknown"];

export default function PlansPage() {
  const [kind, setKind] = useState<Kind>("All");
  const [network, setNetwork] = useState<Network | "All">("All");
  const [sort, setSort] = useState<"price-asc" | "price-desc">("price-asc");

  const visible = useMemo(() => {
    let rows = allRows;
    if (kind !== "All") rows = rows.filter(r => r.kind === kind);
    if (network !== "All") rows = rows.filter(r => r.network === network);
    rows = [...rows].sort((a, b) => sort === "price-asc" ? a.monthly - b.monthly : b.monthly - a.monthly);
    return rows;
  }, [kind, network, sort]);

  return (
    <>
      <div className="page-head">
        <h1>Plans & SIMs<span>· {allRows.length} tariffs · sourced from fonehouse.co.uk</span></h1>
        <div className="actions">
          <button className="btn">Sync from Fonehouse</button>
          <button className="btn primary">+ Add plan</button>
        </div>
      </div>

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
              <div className="network">{r.network}{r.tag && r.tag !== "sim-only" && <span style={{ marginLeft: 8, fontSize: 9, color: "var(--signal)", border: "1px solid var(--signal)", padding: "1px 5px" }}>{r.tag.toUpperCase()}</span>}</div>
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
