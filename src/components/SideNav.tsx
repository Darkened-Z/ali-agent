"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ThreeLogo } from "./ThreeLogo";
import { conversations, leads, broadcasts } from "@/lib/mockData";
import { phoneDeals, simOnlyPlans, phoneModels, refurbPhones, simFreePhones } from "@/lib/plans";

const basePlansCount = phoneDeals.length + simOnlyPlans.length;
const baseDevicesCount = phoneModels.length + refurbPhones.length + simFreePhones.length;

const setup = [
  { href: "/admin/bot", label: "Bot prompt" },
  { href: "/admin/kb", label: "Knowledge base" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/settings", label: "Settings" },
];

export function SideNav() {
  const pathname = usePathname();
  const [counts, setCounts] = useState({
    conversations: conversations.filter(c => c.status !== "closed").length,
    orders: 2,
    leads: leads.length,
    plans: basePlansCount,
    devices: baseDevicesCount,
    broadcasts: broadcasts.filter(b => b.status !== "sent").length,
  });
  const [botEnabled, setBotEnabled] = useState(true);
  const [botModel, setBotModel] = useState("haiku");

  const refreshSidebar = useCallback(async () => {
    try {
      const [resConv, resOrders] = await Promise.all([
        fetch("/api/conversations", { cache: "no-store" }),
        fetch("/api/orders", { cache: "no-store" }),
      ]);
      const dataConv = resConv.ok ? await resConv.json() : null;
      const dataOrders = resOrders.ok ? await resOrders.json() : null;

      if (dataConv?.counts) {
        setCounts({
          conversations: dataConv.counts.conversations,
          orders: Array.isArray(dataOrders?.orders) ? dataOrders.orders.length : 2,
          leads: dataConv.counts.leads,
          plans: basePlansCount + (dataConv.counts.customPlans || 0),
          devices: baseDevicesCount + (dataConv.counts.customDevices || 0),
          broadcasts: dataConv.counts.broadcasts,
        });
      }
      if (typeof dataConv?.botEnabled === "boolean") setBotEnabled(dataConv.botEnabled);
      if (dataConv?.botModel) setBotModel(dataConv.botModel);
    } catch {
      // Keep fallback counts
    }
  }, []);

  useEffect(() => {
    refreshSidebar();
    const onUpdate = () => refreshSidebar();
    window.addEventListener("ali-store-updated", onUpdate);
    return () => window.removeEventListener("ali-store-updated", onUpdate);
  }, [refreshSidebar, pathname]);

  const toggleBotGlobal = async () => {
    const next = !botEnabled;
    setBotEnabled(next);
    try {
      await fetch("/api/bot", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ botEnabled: next }),
      });
      window.dispatchEvent(new Event("ali-store-updated"));
    } catch {
      setBotEnabled(!next);
    }
  };

  const workspace = [
    { href: "/admin", label: "Conversations", count: counts.conversations },
    { href: "/admin/orders", label: "Orders", count: counts.orders },
    { href: "/admin/leads", label: "Leads", count: counts.leads },
    { href: "/admin/plans", label: "Plans & SIMs", count: counts.plans },
    { href: "/admin/devices", label: "Devices", count: counts.devices },
    { href: "/admin/broadcasts", label: "Broadcasts", count: counts.broadcasts },
  ];

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);

  const link = (item: { href: string; label: string; count?: number }) => (
    <Link
      key={item.href}
      href={item.href}
      className={"side-item " + (isActive(item.href) ? "active" : "")}
      style={{ textDecoration: "none" }}
    >
      <span className="side-icon" />
      <span>{item.label}</span>
      {item.count !== undefined && <span className="mono">{String(item.count).padStart(2, "0")}</span>}
    </Link>
  );

  return (
    <aside className="admin-side">
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 10px 14px",
          borderBottom: "1px solid #1f232e",
          marginBottom: 12,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #ff7b67 0%, #ffaba9 100%)",
            borderRadius: 8,
            padding: "5px 6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(255, 123, 103, 0.3)",
          }}
        >
          <ThreeLogo size={22} fill="#000" />
        </div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: "-0.02em", color: "#ffffff" }}>
            Three UK Admin
          </div>
          <div style={{ fontSize: 10, color: "#ff7b67", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Call Center Hub
          </div>
        </div>
      </Link>

      <div className="side-label">Workspace</div>
      {workspace.map(link)}

      <div className="side-label">Setup</div>
      {setup.map(link)}

      <div className="side-footer">
        <button
          type="button"
          className="bot-toggle"
          onClick={toggleBotGlobal}
          title="Click to toggle global AI auto-reply"
          style={{
            background: "transparent",
            color: "inherit",
            fontFamily: "inherit",
            fontSize: "inherit",
            cursor: "pointer",
            width: "100%",
          }}
        >
          <span>
            <span
              className="dot"
              style={{ background: botEnabled ? "var(--ok)" : "var(--warn)" }}
            />
            {botEnabled ? "Bot ON" : "Bot PAUSED"}
          </span>
          <span className="mono">{botModel.toUpperCase()}-4-5</span>
        </button>
        <span>Ali Rehman · Owner</span>
      </div>
    </aside>
  );
}
