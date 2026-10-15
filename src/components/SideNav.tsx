"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { signOut } from "@/app/login/actions";
import { useTheme } from "@/lib/useTheme";

function NavIcon({ type }: { type: string }) {
  const props = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
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
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
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
          <path d="M7 2h7l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
          <rect x="8.5" y="11" width="7" height="7" rx="1" />
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
    case "email":
      return (
        <svg {...props}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M22 6l-10 7L2 6" />
        </svg>
      );
    case "bot":
      return (
        <svg {...props}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M6 9l3 3-3 3M12 15h5" />
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
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
        </svg>
      );
    case "settings":
      return (
        <svg {...props}>
          <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
          <circle cx="16" cy="6" r="2" />
          <circle cx="10" cy="12" r="2" />
          <circle cx="18" cy="18" r="2" />
        </svg>
      );
    default:
      return null;
  }
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

type Counts = { conversations: number; leads: number; orders: number; live: number; queued: number };
type NavItem = { href: string; label: string; type: string; count?: keyof Counts; hot?: boolean };

const NAV: { label: string; items: NavItem[] }[] = [
  {
    label: "Inbox",
    items: [{ href: "/admin", label: "Conversations", type: "conversations", count: "conversations", hot: true }],
  },
  {
    label: "Sales",
    items: [
      { href: "/admin/leads", label: "Leads", type: "leads", count: "leads" },
      { href: "/admin/orders", label: "Orders", type: "orders", count: "orders" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/email", label: "Email", type: "email" },
      { href: "/admin/broadcasts", label: "WhatsApp broadcasts", type: "broadcasts" },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { href: "/admin/plans", label: "Plans & SIMs", type: "plans" },
      { href: "/admin/devices", label: "Devices", type: "devices" },
    ],
  },
  {
    label: "Setup",
    items: [
      { href: "/admin/bot", label: "Bot prompt", type: "bot" },
      { href: "/admin/kb", label: "Knowledge base", type: "kb" },
      { href: "/admin/team", label: "Team", type: "team" },
      { href: "/admin/settings", label: "Settings", type: "settings" },
    ],
  },
];

const isActive = (pathname: string | null, href: string) =>
  href === "/admin" ? pathname === "/admin" : !!pathname?.startsWith(href);

export function SideNav({ signedInAs }: { signedInAs?: string }) {
  const pathname = usePathname();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [botEnabled, setBotEnabled] = useState(true);
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  const refresh = useCallback(async () => {
    try {
      const [resConv, resOrders] = await Promise.all([
        fetch("/api/conversations", { cache: "no-store" }),
        fetch("/api/orders", { cache: "no-store" }),
      ]);
      const conv = resConv.ok ? await resConv.json() : null;
      const orders = resOrders.ok ? await resOrders.json() : null;
      if (conv?.counts) {
        setCounts({
          conversations: conv.counts.conversations,
          leads: conv.counts.leads,
          orders: Array.isArray(orders?.orders) ? orders.orders.length : 0,
          live: conv.stats?.activeNow ?? 0,
          queued: conv.stats?.queuedToday ?? 0,
        });
      }
      if (typeof conv?.botEnabled === "boolean") setBotEnabled(conv.botEnabled);
    } catch {
      // counts are a nicety; navigation works without them
    }
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("ali-store-updated", onUpdate);
    return () => window.removeEventListener("ali-store-updated", onUpdate);
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const toggleBot = async () => {
    const next = !botEnabled;
    setBotEnabled(next);
    const res = await fetch("/api/bot", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ botEnabled: next }),
    }).catch(() => null);
    if (!res?.ok) setBotEnabled(!next);
    else window.dispatchEvent(new Event("ali-store-updated"));
  };

  const current = NAV.flatMap(g => g.items).find(i => isActive(pathname, i.href));

  return (
    <>
      <div className="admin-mobilebar">
        <button className="menu-btn" onClick={() => setOpen(true)} aria-label="Open navigation" aria-expanded={open}>
          <MenuIcon />
        </button>
        <Link href="/admin" className="brand">
          <span className="brand-mark">
            A<i>.</i>
          </span>
          <span className="title">Ali Agent</span>
        </Link>
        {current && <span className="crumb">{current.label}</span>}
      </div>
      <div className={"side-backdrop" + (open ? " open" : "")} onClick={() => setOpen(false)} />

      <aside className={"admin-side" + (open ? " open" : "")} aria-label="Admin navigation">
        <Link href="/admin" className="side-brand">
          <span className="brand-mark">
            A<i>.</i>
          </span>
          <span className="brand-name">
            Ali Agent
            <span>Ops desk</span>
          </span>
        </Link>

        {NAV.map(group => (
          <nav key={group.label} aria-label={group.label}>
            <div className="side-label">{group.label}</div>
            {group.items.map(item => {
              const active = isActive(pathname, item.href);
              const count = item.count && counts ? counts[item.count] : 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={"side-item" + (active ? " active" : "")}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  <span className="side-icon-wrap">
                    <NavIcon type={item.type} />
                  </span>
                  <span>{item.label}</span>
                  {count > 0 && <span className={"side-count" + (item.hot ? " hot" : "")}>{count}</span>}
                </Link>
              );
            })}
          </nav>
        ))}

        <div className="side-footer">
          {counts && (
            <div className="side-status">
              <span className="live-dot" />
              <span>
                <b>{counts.live}</b> live · <b>{counts.queued}</b> queued
              </span>
            </div>
          )}
          <button type="button" className="bot-toggle" onClick={toggleBot} title="Turn automatic replies on or off">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="dot" style={{ background: botEnabled ? "var(--ok)" : "var(--warn)" }} />
              Auto-reply
            </span>
            <span className="state" style={{ color: botEnabled ? "var(--ok)" : "var(--warn)" }}>
              {botEnabled ? "On" : "Paused"}
            </span>
          </button>
          <div className="side-row">
            <button type="button" className="btn" onClick={toggle}>
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <Link href="/" className="btn" target="_blank" style={{ textDecoration: "none" }}>
              Storefront ↗
            </Link>
          </div>
          {signedInAs && signedInAs !== "dev@localhost" && (
            <form action={signOut} className="side-row">
              <button type="submit" className="btn">
                Sign out
              </button>
            </form>
          )}
          {signedInAs && <div className="side-user">{signedInAs}</div>}
        </div>
      </aside>
    </>
  );
}
