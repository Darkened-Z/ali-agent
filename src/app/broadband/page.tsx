"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThreeLogo } from "@/components/ThreeLogo";
import { ChatWidget } from "@/components/ChatWidget";

export default function BroadbandPage() {
  const router = useRouter();
  const [postcode, setPostcode] = useState("");
  const [coverageStatus, setCoverageStatus] = useState<"idle" | "checking" | "success" | "empty">("idle");
  const [checkedPc, setCheckedPc] = useState("");

  const askAi = (prompt: string) => {
    window.dispatchEvent(new CustomEvent("ali-open-chat", { detail: { prompt } }));
  };

  const handleCheckPostcode = () => {
    const pc = postcode.trim().toUpperCase();
    if (!pc) {
      setCoverageStatus("empty");
      return;
    }
    setCoverageStatus("checking");
    setTimeout(() => {
      setCheckedPc(pc);
      setCoverageStatus("success");
    }, 400);
  };

  const handleOrderBroadband = (plan: { id: string; name: string; monthly: number; upfront: number; term: string }) => {
    // Save to basket
    try {
      const existing = JSON.parse(localStorage.getItem("three_basket") || "[]");
      const newItem = {
        id: `${plan.id}-${Date.now()}`,
        name: plan.name,
        price: `£${plan.monthly.toFixed(2)}/mo`,
        upfront: `£${plan.upfront} upfront`,
      };
      localStorage.setItem("three_basket", JSON.stringify([...existing, newItem]));
    } catch {}

    const query = new URLSearchParams({
      plan: plan.id,
      name: plan.name,
      monthly: plan.monthly.toFixed(2),
      upfront: plan.upfront.toString(),
      contract: plan.term,
      postcode: checkedPc || postcode || "NW1 8QH",
    });
    router.push(`/checkout?${query.toString()}`);
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
                Business Broadband
              </Link>
            </div>
          </div>
          <div className="three-top-utility__right">
            <span className="three-phone-order">
              <b>Broadband Hotline: 0800 033 8006</b>
            </span>
            <ul className="three-utility-links">
              <li>
                <button type="button" onClick={() => askAi("How does Three 5G Home Broadband compare to BT or Virgin Media?")}>
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
            <Link href="/sim-only" className="three-nav-btn" style={{ textDecoration: "none" }}>
              SIM Only Deals
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
              onClick={() => askAi("Tell me about the £300 switcher guarantee for broadband")}
            >
              Ask AI about £300 Switch Bonus →
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO WITH COVERAGE CHECKER */}
      <section
        style={{
          background: "linear-gradient(135deg, #fdf2f0 0%, #fff 60%, #fff4f1 100%)",
          padding: "54px 0 44px",
          borderBottom: "1px solid #eedbd8",
        }}
      >
        <div className="three-container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: 40,
              alignItems: "center",
            }}
          >
            <div>
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
                PLUG AND PLAY · NO LANDLINE NEEDED
              </span>
              <h1 style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-0.5px", margin: "0 0 12px", color: "#000", lineHeight: 1.15 }}>
                Three 5G Home Broadband
              </h1>
              <p style={{ fontSize: 20, color: "#d94830", fontWeight: 800, margin: "0 0 12px" }}>
                Only £18 a month + Claim up to £300 when you switch
              </p>
              <p style={{ fontSize: 15, color: "#555", lineHeight: 1.5, margin: "0 0 24px" }}>
                Superfast Wi-Fi powered by the UK&apos;s fastest 5G network. No engineer appointments, no drilling through walls, no expensive copper landline fees. Plug the 5G Hub into any wall socket and connect within 2 minutes.
              </p>

              {/* POSTCODE CHECKER BOX */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  border: "2px solid #ff7b67",
                  padding: 24,
                  boxShadow: "0 8px 24px rgba(255, 123, 103, 0.15)",
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8, color: "#000", display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff7b67" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Check 5G Broadband availability at your address:
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    value={postcode}
                    onChange={e => {
                      setPostcode(e.target.value);
                      if (coverageStatus !== "idle") setCoverageStatus("idle");
                    }}
                    onKeyDown={e => e.key === "Enter" && handleCheckPostcode()}
                    placeholder="Enter Postcode (e.g. NW1 8QH, M1 1AE)"
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
                    onClick={handleCheckPostcode}
                    style={{
                      background: "#ff7b67",
                      color: "#000",
                      border: "none",
                      borderRadius: 999,
                      padding: "12px 24px",
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    Check Postcode
                  </button>
                </div>

                {coverageStatus === "success" && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: "14px 18px",
                      background: "#ecfdf5",
                      border: "1px solid #a7f3d0",
                      borderRadius: 14,
                      color: "#065f46",
                      fontSize: 13,
                    }}
                  >
                    <strong style={{ display: "block", fontSize: 14, marginBottom: 2 }}>
                      ✓ Great news! 5G Ultrafast Broadband is live at {checkedPc}
                    </strong>
                    Average download speeds 150-250Mbps (peak 1Gbps+). Free DPD next-working-day router delivery available.
                  </div>
                )}
                {coverageStatus === "empty" && (
                  <div style={{ marginTop: 10, color: "#c00", fontSize: 12 }}>
                    Please enter a valid UK postcode.
                  </div>
                )}
              </div>
            </div>

            {/* HERO VISUAL */}
            <div style={{ textAlign: "center" }}>
              <img
                src="https://www.three.co.uk/content/dam/live-asset/web/device-images/broadband/home-broadband/1690x1100-get-threes-home-broadband-with-price-18.png"
                alt="Three 5G Home Broadband Router"
                style={{
                  maxWidth: "100%",
                  maxHeight: 420,
                  objectFit: "contain",
                  filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.1))",
                }}
              />
              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16, fontSize: 12, color: "#666" }}>
                <span>✓ Three 5G Wi-Fi 6 Hub Included</span>
                <span>✓ Connect up to 64 devices</span>
                <span>✓ 30-Day Money Back</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PLANS COMPARISON */}
      <main className="three-container" style={{ padding: "50px 16px 80px" }}>
        <div style={{ textAlign: "center", maxWidth: 650, margin: "0 auto 36px" }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 10px" }}>
            Choose your 5G Broadband plan
          </h2>
          <p style={{ fontSize: 15, color: "#555" }}>
            All plans include unlimited data with zero download limits and our latest high-performance 5G Wi-Fi 6 Hub.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {/* Plan 1: 24-Month Contract */}
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              border: "2px solid #ff7b67",
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              boxShadow: "0 10px 30px rgba(255, 123, 103, 0.12)",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: -12,
                left: 28,
                background: "#ff7b67",
                color: "#fff",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.8px",
                padding: "4px 12px",
                borderRadius: 999,
                textTransform: "uppercase",
              }}
            >
              BEST VALUE · £300 SWITCH BONUS
            </span>

            <span style={{ fontSize: 12, fontWeight: 700, color: "#777", textTransform: "uppercase" }}>
              24-MONTH CONTRACT
            </span>
            <h3 style={{ fontSize: 24, fontWeight: 900, color: "#000", margin: "4px 0 8px" }}>
              Unlimited 5G Home Broadband
            </h3>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#d94830", marginBottom: 16 }}>
              ★ Claim up to £300 switching credit towards old contract fees
            </span>

            <div
              style={{
                background: "#fdf2f0",
                borderRadius: 16,
                padding: "16px 20px",
                marginBottom: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <div>
                <span style={{ fontSize: 36, fontWeight: 900, color: "#000" }}>£18.00</span>
                <span style={{ fontSize: 14, color: "#555" }}> / month</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>
                £0 UPFRONT
              </div>
            </div>

            <div style={{ fontSize: 11, color: "#777", marginBottom: 20 }}>
              Increasing to £21.50 from 1 Apr 27, £25.00 from 1 Apr 28. [1]
            </div>

            <ul style={{ margin: "0 0 24px", paddingLeft: 20, fontSize: 13, color: "#333", lineHeight: 1.7, flex: 1 }}>
              <li><b>Truly Unlimited data</b> with zero speed limits</li>
              <li><b>Three 5G Wi-Fi 6 Hub included</b> (worth £249)</li>
              <li>Connect up to 64 devices simultaneously</li>
              <li><b>30-Day Money-Back Guarantee</b> (zero risk)</li>
              <li>Free next working day tracked DPD delivery</li>
              <li>£300 Switcher Guarantee for Virgin, BT, Sky switchers</li>
            </ul>

            <button
              type="button"
              onClick={() =>
                handleOrderBroadband({
                  id: "broadband-5g-24m",
                  name: "Three 5G Home Broadband (24m)",
                  monthly: 18.0,
                  upfront: 0,
                  term: "24m",
                })
              }
              style={{
                background: "#000",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "16px 24px",
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Order 5G Broadband (£18/mo) →
            </button>
          </div>

          {/* Plan 2: 1-Month Rolling */}
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              border: "1px solid #eedbd8",
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: "#777", textTransform: "uppercase" }}>
              1-MONTH ROLLING · CANCEL ANYTIME
            </span>
            <h3 style={{ fontSize: 24, fontWeight: 900, color: "#000", margin: "4px 0 8px" }}>
              Flexible 5G Home Broadband
            </h3>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 16 }}>
              Ideal for renters, temporary accommodation, or flexible living
            </span>

            <div
              style={{
                background: "#fdf2f0",
                borderRadius: 16,
                padding: "16px 20px",
                marginBottom: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <div>
                <span style={{ fontSize: 36, fontWeight: 900, color: "#000" }}>£24.00</span>
                <span style={{ fontSize: 14, color: "#555" }}> / month</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>
                £29 UPFRONT HUB
              </div>
            </div>

            <div style={{ fontSize: 11, color: "#777", marginBottom: 20 }}>
              Cancel anytime with 30 days notice. Router belongs to you.
            </div>

            <ul style={{ margin: "0 0 24px", paddingLeft: 20, fontSize: 13, color: "#333", lineHeight: 1.7, flex: 1 }}>
              <li><b>No long contract</b> — 30-day rolling flexibility</li>
              <li>Truly Unlimited 5G downloads &amp; streaming</li>
              <li>Includes 5G Wi-Fi 6 Router (£29 one-off fee)</li>
              <li>Plug and play in minutes anywhere in the UK</li>
              <li>Free next working day delivery</li>
            </ul>

            <button
              type="button"
              onClick={() =>
                handleOrderBroadband({
                  id: "broadband-5g-1m",
                  name: "Three 5G Flexible Broadband (1m Rolling)",
                  monthly: 24.0,
                  upfront: 29,
                  term: "1m",
                })
              }
              style={{
                background: "#000",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "16px 24px",
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Order 1-Month Rolling →
            </button>
          </div>

          {/* Plan 3: Pocket MiFi Mobile Broadband */}
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              border: "1px solid #eedbd8",
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: "#777", textTransform: "uppercase" }}>
              PORTABLE 5G MIFI · TRAVEL
            </span>
            <h3 style={{ fontSize: 24, fontWeight: 900, color: "#000", margin: "4px 0 8px" }}>
              5G Mobile Broadband MiFi
            </h3>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 16 }}>
              Personal pocket hotspot with 12h rechargeable battery
            </span>

            <div
              style={{
                background: "#fdf2f0",
                borderRadius: 16,
                padding: "16px 20px",
                marginBottom: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <div>
                <span style={{ fontSize: 36, fontWeight: 900, color: "#000" }}>£14.00</span>
                <span style={{ fontSize: 14, color: "#555" }}> / month</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>
                £0 UPFRONT
              </div>
            </div>

            <div style={{ fontSize: 11, color: "#777", marginBottom: 20 }}>
              24-month contract. Includes 100GB 5G high-speed allowance.
            </div>

            <ul style={{ margin: "0 0 24px", paddingLeft: 20, fontSize: 13, color: "#333", lineHeight: 1.7, flex: 1 }}>
              <li>Pocket-sized 5G router with color display</li>
              <li>Connect up to 32 phones, laptops, and tablets</li>
              <li>12-hour rechargeable battery on a single charge</li>
              <li>Ideal for commuters, holiday homes &amp; remote work</li>
            </ul>

            <button
              type="button"
              onClick={() =>
                handleOrderBroadband({
                  id: "broadband-mifi-24m",
                  name: "Three 5G Mobile MiFi (24m)",
                  monthly: 14.0,
                  upfront: 0,
                  term: "24m",
                })
              }
              style={{
                background: "#000",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "16px 24px",
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Order Pocket MiFi →
            </button>
          </div>
        </div>

        {/* 5. COMPARISON TABLE: Three 5G vs Traditional Fibre */}
        <section style={{ marginTop: 60, padding: "36px 0", borderTop: "1px solid #eee" }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 20 }}>
            How Three 5G Broadband beats traditional fibre
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #eedbd8" }}>
              <thead>
                <tr style={{ background: "#fdf2f0", borderBottom: "2px solid #eedbd8" }}>
                  <th style={{ padding: "16px 20px", textAlign: "left", fontSize: 14, fontWeight: 800 }}>Feature</th>
                  <th style={{ padding: "16px 20px", textAlign: "left", fontSize: 14, fontWeight: 800, color: "#ff7b67" }}>Three 5G Home Broadband</th>
                  <th style={{ padding: "16px 20px", textAlign: "left", fontSize: 14, fontWeight: 800, color: "#777" }}>Traditional Fibre (BT, Virgin, Sky)</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: 13 }}>
                <tr style={{ borderBottom: "1px solid #f4e8e6" }}>
                  <td style={{ padding: "14px 20px", fontWeight: 700 }}>Monthly Cost</td>
                  <td style={{ padding: "14px 20px", color: "#059669", fontWeight: 700 }}>From £18.00 / month</td>
                  <td style={{ padding: "14px 20px", color: "#666" }}>£34.00 – £48.00 / month</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #f4e8e6" }}>
                  <td style={{ padding: "14px 20px", fontWeight: 700 }}>Installation Time</td>
                  <td style={{ padding: "14px 20px", color: "#059669", fontWeight: 700 }}>2 minutes (Plug into wall socket)</td>
                  <td style={{ padding: "14px 20px", color: "#666" }}>Wait 2–3 weeks for Openreach engineer</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #f4e8e6" }}>
                  <td style={{ padding: "14px 20px", fontWeight: 700 }}>Landline Requirement</td>
                  <td style={{ padding: "14px 20px", color: "#059669", fontWeight: 700 }}>None (£0 landline fees)</td>
                  <td style={{ padding: "14px 20px", color: "#666" }}>Mandatory landline rental (£18–£22/mo)</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #f4e8e6" }}>
                  <td style={{ padding: "14px 20px", fontWeight: 700 }}>Switching Bonus</td>
                  <td style={{ padding: "14px 20px", color: "#059669", fontWeight: 700 }}>Up to £300 switcher credit</td>
                  <td style={{ padding: "14px 20px", color: "#666" }}>£0 (You pay early termination fees)</td>
                </tr>
                <tr>
                  <td style={{ padding: "14px 20px", fontWeight: 700 }}>Moving House</td>
                  <td style={{ padding: "14px 20px", color: "#059669", fontWeight: 700 }}>Take router with you, plug in instantly</td>
                  <td style={{ padding: "14px 20px", color: "#666" }}>Pay £60+ moving fee &amp; restart 24m contract</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <ChatWidget />
    </div>
  );
}
