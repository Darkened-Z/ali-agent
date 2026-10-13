"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ThreeLogo } from "./ThreeLogo";

type Props = {
  liveCount?: number;
  queuedCount?: number;
};

export function TopBar({ liveCount = 3, queuedCount = 12 }: Props) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const [counts, setCounts] = useState({ live: liveCount, queued: queuedCount });

  const refreshCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.stats) {
        setCounts({
          live: data.stats.activeNow ?? liveCount,
          queued: data.stats.queuedToday ?? queuedCount,
        });
      }
    } catch {
      // Keep fallback counts
    }
  }, [liveCount, queuedCount]);

  useEffect(() => {
    const stored = localStorage.getItem("ali-theme") as "light" | "dark" | null;
    if (stored) setTheme(stored);
    else setTheme(matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

    refreshCounts();
    const onUpdate = () => refreshCounts();
    window.addEventListener("ali-store-updated", onUpdate);
    return () => window.removeEventListener("ali-store-updated", onUpdate);
  }, [refreshCounts]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("ali-theme", next);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <header className="topbar">
      <Link href="/" className="brand" style={{ textDecoration: "none", color: "inherit" }}>
        <div
          className="brand-mark"
          style={{
            background: "linear-gradient(135deg, #ff7b67 0%, #ffaba9 100%)",
            color: "#000",
            borderRadius: 6,
            width: 30,
            height: 30,
          }}
        >
          <ThreeLogo size={20} fill="#000" />
        </div>
        <div className="brand-name">
          Three UK · Ali Agent<span>Call Center v1.0</span>
        </div>
      </Link>
      <nav className="topnav" aria-label="Sections">
        <Link href="/" className={isActive("/") ? "active" : ""}>Three.co.uk Store</Link>
        <Link href="/checkout" className={isActive("/checkout") ? "active" : ""}>Checkout</Link>
        <Link href="/admin" className={isActive("/admin") ? "active" : ""}>Dashboard</Link>
        <Link href="/form" className={isActive("/form") ? "active" : ""}>Lead form</Link>
        <Link href="/widget" className={isActive("/widget") ? "active" : ""}>Chat widget</Link>
      </nav>
      <div className="topright">
        <span className="live-dot" aria-hidden="true" />
        <span className="mono">{counts.live} LIVE · {counts.queued} QUEUED</span>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? "LIGHT" : "DARK"}
        </button>
      </div>
    </header>
  );
}
