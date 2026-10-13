"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ThreeLogo } from "./ThreeLogo";
import { conversations, leads, broadcasts } from "@/lib/mockData";
import { phoneDeals, simOnlyPlans, phoneModels, refurbPhones, simFreePhones } from "@/lib/plans";

const basePlansCount = phoneDeals.length + simOnlyPlans.length;
const baseDevicesCount = phoneModels.length + refurbPhones.length + simFreePhones.length;

function NavIcon({ type }: { type: string }) {
  const props = {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (type) {
    case "conversations":
      return (
        <svg {...props}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "orders":
      return (
        <svg {...props}>
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-2z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      );
    case "leads":
      return (
        <svg {...props}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "plans":
      return (
        <svg {...props}>
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="8" y1="6" x2="8" y2="8" />
          <line x1="16" y1="6" x2="16" y2="8" />
          <line x1="12" y1="6" x2="12" y2="8" />
          <path d="M8 12h8v6H8z" />
        </svg>
      );
    case "devices":
      return (
        <svg {...props}>
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );
    case "broadcasts":
      return (
        <svg {...props}>
          <path d="M3 11l18-5v12L3 13v-2z" />
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </svg>
      );
    case "bot":
      return (
        <svg {...props}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      );
    case "kb":
      return (
        <svg {...props}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case "team":
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "settings":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    default:
      return null;
  }
}

const setup = [
  { href: "/admin/bot", label: "Bot Prompt", type: "bot" },
  { href: "/admin/kb", label: "Knowledge Base", type: "kb" },
  { href: "/admin/team", label: "Team", type: "team" },
  { href: "/admin/settings", label: "Settings", type: "settings" },
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
    { href: "/admin", label: "Conversations", count: counts.conversations, type: "conversations" },
    { href: "/admin/orders", label: "Orders", count: counts.orders, type: "orders" },
    { href: "/admin/leads", label: "Leads", count: counts.leads, type: "leads" },
    { href: "/admin/plans", label: "Plans & SIMs", count: counts.plans, type: "plans" },
    { href: "/admin/devices", label: "Devices", count: counts.devices, type: "devices" },
    { href: "/admin/broadcasts", label: "Broadcasts", count: counts.broadcasts, type: "broadcasts" },
  ];

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);

  const link = (item: { href: string; label: string; count?: number; type: string }) => (
    <Link
      key={item.href}
      href={item.href}
      className={"side-item " + (isActive(item.href) ? "active" : "")}
      style={{ textDecoration: "none" }}
    >
      <span className="side-icon-wrap">
        <NavIcon type={item.type} />
      </span>
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
          padding: "8px 10px 14px",
          borderBottom: "1px solid #1f232e",
          marginBottom: 10,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #ff7b67 0%, #ffaba9 100%)",
            borderRadius: 6,
            padding: "5px 6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(255, 123, 103, 0.25)",
            flexShrink: 0,
          }}
        >
          <ThreeLogo size={20} fill="#000" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: "-0.01em", color: "#ffffff" }}>
            Three UK
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.04em" }}>
            Operations Desk
          </div>
        </div>
      </Link>

      <div className="side-label">Workspace</div>
      {workspace.map(link)}

      <div className="side-label" style={{ marginTop: 8 }}>Setup</div>
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
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              className="dot"
              style={{ background: botEnabled ? "var(--ok)" : "var(--warn)" }}
            />
            <span style={{ fontWeight: 600, fontSize: 12 }}>Auto-Reply</span>
          </span>
          <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: botEnabled ? "var(--ok)" : "var(--warn)" }}>
            {botEnabled ? "ACTIVE" : "PAUSED"}
          </span>
        </button>
      </div>
    </aside>
  );
}
