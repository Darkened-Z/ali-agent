"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/useTheme";

const LINKS = [
  { href: "/", label: "Storefront" },
  { href: "/form", label: "Lead form" },
  { href: "/widget", label: "Chat widget" },
  { href: "/admin", label: "Admin" },
];

export function TopBar() {
  const pathname = usePathname();
  const { theme, toggle: toggleTheme } = useTheme();

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  return (
    <header className="topbar">
      <Link href="/" className="brand">
        <span className="brand-mark">
          A<i>.</i>
        </span>
        <span className="brand-name">
          Ali Agent
          <span>Customer tools</span>
        </span>
      </Link>
      <nav className="topnav" aria-label="Sections">
        {LINKS.map(l => (
          <Link key={l.href} href={l.href} className={isActive(l.href) ? "active" : ""}>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="topright">
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </div>
    </header>
  );
}
