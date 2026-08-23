import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { stats } from "@/lib/mockData";

export default function Home() {
  return (
    <>
      <TopBar />
      <main className="hub">
        <div className="hub-head">
          <div className="kicker">CLIENT DEMO · V0.1</div>
          <h1>Auto-reply chats. Capture leads. Never miss a customer.</h1>
          <p>
            Ali Agent handles WhatsApp and website chats with Claude, feeds every lead into one dashboard, and hands off to your team when it matters. Below — a live walk-through of what your call center gets on day one.
          </p>
        </div>

        <div className="hub-stats">
          <div className="hub-stat"><div className="num">{stats.handledToday}</div><div className="label">HANDLED · TODAY</div></div>
          <div className="hub-stat"><div className="num">{stats.wonToday}</div><div className="label">WON · TODAY</div></div>
          <div className="hub-stat"><div className="num">{stats.escalatedToday}</div><div className="label">ESCALATED</div></div>
          <div className="hub-stat"><div className="num">{stats.revenueToday}</div><div className="label">REVENUE · TODAY</div></div>
        </div>

        <div className="hub-grid">
          <Link href="/admin" className="hub-card">
            <div className="idx">01 / 03</div>
            <h3>Admin dashboard</h3>
            <p>Where you and the call center staff live. See every live conversation, take over from the bot, review lead scoring, and browse the day.</p>
            <div className="cta"><span>OPEN DASHBOARD</span><span>→</span></div>
          </Link>

          <Link href="/form" className="hub-card">
            <div className="idx">02 / 03</div>
            <h3>Public lead form</h3>
            <p>Multi-step form for ads and landing pages. Keyboard-first, mobile-first. Every submission lands in the dashboard within seconds.</p>
            <div className="cta"><span>TRY THE FORM</span><span>→</span></div>
          </Link>

          <Link href="/widget" className="hub-card">
            <div className="idx">03 / 03</div>
            <h3>Chat widget</h3>
            <p>One script tag drops it into any Ali site. Streams answers from Claude, hands off to human on demand, remembers every conversation.</p>
            <div className="cta"><span>SEE IT IN CONTEXT</span><span>→</span></div>
          </Link>
        </div>
      </main>
    </>
  );
}
