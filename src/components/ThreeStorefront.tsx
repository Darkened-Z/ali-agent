"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThreeLogo } from "./ThreeLogo";
import { ChatWidget } from "./ChatWidget";
import { phoneDeals, simOnlyPlans, refurbPhones } from "@/lib/plans";

type BasketItem = {
  id: string;
  name: string;
  price: string;
  upfront?: string;
};

const POPULAR_SHOWCASE = [
  {
    id: "pop-iphone-17",
    title: "iPhone 17",
    subtitle: "Save with our Unlimited Lite airtime plan. More delightful. More durable.",
    monthly: "£42",
    upfront: "£25 upfront",
    data: "100GB 5G · Unlimited mins & texts",
    rise: "Increasing to £44.30 from 1 Apr 27, £46.60 from 1 Apr 28. [1]",
    img: "https://www.three.co.uk/content/dam/live-asset/web/Pages/Home/620x620-centre-iphone-17-lavender.png",
    tag: "POPULAR",
  },
  {
    id: "pop-s26",
    title: "Samsung Galaxy S26",
    subtitle: "Save up to £726 when you trade in an eligible phone.",
    monthly: "£38",
    upfront: "£29 upfront",
    data: "Unlimited 5G · Unlimited mins & texts",
    rise: "Increasing to £40.30 from 1 Apr 27, £42.60 from 1 Apr 28. [1]",
    img: "https://www.three.co.uk/content/dam/live-asset/web/Pages/Home/620x620-samsung-galaxy-s26-cobaltviolet.png",
    tag: "TRADE-IN OFFER",
  },
  {
    id: "pop-honor-v6",
    title: "HONOR Magic V6",
    subtitle: "Save with selected airtime plans.",
    monthly: "£49",
    upfront: "£39 upfront",
    data: "Unlimited 5G · Foldable flagship",
    rise: "Increasing to £51.50 from 1 Apr 27, £54.00 from 1 Apr 28. [1]",
    img: "https://www.three.co.uk/content/dam/live-asset/web/device-images/phones/honor/magic-series/620x620-centre-honor-magic-v6-red.png",
    tag: "NEW FOLDABLE",
  },
  {
    id: "pop-razr-70",
    title: "Motorola Razr 70 Ultra",
    subtitle: "Save with selected airtime plans.",
    monthly: "£41",
    upfront: "£29 upfront",
    data: "100GB 5G · Flip display",
    rise: "Increasing to £43.30 from 1 Apr 27, £45.60 from 1 Apr 28. [1]",
    img: "https://www.three.co.uk/content/dam/live-asset/web/device-images/phones/motorola/razr-70-ultra/620x620-centre-motorola-razr-70-ultra-orient-blue.png",
    tag: "EXCLUSIVE",
  },
];

const QUICK_CATEGORIES = [
  { label: "Student Discounts", icon: "🎓", query: "Do you have student discounts on Three?" },
  { label: "Pay Monthly phones", icon: "📱", query: "Show me your best Pay Monthly phone deals" },
  { label: "Pay As You Go phones", icon: "💳", query: "What Pay As You Go phones do you have?" },
  { label: "SIM Only", icon: "📶", query: "What is your cheapest SIM-only plan?" },
  { label: "Home Broadband", icon: "🏠", query: "Tell me about Three Home Broadband for £18 a month" },
  { label: "Mobile Broadband", icon: "📡", query: "Do you offer 5G Mobile Broadband?" },
  { label: "Tablets and Laptops", icon: "💻", query: "What tablet and iPad deals do you have?" },
  { label: "Smartwatches", icon: "⌚", query: "Do you have Apple Watch or Samsung Watch plans?" },
  { label: "Accessories", icon: "🎧", query: "Do you have AirPods Pro 2 or Galaxy Buds in stock?" },
  { label: "Business plans", icon: "💼", query: "Tell me about business multi-SIM discounts" },
  { label: "Top up", icon: "⚡", query: "How do I top up my Pay As You Go SIM?" },
];

