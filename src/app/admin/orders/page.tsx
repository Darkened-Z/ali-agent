"use client";

import { useCallback, useEffect, useState } from "react";
import type { OrderRecord } from "@/lib/store";

const statusCycle: OrderRecord["status"][] = ["confirmed", "dispatching", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.orders)) setOrders(data.orders);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const visible = orders.filter(o => {
    if (filter !== "all" && o.status !== filter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q) ||
      o.postcode.toLowerCase().includes(q) ||
      o.city.toLowerCase().includes(q) ||
      o.trackingNumber.toLowerCase().includes(q) ||
      o.items.some(i => i.name.toLowerCase().includes(q))
    );
  });

  const exportCsv = () => {
    const header = ["Order ID", "Date", "Customer", "Phone", "Email", "Address", "Postcode", "Items", "Monthly", "Upfront", "Status", "DPD Tracking"];
    const rows = visible.map(o =>
      [
        o.id,
        o.createdAt,
        o.customerName,
        o.phone,
        o.email,
        o.address,
        o.postcode,
        o.items.map(i => i.name).join(" + "),
        o.monthlyTotal,
        o.upfrontTotal,
        o.status,
        o.trackingNumber,
      ]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `three-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteOrder = async (id: string, name: string) => {
    if (!confirm(`Delete order ${id} for ${name}?`)) return;
    await fetch(`/api/orders?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await loadOrders();
    window.dispatchEvent(new Event("ali-store-updated"));
  };

  const clearAllOrders = async () => {
    if (!confirm("Are you sure you want to clear all orders?")) return;
    await fetch("/api/orders?all=true", { method: "DELETE" });
    await loadOrders();
    window.dispatchEvent(new Event("ali-store-updated"));
  };

  const statusBadgeClass = (s: OrderRecord["status"]) => {
    if (s === "confirmed") return "badge new";
    if (s === "dispatching") return "badge bot";
    if (s === "delivered") return "badge human";
    return "badge";
  };

  return (
    <>
      <div className="page-head">
        <h1>
          Orders
          <span>
            · {orders.length} total · {orders.filter(o => o.status === "confirmed").length} confirmed
          </span>
        </h1>
        <div className="actions">
          <button className="btn" onClick={exportCsv}>Export CSV</button>
          {orders.length > 0 && (
            <button
              className="btn"
              style={{ color: "#d32f2f", borderColor: "#ffcdd2" }}
              onClick={clearAllOrders}
            >
              Clear all
            </button>
          )}
          <a href="/checkout" target="_blank" className="btn primary" style={{ textDecoration: "none" }}>
            + Test Checkout (/checkout)
          </a>
        </div>
      </div>

      <div className="filters-bar">
        {["all", "confirmed", "dispatching", "delivered", "cancelled"].map(f => (
          <button
            key={f}
            className={"chip " + (filter === f ? "on" : "")}
            onClick={() => setFilter(f)}
          >
            {f.toUpperCase()} · {f === "all" ? orders.length : orders.filter(o => o.status === f).length}
          </button>
        ))}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by order ID, customer, postcode, DPD tracking…"
          style={{
            marginLeft: "auto",
            padding: "4px 10px",
            border: "1px solid var(--line-strong)",
            background: "var(--paper)",
            color: "var(--ink)",
            fontSize: 12,
            minWidth: 260,
          }}
        />
      </div>

      <div className="page-body">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order Ref</th>
              <th>Placed</th>
              <th>Customer</th>
              <th>Delivery Destination</th>
              <th>Order Items</th>
              <th>Monthly / Upfront</th>
              <th>DPD Tracking</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)" }}>
                  No orders found. Customers who complete checkout on <a href="/checkout" target="_blank" style={{ textDecoration: "underline", color: "var(--ink)" }}>/checkout</a> will show here automatically.
                </td>
              </tr>
            ) : (
              visible.map(o => (
                <tr key={o.id}>
                  <td>
                    <span className="mono" style={{ fontWeight: 700, color: "var(--signal)" }}>
                      {o.id}
                    </span>
                  </td>
                  <td><span className="mono">{o.createdAt}</span></td>
                  <td>
                    <div><strong>{o.customerName}</strong></div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{o.phone}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>{o.email}</div>
                  </td>
                  <td>
                    <div>{o.address}</div>
                    <div className="mono" style={{ fontWeight: 600 }}>{o.city}, {o.postcode}</div>
                    {o.pacCode && (
                      <span className="badge" style={{ marginTop: 4, background: "#fdf2f0", borderColor: "#ffaba9", color: "#000" }}>
                        PAC: {o.pacCode}
                      </span>
                    )}
                  </td>
                  <td>
                    {o.items.map((item, idx) => (
                      <div key={idx} style={{ fontSize: 12 }}>
                        • <strong>{item.name}</strong>
                      </div>
                    ))}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{o.monthlyTotal}</div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{o.upfrontTotal} upfront</div>
                  </td>
                  <td>
                    <span className="mono" style={{ fontSize: 12, background: "var(--paper-2)", padding: "2px 6px" }}>
                      {o.trackingNumber}
                    </span>
                  </td>
                  <td>
                    <span className={statusBadgeClass(o.status)}>
                      {o.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "#c00", cursor: "pointer", fontSize: 13, padding: "2px 6px" }}
                      title="Delete order"
                      onClick={() => deleteOrder(o.id, o.customerName)}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
