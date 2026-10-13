"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

const baseRows: Row[] = [...newRows, ...simFreeRows, ...refurbRows];

export default function DevicesPage() {
  const [customRows, setCustomRows] = useState<Row[]>([]);
  const [lastSynced, setLastSynced] = useState("Aug 24, 14:00");
  const [syncing, setSyncing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const [newBrand, setNewBrand] = useState<Brand>("Apple");
  const [newKind, setNewKind] = useState<"New" | "SIM-free" | "Refurbished">("New");
  const [newName, setNewName] = useState("");
  const [newVariant, setNewVariant] = useState("256 GB · Black");
  const [newPrice, setNewPrice] = useState("£899");

  const [kind, setKind] = useState<Kind>("All");
  const [brand, setBrand] = useState<Brand | "All">("All");

  const loadCatalogue = useCallback(async () => {
    try {
      const res = await fetch("/api/catalogue", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.customDevices)) setCustomRows(data.customDevices);
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
    if (brand !== "All") rows = rows.filter(r => r.brand === brand);
    return rows;
  }, [allRows, kind, brand]);

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

  const handleAddDevice = async () => {
    if (!newName.trim()) return;
    const res = await fetch("/api/catalogue", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "device",
        brand: newBrand,
        kind: newKind,
        name: newName,
        variant: newVariant,
        price: newPrice,
        meta: `${newKind} · In stock`,
      }),
    });
    if (res.ok) {
      setNewName("");
      setShowAdd(false);
      await loadCatalogue();
      window.dispatchEvent(new Event("ali-store-updated"));
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>
          Devices
          <span>
            · {allRows.length} SKUs · synced {lastSynced}
          </span>
        </h1>
        <div className="actions">
          <button className="btn" onClick={handleSync} disabled={syncing}>
            {syncing ? "Syncing…" : "Sync from Fonehouse"}
          </button>
          <button className="btn primary" onClick={() => setShowAdd(v => !v)}>
            {showAdd ? "Cancel" : "+ Add device"}
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
            gridTemplateColumns: "130px 140px 1fr 1fr 120px auto",
            gap: 10,
            alignItems: "end",
          }}
        >
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>BRAND</label>
            <select
              value={newBrand}
              onChange={e => setNewBrand(e.target.value as Brand)}
              style={{ fontSize: 13, padding: "8px 10px" }}
            >
              <option value="Apple">Apple</option>
              <option value="Samsung">Samsung</option>
              <option value="Google">Google</option>
              <option value="Honor">Honor</option>
              <option value="Doro">Doro</option>
            </select>
          </div>
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>KIND</label>
            <select
              value={newKind}
              onChange={e => setNewKind(e.target.value as "New" | "SIM-free" | "Refurbished")}
              style={{ fontSize: 13, padding: "8px 10px" }}
            >
              <option value="New">New</option>
              <option value="SIM-free">SIM-free</option>
              <option value="Refurbished">Refurbished</option>
            </select>
          </div>
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>MODEL NAME</label>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. iPhone 17 Ultra"
              style={{ fontSize: 13, padding: "8px 10px" }}
            />
          </div>
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>VARIANT</label>
            <input
              value={newVariant}
              onChange={e => setNewVariant(e.target.value)}
              style={{ fontSize: 13, padding: "8px 10px" }}
            />
          </div>
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>PRICE</label>
            <input
              value={newPrice}
              onChange={e => setNewPrice(e.target.value)}
              style={{ fontSize: 13, padding: "8px 10px" }}
            />
          </div>
          <button
            className="btn primary"
            onClick={handleAddDevice}
            disabled={!newName.trim()}
            style={{ height: 37 }}
          >
            Save device
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