export function ThreeStorefront() {
  const [division, setDivision] = useState<"personal" | "business">("personal");
  const [openMenu, setOpenMenu] = useState<"shop" | "why" | "help" | null>(null);
  const [showMy3, setShowMy3] = useState(false);
  const [showBasket, setShowBasket] = useState(false);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [dealTab, setDealTab] = useState<"featured" | "phones" | "sim" | "refurb">("featured");
  const [postcode, setPostcode] = useState("");
  const [postcodeResult, setPostcodeResult] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("three_basket");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setBasket(parsed);
      }
    } catch {}
  }, []);

  const askAi = (prompt: string) => {
    window.dispatchEvent(new CustomEvent("ali-open-chat", { detail: { prompt } }));
  };

  const addToBasket = (item: BasketItem) => {
    setBasket(prev => {
      const next = [...prev, item];
      try {
        localStorage.setItem("three_basket", JSON.stringify(next));
      } catch {}
      return next;
    });
    setShowBasket(true);
  };

  const checkBroadbandPostcode = () => {
    const pc = postcode.trim().toUpperCase();
    if (!pc) return;
    setPostcodeResult(
      `✓ Great news! Three 5G Home Broadband (avg. 150Mbps) is available at ${pc} for £18/mo with next-working-day plug-and-play router delivery.`
    );
  };

  return (
    <div className="three-page">
      {/* =====================================================================
          1. TOP UTILITY HEADER (cmp-container--top-header)
      ===================================================================== */}
      <div className="three-top-utility">
        <div className="three-container three-top-utility__inner">
          <div className="three-top-utility__left">
            <Link href="/" className="three-logo-link" aria-label="Three home">
              <ThreeLogo size={42} fill="#000" />
            </Link>
            <div className="three-division-tabs">
              <button
                type="button"
                className={division === "personal" ? "active" : ""}
                onClick={() => setDivision("personal")}
              >
                Personal
              </button>
              <button
                type="button"
                className={division === "business" ? "active" : ""}
                onClick={() => {
                  setDivision("business");
                  askAi("Tell me about Three Business multi-SIM plans for 5+ lines");
                }}
              >
                Business
              </button>
            </div>
          </div>

          <div className="three-top-utility__right">
            <span className="three-phone-order">
              <b>Order by phone: 0800 033 8006</b>
            </span>
            <ul className="three-utility-links">
              <li>
                <button type="button" onClick={() => askAi("Can you check 5G network coverage in my area?")}>
                  Coverage checker
                </button>
              </li>
              <li>
                <button type="button" onClick={() => askAi("Where is my nearest Three store and opening hours?")}>
                  Store locator
                </button>
              </li>
              <li>
                <Link href="/checkout" className="three-pill-utility" style={{ background: "#fdf2f0", borderColor: "#ffaba9", fontWeight: 700 }}>
                  Checkout ({basket.length}) 🛒
                </Link>
              </li>
              <li>
                <Link href="/form" className="three-pill-utility">
                  Request callback
                </Link>
              </li>
              <li>
                <Link href="/admin" className="three-pill-utility three-pill-utility--dark">
                  Staff Admin →
                </Link>
              </li>
            </ul>

            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="three-account-btn"
                onClick={() => setShowMy3(v => !v)}
              >
                <span className="three-account-icon">👤</span>
                <span>Login / My3</span>
                <span style={{ fontSize: 10 }}>▾</span>
              </button>
              {showMy3 && (
                <div className="three-dropdown-card">
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>My3 Account &amp; Staff</div>
                  <Link href="/checkout" onClick={() => setShowMy3(false)} style={{ color: "#000", fontWeight: 700 }}>
                    🛒 Checkout &amp; Order Confirmation (/checkout)
                  </Link>
                  <Link href="/admin/orders" onClick={() => setShowMy3(false)}>
                    📦 Customer Orders Queue (/admin/orders)
                  </Link>
                  <Link href="/admin" onClick={() => setShowMy3(false)}>
                    Open Call Center Dashboard (/admin)
                  </Link>
                  <Link href="/admin/leads" onClick={() => setShowMy3(false)}>
                    View Live Leads Queue (/admin/leads)
                  </Link>
                  <Link href="/form" onClick={() => setShowMy3(false)}>
                    Public Callback Form (/form)
                  </Link>
                  <Link href="/widget" onClick={() => setShowMy3(false)}>
                    Widget Embed Demo (/widget)
                  </Link>
                </div>
              )}
            </div>

            <button
              type="button"
              className="three-basket-btn"
              onClick={() => setShowBasket(v => !v)}
            >
              <span>Basket</span>
              {basket.length > 0 && (
                <span className="three-basket-badge">{basket.length}</span>
              )}
              <span aria-hidden="true">🛒</span>
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. MAIN CORAL-PINK GRADIENT HEADER & MEGANAV
      ===================================================================== */}
      <header
        className="three-main-header"
        onMouseLeave={() => setOpenMenu(null)}
      >
        <div className="three-container three-main-header__inner">
          <nav className="three-main-nav" aria-label="Main Navigation">
            <button
              type="button"
              className={"three-nav-btn " + (openMenu === "shop" ? "active" : "")}
              onMouseEnter={() => setOpenMenu("shop")}
              onClick={() => setOpenMenu(openMenu === "shop" ? null : "shop")}
            >
              Shop <span>▾</span>
            </button>
            <button
              type="button"
              className={"three-nav-btn " + (openMenu === "why" ? "active" : "")}
              onMouseEnter={() => setOpenMenu("why")}
              onClick={() => setOpenMenu(openMenu === "why" ? null : "why")}
            >
              Why Three? <span>▾</span>
            </button>
            <button
              type="button"
              className={"three-nav-btn " + (openMenu === "help" ? "active" : "")}
              onMouseEnter={() => setOpenMenu("help")}
              onClick={() => setOpenMenu(openMenu === "help" ? null : "help")}
            >
              Help <span>▾</span>
            </button>
            <Link href="/form" className="three-nav-btn" style={{ textDecoration: "none" }}>
              Callback in 30m
            </Link>
            <Link href="/admin" className="three-nav-btn" style={{ textDecoration: "none" }}>
              Call Center Hub
            </Link>
          </nav>

          <div className="three-header-search">
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  askAi(searchQuery.trim());
                  setSearchQuery("");
                }
              }}
              placeholder="Ask AI or search iPhone 17, SIM Only…"
            />
            <button
              type="button"
              onClick={() => {
                if (searchQuery.trim()) {
                  askAi(searchQuery.trim());
                  setSearchQuery("");
                } else {
                  askAi("What are your best deals today?");
                }
              }}
            >
              Ask AI →
            </button>
          </div>
        </div>

        {/* Mega Menu Dropdowns */}
        {openMenu === "shop" && (
          <div className="three-meganav">
            <div className="three-container three-meganav__grid">
              <div>
                <h4>Offers</h4>
                <ul>
                  <li><button onClick={() => { setDealTab("featured"); setOpenMenu(null); }}>Latest offers</button></li>
                  <li><button onClick={() => { askAi("What student discounts do you offer?"); setOpenMenu(null); }}>Student deals</button></li>
                  <li><button onClick={() => { askAi("Tell me about phone bundle deals"); setOpenMenu(null); }}>Phone bundles</button></li>
                  <li><button onClick={() => { setDealTab("refurb"); setOpenMenu(null); }}>Refurbished phones</button></li>
                  <li><button onClick={() => { askAi("How do multi-line discounts work?"); setOpenMenu(null); }}>Multi-line discounts</button></li>
                </ul>
              </div>
              <div>
                <h4>Mobile phones</h4>
                <ul>
                  <li><button onClick={() => { setDealTab("phones"); setOpenMenu(null); }}>Pay Monthly phones</button></li>
                  <li><button onClick={() => { askAi("Show me iPhone 18 Pro and iPhone 17 deals"); setOpenMenu(null); }}>iPhone 18 &amp; iPhone 17</button></li>
                  <li><button onClick={() => { askAi("Show me Samsung Galaxy S26 Ultra deals"); setOpenMenu(null); }}>Samsung Galaxy S26 Series</button></li>
                  <li><button onClick={() => { askAi("Show me Samsung Galaxy Z Flip8 deals"); setOpenMenu(null); }}>Samsung Z Flip and Fold Series</button></li>
                  <li><button onClick={() => { askAi("Show me Google Pixel 11 and Pixel 10 Pro deals"); setOpenMenu(null); }}>Google Pixel Series</button></li>
                </ul>
              </div>
              <div>
                <h4>SIM Only</h4>
                <ul>
                  <li><button onClick={() => { setDealTab("sim"); setOpenMenu(null); }}>All SIM deals</button></li>
                  <li><button onClick={() => { askAi("Tell me about the £23 Unlimited data SIM"); setOpenMenu(null); }}>Pay Monthly phone SIMs</button></li>
                  <li><button onClick={() => { askAi("Tell me about the £10 60GB rolling 30-day SIM"); setOpenMenu(null); }}>30-day Rolling SIMs</button></li>
                  <li><button onClick={() => { askAi("Do you have data-only SIMs for tablets?"); setOpenMenu(null); }}>Pay Monthly Data Only SIMs</button></li>
                </ul>
              </div>
              <div>
                <h4>Broadband &amp; More</h4>
                <ul>
                  <li><button onClick={() => { askAi("Tell me about Three Home Broadband for £18/mo"); setOpenMenu(null); }}>Home Broadband (£18/mo)</button></li>
                  <li><button onClick={() => { askAi("Tell me about Three Mobile Broadband"); setOpenMenu(null); }}>Mobile Broadband</button></li>
                  <li><button onClick={() => { askAi("How do I upgrade my existing Three contract early?"); setOpenMenu(null); }}>Upgrade my device or SIM</button></li>
                  <li><Link href="/admin/plans" onClick={() => setOpenMenu(null)}>Full Tariff Catalogue (52 deals) →</Link></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {openMenu === "why" && (
          <div className="three-meganav">
            <div className="three-container three-meganav__grid">
              <div>
                <h4>Our network</h4>
                <ul>
                  <li><button onClick={() => { askAi("Tell me about the VodafoneThree Nation's Network"); setOpenMenu(null); }}>The Nation&apos;s Network (VodafoneThree)</button></li>
                  <li><button onClick={() => { askAi("Does Three have 5G on the London Underground?"); setOpenMenu(null); }}>London Underground Connectivity</button></li>
                  <li><button onClick={() => { askAi("Is my phone 5G ready?"); setOpenMenu(null); }}>5G ready</button></li>
                </ul>
              </div>
              <div>
                <h4>Life made easy</h4>
                <ul>
                  <li><button onClick={() => { askAi("How does Three Your Way flexible credit work?"); setOpenMenu(null); }}>Three Your Way</button></li>
                  <li><button onClick={() => { askAi("How do I trade in my old device?"); setOpenMenu(null); }}>Trade in your device</button></li>
                  <li><button onClick={() => { askAi("How do I port my number with a PAC code?"); setOpenMenu(null); }}>Keep your number (PAC to 65075)</button></li>
                  <li><button onClick={() => { askAi("When is the cutoff for free next-day DPD delivery?"); setOpenMenu(null); }}>Next day delivery</button></li>
                </ul>
              </div>
              <div>
                <h4>Additional benefits</h4>
                <ul>
                  <li><button onClick={() => { askAi("What rewards do I get with the Three+ app?"); setOpenMenu(null); }}>Three+ rewards (£1 barista coffee)</button></li>
                  <li><button onClick={() => { askAi("Tell me about Truly Unlimited Data on Three"); setOpenMenu(null); }}>Truly Unlimited Data</button></li>
                  <li><button onClick={() => { askAi("Does Three include Paramount+?"); setOpenMenu(null); }}>Paramount+</button></li>
                </ul>
              </div>
              <div>
                <h4>Partnerships</h4>
                <ul>
                  <li><button onClick={() => { askAi("Tell me about Three and Samaritans"); setOpenMenu(null); }}>Samaritans</button></li>
                  <li><button onClick={() => { askAi("Tell me about Three's sponsorship of Gogglebox"); setOpenMenu(null); }}>Gogglebox on Channel 4</button></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {openMenu === "help" && (
          <div className="three-meganav">
            <div className="three-container three-meganav__grid">
              <div>
                <h4>Account &amp; Billing</h4>
                <ul>
                  <li><button onClick={() => { askAi("How does Klarna or PayPal Pay in 3 work for upfront costs?"); setOpenMenu(null); }}>Klarna &amp; PayPal Pay in 3</button></li>
                  <li><button onClick={() => { askAi("How do April CPI price rises work?"); setOpenMenu(null); }}>Bills &amp; April price rises</button></li>
                  <li><button onClick={() => { askAi("How do I upgrade early?"); setOpenMenu(null); }}>Upgrades</button></li>
                </ul>
              </div>
              <div>
                <h4>Switching &amp; SIM Support</h4>
                <ul>
                  <li><button onClick={() => { askAi("How do I switch my number using a PAC code?"); setOpenMenu(null); }}>Switching to Three (PAC)</button></li>
                  <li><button onClick={() => { askAi("Do you support eSIM activation?"); setOpenMenu(null); }}>eSIM support</button></li>
                  <li><button onClick={() => { askAi("What is your 14-day returns policy?"); setOpenMenu(null); }}>14-day cooling-off &amp; returns</button></li>
                </ul>
              </div>
              <div>
                <h4>Get in touch</h4>
                <ul>
                  <li><button onClick={() => { askAi("I'd like to speak to a human agent please"); setOpenMenu(null); }}>Live Chat with a Human Advisor</button></li>
                  <li><Link href="/form" onClick={() => setOpenMenu(null)}>Book a 30-Minute Callback →</Link></li>
                  <li><Link href="/admin" onClick={() => setOpenMenu(null)}>Call Center Staff Dashboard →</Link></li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Basket Drawer Modal */}
      {showBasket && (
        <div className="three-basket-drawer">
          <div className="three-basket-drawer__head">
            <strong>Your Three Basket ({basket.length})</strong>
            <button type="button" onClick={() => setShowBasket(false)}>×</button>
          </div>
          {basket.length === 0 ? (
            <p style={{ fontSize: 13, color: "#555", margin: "12px 0" }}>
              Your basket is empty. Pick any phone, SIM or broadband offer below.
            </p>
          ) : (
            <ul className="three-basket-list">
              {basket.map((item, idx) => (
                <li key={item.id + idx}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: "#555" }}>
                      {item.price} {item.upfront ? `· ${item.upfront}` : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBasket(b => b.filter((_, i) => i !== idx))}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#c00" }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <Link
              href="/checkout"
              className="three-cta-pill three-cta-pill--black"
              style={{ flex: 1, textAlign: "center", justifyContent: "center" }}
            >
              Confirm Order &amp; Delivery ({basket.length}) →
            </Link>
          </div>
        </div>
      )}

      {/* =====================================================================
          3. HERO BANNER + 3 FEATURED PROMO CARDS
      ===================================================================== */}
      <main>
        <section className="three-hero-section">
          <div className="three-container">
            <h1 className="three-visually-sub">Phone, Broadband and SIM Only deals</h1>

            {/* Main iPhone 18 Pro Hero Card */}
            <div className="three-hero-banner">
              <div className="three-hero-banner__copy">
                <span className="three-kicker-pill">NEW ON THE NATION&apos;S NETWORK</span>
                <h2>iPhone 18 Pro</h2>
                <p className="three-hero-lead">
                  Save up to £1035 and go unlimited when you trade in an eligible phone. Pro further.
                </p>
                <div className="three-hero-actions">
                  <button
                    type="button"
                    className="three-cta-pill three-cta-pill--white"
                    onClick={() =>
                      addToBasket({
                        id: "iphone-18-pro",
                        name: "iPhone 18 Pro · Unlimited 5G Plan",
                        price: "£54.00 / mo",
                        upfront: "£45 upfront",
                      })
                    }
                  >
                    Buy iPhone 18 Pro
                  </button>
                  <button
                    type="button"
                    className="three-cta-pill three-cta-pill--outline-light"
                    onClick={() => askAi("Tell me about the iPhone 18 Pro and iPhone 17 Pro deals on Three")}
                  >
                    Ask Three AI
                  </button>
                </div>
                <p className="three-hero-upgrade-note">
                  Already with Three?{" "}
                  <Link href="/form" style={{ color: "#ffaba9", textDecoration: "underline" }}>
                    Log in or book an upgrade callback
                  </Link>{" "}
                  to see our latest upgrade offers.
                </p>
              </div>
              <div className="three-hero-banner__visual">
                <img
                  src="https://www.three.co.uk/content/dam/live-asset/web/Pages/Home/620x620-centre-iphone-17-lavender.png"
                  alt="iPhone Pro Series on Three"
                />
              </div>
            </div>

            {/* 3 Featured Promo Cards (Exact Trio from three.co.uk) */}
            <div className="three-promo-trio">
              <article className="three-promo-card three-promo-card--coral">
                <div className="three-promo-card__body">
                  <h3>Get an Unlimited data SIM for only £23 a month</h3>
                  <p>Plus, use your data in 49 European destinations with 12GB roaming.</p>
                  <p className="three-legal-mini">
                    £23.00 per month, increasing to £25.30 from 1 Apr27, £27.60 from 1 Apr28.{" "}
                    <button type="button" onClick={() => setShowTerms(true)}>[1]</button>
                  </p>
                  <div className="three-card-actions">
                    <button
                      type="button"
                      className="three-cta-pill three-cta-pill--black"
                      onClick={() =>
                        addToBasket({
                          id: "sim-unl-23",
                          name: "Three Unlimited Data SIM (24m)",
                          price: "£23.00 / mo",
                          upfront: "£0 upfront",
                        })
                      }
                    >
                      Find out more
                    </button>
                    <button
                      type="button"
                      className="three-link-btn"
                      onClick={() => askAi("Tell me about the £23 Unlimited data SIM and £10 60GB rolling SIM")}
                    >
                      Ask AI →
                    </button>
                  </div>
                </div>
                <div className="three-promo-card__img">
                  <img
                    src="https://www.three.co.uk/content/dam/live-asset/web/device-images/sim/1100x1100-simo-go-unlimited-23-home-shop.png"
                    alt="Three Unlimited data SIM £23"
                  />
                </div>
              </article>

              <article className="three-promo-card">
                <div className="three-promo-card__body">
                  <h3>Google Pixel 11</h3>
                  <p>Save up to £576 with our Unlimited Lite airtime plan.</p>
                  <p className="three-legal-mini">
                    From £47.00/mo + £15 upfront, or £48.00/mo on Three 100GB 5G.{" "}
                    <button type="button" onClick={() => setShowTerms(true)}>[1]</button>
                  </p>
                  <div className="three-card-actions">
                    <button
                      type="button"
                      className="three-cta-pill three-cta-pill--black"
                      onClick={() => askAi("Quote me the Google Pixel 11 256GB deal")}
                    >
                      Get this offer
                    </button>
                  </div>
                </div>
                <div className="three-promo-card__img">
                  <img
                    src="https://www.three.co.uk/content/dam/live-asset/web/trading/bau-trading/1100x1100-google-pixel-11-frost-576.png"
                    alt="Google Pixel 11"
                  />
                </div>
              </article>

              <article className="three-promo-card">
                <div className="three-promo-card__body">
                  <h3>Samsung Galaxy S26 FE</h3>
                  <p>Save up to £876 when paired with selected airtime plans.</p>
                  <p className="three-legal-mini">
                    Galaxy S25 FE / S26 series from £28.00/mo with £0 upfront &amp; 300GB 5G data.{" "}
                    <button type="button" onClick={() => setShowTerms(true)}>[1]</button>
                  </p>
                  <div className="three-card-actions">
                    <button
                      type="button"
                      className="three-cta-pill three-cta-pill--black"
                      onClick={() => askAi("Quote me the Samsung Galaxy S25 FE and Galaxy S26 deals")}
                    >
                      Buy now
                    </button>
                  </div>
                </div>
                <div className="three-promo-card__img">
                  <img
                    src="https://www.three.co.uk/content/dam/live-asset/web/Pages/Home/1100x1100-samsung-galaxy-26-fe-pistachio.png"
                    alt="Samsung Galaxy S26 FE"
                  />
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* =====================================================================
            4. OUR POPULAR DEALS (4-Card Showcase + Interactive Catalogue Tabs)
        ===================================================================== */}
        <section className="three-section three-section--blush">
          <div className="three-container">
            <div className="three-section-header">
              <h2>Our popular deals</h2>
              <div className="three-pill-tabs">
                <button
                  type="button"
                  className={dealTab === "featured" ? "active" : ""}
                  onClick={() => setDealTab("featured")}
                >
                  Featured (4)
                </button>
                <button
                  type="button"
                  className={dealTab === "phones" ? "active" : ""}
                  onClick={() => setDealTab("phones")}
                >
                  Pay Monthly Phones ({phoneDeals.length})
                </button>
                <button
                  type="button"
                  className={dealTab === "sim" ? "active" : ""}
                  onClick={() => setDealTab("sim")}
                >
                  SIM Only ({simOnlyPlans.length})
                </button>
                <button
                  type="button"
                  className={dealTab === "refurb" ? "active" : ""}
                  onClick={() => setDealTab("refurb")}
                >
                  Refurbished ({refurbPhones.length})
                </button>
              </div>
            </div>

            {dealTab === "featured" && (
              <div className="three-popular-grid">
                {POPULAR_SHOWCASE.map(item => (
                  <div key={item.id} className="three-product-card">
                    <span className="three-product-tag">{item.tag}</span>
                    <div className="three-product-img-wrap">
                      <img src={item.img} alt={item.title} />
                    </div>
                    <h3>{item.title}</h3>
                    <p className="three-product-sub">{item.subtitle}</p>
                    <div className="three-product-price-box">
                      <div>
                        <span className="three-price-big">{item.monthly}</span>
                        <span className="three-price-unit"> a month</span>
                      </div>
                      <div className="three-price-meta">
                        {item.upfront} · {item.data}
                      </div>
                      <div className="three-legal-mini" style={{ marginTop: 4 }}>
                        {item.rise}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                      <button
                        type="button"
                        className="three-cta-pill three-cta-pill--black"
                        style={{ flex: 1, justifyContent: "center" }}
                        onClick={() =>
                          addToBasket({
                            id: item.id,
                            name: item.title,
                            price: `${item.monthly}/mo`,
                            upfront: item.upfront,
                          })
                        }
                      >
                        Choose deal
                      </button>
                      <button
                        type="button"
                        className="three-cta-pill three-cta-pill--outline"
                        onClick={() => askAi(`Tell me about the ${item.title} deal`)}
                      >
                        Ask AI
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {dealTab === "phones" && (
              <div className="three-popular-grid">
                {phoneDeals.slice(0, 12).map(d => (
                  <div key={d.id} className="three-product-card">
                    <span className="three-product-tag">{d.network.toUpperCase()} · 5G</span>
                    <h3>
                      {d.model} · {d.storageGb}GB
                    </h3>
                    <p className="three-product-sub">
                      Colour: {d.colour} · {d.dataGb === "unlimited" ? "Unlimited" : `${d.dataGb}GB`} 5G data · Unlimited mins &amp; texts
                    </p>
                    <div className="three-product-price-box">
                      <div>
                        <span className="three-price-big">
                          £{d.monthly.toFixed(d.monthly % 1 ? 2 : 0)}
                        </span>
                        <span className="three-price-unit"> a month</span>
                      </div>
                      <div className="three-price-meta">
                        £{d.upfront} upfront · {d.contractMonths} months
                      </div>
                      {d.priceRises?.[0] && (
                        <div className="three-legal-mini" style={{ marginTop: 4 }}>
                          Increases to £{d.priceRises[0].monthly.toFixed(2)} Apr 27, £
                          {(d.priceRises[1]?.monthly ?? d.priceRises[0].monthly).toFixed(2)} Apr 28. [1]
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                      <button
                        type="button"
                        className="three-cta-pill three-cta-pill--black"
                        style={{ flex: 1, justifyContent: "center" }}
                        onClick={() =>
                          addToBasket({
                            id: d.id,
                            name: `${d.model} ${d.storageGb}GB (${d.network})`,
                            price: `£${d.monthly}/mo`,
                            upfront: `£${d.upfront} upfront`,
                          })
                        }
                      >
                        Add to basket
                      </button>
                      <button
                        type="button"
                        className="three-cta-pill three-cta-pill--outline"
                        onClick={() => askAi(`Quote me ${d.model} ${d.storageGb}GB on ${d.network}`)}
                      >
                        Ask AI
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {dealTab === "sim" && (
              <div className="three-popular-grid">
                {simOnlyPlans.map(s => (
                  <div key={s.id} className="three-product-card">
                    <span className="three-product-tag">
                      {s.contractMonths === 1 ? "30-DAY ROLLING" : `${s.contractMonths}-MONTH SIM`}
                    </span>
                    <h3>
                      {s.dataGb === "unlimited" ? "Unlimited" : `${s.dataGb}GB`} 5G Data SIM
                    </h3>
                    <p className="three-product-sub">
                      {s.network} Network · Unlimited minutes &amp; texts · Free next-day delivery
                      {s.cashback ? ` · Includes £${s.cashback} cashback` : ""}
                    </p>
                    <div className="three-product-price-box">
                      <div>
                        <span className="three-price-big">
                          £{s.monthly.toFixed(s.monthly % 1 ? 2 : 0)}
                        </span>
                        <span className="three-price-unit"> a month</span>
                      </div>
                      <div className="three-price-meta">£0 upfront · 5G Ready</div>
                    </div>
                    <button
                      type="button"
                      className="three-cta-pill three-cta-pill--black"
                      style={{ marginTop: "auto", justifyContent: "center" }}
                      onClick={() =>
                        addToBasket({
                          id: s.id,
                          name: `Three ${s.dataGb}GB SIM (${s.contractMonths}m)`,
                          price: `£${s.monthly}/mo`,
                          upfront: "£0 upfront",
                        })
                      }
                    >
                      Select SIM
                    </button>
                  </div>
                ))}
              </div>
            )}

            {dealTab === "refurb" && (
              <div className="three-popular-grid">
                {refurbPhones.slice(0, 8).map(r => (
                  <div key={r.id} className="three-product-card">
                    <span className="three-product-tag">GRADE: {r.grade.toUpperCase()}</span>
                    <h3>
                      {r.brand} {r.model} · {r.storageGb}GB
                    </h3>
                    <p className="three-product-sub">
                      Colour: {r.colour} · Unlocked SIM-Free · 12-Month Warranty &amp; 14-day returns
                    </p>
                    <div className="three-product-price-box">
                      <div>
                        <span className="three-price-big">£{r.simFreePrice}</span>
                        <span className="three-price-unit"> outright</span>
                      </div>
                      <div className="three-price-meta">Or split into 3 with Klarna Pay in 3</div>
                    </div>
                    <button
                      type="button"
                      className="three-cta-pill three-cta-pill--black"
                      style={{ marginTop: "auto", justifyContent: "center" }}
                      onClick={() =>
                        addToBasket({
                          id: r.id,
                          name: `Refurbished ${r.brand} ${r.model} ${r.storageGb}GB`,
                          price: `£${r.simFreePrice} SIM-free`,
                        })
                      }
                    >
                      Buy SIM-Free
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* =====================================================================
            5. HOME BROADBAND BANNER (£18/mo + Interactive Postcode Checker)
        ===================================================================== */}
        <section className="three-section">
          <div className="three-container">
            <div className="three-broadband-banner">
              <div className="three-broadband-banner__copy">
                <span className="three-kicker-pill three-kicker-pill--dark">PLUG AND PLAY · NEXT-DAY DELIVERY</span>
                <h2>Get Three’s Home Broadband for only £18 a month</h2>
                <p style={{ fontSize: 17, margin: "8px 0" }}>
                  Plus claim £300 if you switch to our 24-month plan.
                </p>
                <p className="three-legal-mini" style={{ color: "#222" }}>
                  £18.00 a month, increasing to £21.50 from 1 Apr 27, £25.00 from 1 Apr 28.{" "}
                  <button type="button" onClick={() => setShowTerms(true)}>[1]</button>
                </p>

                <div className="three-postcode-box">
                  <input
                    value={postcode}
                    onChange={e => setPostcode(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && checkBroadbandPostcode()}
                    placeholder="Enter postcode (e.g. NW1 8QH)"
                  />
                  <button
                    type="button"
                    className="three-cta-pill three-cta-pill--black"
                    onClick={checkBroadbandPostcode}
                  >
                    Check availability
                  </button>
                </div>
                {postcodeResult && (
                  <div className="three-postcode-result">{postcodeResult}</div>
                )}
              </div>
              <div className="three-broadband-banner__img">
                <img
                  src="https://www.three.co.uk/content/dam/live-asset/web/device-images/broadband/home-broadband/1690x1100-get-threes-home-broadband-with-price-18.png"
                  alt="Three Home Broadband £18 a month"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            6. TAKE A LOOK AROUND (11 Quick Category Icons)
        ===================================================================== */}
        <section className="three-section three-section--compact">
          <div className="three-container">
            <h2 className="three-center-heading">Take a look around</h2>
            <div className="three-quick-icons">
              {QUICK_CATEGORIES.map(c => (
                <button
                  key={c.label}
                  type="button"
                  className="three-quick-icon-item"
                  onClick={() => askAi(c.query)}
                >
                  <span className="three-quick-icon-circle">{c.icon}</span>
                  <span className="three-quick-icon-label">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================================
            7. ANDROID PHONES & RAY-BAN META (2-Column Feature Cards)
        ===================================================================== */}
        <section className="three-section">
          <div className="three-container">
            <div className="three-two-col-grid">
              <article className="three-lifestyle-card">
                <img
                  src="https://www.three.co.uk/content/dam/threedigital/new-dam-structure-temp/device-images/manufacturer-logos/android-1600x1040.jpg"
                  alt="Android phones"
                />
                <div className="three-lifestyle-card__body">
                  <h3>Android phones</h3>
                  <p>
                    Most of the world’s biggest phone brands run on Android, like Samsung, Motorola, and Google Pixel. Learn about Android’s best features and find your perfect smartphone.
                  </p>
                  <button
                    type="button"
                    className="three-cta-pill three-cta-pill--black"
                    onClick={() => {
                      setDealTab("phones");
                      askAi("Show me your best Samsung and Google Pixel Android phone deals");
                    }}
                  >
                    Discover Android phones
                  </button>
                </div>
              </article>

              <article className="three-lifestyle-card">
                <img
                  src="https://www.three.co.uk/content/dam/threedigital/new-dam-structure-temp/device-images/wearables/ray-ban/ray-ban-meta-1600x1040.jpg"
                  alt="Ray-Ban Meta"
                />
                <div className="three-lifestyle-card__body">
                  <h3>Ray-Ban Meta</h3>
                  <p>
                    Capture, share and listen hands-free with iconic Ray-Ban style and Meta AI built right in. Pair with any Three Unlimited plan.
                  </p>
                  <button
                    type="button"
                    className="three-cta-pill three-cta-pill--black"
                    onClick={() => askAi("Do you have wearable accessories and audio bundles in stock?")}
                  >
                    Shop Accessories
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* =====================================================================
            8. GET MORE WITH THREE (Three+ Rewards & Three Your Way)
        ===================================================================== */}
        <section className="three-section three-section--blush">
          <div className="three-container">
            <h2 className="three-center-heading">Get more with Three</h2>
            <div className="three-two-col-grid">
              <article className="three-lifestyle-card">
                <img
                  src="https://www.three.co.uk/content/dam/live-asset/web/brand/threeplus/1500x750-threeplus-page-sept.png"
                  alt="Three+ rewards"
                />
                <div className="three-lifestyle-card__body">
                  <h3>Three+ rewards</h3>
                  <p>
                    Our rewards app brings you treats from the UK&apos;s biggest brands. And you can get a barista-crafted drink for £1 every week at 100s of local cafés too.
                  </p>
                  <button
                    type="button"
                    className="three-cta-pill three-cta-pill--black"
                    onClick={() => askAi("What rewards do I get with Three+ on Pay Monthly and SIM Only?")}
                  >
                    Find out more
                  </button>
                </div>
              </article>

              <article className="three-lifestyle-card">
                <img
                  src="https://www.three.co.uk/content/dam/threedigital/dynamic-media/three-your-way-1500x750-paramount.png"
                  alt="Say hello to mobile done your way"
                />
                <div className="three-lifestyle-card__body">
                  <h3>Say hello to mobile done your way</h3>
                  <p>
                    With our Three Your Way plans, you get ultimate flexibility. Choose your device and how much to pay upfront. Customise the length of your plan to control your spend. Then pick your extras.
                  </p>
                  <button
                    type="button"
                    className="three-cta-pill three-cta-pill--black"
                    onClick={() => askAi("How can I split upfront costs or customise my contract length?")}
                  >
                    Explore Three Your Way
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* =====================================================================
            9. THREE PARTNERS (Samaritans & Gogglebox)
        ===================================================================== */}
        <section className="three-section">
          <div className="three-container">
            <h2 className="three-center-heading">Three partners</h2>
            <div className="three-two-col-grid">
              <article className="three-lifestyle-card">
                <img
                  src="https://www.three.co.uk/content/dam/threedigital/new-dam-structure-temp/campaigns/samaritans/three-samaritans-1500x750.jpg"
                  alt="Three and Samaritans"
                />
                <div className="three-lifestyle-card__body">
                  <h3>Three and Samaritans</h3>
                  <p>
                    We’ve created a powerful alliance that’s focused on making a positive difference to the nation&apos;s wellbeing.
                  </p>
                  <button
                    type="button"
                    className="three-link-btn"
                    onClick={() => askAi("Tell me about Three's partnership with Samaritans")}
                  >
                    Learn about our partnership →
                  </button>
                </div>
              </article>

              <article className="three-lifestyle-card">
                <img
                  src="https://www.three.co.uk/content/dam/threedigital/new-dam-structure-temp/campaigns/gogglebox/ellie-and-izzi-googlebox-2025-800x400-1ab.jpg"
                  alt="Gogglebox"
                />
                <div className="three-lifestyle-card__body">
                  <h3>Gogglebox</h3>
                  <p>
                    Whether you’re watching on the telly, your phone screen, tablet, or laptop – join us on the sofa, every Friday, 9pm, on Channel 4.
                  </p>
                  <button
                    type="button"
                    className="three-link-btn"
                    onClick={() => askAi("Tell me about Three and Gogglebox")}
                  >
                    Meet the Goggleboxers →
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* =====================================================================
            10. HERE TO HELP (Community, Reconnected, VodafoneThree Merger)
        ===================================================================== */}
        <section className="three-section three-section--blush">
          <div className="three-container">
            <h2 className="three-center-heading">Here to help</h2>
            <div className="three-three-col-grid">
              <article className="three-lifestyle-card">
                <img
                  src="https://www.three.co.uk/content/dam/threedigital/new-dam-structure-temp/campaigns/why-choose-three/marketing-images/community-why-choose-three.png"
                  alt="Connect with our community"
                />
                <div className="three-lifestyle-card__body">
                  <h3>Connect with our community</h3>
                  <p>
                    A place to support, learn, and collaborate with each other. Share questions and answers with your community.
                  </p>
                  <button type="button" className="three-link-btn" onClick={() => askAi("How can I get help from an advisor right now?")}>
                    Join the conversation →
                  </button>
                </div>
              </article>

              <article className="three-lifestyle-card">
                <img
                  src="https://www.three.co.uk/content/dam/threedigital/new-dam-structure-temp/brand/lifestyle/reconnected-donate-your-phone-1690x1100.jpg"
                  alt="Reconnected: Donate your old phone"
                />
                <div className="three-lifestyle-card__body">
                  <h3>Reconnected: Donate your old phone</h3>
                  <p>
                    Let go of your old phone. Donate it today to help out someone who’s disadvantaged and who really needs it.
                  </p>
                  <button type="button" className="three-link-btn" onClick={() => askAi("How do I trade in or donate my old phone?")}>
                    How to donate →
                  </button>
                </div>
              </article>

              <article className="three-lifestyle-card">
                <div
                  style={{
                    height: 200,
                    background: "#fff",
                    display: "grid",
                    placeItems: "center",
                    padding: 24,
                    borderBottom: "1px solid #f0e4e2",
                  }}
                >
                  <img
                    src="https://www.three.co.uk/content/dam/threedigital/dynamic-media/vodafonethree-logo.png"
                    alt="VodafoneThree Merger"
                    style={{ maxHeight: 90, width: "auto", objectFit: "contain" }}
                  />
                </div>
                <div className="three-lifestyle-card__body">
                  <h3>Important update: Three UK and Vodafone UK merger completed</h3>
                  <p>
                    We sell tariffs across both Three and Vodafone on the combined Nation&apos;s Network — compare both side-by-side with our AI assistant.
                  </p>
                  <button type="button" className="three-link-btn" onClick={() => askAi("Compare Three vs Vodafone deals for iPhone 17")}>
                    Find out more →
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* =====================================================================
            11. WHY CHOOSE THREE? (Nation's Network, Three+, Switching)
        ===================================================================== */}
        <section className="three-section">
          <div className="three-container">
            <h2 className="three-center-heading">Why choose Three?</h2>
            <div className="three-three-col-grid">
              <article className="three-lifestyle-card">
                <img
                  src="https://www.three.co.uk/content/dam/threedigital/new-dam-structure-temp/campaigns/why-choose-three/reliable-connection-battenberg-1280x834.png"
                  alt="Let fun in with Three"
                />
                <div className="three-lifestyle-card__body">
                  <h3>Let fun in with Three. On the Nation’s Network</h3>
                  <p>
                    The nation’s biggest network keeps getting better. With £11bn investment, it’s even easier to say yes when the moment hits. Three runs on the Nation’s Network – the combined Vodafone and Three network.
                  </p>
                  <button type="button" className="three-link-btn" onClick={() => askAi("Tell me about 5G coverage on Three and Vodafone")}>
                    More about our network →
                  </button>
                </div>
              </article>

              <article className="three-lifestyle-card">
                <img
                  src="https://www.three.co.uk/content/dam/threedigital/new-dam-structure-temp/campaigns/why-choose-three/experience-fragments/three-plus-why-three-1600x1041.jpg"
                  alt="Live life on the plus side"
                />
                <div className="three-lifestyle-card__body">
                  <h3>Live life on the plus side</h3>
                  <p>
                    Unlock presale festival tickets, £1 weekly barista coffee, cinema deals and dining offers with the Three+ rewards app.
                  </p>
                  <button type="button" className="three-link-btn" onClick={() => askAi("Tell me about Three+ rewards")}>
                    Discover Three+ →
                  </button>
                </div>
              </article>

              <article className="three-lifestyle-card">
                <img
                  src="https://www.three.co.uk/content/dam/threedigital/new-dam-structure-temp/campaigns/why-choose-three/experience-fragments/switch-why-three-1600x1041.jpg"
                  alt="Switching to Three"
                />
                <div className="three-lifestyle-card__body">
                  <h3>Switching to Three</h3>
                  <p>
                    It’s super easy to switch your mobile number or Home Broadband to Three. Text PAC to 65075 and we move your number in 1 working day.
                  </p>
                  <button type="button" className="three-link-btn" onClick={() => askAi("How do I switch my number to Three using a PAC code?")}>
                    Switching to Three →
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* =====================================================================
            12. TERMS AND CONDITIONS / PRICE INCREASE ACCORDION
        ===================================================================== */}
        <section className="three-terms-bar">
          <div className="three-container">
            <button
              type="button"
              className="three-terms-toggle"
              onClick={() => setShowTerms(v => !v)}
            >
              <span>Terms and conditions &amp; Annual Price Increase [1]</span>
              <span>{showTerms ? "▴" : "▾"}</span>
            </button>
            {showTerms && (
              <div className="three-terms-content">
                <strong>[1] Annual Price Increase:</strong> Monthly plan prices increase each April by a fixed pounds-and-pence amount disclosed at checkout (typically £1.90–£2.50/month on Pay Monthly phones &amp; SIMs and £3.50/month on Home Broadband) from 1 April 2027 and 1 April 2028. All Three &amp; Fonehouse tariffs quoted by Ali Agent disclose exact April 2027 and April 2028 rates upfront in compliance with Ofcom regulations.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* =====================================================================
          13. EXACT THREE.CO.UK DARK MULTI-COLUMN FOOTER
      ===================================================================== */}
      <footer className="three-footer">
        <div className="three-container">
          <div className="three-footer__grid">
            <div>
              <h4>Explore Three</h4>
              <ul>
                <li><button onClick={() => setDealTab("phones")}>Mobile Phones</button></li>
                <li><button onClick={() => askAi("Tell me about Three Home Broadband")}>Broadband</button></li>
                <li><button onClick={() => askAi("Do you have tablet deals?")}>Tablets</button></li>
                <li><button onClick={() => askAi("How do I top up?")}>Top-up</button></li>
                <li><button onClick={() => setDealTab("sim")}>SIM Only deals</button></li>
                <li><button onClick={() => askAi("Tell me about Pay As You Go")}>Pay As You Go</button></li>
                <li><button onClick={() => askAi("Tell me about Three+")}>Three+</button></li>
                <li><Link href="/form">Book a Callback (/form)</Link></li>
                <li><Link href="/admin">Call Center Admin (/admin)</Link></li>
              </ul>
            </div>

            <div>
              <h4>Popular phones</h4>
              <ul>
                <li><button onClick={() => askAi("Quote me iPhone 18 Pro")}>iPhone 18 Pro</button></li>
                <li><button onClick={() => askAi("Quote me iPhone 17 Pro Max")}>iPhone 17 Pro Max</button></li>
                <li><button onClick={() => askAi("Quote me iPhone 17 256GB")}>iPhone 17</button></li>
                <li><button onClick={() => askAi("Quote me Samsung Galaxy Z Flip8")}>Samsung Galaxy Z Flip8</button></li>
                <li><button onClick={() => askAi("Quote me Samsung Galaxy Z Fold8")}>Samsung Galaxy Z Fold8</button></li>
                <li><button onClick={() => askAi("Quote me Samsung Galaxy S26 Ultra")}>Samsung Galaxy S26 Series</button></li>
                <li><button onClick={() => askAi("Quote me Google Pixel 11 Pro")}>Google Pixel 11 Pro</button></li>
                <li><button onClick={() => askAi("Quote me Google Pixel 10 Pro")}>Google Pixel 10 Pro</button></li>
              </ul>
            </div>

            <div>
              <h4>Popular products</h4>
              <ul>
                <li><button onClick={() => askAi("Show me all Apple iPhone deals")}>iPhone</button></li>
                <li><button onClick={() => askAi("Show me all Samsung Galaxy deals")}>Samsung</button></li>
                <li><button onClick={() => askAi("Show me Honor phone deals")}>HONOR</button></li>
                <li><button onClick={() => askAi("Show me Google Pixel deals")}>Google Pixel</button></li>
                <li><button onClick={() => setDealTab("refurb")}>Refurbished Pixels</button></li>
                <li><Link href="/widget">Embeddable Widget Demo</Link></li>
              </ul>
            </div>

            <div>
              <h4>Our company &amp; networks</h4>
              <ul>
                <li><Link href="/admin">Ali Agent Call Center</Link></li>
                <li><Link href="/admin/leads">Leads CRM</Link></li>
                <li><Link href="/admin/plans">Tariff Catalogue</Link></li>
                <li><Link href="/admin/devices">Device Inventory</Link></li>
                <li><Link href="/admin/bot">Claude AI Prompt Studio</Link></li>
                <li><Link href="/admin/kb">Knowledge Base</Link></li>
                <li><Link href="/admin/broadcasts">WhatsApp Broadcasts</Link></li>
                <li><Link href="/admin/settings">Settings &amp; WA Simulator</Link></li>
              </ul>
            </div>
          </div>

          <div className="three-footer__bottom">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <ThreeLogo size={36} fill="#fff" />
              <span>© Hutchison 3G UK Limited 2002 - Present · Powered by Ali Agent AI Call Center</span>
            </div>
            <div className="three-footer__sister-brands">
              <span>SMARTY</span>
              <span>VodafoneThree</span>
              <span>Vodafone</span>
              <span>VOXI</span>
              <span>Talkmobile</span>
            </div>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          14. FLOATING ALI AGENT CHAT WIDGET
      ===================================================================== */}
      <ChatWidget />
    </div>
  );
}
