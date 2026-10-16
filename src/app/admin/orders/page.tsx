"use client";

import { useCallback, useEffect, useState } from "react";
import type { OrderRecord } from "@/lib/store";

const STATUSES: OrderRecord["status"][] = ["confirmed", "dispatching", "delivered", "cancelled"];
const STATUS_LABEL: Record<OrderRecord["status"], string> = {
  confirmed: "Confirmed",
  dispatching: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

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

  const updateOrder = async (id: string, patch: { status?: OrderRecord["status"]; trackingNumber?: string }) => {
    if (patch.status === "dispatching") {
      const order = orders.find(o => o.id === id);
      if (order && !confirm(`Mark ${id} as dispatched and email ${order.email}?`)) return;
    }
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    if (res.ok) {
      const { order } = await res.json();
      setOrders(list => list.map(o => (o.id === id ? order : o)));
    }
  };

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

  const statusTone = (s: OrderRecord["status"]) => {
    if (s === "confirmed") return "hot";
    if (s === "dispatching") return "warm";
    if (s === "delivered") return "won";
    return "lost";
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
            <button className="btn ghost" onClick={clearAllOrders}>
              Delete all
            </button>
          )}
          <a href="/checkout" target="_blank" rel="noreferrer" className="btn" style={{ textDecoration: "none" }}>
            Open checkout ↗
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
            {f[0].toUpperCase() + f.slice(1)}{" "}
            <span className="mono" style={{ opacity: 0.7 }}>
              {f === "all" ? orders.length : orders.filter(o => o.status === f).length}
            </span>
          </button>
        ))}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search order, customer, postcode or tracking"
          style={{ marginLeft: "auto", minWidth: 280 }}
        />
      </div>

      <div className="page-body">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Placed</th>
              <th>Customer</th>
              <th>Deliver to</th>
              <th>Items</th>
              <th>Price</th>
              <th>Tracking</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)" }}>
                  No orders yet. Anything bought through <a href="/checkout" target="_blank" rel="noreferrer" style={{ textDecoration: "underline", color: "var(--ink)" }}>checkout</a> shows up here.
                </td>
              </tr>
            ) : (
              visible.map(o => (
                <tr key={o.id}>
                  <td>
                    <span className="mono" style={{ fontWeight: 600 }}>
                      {o.id}
                    </span>
                  </td>
                  <td><span className="mono">{o.createdAt}</span></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                    <div className="mono" style={{ fontSize: 11.5, color: "var(--muted)" }}>{o.phone}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{o.email}</div>
                  </td>
                  <td>
                    <div>{o.address}</div>
                    <div style={{ color: "var(--muted)" }}>
                      {o.city}, <span className="mono">{o.postcode}</span>
                    </div>
                    {o.pacCode && (
                      <span className="badge" style={{ marginTop: 4 }}>
                        PAC {o.pacCode}
                      </span>
                    )}
                  </td>
                  <td>
                    {o.items.map((item, idx) => (
                      <div key={idx} style={{ fontSize: 13 }}>
                        {item.name}
                      </div>
                    ))}
                  </td>
                  <td>
                    <div className="mono" style={{ fontWeight: 600 }}>{o.monthlyTotal}</div>
                    <div className="mono" style={{ fontSize: 11.5, color: "var(--muted)" }}>{o.upfrontTotal} upfront</div>
                  </td>
                  <td>
                    <input
                      className="mono"
                      defaultValue={o.trackingNumber}
                      placeholder="Add tracking"
                      aria-label={`Tracking number for ${o.id}`}
                      onBlur={e => {
                        const v = e.target.value.trim();
                        if (v !== (o.trackingNumber || "")) updateOrder(o.id, { trackingNumber: v });
                      }}
                      style={{
                        width: 140, height: 28, padding: "0 8px", fontSize: 12,
                        border: "1px solid var(--line)", borderRadius: "var(--r-1)",
                        background: "transparent", color: "var(--ink)",
                      }}
                    />
                  </td>
                  <td>
                    <select
                      className={"status-select " + statusTone(o.status)}
                      value={o.status}
                      aria-label={`Status for ${o.id}`}
                      onChange={e => updateOrder(o.id, { status: e.target.value as OrderRecord["status"] })}
                    >
                      {STATUSES.map(st => (
                        <option key={st} value={st}>{STATUS_LABEL[st]}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="link-action"
                      title="Delete order"
                      onClick={() => deleteOrder(o.id, o.customerName)}
                    >
                      Delete
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
