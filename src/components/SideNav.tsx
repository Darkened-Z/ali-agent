"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { conversations, leads, broadcasts } from "@/lib/mockData";
import { phoneDeals, simOnlyPlans, phoneModels, refurbPhones, simFreePhones } from "@/lib/plans";

// Sidebar counts derive from the actual data — never hardcode.
const workspace = [
  { href: "/admin", label: "Conversations", count: conversations.filter(c => c.status !== "closed").length },
  { href: "/admin/leads", label: "Leads", count: leads.length },
  { href: "/admin/plans", label: "Plans & SIMs", count: phoneDeals.length + simOnlyPlans.length },
  { href: "/admin/devices", label: "Devices", count: phoneModels.length + refurbPhones.length + simFreePhones.length },
  { href: "/admin/broadcasts", label: "Broadcasts", count: broadcasts.filter(b => b.status !== "sent").length },
];

const setup = [
  { href: "/admin/bot", label: "Bot prompt" },
  { href: "/admin/kb", label: "Knowledge base" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/settings", label: "Settings" },
];

export function SideNav() {
  const pathname = usePathname();
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
      <div className="side-label">Workspace</div>
      {workspace.map(link)}

      <div className="side-label">Setup</div>
      {setup.map(link)}

      <div className="side-footer">
        <div className="bot-toggle">
          <span><span className="dot" />Bot ON</span>
          <span className="mono">HAIKU-4-5</span>
        </div>
        <span>Ali Rehman · Owner</span>
      </div>
    </aside>
  );
}
