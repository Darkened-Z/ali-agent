"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThreeLogo } from "@/components/ThreeLogo";
import type { OrderRecord } from "@/lib/store";

type BasketItem = {
  id: string;
  name: string;
  price: string;
  upfront?: string;
};

const DEFAULT_DEALS: BasketItem[] = [
  {
    id: "pop-iphone-18",
    name: "iPhone 18 Pro · Unlimited 5G Plan",
    price: "£54.00/mo",
    upfront: "£45.00 upfront",
  },
  {
    id: "sim-unl-23",
    name: "Three Unlimited Data SIM (24m)",
    price: "£23.00/mo",
    upfront: "£0.00 upfront",
  },
  {
    id: "pop-s26",
    name: "Samsung Galaxy S26 · Unlimited 5G Plan",
    price: "£38.00/mo",
    upfront: "£29.00 upfront",
  },
  {
    id: "bb-18",
    name: "Three 5G Home Broadband (Plug & Play)",
    price: "£18.00/mo",
    upfront: "£0.00 upfront",
  },
];

export default function CheckoutPage() {
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [keepNumber, setKeepNumber] = useState(false);
  const [pacCode, setPacCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Klarna Pay in 3");
  const [agreed, setAgreed] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const sp = new URLSearchParams(window.location.search);
        const qName = sp.get("name");
        const qMonthly = sp.get("monthly");
        const qUpfront = sp.get("upfront");
        if (qName && qMonthly) {
          const itemFromUrl: BasketItem = {
            id: `item-${Date.now()}`,
            name: qName,
            price: `£${parseFloat(qMonthly).toFixed(2)}/mo`,
            upfront: qUpfront ? `£${parseFloat(qUpfront).toFixed(2)} upfront` : "£0.00 upfront",
          };
          setBasket([itemFromUrl]);
          return;
        }
      }

      const saved = localStorage.getItem("three_basket");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBasket(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    // Default to popular deal if basket was empty
    setBasket([DEFAULT_DEALS[0]]);
  }, []);

  const removeItem = (idx: number) => {
    setBasket(b => {
      const next = b.filter((_, i) => i !== idx);
      try {
        localStorage.setItem("three_basket", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const addItem = (item: BasketItem) => {
    setBasket(b => {
      const next = [...b, item];
      try {
        localStorage.setItem("three_basket", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const calculateTotals = () => {
    let monthly = 0;
    let upfront = 0;
    for (const item of basket) {
      const m = item.price.match(/£?([0-9.]+)/);
      if (m) monthly += parseFloat(m[1]);
      if (item.upfront) {
        const u = item.upfront.match(/£?([0-9.]+)/);
        if (u) upfront += parseFloat(u[1]);
      }
    }
    return {
      monthly: `£${monthly.toFixed(2)}`,
      upfront: `£${upfront.toFixed(2)}`,
    };
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim() || !postcode.trim() || !email.trim()) {
      alert("Please fill in all delivery and contact details.");
      return;
    }
    if (basket.length === 0) {
      alert("Your basket is empty. Please select a phone or SIM plan.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          email,
          phone,
          address,
          city: city || "London",
          postcode,
          pacCode: keepNumber ? pacCode : undefined,
          paymentMethod,
          items: basket,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setConfirmedOrder(json.order);
        try {
          localStorage.removeItem("three_basket");
        } catch {}
        window.dispatchEvent(new Event("ali-store-updated"));
      } else {
        alert("Failed to submit order. Please try again.");
      }
    } catch {
      alert("Network error placing order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const totals = calculateTotals();

  // =========================================================================
  // CONFIRMATION VIEW
  // =========================================================================
  if (confirmedOrder) {
    return (
      <div className="three-page" style={{ minHeight: "100vh", background: "#fdf2f0" }}>
        <header className="three-top-utility">
          <div className="three-container three-top-utility__inner">
            <Link href="/" className="three-logo-link">
              <ThreeLogo size={42} fill="#000" />
            </Link>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Official Order Confirmation</span>
            <Link href="/admin" className="three-pill-utility three-pill-utility--dark">
              Staff Portal (/admin) →
            </Link>
          </div>
        </header>

        <main style={{ padding: "48px 0" }}>
          <div className="three-container" style={{ maxWidth: 840 }}>
            <div
              style={{
                background: "#ffffff",
                borderRadius: 24,
                padding: "44px 48px",
                boxShadow: "0 18px 48px rgba(0,0,0,0.08)",
                border: "1px solid #ead8d6",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #00A86B, #00C853)",
                    color: "#fff",
                    fontSize: 38,
                    display: "grid",
                    placeItems: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  ✓
                </div>
                <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.03em" }}>
                  Thank you, your order is confirmed!
                </h1>
                <p style={{ fontSize: 16, color: "#555", margin: 0 }}>
                  We’ve sent a full confirmation receipt and contract summary to <b>{confirmedOrder.email}</b>.
                </p>
              </div>

              {/* Order Reference Box */}
              <div
                style={{
                  background: "#fdf2f0",
                  borderRadius: 16,
                  padding: "20px 24px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 28,
                  border: "1px solid #ffaba9",
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#666" }}>
                    THREE ORDER REFERENCE
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#000" }}>
                    {confirmedOrder.id}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#666" }}>
                    ESTIMATED DPD DELIVERY
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#00A86B" }}>
                    Next working day by 13:00 (Tracked 24)
                  </div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                    Tracking Ref: {confirmedOrder.trackingNumber}
                  </div>
                </div>
              </div>

              {/* Items Summary */}
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 12px" }}>Order Items</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                {confirmedOrder.items.map((item, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      background: "#fafafa",
                      borderRadius: 12,
                      border: "1px solid #eee",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        UK 5G Network · Free DPD Next-Day delivery
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{item.price}</div>
                      {item.upfront && <div style={{ fontSize: 12, color: "#666" }}>{item.upfront}</div>}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Delivery Details */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 20,
                  paddingTop: 20,
                  borderTop: "1px solid #eee",
                  marginBottom: 32,
                  fontSize: 14,
                }}
              >
                <div>
                  <strong>Delivery Address:</strong>
                  <div style={{ color: "#555", marginTop: 4 }}>
                    {confirmedOrder.customerName}<br />
                    {confirmedOrder.address}<br />
                    {confirmedOrder.city}, {confirmedOrder.postcode}<br />
                    Phone: {confirmedOrder.phone}
                  </div>
                </div>
                <div>
                  <strong>Payment &amp; Number Switching:</strong>
                  <div style={{ color: "#555", marginTop: 4 }}>
                    Payment method: {confirmedOrder.paymentMethod}<br />
                    Number switch: {confirmedOrder.pacCode ? `Porting PAC: ${confirmedOrder.pacCode} (1 working day)` : "New Three Mobile number requested"}<br />
                    Status: <span style={{ color: "#00A86B", fontWeight: 700 }}>Order Dispatched to Warehouse</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link
                  href="/"
                  className="three-cta-pill three-cta-pill--black"
                  style={{ flex: 1, textAlign: "center", justifyContent: "center" }}
                >
                  Return to Storefront
                </Link>
                <Link
                  href="/admin"
                  className="three-cta-pill three-cta-pill--outline"
                  style={{ flex: 1, textAlign: "center", justifyContent: "center" }}
                >
                  View in Admin Portal
                </Link>
                <button
                  type="button"
                  className="three-cta-pill three-cta-pill--outline"
                  onClick={() => window.print()}
                >
                  Print Receipt 🖨️
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // CHECKOUT FORM VIEW
  // =========================================================================
  return (
    <div className="three-page">
      {/* Top utility */}
      <header className="three-top-utility">
        <div className="three-container three-top-utility__inner">
          <div className="three-top-utility__left">
            <Link href="/" className="three-logo-link" aria-label="Three home">
              <ThreeLogo size={42} fill="#000" />
            </Link>
            <span style={{ fontSize: 13, fontWeight: 700 }}>
              Secure Three Checkout · Order Hotline: 0800 033 8006
            </span>
          </div>
          <div className="three-top-utility__right">
            <Link href="/" style={{ color: "#000", fontSize: 13, textDecoration: "underline" }}>
              ← Continue shopping
            </Link>
            <Link href="/admin" className="three-pill-utility three-pill-utility--dark">
              Call Center Staff (/admin)
            </Link>
          </div>
        </div>
      </header>

      {/* Main Checkout View */}
      <main style={{ padding: "36px 0 60px", background: "linear-gradient(180deg, #fdf2f0 0%, #ffffff 40%)" }}>
        <div className="three-container">
          <div style={{ marginBottom: 28 }}>
            <span className="three-kicker-pill">ORDER CONFIRMATION &amp; DISPATCH</span>
            <h1 style={{ fontSize: clamp(32, "4vw", 44), fontWeight: 800, margin: "6px 0 8px", letterSpacing: "-0.03em" }}>
              Complete your Three order
            </h1>
            <p style={{ fontSize: 15, color: "#555", margin: 0 }}>
              Free DPD Next-Working-Day delivery on all handsets &amp; SIMs. 14-day cooling-off guarantee.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr",
              gap: 32,
              alignItems: "start",
            }}
          >
            {/* Left Column: Form */}
            <form onSubmit={handlePlaceOrder} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* 1. Basket review */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  padding: 24,
                  border: "1px solid #ebd8d6",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
                    1. Review Selected Items ({basket.length})
                  </h3>
                  <span style={{ fontSize: 12, color: "#00A86B", fontWeight: 700 }}>
                    ✓ 5G SIM Included Free
                  </span>
                </div>

                {basket.length === 0 ? (
                  <div style={{ padding: "20px 0", textAlign: "center" }}>
                    <p style={{ color: "#666", fontSize: 14 }}>Your basket is currently empty.</p>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
                      {DEFAULT_DEALS.map(d => (
                        <button
                          key={d.id}
                          type="button"
                          className="three-cta-pill three-cta-pill--outline"
                          onClick={() => addItem(d)}
                          style={{ fontSize: 12, padding: "8px 14px" }}
                        >
                          + Add {d.name.split("·")[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {basket.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "12px 14px",
                          background: "#fdf2f0",
                          borderRadius: 12,
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</div>
                          <div style={{ fontSize: 12, color: "#555" }}>
                            {item.price} {item.upfront ? `· ${item.upfront}` : ""}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          style={{ background: "none", border: "none", color: "#c00", cursor: "pointer", fontSize: 13 }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Customer Contact & Delivery */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  padding: 24,
                  border: "1px solid #ebd8d6",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
                }}
              >
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 16px" }}>
                  2. Contact &amp; UK Delivery Address
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>FULL NAME</label>
                    <input
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Marcus Vance"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>EMAIL ADDRESS</label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. marcus@gmail.com"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", fontSize: 14 }}
                    />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>UK MOBILE PHONE NUMBER</label>
                    <input
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. 07700 900214"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", fontSize: 14 }}
                    />
                    <small style={{ color: "#666", fontSize: 11 }}>We’ll send your 1-hour DPD delivery SMS window here.</small>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>DELIVERY STREET ADDRESS</label>
                    <input
                      required
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="e.g. 42 Richmond Hill"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>TOWN / CITY</label>
                    <input
                      required
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="e.g. London"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>UK POSTCODE</label>
                    <input
                      required
                      value={postcode}
                      onChange={e => setPostcode(e.target.value)}
                      placeholder="e.g. TW10 6QX"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", fontSize: 14 }}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Number Porting (PAC Code) */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  padding: 24,
                  border: "1px solid #ebd8d6",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
                }}
              >
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 12px" }}>
                  3. Keep Your Current Number? (Optional)
                </h3>
                <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, cursor: "pointer", marginBottom: 12 }}>
                  <input
                    type="checkbox"
                    checked={keepNumber}
                    onChange={e => setKeepNumber(e.target.checked)}
                    style={{ width: 18, height: 18 }}
                  />
                  <span>Yes, I want to transfer my current number to Three using a PAC code.</span>
                </label>
                {keepNumber && (
                  <div style={{ background: "#fdf2f0", padding: 14, borderRadius: 12 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                      ENTER PAC CODE (Text PAC to 65075 for free)
                    </label>
                    <input
                      value={pacCode}
                      onChange={e => setPacCode(e.target.value.toUpperCase())}
                      placeholder="e.g. VOD123456"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #ccc", fontSize: 14 }}
                    />
                    <small style={{ color: "#666", fontSize: 11, display: "block", marginTop: 4 }}>
                      We port your number automatically within 1 working day without interrupting your service.
                    </small>
                  </div>
                )}
              </div>

              {/* 4. Payment Selection for upfront */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  padding: 24,
                  border: "1px solid #ebd8d6",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
                }}
              >
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 14px" }}>
                  4. Upfront Payment Method ({totals.upfront})
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {[
                    { label: "Klarna Pay in 3", sub: "Interest-free" },
                    { label: "Debit / Credit Card", sub: "Visa / Mastercard" },
                    { label: "PayPal Pay in 3", sub: "Instant check" },
                  ].map(m => (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setPaymentMethod(m.label)}
                      style={{
                        padding: "12px 10px",
                        borderRadius: 12,
                        border: paymentMethod === m.label ? "2px solid #000" : "1px solid #ddd",
                        background: paymentMethod === m.label ? "#fdf2f0" : "#fff",
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: "#666" }}>{m.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Terms agreement */}
              <label style={{ display: "flex", gap: 10, fontSize: 13, color: "#444", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  style={{ width: 18, height: 18, marginTop: 2 }}
                />
                <span>
                  I agree to Three UK&apos;s standard terms &amp; conditions, the Ofcom annual price rise disclosure (prices increase each April by the specified pounds-and-pence rate), and credit check.
                </span>
              </label>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="three-cta-pill three-cta-pill--black"
                style={{
                  padding: "16px 32px",
                  fontSize: 16,
                  justifyContent: "center",
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "Placing Order with Three…" : `Place Order & Confirm Delivery (${totals.upfront} today) →`}
              </button>
            </form>

            {/* Right Column: Order Summary Card */}
            <aside style={{ position: "sticky", top: 80 }}>
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 24,
                  padding: "28px 24px",
                  border: "2px solid #ffaba9",
                  boxShadow: "0 12px 36px rgba(0,0,0,0.06)",
                }}
              >
                <span className="three-kicker-pill">ORDER SUMMARY</span>
                <h3 style={{ fontSize: 22, fontWeight: 800, margin: "6px 0 16px" }}>Your Monthly Spend</h3>

                <div style={{ borderBottom: "1px solid #eee", paddingBottom: 16, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 14, color: "#555" }}>Monthly plan cost:</span>
                    <span style={{ fontSize: 26, fontWeight: 800 }}>{totals.monthly}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8 }}>
                    <span style={{ fontSize: 14, color: "#555" }}>Upfront today:</span>
                    <span style={{ fontSize: 18, fontWeight: 700 }}>{totals.upfront}</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "#333" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: "#00A86B", fontWeight: 800 }}>✓</span>
                    <span>Free DPD Next-Working-Day Tracked Delivery</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: "#00A86B", fontWeight: 800 }}>✓</span>
                    <span>14-Day Cooling-off &amp; Returns guarantee</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: "#00A86B", fontWeight: 800 }}>✓</span>
                    <span>Free Three+ Rewards app (£1 weekly coffee)</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: "#00A86B", fontWeight: 800 }}>✓</span>
                    <span>Nation&apos;s Network combined 5G coverage</span>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 20,
                    padding: 12,
                    background: "#fdf2f0",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "#555",
                    lineHeight: 1.45,
                  }}
                >
                  <strong>Need help ordering?</strong> Call our dedicated phone advisors at <b>0800 033 8006</b> or use the floating Three AI widget.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

function clamp(min: number, val: string, max: number): string {
  return `clamp(${min}px, ${val}, ${max}px)`;
}
