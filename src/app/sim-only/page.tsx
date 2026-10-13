"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThreeLogo } from "@/components/ThreeLogo";
import { ChatWidget } from "@/components/ChatWidget";

type SimPlan = {
  id: string;
  data: string;
  monthly: number;
  termMonths: number;
  badge?: string;
  popular?: boolean;
  savings?: string;
  features: string[];
  ofcomRise: string;
};

const SIM_PLANS: SimPlan[] = [
  {
    id: "sim-unl-24m",
    data: "Truly Unlimited 5G Data",
    monthly: 23.0,
    termMonths: 24,
    badge: "MOST POPULAR",
    popular: true,
    savings: "Save £144 over contract",
    features: [
      "No speed caps, no throttling, truly unlimited",
      "Unlimited UK calls & texts",
      "12GB European Roaming across 49 destinations",
      "Three+ Rewards: £1 weekly Caffè Nero coffee & cinema tickets",
      "Instant eSIM ready in 5 minutes or free next-day DPD SIM",
      "Personal Hotspot / Unlimited Tethering",
    ],
    ofcomRise: "Increases to £25.30 from 1 Apr 27, £27.60 from 1 Apr 28.",
  },
  {
    id: "sim-300gb-24m",
    data: "300GB 5G Data",
    monthly: 16.0,
    termMonths: 24,
    badge: "MEGA VALUE",
    features: [
      "300GB ultra-fast 5G data",
      "Unlimited UK calls & texts",
      "Three+ VIP rewards benefits",
      "Personal Hotspot included",
      "Free next working day delivery",
    ],
    ofcomRise: "Increases to £17.80 from 1 Apr 27, £19.60 from 1 Apr 28.",
  },
  {
    id: "sim-60gb-rolling",
    data: "60GB 5G Data (No Contract)",
    monthly: 10.0,
    termMonths: 1,
    badge: "30-DAY ROLLING",
    popular: true,
    features: [
      "1-month rolling contract — cancel anytime",
      "Change or pause your plan each month",
      "Unlimited UK calls & texts",
      "Three+ Rewards app treats",
      "Instant eSIM activation",
    ],
    ofcomRise: "Price guaranteed for first 12 months.",
  },
  {
    id: "sim-120gb-24m",
    data: "120GB 5G Data",
    monthly: 12.0,
    termMonths: 24,
    features: [
      "120GB 5G UK data allowance",
      "Unlimited UK calls & texts",
      "Three+ Rewards access",
      "Free SIM delivery",
    ],
    ofcomRise: "Increases to £13.40 from 1 Apr 27, £14.80 from 1 Apr 28.",
  },
  {
    id: "sim-unl-12m",
    data: "Unlimited 5G Data (12 Months)",
    monthly: 26.0,
    termMonths: 12,
    badge: "FLEXIBLE TERM",
    features: [
      "Truly Unlimited 5G Data",
      "12-month shorter commitment",
      "Unlimited UK calls & texts",
      "12GB EU Roaming included",
      "Three+ Rewards app discounts",
    ],
    ofcomRise: "Standard April annual CPI price rise applies.",
  },
  {
    id: "sim-30gb-24m",
    data: "30GB 5G Data",
    monthly: 8.0,
    termMonths: 24,
    badge: "BUDGET SAVER",
    features: [
      "30GB 5G data for everyday browsing & maps",
      "Unlimited UK minutes & SMS",
      "Three+ app rewards",
      "Zero upfront fee",
    ],
    ofcomRise: "Standard April annual CPI price rise applies.",
  },
];

