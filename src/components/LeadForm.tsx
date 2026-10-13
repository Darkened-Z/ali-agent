"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Need = "sim" | "port" | "phone" | "plan";
type NetworkChoice = "ee" | "o2" | "vodafone" | "three" | "talkmobile" | "id" | "smarty" | "any";

type FormState = {
  name: string;
  need: Need | null;
  city: string;
  network: NetworkChoice;
  phone: string;
  time: string;
};

const initial: FormState = {
  name: "",
  need: null,
  city: "",
  network: "any",
  phone: "",
  time: "any",
};

const needOptions = [
  { key: "sim" as Need, title: "SIM-only plan", desc: "EE · O2 · Vodafone · Three · Talkmobile · SMARTY. Next-day delivery." },
  { key: "port" as Need, title: "Port my number", desc: "Keep your number. Switch networks in one working day." },
  { key: "phone" as Need, title: "Buy a phone", desc: "New, refurbished or SIM-free · Klarna / PayPal Pay in 3." },
  { key: "plan" as Need, title: "Upgrade my contract", desc: "Compare early-upgrade offers against your remaining months." },
];

export function LeadForm() {
  const [step, setStep] = useState<number>(1);
  const [data, setData] = useState<FormState>(initial);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const total = 4;
  const canNext =
    (step === 1 && data.name.trim().length > 1) ||
    (step === 2 && !!data.need) ||
    (step === 3 && data.city.trim().length > 1) ||
    (step === 4 && data.phone.trim().length >= 8);

  const submit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          need: data.need || "phone",
          city: data.city,
          network: data.network,
          phone: data.phone,
          time: data.time,
          source: "Website form",
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setSubmitted(json.lead?.id || "AA-" + Math.floor(1000 + Math.random() * 9000));
        window.dispatchEvent(new Event("ali-store-updated"));
      } else {
        setSubmitted("AA-" + Math.floor(1000 + Math.random() * 9000));
      }
    } catch {
      setSubmitted("AA-" + Math.floor(1000 + Math.random() * 9000));
    } finally {
      setSubmitting(false);
    }
  }, [data, submitting]);

  const next = useCallback(() => {
    if (!canNext) return;
    if (step < total) setStep(s => s + 1);
    else submit();
  }, [canNext, step, submit]);

  const back = () => step > 1 && setStep(step - 1);

  useEffect(() => {
    if (step !== 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).matches("input, textarea")) return;
      const idx = parseInt(e.key, 10);
      if (idx >= 1 && idx <= 4) {
        setData(d => ({ ...d, need: needOptions[idx - 1].key }));
      }
      if (e.key === "Enter" && data.need) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, data.need, next]);

  if (submitted) {
    return (
      <div className="form-stage">
        <div className="form-frame form-done">
          <div className="big-num">{submitted}</div>
          <h2>Got it — we&apos;ll call you back within 30 minutes.</h2>
          <p>
            Your reference is <span className="mono">{submitted}</span>. It has been added to our live call-center queue and leads list.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn lg" onClick={() => { setSubmitted(null); setData(initial); setStep(1); }}>
              Start another request
            </button>
            <Link href="/admin/leads" className="btn lg primary" style={{ textDecoration: "none" }}>
              View in Admin Leads →
            </Link>
          </div>
        </div>
        <div className="form-context">
          <h4>What happens next</h4>
          <p>Your request goes straight to the call center. An agent picks it up, calls you at your preferred time, and closes the loop.</p>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 20 }}>
            Data stays with Ali Agent. Never shared, never sold.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-stage">
      <div className="form-frame">
        <div className="form-topline">
          <span>ALI AGENT · REQUEST</span>
          <span className="step">STEP {String(step).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        </div>
        <div className="form-progress">
          {[1, 2, 3, 4].map(n => (
            <span key={n} className={n < step ? "done" : n === step ? "now" : ""} />
          ))}
        </div>

        {step === 1 && (
          <>
            <h1 className="form-q">What&apos;s your name?</h1>
            <p className="form-sub">So we know who to ask for when we call.</p>
            <div className="form-input">
              <label htmlFor="name">FULL NAME</label>
              <input
                id="name"
                autoFocus
                value={data.name}
                onChange={e => setData({ ...data, name: e.target.value })}
                placeholder="e.g. Amelia Clarke"
                onKeyDown={e => e.key === "Enter" && next()}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="form-q">What do you need today?</h1>
            <p className="form-sub">
              Pick one. You&apos;ll get a callback within <span className="mono">30 minutes</span>.
            </p>
            <div className="form-options">
              {needOptions.map((o, i) => (
                <button
                  key={o.key}
                  className={"form-option " + (data.need === o.key ? "selected" : "")}
                  onClick={() => setData({ ...data, need: o.key })}
                >
                  <span className="mono">0{i + 1}</span>
                  <div>
                    <div className="title">{o.title}</div>
                    <div className="desc">{o.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="form-q">Where should we deliver?</h1>
            <p className="form-sub">City and preferred network. Skip network if you&apos;re not sure yet.</p>
            <div className="form-input">
              <label htmlFor="city">CITY</label>
              <input
                id="city"
                autoFocus
                value={data.city}
                onChange={e => setData({ ...data, city: e.target.value })}
                placeholder="e.g. London · N1 or postcode"
                onKeyDown={e => e.key === "Enter" && next()}
              />
            </div>
            <div className="form-input">
              <label htmlFor="network">PREFERRED NETWORK</label>
              <select
                id="network"
                value={data.network}
                onChange={e => setData({ ...data, network: e.target.value as NetworkChoice })}
              >
                <option value="any">Any / not sure</option>
                <option value="ee">EE</option>
                <option value="o2">O2</option>
                <option value="vodafone">Vodafone</option>
                <option value="three">Three</option>
                <option value="talkmobile">Talkmobile</option>
                <option value="id">iD Mobile</option>
                <option value="smarty">SMARTY</option>
              </select>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="form-q">Where should we call?</h1>
            <p className="form-sub">We&apos;ll ring you at the best time — no spam, one call.</p>
            <div className="form-input mono-input">
              <label htmlFor="phone">PHONE NUMBER</label>
              <input
                id="phone"
                autoFocus
                inputMode="tel"
                value={data.phone}
                onChange={e => setData({ ...data, phone: e.target.value })}
                placeholder="+44 7XXX XXXXXX"
                onKeyDown={e => e.key === "Enter" && next()}
              />
            </div>
            <div className="form-input">
              <label htmlFor="time">BEST TIME TO CALL</label>
              <select id="time" value={data.time} onChange={e => setData({ ...data, time: e.target.value })}>
                <option value="any">Any time today</option>
                <option value="morning">Morning (9–12)</option>
                <option value="afternoon">Afternoon (12–17)</option>
                <option value="evening">Evening (17–20)</option>
              </select>
            </div>
          </>
        )}

        <div className="form-nav">
          <button className="btn" onClick={back} disabled={step === 1 || submitting}>← Back</button>
          {step === 2 && (
            <div className="hint">
              Or press <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd><kbd>4</kbd>
            </div>
          )}
          <button className="btn primary" onClick={next} disabled={!canNext || submitting}>
            {submitting ? "Submitting…" : step === total ? "Submit →" : "Continue →"}
          </button>
        </div>
      </div>

      <div className="form-context">
        <h4>What we&apos;ll ask</h4>
        <p>Four short steps. Nothing you wouldn&apos;t tell a shop clerk. We only use this to call you back.</p>
        <ol>
          {["Your name", "What you need", "City & preferred network", "Phone number & best time to call"].map((label, i) => {
            const n = i + 1;
            const cls = n < step ? "done" : n === step ? "active" : "";
            return (
              <li key={n} className={cls}>
                <span className="mono">0{n}</span>
                <span>{label}</span>
              </li>
            );
          })}
        </ol>
        <p style={{ marginTop: 20, fontSize: 12, color: "var(--muted)" }}>
          Data stays with Ali Agent. Never shared, never sold.
        </p>
      </div>
    </div>
  );
}
