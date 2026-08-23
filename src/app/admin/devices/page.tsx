"use client";

import { useMemo, useState } from "react";
import { phoneModels, refurbPhones, simFreePhones, type Brand } from "@/lib/plans";

type Kind = "All" | "New" | "SIM-free" | "Refurbished";
const kinds: Kind[] = ["All", "New", "SIM-free", "Refurbished"];
const brands: (Brand | "All")[] = ["All", "Apple", "Samsung", "Google", "Honor", "Doro"];

type Row = {
  id: string;
  brand: Brand;
  name: string;
  variant: string;
  price: string;
  meta: string;
  kind: "New" | "SIM-free" | "Refurbished";
};

const newRows: Row[] = phoneModels.map(m => ({
  id: `M-${m.model.replace(/\s+/g, "-")}`,
  brand: m.brand,
  name: m.model,
  variant: `${m.storages[0] ?? "—"} GB · ${m.colours[0] ?? "—"}`,
  price: `from £${m.fromMonthly.toFixed(m.fromMonthly % 1 ? 2 : 0)} / mo`,
  meta: m.simFreeFrom ? `SIM-free from £${m.simFreeFrom.toLocaleString()}` : "Contract only",
  kind: "New",
}));

const simFreeRows: Row[] = simFreePhones.map(p => ({
  id: p.id,
  brand: p.brand,
  name: p.model,
  variant: `${p.storageGb ? p.storageGb + " GB · " : ""}${p.colours.join(" / ") || "—"}`,
  price: `£${p.price.toLocaleString(undefined, { minimumFractionDigits: p.price % 1 ? 2 : 0 })}`,
  meta: "SIM-free · outright",
  kind: "SIM-free",
}));

const refurbRows: Row[] = refurbPhones.map(p => ({
  id: p.id,
  brand: p.brand,
  name: p.model,
  variant: `${p.storageGb} GB · ${p.colour}`,
  price: `£${p.simFreePrice.toLocaleString()}`,
  meta: `${p.grade} · SIM-free`,
  kind: "Refurbished",
}));

const allRows: Row[] = [...newRows, ...simFreeRows, ...refurbRows];

export default function DevicesPage() {
  const [kind, setKind] = useState<Kind>("All");
  const [brand, setBrand] = useState<Brand | "All">("All");

  const visible = useMemo(() => {
    let rows = allRows;
    if (kind !== "All") rows = rows.filter(r => r.kind === kind);
    if (brand !== "All") rows = rows.filter(r => r.brand === brand);
    return rows;
  }, [kind, brand]);

  return (
    <>
      <div className="page-head">
        <h1>Devices<span>· {allRows.length} SKUs · sourced from fonehouse.co.uk</span></h1>
        <div className="actions">
          <button className="btn">Sync from Fonehouse</button>
          <button className="btn primary">+ Add device</button>
        </div>
      </div>

      <div className="filters-bar">
        {kinds.map(k => (
          <button key={k} className={"chip " + (kind === k ? "on" : "")} onClick={() => setKind(k)}>
            {k.toUpperCase()} · {k === "All" ? allRows.length : allRows.filter(r => r.kind === k).length}
          </button>
        ))}
        <span style={{ width: 1, background: "var(--line)", alignSelf: "stretch", margin: "0 4px" }} />
        {brands.map(b => (
          <button key={b} className={"chip " + (brand === b ? "on" : "")} onClick={() => setBrand(b)}>
            {b.toUpperCase()} · {b === "All" ? allRows.length : allRows.filter(r => r.brand === b).length}
          </button>
        ))}
      </div>

      <div className="page-body">
        <div className="card-grid four">
          {visible.map(d => (
            <div key={d.id} className="device-card">
              <div className="network">{d.brand} · <span style={{ color: "var(--muted)" }}>{d.kind}</span></div>
              <h3>{d.name}</h3>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>{d.variant}</div>
              <div className="price">{d.price}</div>
              <div className="meta">
                <span>{d.id.slice(0, 22).toUpperCase()}</span>
                <span style={{ color: "var(--ok)" }}>{d.meta}</span>
              </div>
            </div>
          ))}
          {visible.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", gridColumn: "1 / -1" }}>
              No devices match those filters.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
