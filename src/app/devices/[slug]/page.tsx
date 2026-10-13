"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThreeLogo } from "@/components/ThreeLogo";
import { ChatWidget } from "@/components/ChatWidget";
import { getDeviceBySlug, DeviceDetail } from "@/lib/deviceDetails";

export default function DevicePDPPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const device: DeviceDetail = getDeviceBySlug(resolvedParams.slug);

  // Configuration state
  const [selectedColor, setSelectedColor] = useState(device.colors[0]);
  const [selectedStorage, setSelectedStorage] = useState(
    device.storages.find(s => s.popular) || device.storages[0]
  );
  const [contractMonths, setContractMonths] = useState<number>(36);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    device.airtimePlans.find(p => p.popular)?.id || device.airtimePlans[0].id
  );
  const [activeSpecCategory, setActiveSpecCategory] = useState<string>(
    device.specs[0]?.category || ""
  );
  const [tradeInBrand, setTradeInBrand] = useState<string>("");
  const [tradeInApplied, setTradeInApplied] = useState<boolean>(false);
  const [activeGalleryAngle, setActiveGalleryAngle] = useState<number>(0);

  // Selected plan calculation
  const currentPlan =
    device.airtimePlans.find(p => p.id === selectedPlanId) ||
    device.airtimePlans[0];

  // Price calculations: 24m vs 36m adjustment (24m is slightly higher monthly)
  const termFactor = contractMonths === 24 ? 1.22 : 1.0;
  const baseMonthly =
    (currentPlan.monthly + selectedStorage.monthlyDiff) * termFactor;
  const tradeInDiscount = tradeInApplied ? Math.min(15, device.tradeInBonus / 36) : 0;
  const finalMonthly = Math.max(10, Math.round((baseMonthly - tradeInDiscount) * 10) / 10);
  const finalUpfront = selectedStorage.upfrontDiff + currentPlan.upfront;

  const askAi = (prompt: string) => {
    window.dispatchEvent(
      new CustomEvent("ali-open-chat", { detail: { prompt } })
    );
  };

  const handleCheckout = () => {
    const itemName = `${device.model} ${selectedStorage.size} - ${selectedColor.name} (${contractMonths}m)`;
    // Save into localStorage basket for convenience
    try {
      const existing = JSON.parse(localStorage.getItem("three_basket") || "[]");
      const newItem = {
        id: `${device.slug}-${selectedStorage.size}-${Date.now()}`,
        name: itemName,
        price: `£${finalMonthly.toFixed(2)}/mo`,
        upfront: `£${finalUpfront} upfront`,
      };
      localStorage.setItem("three_basket", JSON.stringify([...existing, newItem]));
    } catch {}

    const query = new URLSearchParams({
      plan: currentPlan.id,
      name: itemName,
      monthly: finalMonthly.toFixed(2),
      upfront: finalUpfront.toString(),
      storage: selectedStorage.size,
      color: selectedColor.name,
      contract: `${contractMonths}m`,
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
                <button
                  type="button"
                  onClick={() =>
                    askAi(`What are the key specs of the ${device.model}?`)
                  }
                >
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
              ← Back to Store
            </Link>
            <Link href="/sim-only" className="three-nav-btn" style={{ textDecoration: "none" }}>
              SIM Only Deals
            </Link>
            <Link href="/broadband" className="three-nav-btn" style={{ textDecoration: "none" }}>
              5G Home Broadband (£18/mo)
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
              onClick={() =>
                askAi(`Help me choose a contract and storage for ${device.model}`)
              }
            >
              Ask AI about {device.model} →
            </button>
          </div>
        </div>
      </header>

      {/* 3. BREADCRUMBS */}
      <div style={{ background: "#f8f8f8", borderBottom: "1px solid #eee", padding: "10px 0" }}>
        <div className="three-container" style={{ fontSize: 12, color: "#666", display: "flex", gap: 8, alignItems: "center" }}>
          <Link href="/" style={{ color: "#000", textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <Link href="/" style={{ color: "#000", textDecoration: "none" }}>Mobile phones</Link>
          <span>/</span>
          <Link href="/" style={{ color: "#000", textDecoration: "none" }}>Pay Monthly phones</Link>
          <span>/</span>
          <span>{device.brand}</span>
          <span>/</span>
          <strong style={{ color: "#000" }}>{device.model}</strong>
        </div>
      </div>

      {/* 4. MAIN PDP CONFIGURATOR HERO */}
      <main className="three-container" style={{ padding: "36px 16px 60px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: 40,
            alignItems: "start",
          }}
        >
          {/* LEFT: GALLERY & VISUALIZER */}
          <div
            style={{
              position: "sticky",
              top: 20,
              background: "#fff",
              borderRadius: 24,
              border: "1px solid #f0e2df",
              padding: 32,
              boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span
                style={{
                  background: "#ff7b67",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.8px",
                  padding: "4px 10px",
                  borderRadius: 999,
                  textTransform: "uppercase",
                }}
              >
                {device.badge}
              </span>
              <span style={{ fontSize: 13, color: "#666" }}>
                Color: <b>{selectedColor.name}</b>
              </span>
            </div>

            {/* Main Stage Image */}
            <div
              style={{
                height: 380,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "radial-gradient(circle at center, #fff4f1 0%, #ffffff 70%)",
                borderRadius: 20,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <img
                src={selectedColor.image}
                alt={`${device.model} in ${selectedColor.name}`}
                style={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  objectFit: "contain",
                  filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.12))",
                  transition: "transform 0.3s ease",
                  transform:
                    activeGalleryAngle === 1
                      ? "rotate(-6deg) scale(0.96)"
                      : activeGalleryAngle === 2
                      ? "rotate(6deg) scale(0.96)"
                      : "scale(1)",
                }}
              />
            </div>

            {/* Gallery Angle Selectors */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 24 }}>
              {["Front Angle", "Tilt Left", "Tilt Right"].map((label, idx) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActiveGalleryAngle(idx)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: activeGalleryAngle === idx ? 700 : 500,
                    border: activeGalleryAngle === idx ? "2px solid #000" : "1px solid #e0d0ce",
                    background: activeGalleryAngle === idx ? "#000" : "#fff",
                    color: activeGalleryAngle === idx ? "#fff" : "#333",
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Key Feature Tiles under Visualizer */}
            <div style={{ borderTop: "1px solid #f0e2df", paddingTop: 20 }}>
              <h4 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.5px", color: "#888", marginBottom: 12 }}>
                Device Highlights
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {device.highlights.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 12,
                      background: "#faf7f6",
                      borderRadius: 14,
                      border: "1px solid #f2e7e5",
                    }}
                  >
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{h.icon}</div>
                    <strong style={{ fontSize: 12, display: "block", color: "#111" }}>{h.title}</strong>
                    <span style={{ fontSize: 11, color: "#666", lineHeight: 1.3, display: "block", marginTop: 2 }}>
                      {h.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: CUSTOMISER & PURCHASE FORM */}
          <div>
            {/* Title & Reviews */}
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.5px", margin: "0 0 6px", color: "#000" }}>
                {device.model}
              </h1>
              <p style={{ fontSize: 16, color: "#555", margin: "0 0 10px" }}>{device.tagline}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <span style={{ color: "#f59e0b", letterSpacing: "1px" }}>★★★★★</span>
                <strong>{device.rating} / 5</strong>
                <span style={{ color: "#777" }}>({device.reviewsCount} verified reviews)</span>
                <span style={{ color: "#ccc" }}>•</span>
                <span style={{ color: "#059669", fontWeight: 600 }}>✓ In Stock for Free Next-Day Delivery</span>
              </div>
            </div>

            {/* STEP 1: CHOOSE COLOUR */}
            <div
              style={{
                background: "#fff",
                borderRadius: 20,
                border: "1px solid #f0e2df",
                padding: "20px 24px",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontWeight: 800, fontSize: 15 }}>1. Choose your colour</span>
                <span style={{ color: "#ff7b67", fontWeight: 700, fontSize: 14 }}>{selectedColor.name}</span>
              </div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                {device.colors.map(col => {
                  const isSelected = selectedColor.name === col.name;
                  return (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 16px",
                        borderRadius: 999,
                        border: isSelected ? "2px solid #000" : "1px solid #e0d0ce",
                        background: isSelected ? "#fcf8f7" : "#fff",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          backgroundColor: col.hex,
                          border: "1px solid rgba(0,0,0,0.15)",
                          display: "inline-block",
                        }}
                      />
                      <span style={{ fontSize: 13, fontWeight: isSelected ? 700 : 500, color: "#111" }}>
                        {col.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: CHOOSE STORAGE */}
            <div
              style={{
                background: "#fff",
                borderRadius: 20,
                border: "1px solid #f0e2df",
                padding: "20px 24px",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontWeight: 800, fontSize: 15 }}>2. Choose storage</span>
                <span style={{ color: "#ff7b67", fontWeight: 700, fontSize: 14 }}>{selectedStorage.size}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${device.storages.length}, 1fr)`, gap: 10 }}>
                {device.storages.map(st => {
                  const isSelected = selectedStorage.size === st.size;
                  return (
                    <button
                      key={st.size}
                      type="button"
                      onClick={() => setSelectedStorage(st)}
                      style={{
                        padding: "12px 10px",
                        borderRadius: 14,
                        border: isSelected ? "2px solid #000" : "1px solid #e0d0ce",
                        background: isSelected ? "#000" : "#fff",
                        color: isSelected ? "#fff" : "#111",
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{st.size}</div>
                      <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>
                        {st.monthlyDiff === 0 ? "Standard" : `+£${st.monthlyDiff}/mo`}
                      </div>
                      {st.popular && (
                        <div
                          style={{
                            fontSize: 9,
                            fontWeight: 800,
                            letterSpacing: "0.5px",
                            color: isSelected ? "#ffaba9" : "#ff7b67",
                            marginTop: 3,
                            textTransform: "uppercase",
                          }}
                        >
                          Recommended
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 3: CONTRACT DURATION (Three Your Way) */}
            <div
              style={{
                background: "#fff",
                borderRadius: 20,
                border: "1px solid #f0e2df",
                padding: "20px 24px",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontWeight: 800, fontSize: 15 }}>3. Contract length (Three Your Way)</span>
                <span style={{ fontSize: 12, color: "#666" }}>0% APR Representative</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setContractMonths(36)}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: contractMonths === 36 ? "2px solid #000" : "1px solid #e0d0ce",
                    background: contractMonths === 36 ? "#fdf2f0" : "#fff",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#000" }}>36 Months</div>
                  <div style={{ fontSize: 12, color: "#059669", fontWeight: 700, marginTop: 2 }}>
                    Lowest monthly payment
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setContractMonths(24)}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: contractMonths === 24 ? "2px solid #000" : "1px solid #e0d0ce",
                    background: contractMonths === 24 ? "#fdf2f0" : "#fff",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#000" }}>24 Months</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                    Pay off your device faster
                  </div>
                </button>
              </div>
            </div>

            {/* STEP 4: CHOOSE AIRTIME PLAN */}
            <div
              style={{
                background: "#fff",
                borderRadius: 20,
                border: "1px solid #f0e2df",
                padding: "20px 24px",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontWeight: 800, fontSize: 15 }}>4. Choose your Airtime plan</span>
                <span style={{ fontSize: 12, color: "#666" }}>5G at no extra cost</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {device.airtimePlans.map(plan => {
                  const isSelected = selectedPlanId === plan.id;
                  const planMonthly =
                    Math.round(
                      (plan.monthly + selectedStorage.monthlyDiff) * termFactor * 10
                    ) / 10;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      style={{
                        padding: 18,
                        borderRadius: 16,
                        border: isSelected ? "2px solid #ff7b67" : "1px solid #e0d0ce",
                        background: isSelected ? "#fffaf9" : "#fff",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <strong style={{ fontSize: 16, color: "#000" }}>{plan.name}</strong>
                            {plan.popular && (
                              <span
                                style={{
                                  background: "#000",
                                  color: "#fff",
                                  fontSize: 10,
                                  fontWeight: 800,
                                  padding: "2px 8px",
                                  borderRadius: 999,
                                }}
                              >
                                POPULAR
                              </span>
                            )}
                          </div>
                          {plan.savings && (
                            <span style={{ fontSize: 12, color: "#d94830", fontWeight: 700, display: "block", marginTop: 3 }}>
                              ★ {plan.savings}
                            </span>
                          )}
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: 20, fontWeight: 900, color: "#000" }}>
                            £{planMonthly.toFixed(2)}
                          </span>
                          <span style={{ fontSize: 12, color: "#555" }}> / month</span>
                        </div>
                      </div>

                      <ul style={{ margin: "12px 0 0", paddingLeft: 18, fontSize: 12, color: "#444", lineHeight: 1.5 }}>
                        {plan.features.map((f, idx) => (
                          <li key={idx}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP 5: TRADE-IN ESTIMATOR */}
            <div
              style={{
                background: "#fdf2f0",
                borderRadius: 20,
                border: "1px dashed #ff7b67",
                padding: "20px 24px",
                marginBottom: 26,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: "#000" }}>
                  ♻️ Trade in your old phone &amp; save
                </span>
                <span style={{ background: "#ff7b67", color: "#fff", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                  Save up to £{device.tradeInBonus}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "#555", margin: "0 0 12px" }}>
                Send us your old phone in our prepaid DPD pack to reduce your monthly bill or get instant cashback.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <select
                  value={tradeInBrand}
                  onChange={e => {
                    setTradeInBrand(e.target.value);
                    setTradeInApplied(Boolean(e.target.value));
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: 999,
                    border: "1px solid #e0d0ce",
                    fontSize: 13,
                    background: "#fff",
                  }}
                >
                  <option value="">Select your current phone brand...</option>
                  <option value="apple">Apple iPhone 14/15/16 (Save £15/mo)</option>
                  <option value="samsung">Samsung Galaxy S22/S23/S24 (Save £12/mo)</option>
                  <option value="google">Google Pixel 7/8/9 (Save £10/mo)</option>
                  <option value="other">Other brand (Save £8/mo)</option>
                </select>
                {tradeInApplied && (
                  <button
                    type="button"
                    onClick={() => {
                      setTradeInBrand("");
                      setTradeInApplied(false);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#c00",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* ORDER SUMMARY & CHECKOUT BOX */}
            <div
              style={{
                background: "#000",
                color: "#fff",
                borderRadius: 24,
                padding: "28px 28px 24px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 12, letterSpacing: "1px", textTransform: "uppercase", color: "#aaa" }}>
                    Total Monthly
                  </span>
                  <div style={{ fontSize: 38, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>
                    £{finalMonthly.toFixed(2)}
                    <span style={{ fontSize: 16, fontWeight: 500, color: "#bbb" }}> a month</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 12, letterSpacing: "1px", textTransform: "uppercase", color: "#aaa" }}>
                    Upfront Cost
                  </span>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>
                    £{finalUpfront.toFixed(2)}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: "#aaa",
                  lineHeight: 1.4,
                  borderTop: "1px solid #333",
                  paddingTop: 12,
                  marginBottom: 20,
                }}
              >
                Monthly price subject to annual April CPI price rises. Contract duration: {contractMonths} months.
                Includes {currentPlan.data}, unlimited mins &amp; texts. Free tracked next-day DPD delivery.
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="button"
                  onClick={handleCheckout}
                  style={{
                    flex: 2,
                    background: "#ff7b67",
                    color: "#000",
                    border: "none",
                    borderRadius: 999,
                    padding: "16px 24px",
                    fontSize: 16,
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "transform 0.15s ease",
                  }}
                >
                  Proceed to Checkout →
                </button>
                <button
                  type="button"
                  onClick={() =>
                    askAi(
                      `I'm looking at ${device.model} ${selectedStorage.size} in ${selectedColor.name} for £${finalMonthly}/mo. Can you explain the contract details and compare it to other options?`
                    )
                  }
                  style={{
                    flex: 1,
                    background: "transparent",
                    color: "#fff",
                    border: "1px solid #555",
                    borderRadius: 999,
                    padding: "16px 14px",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Ask AI Advisor
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 18,
                  fontSize: 12,
                  color: "#999",
                }}
              >
                <span>📦 Free Next Working Day Delivery</span>
                <span>🔄 14-Day Returns</span>
                <span>📶 30-Day Money Back</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. WHAT'S IN THE BOX */}
        <section style={{ marginTop: 60, padding: "36px 0", borderTop: "1px solid #eee" }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20 }}>What&apos;s in the box</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {device.whatsInTheBox.map((boxItem, idx) => (
              <div
                key={idx}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  border: "1px solid #f0e2df",
                  padding: "20px 16px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>{boxItem.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{boxItem.name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. TECHNICAL SPECIFICATIONS ACCORDION */}
        <section style={{ marginTop: 40, padding: "36px 0", borderTop: "1px solid #eee" }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Technical specifications</h2>
          <p style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>
            Detailed hardware and network capabilities for {device.model}.
          </p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {device.specs.map(cat => (
              <button
                key={cat.category}
                type="button"
                onClick={() => setActiveSpecCategory(cat.category)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: activeSpecCategory === cat.category ? "2px solid #000" : "1px solid #e0d0ce",
                  background: activeSpecCategory === cat.category ? "#000" : "#fff",
                  color: activeSpecCategory === cat.category ? "#fff" : "#111",
                  fontWeight: activeSpecCategory === cat.category ? 700 : 500,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {cat.category}
              </button>
            ))}
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1px solid #f0e2df",
              padding: "24px 28px",
            }}
          >
            {device.specs
              .filter(cat => !activeSpecCategory || cat.category === activeSpecCategory)
              .map(cat => (
                <div key={cat.category}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 16px", color: "#ff7b67" }}>
                    {cat.category}
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                    {cat.items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          borderBottom: "1px solid #f5edea",
                          paddingBottom: 10,
                        }}
                      >
                        <div style={{ fontSize: 12, color: "#777", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginTop: 2 }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* 7. WHY CHOOSE THREE PERKS */}
        <section style={{ marginTop: 40, padding: "40px 0", borderTop: "1px solid #eee" }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>Why buy from Three?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            <div style={{ background: "#fdf2f0", padding: 24, borderRadius: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📶</div>
              <h4 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 6px" }}>The Nation&apos;s Network</h4>
              <p style={{ fontSize: 13, color: "#555", margin: 0, lineHeight: 1.5 }}>
                Covering 99% of the UK population with ultra-fast 5G Standalone and 4G connectivity.
              </p>
            </div>
            <div style={{ background: "#fdf2f0", padding: 24, borderRadius: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🎁</div>
              <h4 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 6px" }}>Three+ Rewards</h4>
              <p style={{ fontSize: 13, color: "#555", margin: 0, lineHeight: 1.5 }}>
                Exclusive weekly treats: £1 Caffè Nero drinks, £3 cinema tickets, and presale access to UK festivals.
              </p>
            </div>
            <div style={{ background: "#fdf2f0", padding: 24, borderRadius: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🚚</div>
              <h4 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 6px" }}>Free Tracked DPD Delivery</h4>
              <p style={{ fontSize: 13, color: "#555", margin: 0, lineHeight: 1.5 }}>
                Order before 8pm Sunday-Friday for free delivery the very next day with a 1-hour delivery slot.
              </p>
            </div>
            <div style={{ background: "#fdf2f0", padding: 24, borderRadius: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📲</div>
              <h4 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 6px" }}>Keep Your Number</h4>
              <p style={{ fontSize: 13, color: "#555", margin: 0, lineHeight: 1.5 }}>
                Just text PAC to 65075 from your current provider. We&apos;ll switch your number over in 1 working day.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 8. STICKY BOTTOM PURCHASE BAR */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#fff",
          borderTop: "1px solid #e0d0ce",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
          zIndex: 900,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img
            src={selectedColor.image}
            alt={device.model}
            style={{ width: 44, height: 44, objectFit: "contain" }}
          />
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#000" }}>
              {device.model} ({selectedStorage.size})
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              Colour: {selectedColor.name} · {contractMonths} months
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#000" }}>
              £{finalMonthly.toFixed(2)}
              <span style={{ fontSize: 12, fontWeight: 500, color: "#555" }}> /mo</span>
            </div>
            <div style={{ fontSize: 11, color: "#777" }}>
              £{finalUpfront.toFixed(2)} upfront
            </div>
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            style={{
              background: "#ff7b67",
              color: "#000",
              border: "none",
              borderRadius: 999,
              padding: "12px 28px",
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Get this deal →
          </button>
        </div>
      </div>

      {/* Embedded Chat Widget */}
      <ChatWidget />
    </div>
  );
}