export default function SimOnlyPage() {
  const router = useRouter();
  const [filterTerm, setFilterTerm] = useState<"all" | "24" | "12" | "1">("all");
  const [deliveryFormat, setDeliveryFormat] = useState<"esim" | "physical">("esim");
  const [postcode, setPostcode] = useState("");
  const [coverageMsg, setCoverageMsg] = useState<string | null>(null);

  const filteredPlans = SIM_PLANS.filter(p => {
    if (filterTerm === "24") return p.termMonths === 24;
    if (filterTerm === "12") return p.termMonths === 12;
    if (filterTerm === "1") return p.termMonths === 1;
    return true;
  });

  const askAi = (prompt: string) => {
    window.dispatchEvent(new CustomEvent("ali-open-chat", { detail: { prompt } }));
  };

  const handleSelectSim = (plan: SimPlan) => {
    const itemName = `Three ${plan.data} (${plan.termMonths === 1 ? "30-Day Rolling" : `${plan.termMonths}m`}) - ${deliveryFormat.toUpperCase()}`;
    // Save to basket
    try {
      const existing = JSON.parse(localStorage.getItem("three_basket") || "[]");
      const newItem = {
        id: `${plan.id}-${Date.now()}`,
        name: itemName,
        price: `£${plan.monthly.toFixed(2)}/mo`,
        upfront: "£0 upfront",
      };
      localStorage.setItem("three_basket", JSON.stringify([...existing, newItem]));
    } catch {}

    const query = new URLSearchParams({
      plan: plan.id,
      name: itemName,
      monthly: plan.monthly.toFixed(2),
      upfront: "0",
      contract: `${plan.termMonths}m`,
      simType: deliveryFormat,
    });
    router.push(`/checkout?${query.toString()}`);
  };

  const checkSignal = () => {
    const pc = postcode.trim().toUpperCase();
    if (!pc) return;
    setCoverageMsg(`✓ Excellent 5G & 4G Indoor and Outdoor coverage confirmed for ${pc}! Speeds up to 280 Mbps.`);
  };

  return (
    <div className="three-page">
      {/* 1. TOP UTILITY HEADER */}
      <div className="three-top-utility">
        <div className="three-container three-top-utility__inner">
          <div className="three-top-utility__left">
            <Link href="/" className="three-logo-link" aria-label="Three home">
              <ThreeLogo size={40} fill="#000" />
            </Link>
            <div className="three-division-tabs">
              <Link href="/" className="active" style={{ textDecoration: "none", color: "inherit", padding: "4px 10px" }}>
                Personal
              </Link>
              <Link href="/form" style={{ textDecoration: "none", color: "inherit", padding: "4px 10px" }}>
                Business
              </Link>
            </div>
          </div>
          <div className="three-top-utility__right">
            <span className="three-phone-order">
              <b>Order by phone: 0800 033 8006</b>
            </span>
            <ul className="three-utility-links">
              <li>
                <button type="button" onClick={() => askAi("Which SIM Only plan is best for high data and EU roaming?")}>
                  Ask AI Advisor
                </button>
              </li>
              <li>
                <Link href="/checkout">Basket &amp; Checkout</Link>
              </li>
              <li>
                <Link href="/admin">Staff Hub</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY NAV BAR */}
      <header className="three-primary-header">
        <div className="three-container three-primary-header__inner">
          <nav className="three-main-nav">
            <Link href="/" className="three-nav-btn" style={{ textDecoration: "none" }}>
              ← Storefront
            </Link>
            <Link href="/devices/iphone-18-pro" className="three-nav-btn" style={{ textDecoration: "none" }}>
              Phones
            </Link>
            <Link href="/broadband" className="three-nav-btn" style={{ textDecoration: "none" }}>
              5G Home Broadband
            </Link>
            <Link href="/checkout" className="three-nav-btn" style={{ textDecoration: "none" }}>
              Basket &amp; Checkout
            </Link>
          </nav>
          <div className="three-header-search">
            <button
              type="button"
              className="three-cta-pill three-cta-pill--coral"
              style={{ padding: "8px 18px", fontSize: 13 }}
              onClick={() => askAi("Compare the £23 Unlimited SIM vs £10 60GB rolling SIM")}
            >
              Ask AI about SIM Deals →
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO BANNER */}
      <section style={{ background: "linear-gradient(135deg, #fdf2f0 0%, #fff 60%, #fff2f0 100%)", padding: "48px 0 36px", borderBottom: "1px solid #f0e2df" }}>
        <div className="three-container">
          <div style={{ maxWidth: 760 }}>
            <span
              style={{
                background: "#000",
                color: "#fff",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "1px",
                padding: "4px 12px",
                borderRadius: 999,
                display: "inline-block",
                marginBottom: 12,
              }}
            >
              NATION&apos;S NETWORK · 5G AT NO EXTRA COST
            </span>
            <h1 style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-0.5px", margin: "0 0 12px", color: "#000" }}>
              Three SIM Only Deals
            </h1>
            <p style={{ fontSize: 18, color: "#444", lineHeight: 1.5, margin: "0 0 24px" }}>
              Keep your existing phone and get big 5G data on the UK&apos;s fastest 5G network. Choose from 24-month value plans or flexible 30-day rolling contracts you can cancel anytime.
            </p>

            {/* SIM Format Selector */}
            <div
              style={{
                display: "inline-flex",
                background: "#fff",
                borderRadius: 999,
                padding: 4,
                border: "1px solid #e0d0ce",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <button
                type="button"
                onClick={() => setDeliveryFormat("esim")}
                style={{
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: "none",
                  background: deliveryFormat === "esim" ? "#000" : "transparent",
                  color: deliveryFormat === "esim" ? "#fff" : "#444",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                ⚡ Instant eSIM (Ready in 5 mins)
              </button>
              <button
                type="button"
                onClick={() => setDeliveryFormat("physical")}
                style={{
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: "none",
                  background: deliveryFormat === "physical" ? "#000" : "transparent",
                  color: deliveryFormat === "physical" ? "#fff" : "#444",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                📬 Physical SIM (Free Next-Day DPD)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PLANS COMPARISON GRID */}
      <main className="three-container" style={{ padding: "40px 16px 80px" }}>
        {/* Filters */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { id: "all", label: "All Plans (6)" },
              { id: "24", label: "24-Month Contracts (Best Value)" },
              { id: "12", label: "12-Month Contracts" },
              { id: "1", label: "30-Day Rolling (Cancel Anytime)" },
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterTerm(f.id as any)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: filterTerm === f.id ? "2px solid #000" : "1px solid #e0d0ce",
                  background: filterTerm === f.id ? "#000" : "#fff",
                  color: filterTerm === f.id ? "#fff" : "#222",
                  fontWeight: filterTerm === f.id ? 700 : 500,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 13, color: "#666" }}>
            Showing <b>{filteredPlans.length}</b> plans with <b>£0 upfront</b>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {filteredPlans.map(plan => (
            <div
              key={plan.id}
              style={{
                background: "#fff",
                borderRadius: 24,
                border: plan.popular ? "2px solid #ff7b67" : "1px solid #eedbd8",
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                boxShadow: plan.popular ? "0 10px 30px rgba(255, 123, 103, 0.12)" : "0 4px 16px rgba(0,0,0,0.03)",
              }}
            >
              {plan.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: 24,
                    background: plan.popular ? "#ff7b67" : "#000",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: "0.8px",
                    padding: "4px 12px",
                    borderRadius: 999,
                    textTransform: "uppercase",
                  }}
                >
                  {plan.badge}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#777", textTransform: "uppercase" }}>
                  {plan.termMonths === 1 ? "1-MONTH ROLLING" : `${plan.termMonths}-MONTH CONTRACT`}
                </span>
                <h3 style={{ fontSize: 24, fontWeight: 900, color: "#000", margin: "4px 0 8px" }}>
                  {plan.data}
                </h3>
                {plan.savings && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#d94830" }}>
                    ★ {plan.savings}
                  </span>
                )}
              </div>

              {/* Price Box */}
              <div
                style={{
                  background: "#fdf2f0",
                  borderRadius: 16,
                  padding: "16px 20px",
                  marginBottom: 20,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div>
                  <span style={{ fontSize: 32, fontWeight: 900, color: "#000" }}>
                    £{plan.monthly.toFixed(plan.monthly % 1 ? 2 : 0)}
                  </span>
                  <span style={{ fontSize: 14, color: "#555" }}> / month</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>
                  £0 UPFRONT
                </div>
              </div>

              <div style={{ fontSize: 11, color: "#777", marginBottom: 16 }}>
                {plan.ofcomRise}
              </div>

              {/* Feature List */}
              <ul style={{ margin: "0 0 24px", paddingLeft: 20, fontSize: 13, color: "#333", lineHeight: 1.6, flex: 1 }}>
                {plan.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => handleSelectSim(plan)}
                  style={{
                    flex: 2,
                    background: "#000",
                    color: "#fff",
                    border: "none",
                    borderRadius: 999,
                    padding: "14px 20px",
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Choose this SIM →
                </button>
                <button
                  type="button"
                  onClick={() => askAi(`Tell me more about the ${plan.data} SIM on Three for £${plan.monthly}/mo`)}
                  style={{
                    flex: 1,
                    background: "#fff",
                    color: "#000",
                    border: "1px solid #d0c0be",
                    borderRadius: 999,
                    padding: "14px 12px",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Ask AI
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 5. COVERAGE CHECKER */}
        <section
          style={{
            marginTop: 60,
            background: "#fdf2f0",
            borderRadius: 24,
            padding: 36,
            border: "1px solid #f0e2df",
          }}
        >
          <div style={{ maxWidth: 640 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "1px", color: "#ff7b67", textTransform: "uppercase" }}>
              Coverage check
            </span>
            <h2 style={{ fontSize: 26, fontWeight: 900, margin: "6px 0 12px" }}>
              Check 5G signal in your neighborhood
            </h2>
            <p style={{ fontSize: 14, color: "#555", margin: "0 0 20px" }}>
              Three covers over 99% of the UK population. Enter your postcode to see available speeds and indoor/outdoor signal.
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={postcode}
                onChange={e => setPostcode(e.target.value)}
                onKeyDown={e => e.key === "Enter" && checkSignal()}
                placeholder="Enter UK Postcode (e.g. SW1A 1AA, NW1 8QH)"
                style={{
                  flex: 1,
                  padding: "12px 18px",
                  borderRadius: 999,
                  border: "1px solid #d8c2bf",
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={checkSignal}
                style={{
                  background: "#000",
                  color: "#fff",
                  border: "none",
                  borderRadius: 999,
                  padding: "12px 24px",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Check Signal
              </button>
            </div>
            {coverageMsg && (
              <div
                style={{
                  marginTop: 14,
                  padding: "12px 16px",
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: 12,
                  color: "#065f46",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {coverageMsg}
              </div>
            )}
          </div>
        </section>

        {/* 6. SWITCHING GUIDE (PAC CODE) */}
        <section style={{ marginTop: 60, padding: "20px 0" }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20 }}>How to keep your mobile number in 3 steps</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            <div style={{ background: "#fff", border: "1px solid #eedbd8", borderRadius: 20, padding: 24 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#ff7b67", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, marginBottom: 12 }}>
                1
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 6px" }}>Text PAC to 65075</h3>
              <p style={{ fontSize: 13, color: "#666", margin: 0, lineHeight: 1.5 }}>
                Send a free text from your existing mobile number. Your current network will reply with your 9-digit PAC code in 60 seconds.
              </p>
            </div>

            <div style={{ background: "#fff", border: "1px solid #eedbd8", borderRadius: 20, padding: 24 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#ff7b67", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, marginBottom: 12 }}>
                2
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 6px" }}>Order your Three SIM</h3>
              <p style={{ fontSize: 13, color: "#666", margin: 0, lineHeight: 1.5 }}>
                Choose any SIM deal above and enter your PAC code during checkout, or provide it later inside your My3 account.
              </p>
            </div>

            <div style={{ background: "#fff", border: "1px solid #eedbd8", borderRadius: 20, padding: 24 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#ff7b67", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, marginBottom: 12 }}>
                3
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 6px" }}>Switch happens in 1 day</h3>
              <p style={{ fontSize: 13, color: "#666", margin: 0, lineHeight: 1.5 }}>
                We automatically transfer your number across without any disruption. Your old contract cancels automatically.
              </p>
            </div>
          </div>
        </section>
      </main>

      <ChatWidget />
    </div>
  );
}
