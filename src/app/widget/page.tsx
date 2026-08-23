import { TopBar } from "@/components/TopBar";
import { ChatWidget } from "@/components/ChatWidget";
import { phoneDeals, simOnlyPlans, refurbPhones } from "@/lib/plans";

// Build the fake storefront directly off the Fonehouse catalogue so the grid
// stays in sync with plans.ts. Picks a spread across brand / network / price
// tier instead of showing 12 near-identical iPhone tariffs.
type Card = { id: string; label: string; price: string; desc: string; badge?: string };

const featuredIds = [
  "iphone-17-256-black-voda-btos",       // £42 iPhone 17 Voda
  "iphone-17pro-256-silver-three-100gb", // £54 iPhone 17 Pro Three
  "iphone-15-128-blue-voda-btos",        // £30 iPhone 15 Voda
  "iphone-13-5g-128-star-three-300",     // £27 iPhone 13 5G Three
  "s26-256-black-voda-btos",             // £36 Galaxy S26 Voda
  "s25fe-128-jet-three-300",             // £28 Galaxy S25 FE Three
  "a17-5g-128-black-three",              // £12 Galaxy A17 5G Three
  "pixel-10-128-obs-voda",               // £25 Pixel 10 Voda
  "pixel-10-pro-128-obs-voda-30",        // £30 Pixel 10 Pro Voda
  "pixel-9a-128-obs-three-100",          // £19 Pixel 9a Three
];

const dealCards: Card[] = featuredIds
  .map(id => phoneDeals.find(d => d.id === id))
  .filter((d): d is NonNullable<typeof d> => Boolean(d))
  .map(d => ({
    id: d.id.toUpperCase(),
    label: `${d.model} · ${d.storageGb} GB`,
    price: `£${d.monthly.toFixed(0)} / mo`,
    desc: `${d.network} · ${d.dataGb === "unlimited" ? "Unlimited" : d.dataGb + "GB"} 5G · £${d.upfront} upfront`,
    badge: d.tags?.includes("back-to-school") ? "BACK-TO-SCHOOL" : d.tags?.includes("free-gift") ? "FREE GIFT" : undefined,
  }));

const simCards: Card[] = simOnlyPlans.map(p => ({
  id: p.id.toUpperCase(),
  label: `${p.network} · ${p.contractMonths === 1 ? "Rolling" : `${p.contractMonths}m`} SIM`,
  price: `£${p.monthly.toFixed(p.monthly % 1 ? 2 : 0)} / mo`,
  desc: `${p.dataGb === "unlimited" ? "Unlimited" : p.dataGb + "GB"}${p.fiveG ? " 5G" : ""} · Unlimited mins & texts${p.cashback ? ` · £${p.cashback} cashback` : ""}`,
  badge: "SIM ONLY",
}));

const refurbCards: Card[] = refurbPhones.slice(0, 4).map(p => ({
  id: p.id.toUpperCase(),
  label: `${p.brand} ${p.model} · ${p.storageGb} GB`,
  price: `£${p.simFreePrice}`,
  desc: `${p.colour} · ${p.grade} · SIM-free`,
  badge: "REFURBISHED",
}));

const shopProducts: Card[] = [...dealCards, ...simCards, ...refurbCards];

export default function WidgetPage() {
  return (
    <>
      <TopBar />
      <section className="surface">
        <div className="section-head">
          <div className="section-idx">03 / 03</div>
          <h2 className="section-title">Embeddable chat widget — one script tag, drops into any Ali site.</h2>
          <p className="section-sub">Shown here on a mock shop page for context. Try it — the widget is live in the bottom-right and answers with the real widget code (canned responses in this demo, will call Claude in production).</p>
        </div>
        <div className="section-body">
          <div className="widget-scene">
            {/* Fake host site for context */}
            <div className="fake-site" aria-hidden="true">
              <header>
                <div className="fake-brand">Ali<span>.</span>Mobile</div>
                <nav className="fake-nav">
                  <span>Phones</span><span>SIMs</span><span>Plans</span><span>Support</span>
                </nav>
              </header>
              <div className="fake-hero">
                <div>
                  <div className="kicker">NEW · IN STOCK UK-WIDE</div>
                  <h1>iPhone 17 &amp; Galaxy S26 — free next-day delivery, Klarna Pay in 3.</h1>
                </div>
                <div className="rhs">
                  Order before <span className="mono">17:00</span> for next-day dispatch via DPD / Royal Mail Tracked 24.
                </div>
              </div>
              <div className="fake-grid-meta">
                <span>{shopProducts.length} live deals · pulled from plans.ts</span>
                <span className="mono">£{Math.min(...dealCards.map(c => parseInt(c.price.replace(/[^0-9]/g, ""), 10))).toString()} / mo entry-level</span>
              </div>
              <div className="fake-grid">
                {shopProducts.map(p => (
                  <div key={p.id} className="fake-card">
                    {p.badge && <div className="badge-tag mono">{p.badge}</div>}
                    <div className="label">{p.label}</div>
                    <div className="price">{p.price}</div>
                    <div className="desc">{p.desc}</div>
                    <div className="foot"><span className="mono">{p.id.slice(0, 22)}</span><span>·</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real widget floats over the whole page */}
      <ChatWidget />
    </>
  );
}
