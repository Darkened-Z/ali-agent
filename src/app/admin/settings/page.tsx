"use client";

import { useState } from "react";

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

export default function SettingsPage() {
  const [tab, setTab] = useState("general");

  return (
    <>
      <div className="page-head">
        <h1>Settings</h1>
        <div className="actions">
          <button className="btn primary" disabled>Save changes</button>
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
                <input defaultValue="Ali Mobile UK" />
              </div>
              <div className="form-row">
                <div className="label-block"><h4>Contact email</h4><p>Where lead notifications go.</p></div>
                <input defaultValue="ali@aliagent.co.uk" type="email" />
              </div>
              <div className="form-row">
                <div className="label-block"><h4>Time zone</h4></div>
                <select defaultValue="gb">
                  <option value="gb">Europe/London · BST · UTC+1 (winter: GMT)</option>
                </select>
              </div>
              <div className="form-row">
                <div className="label-block"><h4>Website domain</h4><p>Widget embed only loads on this domain.</p></div>
                <input defaultValue="aliagent.co.uk" className="mono" />
              </div>
            </>
          )}

          {tab === "hours" && (
            <>
              <h2>Business hours</h2>
              <p className="desc">Outside these hours, the bot handles everything solo. During hours, humans get pinged for escalations.</p>
              {days.map(d => (
                <div key={d} className="form-row">
                  <div className="label-block"><h4>{d}</h4></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto", gap: 10, alignItems: "center" }}>
                    <input type="time" defaultValue={d === "Sunday" ? "" : "10:00"} />
                    <span style={{ color: "var(--muted)", fontSize: 12 }}>to</span>
                    <input type="time" defaultValue={d === "Sunday" ? "" : "22:00"} />
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
                      <input type="checkbox" defaultChecked={d !== "Sunday"} /> Open
                    </label>
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === "whatsapp" && (
            <>
              <h2>WhatsApp</h2>
              <p className="desc">Configure your Meta Cloud API or Twilio credentials.</p>
              <div className="form-row">
                <div className="label-block"><h4>Provider</h4></div>
                <select defaultValue="meta">
                  <option value="meta">Meta Cloud API (recommended)</option>
                  <option value="twilio">Twilio</option>
                </select>
              </div>
              <div className="form-row">
                <div className="label-block"><h4>Phone number ID</h4><p>Get this from Meta Business.</p></div>
                <input defaultValue="1058827740928374" className="mono" />
              </div>
              <div className="form-row">
                <div className="label-block"><h4>Access token</h4><p>Stored encrypted. Rotate every 60 days.</p></div>
                <input defaultValue="EAAY••••••••••••••••••••••••••••" type="password" className="mono" />
              </div>
              <div className="form-row">
                <div className="label-block"><h4>Webhook verify token</h4></div>
                <input defaultValue="ali_agent_verify_a3f9b2" className="mono" />
              </div>
              <div className="form-row">
                <div className="label-block"><h4>Webhook URL</h4><p>Paste this into Meta Business webhook config.</p></div>
                <input readOnly value="https://ali-agent.vercel.app/api/whatsapp/webhook" className="mono" />
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
                    <input type="checkbox" defaultChecked />
                    Enabled
                  </label>
                </div>
              ))}
            </>
          )}

          {tab === "billing" && (
            <>
              <h2>Billing</h2>
              <p className="desc">Ali Agent · Pro plan.</p>
              <div style={{ padding: 20, border: "1px solid var(--line)", background: "var(--paper-2)" }}>
                <div style={{
                  fontFamily: "var(--font-jbmono)", fontSize: 10,
                  textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)",
                }}>
                  THIS MONTH
                </div>
                <div style={{ fontFamily: "var(--font-jbmono)", fontSize: 32, fontWeight: 700, marginTop: 6, letterSpacing: "-0.02em" }}>
                  £124.80
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                  1,247 messages · 48 leads · Renews Sep 01
                </div>
              </div>
              <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
                <button className="btn">Download invoice</button>
                <button className="btn">Change plan</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
