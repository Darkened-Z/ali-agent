"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  liveCount?: number;
  queuedCount?: number;
};

export function TopBar({ liveCount = 3, queuedCount = 12 }: Props) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("ali-theme") as "light" | "dark" | null;
    if (stored) setTheme(stored);
    else setTheme(matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, []);

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
        <div className="brand-mark">A</div>
        <div className="brand-name">
          Ali Agent<span>Demo · v0.1</span>
        </div>
      </Link>
      <nav className="topnav" aria-label="Sections">
        <Link href="/admin" className={isActive("/admin") ? "active" : ""}>Dashboard</Link>
        <Link href="/form" className={isActive("/form") ? "active" : ""}>Lead form</Link>
        <Link href="/widget" className={isActive("/widget") ? "active" : ""}>Chat widget</Link>
      </nav>
      <div className="topright">
        <span className="live-dot" aria-hidden="true" />
        <span className="mono">{liveCount} LIVE · {queuedCount} QUEUED</span>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? "LIGHT" : "DARK"}
        </button>
      </div>
    </header>
  );
}
