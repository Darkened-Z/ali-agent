"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThreeLogo } from "@/components/ThreeLogo";
import { ChatWidget } from "@/components/ChatWidget";
import { getDeviceBySlug, DeviceDetail } from "@/lib/deviceDetails";

function BoxItemIcon({ type, name }: { type: string; name: string }) {
  const t = (type || "").toLowerCase();
  const n = (name || "").toLowerCase();

  const props = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (t === "cable" || n.includes("cable") || n.includes("wire") || n.includes("lead")) {
    return (
      <svg {...props}>
        <rect x="7" y="2" width="10" height="5" rx="1" />
        <path d="M12 7v5a5 5 0 0 1-5 5H4" />
        <rect x="2" y="15" width="4" height="4" rx="1" />
        <line x1="10" y1="2" x2="14" y2="2" />
      </svg>
    );
  }

  if (
    t === "guide" ||
    n.includes("sim") ||
    n.includes("pin") ||
    n.includes("adaptor") ||
    n.includes("tool") ||
    n.includes("guide") ||
    n.includes("manual") ||
    n.includes("documentation")
  ) {
    return (
      <svg {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <circle cx="10" cy="14" r="2" />
        <line x1="10" y1="16" x2="10" y2="19" />
      </svg>
    );
  }

  if (t === "box" || n.includes("packaging") || n.includes("box")) {
    return (
      <svg {...props}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    );
  }

  if (t === "charger" || n.includes("charger") || n.includes("power") || n.includes("brick")) {
    return (
      <svg {...props}>
        <rect x="5" y="8" width="14" height="12" rx="2" />
        <line x1="9" y1="4" x2="9" y2="8" />
        <line x1="15" y1="4" x2="15" y2="8" />
        <circle cx="12" cy="14" r="2" />
      </svg>
    );
  }

  if (t === "pen" || n.includes("pen") || n.includes("stylus")) {
    return (
      <svg {...props}>
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18z" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    );
  }

  if (t === "case" || n.includes("case") || n.includes("leather") || n.includes("cover") || n.includes("aramid")) {
    return (
      <svg {...props}>
        <rect x="5" y="2" width="14" height="20" rx="3" />
        <rect x="7" y="5" width="10" height="14" rx="1.5" strokeDasharray="2 2" />
      </svg>
    );
  }

  // Smartphone (default)
  return (
    <svg {...props}>
      <rect x="5" y="2" width="14" height="20" rx="3" />
      <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5" />
      <line x1="10" y1="4" x2="14" y2="4" />
    </svg>
  );
}

function HighlightIcon({ type, title }: { type: string; title: string }) {
  const t = (type || "").toLowerCase();
  const s = (title || "").toLowerCase();

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

  if (
    t === "chip" ||
    s.includes("bionic") ||
    s.includes("silicon") ||
    s.includes("tensor") ||
    s.includes("snapdragon") ||
    s.includes("processor") ||
    s.includes("power")
  ) {
    return (
      <svg {...props}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" />
        <line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" />
        <line x1="20" y1="15" x2="23" y2="15" />
        <line x1="1" y1="9" x2="4" y2="9" />
        <line x1="1" y1="15" x2="4" y2="15" />
      </svg>
    );
  }

  if (t === "camera" || s.includes("camera") || s.includes("photo") || s.includes("lens") || s.includes("telephoto")) {
    return (
      <svg {...props}>
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    );
  }

  if (t === "shield" || s.includes("titanium") || s.includes("armor") || s.includes("glass") || s.includes("ceramic") || s.includes("update")) {
    return (
      <svg {...props}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }

  if (t === "battery" || s.includes("battery") || s.includes("charge")) {
    return (
      <svg {...props}>
        <rect x="2" y="7" width="16" height="10" rx="2" />
        <line x1="22" y1="11" x2="22" y2="13" />
        <line x1="6" y1="11" x2="6" y2="13" />
        <line x1="10" y1="11" x2="10" y2="13" />
      </svg>
    );
  }

  if (t === "display" || t === "fold" || t === "flip" || s.includes("display") || s.includes("screen") || s.includes("amoled") || s.includes("island")) {
    return (
      <svg {...props}>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <line x1="4" y1="9" x2="20" y2="9" />
      </svg>
    );
  }

  if (t === "pen" || s.includes("pen") || s.includes("stylus")) {
    return (
      <svg {...props}>
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18z" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

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
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 20 }}>
              <h4 style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b", marginBottom: 12, fontWeight: 800, fontFamily: "var(--font-jbmono), monospace" }}>
                Hardware Highlights
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {device.highlights.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "12px 14px",
                      background: "#ffffff",
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ color: "#ff7b67", display: "flex", alignItems: "center" }}>
                        <HighlightIcon type={h.icon} title={h.title} />
                      </span>
                      <strong style={{ fontSize: 12.5, color: "#0f172a", fontWeight: 800 }}>{h.title}</strong>
                    </div>
                    <span style={{ fontSize: 11, color: "#64748b", lineHeight: 1.35, display: "block" }}>
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
                <span style={{ fontWeight: 800, fontSize: 15, color: "#000", display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff7b67" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  Trade in your old phone &amp; save
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
                  color: "#cbd5e1",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff7b67" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Free Next-Day DPD Delivery
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff7b67" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  14-Day Money Back Guarantee
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff7b67" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  0% APR Three Your Way
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. WHAT'S IN THE BOX */}
        <section style={{ marginTop: 60, padding: "36px 0", borderTop: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", margin: 0 }}>What&apos;s in the box</h2>
              <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
                Official retail packaging contents provided directly by the manufacturer
              </p>
            </div>
            <span style={{ fontSize: 11, fontFamily: "var(--font-jbmono), monospace", color: "#64748b", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {device.whatsInTheBox.length} ITEMS INCLUDED
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {device.whatsInTheBox.map((boxItem, idx) => (
              <div
                key={idx}
                style={{
                  background: "#ffffff",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 10,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: "#0f172a",
                  }}
                >
                  <BoxItemIcon type={boxItem.icon} name={boxItem.name} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-jbmono), monospace",
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#ff7b67",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: 3,
                    }}
                  >
                    ITEM {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a", lineHeight: 1.35 }}>
                    {boxItem.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>
                    Included in retail packaging
                  </div>
                </div>
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
        <section style={{ marginTop: 40, padding: "40px 0", borderTop: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20, color: "#0f172a" }}>Why buy from Three?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: 22, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: "#fff5f3", border: "1px solid #ffd8d2", display: "flex", alignItems: "center", justifyContent: "center", color: "#d94830", marginBottom: 14 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V4"/><path d="M22 20v-12"/></svg>
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 6px", color: "#0f172a" }}>The Nation&apos;s Network</h4>
              <p style={{ fontSize: 12.5, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                Covering 99% of the UK population with ultra-fast 5G Standalone and 4G connectivity.
              </p>
            </div>
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: 22, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: "#fff5f3", border: "1px solid #ffd8d2", display: "flex", alignItems: "center", justifyContent: "center", color: "#d94830", marginBottom: 14 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 6px", color: "#0f172a" }}>Three+ Rewards</h4>
              <p style={{ fontSize: 12.5, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                Exclusive weekly treats: £1 Caffè Nero drinks, £3 cinema tickets, and presale access to UK festivals.
              </p>
            </div>
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: 22, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: "#fff5f3", border: "1px solid #ffd8d2", display: "flex", alignItems: "center", justifyContent: "center", color: "#d94830", marginBottom: 14 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 6px", color: "#0f172a" }}>Free Tracked DPD Delivery</h4>
              <p style={{ fontSize: 12.5, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                Order before 8pm Sunday-Friday for free delivery the very next day with a 1-hour delivery slot.
              </p>
            </div>
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: 22, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: "#fff5f3", border: "1px solid #ffd8d2", display: "flex", alignItems: "center", justifyContent: "center", color: "#d94830", marginBottom: 14 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 6px", color: "#0f172a" }}>Keep Your Number</h4>
              <p style={{ fontSize: 12.5, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
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
