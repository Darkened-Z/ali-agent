"use client";

import { useCallback, useEffect, useState } from "react";
import type { AppSettings } from "@/lib/store";

const tabs = [
  { key: "general", label: "General" },
  { key: "hours", label: "Business hours" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "escalation", label: "Escalation rules" },
  { key: "billing", label: "Billing" },
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const escalationRules = [
  { name: "Discount requested", desc: "'discount', 'price match', 'special price', 'best price', 'cheaper'" },
  { name: "Complaint keywords", desc: "'complaint', 'refund', 'return', 'faulty', 'broken'" },
  { name: "Explicit human request", desc: "'human', 'agent', 'person', 'someone', 'advisor'" },
  { name: "Conversation too long", desc: "After 10 back-and-forth messages" },
  { name: "Payment / bank details", desc: "Any request touching card, account or payment info" },
];

const defaultSettings: AppSettings = {
  general: {
    businessName: "Ali Mobile UK",
    contactEmail: "ali@aliagent.co.uk",
    timezone: "gb",
    websiteDomain: "aliagent.co.uk",
  },
  hours: Object.fromEntries(
    days.map(d => [
      d,
      {
        open: d === "Sunday" ? "" : "10:00",
        close: d === "Sunday" ? "" : "22:00",
        enabled: d !== "Sunday",
      },
    ])
  ),
  whatsapp: {
    provider: "meta",
    phoneNumberId: "1058827740928374",
    accessToken: "EAAY_demo_token_ali_agent_uk",
    verifyToken: "ali_agent_verify_a3f9b2",
    webhookUrl: "https://ali-agent.vercel.app/api/whatsapp/webhook",
  },
  escalation: {
    "Discount requested": true,
    "Complaint keywords": true,
    "Explicit human request": true,
    "Conversation too long": true,
    "Payment / bank details": true,
  },
  billing: {
    plan: "Ali Agent · Pro plan",
    monthSpend: "£124.80",
    messagesCount: 1247,
    leadsCount: 48,
    renewsOn: "Nov 01",
  },
};

export default function SettingsPage() {
  const [tab, setTab] = useState("general");
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  // WhatsApp Webhook Simulator state
  const [simName, setSimName] = useState("Tariq Mahmood");
  const [simPhone, setSimPhone] = useState("+44 7700 900511");
  const [simText, setSimText] = useState("Hi, what's your cheapest iPhone 17 deal on Vodafone?");
  const [simResult, setSimResult] = useState<string | null>(null);
  const [simRunning, setSimRunning] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        setDirty(false);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
        setDirty(false);
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  const simulateWhatsAppWebhook = async () => {
    if (!simText.trim() || simRunning) return;
    setSimRunning(true);
    setSimResult(null);
    try {
      const res = await fetch("/api/whatsapp/webhook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: simName,
          phone: simPhone,
          city: "London · WhatsApp",
          text: simText,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSimResult(
          `Bot replied (${data.conversationId}): "${data.reply}" — thread added to Admin Conversations!`
        );
        window.dispatchEvent(new Event("ali-store-updated"));
      } else {
        setSimResult(`Error: ${data.error || "Webhook failed"}`);
      }
    } finally {
      setSimRunning(false);
    }
  };

  const downloadInvoice = () => {
    const content = [
      "ALI AGENT UK — MONTHLY INVOICE",
      "==============================",
      `Business: ${settings.general.businessName}`,
      `Contact:  ${settings.general.contactEmail}`,
      `Plan:     ${settings.billing.plan}`,
      `Amount:   ${settings.billing.monthSpend} (incl. VAT)`,
      `Usage:    ${settings.billing.messagesCount} messages · ${settings.billing.leadsCount} leads`,
      `Status:   PAID`,
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ali-agent-invoice.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const togglePlan = () => {
    const isPro = settings.billing.plan.includes("Pro");
    setSettings(s => ({
      ...s,
      billing: {
        ...s.billing,
        plan: isPro ? "Ali Agent · Enterprise Unlimited" : "Ali Agent · Pro plan",
        monthSpend: isPro ? "£299.00" : "£124.80",
      },
    }));
    setDirty(true);
  };

  return (
    <>
      <div className="page-head">
        <h1>
          Settings
          {savedToast && (
            <span className="mono" style={{ color: "var(--ok)", fontSize: 12, marginLeft: 12 }}>
              ✓ SAVED
            </span>
          )}
        </h1>
        <div className="actions">
          <button
            className="btn primary"
            disabled={!dirty || saving}
            onClick={handleSave}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
      <div className="settings-layout">
        <div className="settings-tabs">
          {tabs.map(t => (
            <button
              key={t.key}
              className={"settings-tab " + (tab === t.key ? "active" : "")}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="settings-panel">
          {tab === "general" && (
            <>
              <h2>General</h2>
              <p className="desc">Basic info about your business. Used across dashboard, form and widget.</p>
              <div className="form-row">
                <div className="label-block"><h4>Business name</h4><p>Shown on the widget and lead form.</p></div>
                <input
                  value={settings.general.businessName}
                  onChange={e => {
                    setSettings(s => ({ ...s, general: { ...s.general, businessName: e.target.value } }));
                    setDirty(true);
                  }}
                />
              </div>
              <div className="form-row">
                <div className="label-block"><h4>Contact email</h4><p>Where lead notifications go.</p></div>
                <input
                  type="email"
                  value={settings.general.contactEmail}
                  onChange={e => {
                    setSettings(s => ({ ...s, general: { ...s.general, contactEmail: e.target.value } }));
                    setDirty(true);
                  }}
                />
              </div>
              <div className="form-row">
                <div className="label-block"><h4>Time zone</h4></div>
                <select
                  value={settings.general.timezone}
                  onChange={e => {
                    setSettings(s => ({ ...s, general: { ...s.general, timezone: e.target.value } }));
                    setDirty(true);
                  }}
                >
                  <option value="gb">Europe/London · BST · UTC+1 (winter: GMT)</option>
                  <option value="utc">UTC · Coordinated Universal Time</option>
                </select>
              </div>
              <div className="form-row">
                <div className="label-block"><h4>Website domain</h4><p>Widget embed only loads on this domain.</p></div>
                <input
                  value={settings.general.websiteDomain}
                  onChange={e => {
                    setSettings(s => ({ ...s, general: { ...s.general, websiteDomain: e.target.value } }));
                    setDirty(true);
                  }}
                  className="mono"
                />
              </div>
            </>
          )}

          {tab === "hours" && (
            <>
              <h2>Business hours</h2>
              <p className="desc">Outside these hours, the bot handles everything solo. During hours, humans get pinged for escalations.</p>
              {days.map(d => {
                const row = settings.hours[d] || { open: "10:00", close: "22:00", enabled: true };
                return (
                  <div key={d} className="form-row">
                    <div className="label-block"><h4>{d}</h4></div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto", gap: 10, alignItems: "center" }}>
                      <input
                        type="time"
                        value={row.open}
                        onChange={e => {
                          setSettings(s => ({
                            ...s,
                            hours: { ...s.hours, [d]: { ...row, open: e.target.value } },
                          }));
                          setDirty(true);
                        }}
                      />
                      <span style={{ color: "var(--muted)", fontSize: 12 }}>to</span>
                      <input
                        type="time"
                        value={row.close}
                        onChange={e => {
                          setSettings(s => ({
                            ...s,
                            hours: { ...s.hours, [d]: { ...row, close: e.target.value } },
                          }));
                          setDirty(true);
                        }}
                      />
                      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
                        <input
                          type="checkbox"
                          checked={row.enabled}
                          onChange={e => {
                            setSettings(s => ({
                              ...s,
                              hours: { ...s.hours, [d]: { ...row, enabled: e.target.checked } },
                            }));
                            setDirty(true);
                          }}
                        />{" "}
                        Open
                      </label>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {tab === "whatsapp" && (
            <>
              <h2>WhatsApp</h2>
              <p className="desc">Configure your Meta Cloud API or Twilio credentials and test the live webhook.</p>
              <div className="form-row">
                <div className="label-block"><h4>Provider</h4></div>
                <select
                  value={settings.whatsapp.provider}
                  onChange={e => {
                    setSettings(s => ({
                      ...s,
                      whatsapp: { ...s.whatsapp, provider: e.target.value as "meta" | "twilio" },
                    }));
                    setDirty(true);
                  }}
                >
                  <option value="meta">Meta Cloud API (recommended)</option>
                  <option value="twilio">Twilio</option>
                </select>
              </div>
              <div className="form-row">
                <div className="label-block"><h4>Phone number ID</h4><p>Get this from Meta Business.</p></div>
                <input
                  value={settings.whatsapp.phoneNumberId}
                  onChange={e => {
                    setSettings(s => ({
                      ...s,
                      whatsapp: { ...s.whatsapp, phoneNumberId: e.target.value },
                    }));
                    setDirty(true);
                  }}
                  className="mono"
                />
              </div>
              <div className="form-row">
                <div className="label-block"><h4>Access token</h4><p>Stored encrypted. Rotate every 60 days.</p></div>
                <input
                  value={settings.whatsapp.accessToken}
                  onChange={e => {
                    setSettings(s => ({
                      ...s,
                      whatsapp: { ...s.whatsapp, accessToken: e.target.value },
                    }));
                    setDirty(true);
                  }}
                  type="password"
                  className="mono"
                />
              </div>
              <div className="form-row">
                <div className="label-block"><h4>Webhook verify token</h4></div>
                <input
                  value={settings.whatsapp.verifyToken}
                  onChange={e => {
                    setSettings(s => ({
                      ...s,
                      whatsapp: { ...s.whatsapp, verifyToken: e.target.value },
                    }));
                    setDirty(true);
                  }}
                  className="mono"
                />
              </div>
              <div className="form-row">
                <div className="label-block"><h4>Webhook URL</h4><p>Paste this into Meta Business webhook config.</p></div>
                <input readOnly value="/api/whatsapp/webhook" className="mono" />
              </div>

              <div
                style={{
                  marginTop: 24,
                  padding: 16,
                  border: "1px solid var(--line-strong)",
                  background: "var(--paper-2)",
                  display: "grid",
                  gap: 10,
                }}
              >
                <div className="mono" style={{ fontSize: 11, color: "var(--signal)" }}>
                  TEST WHATSAPP WEBHOOK SIMULATOR
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <input
                    value={simName}
                    onChange={e => setSimName(e.target.value)}
                    placeholder="Sender name"
                    style={{ padding: "8px 10px", border: "1px solid var(--line-strong)", background: "var(--paper)" }}
                  />
                  <input
                    value={simPhone}
                    onChange={e => setSimPhone(e.target.value)}
                    placeholder="+44 7700 900511"
                    className="mono"
                    style={{ padding: "8px 10px", border: "1px solid var(--line-strong)", background: "var(--paper)" }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
                  <input
                    value={simText}
                    onChange={e => setSimText(e.target.value)}
                    placeholder="Incoming WhatsApp message…"
                    style={{ padding: "8px 10px", border: "1px solid var(--line-strong)", background: "var(--paper)" }}
                  />
                  <button className="btn primary" onClick={simulateWhatsAppWebhook} disabled={simRunning}>
                    {simRunning ? "Sending…" : "Simulate inbound WA →"}
                  </button>
                </div>
                {simResult && (
                  <div style={{ fontSize: 12, color: "var(--ok)", paddingTop: 4 }}>
                    {simResult}
                  </div>
                )}
              </div>
            </>
          )}

          {tab === "escalation" && (
            <>
              <h2>Escalation rules</h2>
              <p className="desc">When the bot should stop and hand off to a human agent.</p>
              {escalationRules.map(r => (
                <div key={r.name} className="form-row">
                  <div className="label-block"><h4>{r.name}</h4><p>{r.desc}</p></div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={settings.escalation[r.name] ?? true}
                      onChange={e => {
                        setSettings(s => ({
                          ...s,
                          escalation: { ...s.escalation, [r.name]: e.target.checked },
                        }));
                        setDirty(true);
                      }}
                    />
                    Enabled
                  </label>
                </div>
              ))}
            </>
          )}

          {tab === "billing" && (
            <>
              <h2>Billing</h2>
              <p className="desc">{settings.billing.plan}.</p>
              <div style={{ padding: 20, border: "1px solid var(--line)", background: "var(--paper-2)" }}>
                <div style={{
                  fontFamily: "var(--font-jbmono)", fontSize: 10,
                  textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)",
                }}>
                  THIS MONTH
                </div>
                <div style={{ fontFamily: "var(--font-jbmono)", fontSize: 32, fontWeight: 700, marginTop: 6, letterSpacing: "-0.02em" }}>
                  {settings.billing.monthSpend}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                  {settings.billing.messagesCount.toLocaleString()} messages · {settings.billing.leadsCount} leads · Renews {settings.billing.renewsOn}
                </div>
              </div>
              <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
                <button className="btn" onClick={downloadInvoice}>Download invoice</button>
                <button className="btn" onClick={togglePlan}>Change plan</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
