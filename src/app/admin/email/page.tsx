"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CampaignRecord } from "@/lib/store";
import { renderEmail } from "@/lib/emailTemplate";

const ALL = "__all";
const ENGAGED = "__engaged";

type ListSummary = { name: string; total: number; subscribed: number };
type Summary = {
  total: number;
  engaged: number;
  byStatus: Record<"subscribed" | "unsubscribed" | "bounced" | "complained", number>;
  lists: ListSummary[];
  emailConfigured: boolean;
};

type Sheet = { fileName: string; header: string[]; rows: string[][] };
type ImportResult = { added: number; updated: number; suppressed: number; invalid: number; duplicates: number };

const EMAIL_RE = /^[^\s@<>()",;]+@[^\s@<>()",;]+\.[a-z]{2,}$/i;

function guessColumn(header: string[], rows: string[][], patterns: RegExp[]): number {
  for (const p of patterns) {
    const i = header.findIndex(h => p.test(h.trim()));
    if (i !== -1) return i;
  }
  return -1;
}

function guessEmailColumn(header: string[], rows: string[][]): number {
  const byHeader = guessColumn(header, rows, [/^e-?mail/i, /mail/i]);
  if (byHeader !== -1) return byHeader;
  const sample = rows.slice(0, 50);
  let best = -1;
  let bestHits = 0;
  header.forEach((_, i) => {
    const hits = sample.filter(r => EMAIL_RE.test((r[i] ?? "").trim())).length;
    if (hits > bestHits) {
      best = i;
      bestHits = hits;
    }
  });
  return best;
}

async function parseSpreadsheet(file: File): Promise<Sheet> {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const grid = XLSX.utils
    .sheet_to_json<unknown[]>(sheet, { header: 1, raw: false, defval: "" })
    .map(r => r.map(v => String(v ?? "")))
    .filter(r => r.some(v => v.trim()));
  const [header = [], ...rows] = grid;
  return { fileName: file.name, header: header.map((h, i) => h.trim() || `Column ${i + 1}`), rows };
}

const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
    : "";

export default function EmailPage() {
  const [tab, setTab] = useState<"campaigns" | "contacts">("campaigns");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [brand, setBrand] = useState({ businessName: "Your business", websiteDomain: "example.com" });

  const load = useCallback(async () => {
    const [c, k, s] = await Promise.all([
      fetch("/api/email/contacts", { cache: "no-store" }),
      fetch("/api/email/campaigns", { cache: "no-store" }),
      fetch("/api/settings", { cache: "no-store" }),
    ]);
    if (c.ok) setSummary(await c.json());
    if (k.ok) setCampaigns((await k.json()).campaigns);
    if (s.ok) {
      const g = (await s.json()).settings?.general;
      if (g) setBrand({ businessName: g.businessName, websiteDomain: g.websiteDomain });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Sending runs in slices on the server; this tab keeps asking for the next slice until done.
  const driving = useRef(new Set<string>());
  const drive = useCallback(async (id: string) => {
    if (driving.current.has(id)) return;
    driving.current.add(id);
    try {
      for (;;) {
        const res = await fetch("/api/email/send", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const data = await res.json().catch(() => ({}));
        const updated: CampaignRecord | undefined = data.campaign;
        if (updated) setCampaigns(list => list.map(c => (c.id === id ? updated : c)));
        if (!res.ok || !updated || updated.status !== "sending" || data.waiting) break;
      }
    } finally {
      driving.current.delete(id);
    }
  }, []);

  useEffect(() => {
    campaigns.filter(c => c.status === "sending").forEach(c => drive(c.id));
  }, [campaigns, drive]);

  const subscribed = summary?.byStatus.subscribed ?? 0;
  const sending = campaigns.filter(c => c.status === "sending").length;

  return (
    <>
      <div className="page-head">
        <h1>
          Email
          <span>
            · {subscribed.toLocaleString()} subscribed{sending ? ` · ${sending} sending` : ""}
          </span>
        </h1>
        <div className="actions">
          <button className={"chip " + (tab === "campaigns" ? "on" : "")} onClick={() => setTab("campaigns")}>
            Campaigns
          </button>
          <button className={"chip " + (tab === "contacts" ? "on" : "")} onClick={() => setTab("contacts")}>
            Contacts
          </button>
        </div>
      </div>

      {summary && !summary.emailConfigured && (
        <div className="notice">
          Sending is off: set <span className="mono">RESEND_API_KEY</span> and{" "}
          <span className="mono">EMAIL_FROM</span> (on a domain verified in Resend).
        </div>
      )}

      <div className="page-body">
        {tab === "contacts" ? (
          <ContactsTab summary={summary} onChange={load} />
        ) : (
          <CampaignsTab
            summary={summary}
            campaigns={campaigns}
            brand={brand}
            onCreated={c => {
              setCampaigns(list => [c, ...list]);
              drive(c.id);
            }}
            onUpdated={c => setCampaigns(list => list.map(x => (x.id === c.id ? c : x)))}
            onGoToContacts={() => setTab("contacts")}
          />
        )}
      </div>
    </>
  );
}

const panel: React.CSSProperties = {
  background: "var(--paper)",
  border: "1px solid var(--line)",
  borderRadius: "var(--r-3)",
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const sectionTitle: React.CSSProperties = { fontSize: 15, fontWeight: 800, color: "var(--ink)" };
const hint: React.CSSProperties = { fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 };

function ContactsTab({ summary, onChange }: { summary: Summary | null; onChange: () => void }) {
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [emailCol, setEmailCol] = useState(-1);
  const [nameCol, setNameCol] = useState(-1);
  const [lastCol, setLastCol] = useState(-1);
  const [list, setList] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setResult(null);
    try {
      const parsed = await parseSpreadsheet(file);
      if (!parsed.rows.length) throw new Error("No rows found in the first sheet.");
      setSheet(parsed);
      setEmailCol(guessEmailColumn(parsed.header, parsed.rows));
      setNameCol(guessColumn(parsed.header, parsed.rows, [/^(full\s*)?name$/i, /^first\s*_?name/i, /name/i]));
      setLastCol(guessColumn(parsed.header, parsed.rows, [/^(last|sur)\s*_?name/i]));
      setList(file.name.replace(/\.[^.]+$/, ""));
    } catch (e) {
      setSheet(null);
      setError(e instanceof Error ? e.message : "Couldn't read that file.");
    }
  };

  const rows = useMemo(() => {
    if (!sheet || emailCol < 0) return [];
    return sheet.rows.map(r => ({
      email: (r[emailCol] ?? "").trim(),
      name: [nameCol >= 0 ? r[nameCol] : "", lastCol >= 0 && lastCol !== nameCol ? r[lastCol] : ""]
        .map(v => (v ?? "").trim())
        .filter(Boolean)
        .join(" "),
    }));
  }, [sheet, emailCol, nameCol, lastCol]);
  const validCount = rows.filter(r => EMAIL_RE.test(r.email)).length;

  const doImport = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/email/contacts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ list: list.trim(), consent, source: `Import: ${sheet?.fileName}`, rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "Import failed");
      setResult(data);
      setSheet(null);
      setConsent(false);
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(false);
    }
  };

  const removeList = async (name: string) => {
    if (!confirm(`Remove the "${name}" list? Unsubscribed and bounced addresses stay blocked.`)) return;
    await fetch(`/api/email/contacts?list=${encodeURIComponent(name)}`, { method: "DELETE" });
    onChange();
  };

  const columnSelect = (label: string, value: number, set: (n: number) => void, optional = true) => (
    <div className="form-input" style={{ marginBottom: 0, flex: 1, minWidth: 140 }}>
      <label>{label}</label>
      <select value={value} onChange={e => set(Number(e.target.value))} style={{ fontSize: 13, padding: "8px 10px" }}>
        {optional && <option value={-1}>—</option>}
        {sheet!.header.map((h, i) => (
          <option key={i} value={i}>
            {h}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div style={{ display: "grid", gap: 20, gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", alignItems: "start" }}>
      <div style={panel}>
        <div style={sectionTitle}>Import contacts</div>
        <p style={hint}>
          Excel (.xlsx, .xls) or CSV. The first row should be column headings. Only import people who opted in to
          offers or are past customers. Anyone who unsubscribed or bounced stays blocked even if they&apos;re in the
          file again.
        </p>
        <label
          style={{
            border: "2px dashed var(--line-strong)",
            borderRadius: 12,
            padding: "22px 16px",
            textAlign: "center",
            cursor: "pointer",
            fontSize: 13.5,
            color: "var(--ink)",
          }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            onFile(e.dataTransfer.files[0]);
          }}
        >
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: "none" }}
            onChange={e => {
              onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {sheet ? (
            <>
              <b>{sheet.fileName}</b> · <span className="mono">{sheet.rows.length.toLocaleString()}</span> rows — choose
              another file
            </>
          ) : (
            <>
              <b>Drop a spreadsheet here</b> or click to choose
            </>
          )}
        </label>

        {sheet && (
          <>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {columnSelect("EMAIL COLUMN", emailCol, setEmailCol, false)}
              {columnSelect("NAME / FIRST NAME", nameCol, setNameCol)}
              {columnSelect("LAST NAME", lastCol, setLastCol)}
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="data-table" style={{ fontSize: 12.5 }}>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((r, i) => (
                    <tr key={i}>
                      <td className="mono" style={{ color: EMAIL_RE.test(r.email) ? undefined : "var(--danger)" }}>
                        {r.email || "—"}
                      </td>
                      <td>{r.name || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={hint}>
              <span className="mono">{validCount.toLocaleString()}</span> valid emails of{" "}
              <span className="mono">{rows.length.toLocaleString()}</span> rows. Invalid ones are skipped.
            </div>

            <div className="form-input" style={{ marginBottom: 0 }}>
              <label>LIST NAME</label>
              <input value={list} onChange={e => setList(e.target.value)} maxLength={80} style={{ fontSize: 13, padding: "8px 10px" }} />
            </div>

            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "var(--ink)", cursor: "pointer" }}>
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: 3 }} />
              <span>
                These people opted in to marketing emails or are past customers of ours. Recorded with your email as proof
                of consent.
              </span>
            </label>

            <button
              className="btn primary lg"
              onClick={doImport}
              disabled={busy || !consent || !list.trim() || validCount === 0 || validCount > 20000}
            >
              {busy ? "Importing…" : `Import ${validCount.toLocaleString()} contacts`}
            </button>
            {validCount > 20000 && <div style={{ ...hint, color: "var(--danger)" }}>Max 20,000 per import — split the file.</div>}
          </>
        )}

        {error && <div style={{ ...hint, color: "var(--danger)" }}>{error}</div>}
        {result && (
          <div style={{ ...hint, color: "var(--ok)" }}>
            Imported: {result.added} new, {result.updated} already on file
            {result.suppressed ? ` (${result.suppressed} of those are unsubscribed/bounced and stay blocked)` : ""}
            {result.invalid ? `, ${result.invalid} invalid skipped` : ""}
            {result.duplicates ? `, ${result.duplicates} duplicates in the file` : ""}.
          </div>
        )}
      </div>

      <div style={panel}>
        <div style={sectionTitle}>Lists</div>
        {summary?.lists.length ? (
          <table className="data-table" style={{ fontSize: 13 }}>
            <thead>
              <tr>
                <th>List</th>
                <th>Subscribed</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {summary.lists.map(l => (
                <tr key={l.name} style={{ cursor: "default" }}>
                  <td>{l.name}</td>
                  <td className="mono">
                    {l.subscribed.toLocaleString()}
                    <span style={{ color: "var(--faint)" }}> / {l.total.toLocaleString()}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn ghost" style={{ padding: "2px 8px", fontSize: 11 }} onClick={() => removeList(l.name)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={hint}>No contacts yet. Import a spreadsheet to create your first list.</p>
        )}
        {summary && (
          <div style={{ ...hint, fontFamily: "var(--font-jbmono), monospace", fontSize: 11.5 }}>
            {summary.byStatus.unsubscribed} unsubscribed · {summary.byStatus.bounced} bounced ·{" "}
            {summary.byStatus.complained} spam complaints
          </div>
        )}
      </div>
    </div>
  );
}

function CampaignsTab({
  summary,
  campaigns,
  brand,
  onCreated,
  onUpdated,
  onGoToContacts,
}: {
  summary: Summary | null;
  campaigns: CampaignRecord[];
  brand: { businessName: string; websiteDomain: string };
  onCreated: (c: CampaignRecord) => void;
  onUpdated: (c: CampaignRecord) => void;
  onGoToContacts: () => void;
}) {
  const [subject, setSubject] = useState("{{first_name}}, new offers just landed");
  const [body, setBody] = useState(
    "Hi {{first_name}},\n\nWe've just dropped prices on this week's best deals — including the iPhone 17 from **£31.95/mo** with free next-day delivery.\n\nOffer ends Sunday. Reply to this email if you'd like us to call you back."
  );
  const [ctaLabel, setCtaLabel] = useState("See the offers");
  const [ctaUrl, setCtaUrl] = useState("");
  const [list, setList] = useState(ALL);
  const [dailyLimit, setDailyLimit] = useState("");
  const [testTo, setTestTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  const audience =
    list === ALL
      ? summary?.byStatus.subscribed ?? 0
      : list === ENGAGED
      ? summary?.engaged ?? 0
      : summary?.lists.find(l => l.name === list)?.subscribed ?? 0;
  const cap = Number(dailyLimit) || 0;

  const preview = useMemo(
    () =>
      renderEmail(
        { subject, body, ctaLabel, ctaUrl },
        { name: "Sam Taylor", email: "sam@example.com" },
        brand,
        "#unsubscribe"
      ),
    [subject, body, ctaLabel, ctaUrl, brand]
  );

  const post = async (payload: Record<string, unknown>) => {
    const res = await fetch("/api/email/campaigns", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subject, body, ctaLabel: ctaLabel || undefined, ctaUrl: ctaUrl || undefined, ...payload }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  };

  const sendTest = async () => {
    setBusy(true);
    setNote(null);
    try {
      const data = await post({ action: "test", to: testTo || undefined });
      setNote({ ok: true, text: `Test sent to ${data.sentTo}.` });
    } catch (e) {
      setNote({ ok: false, text: e instanceof Error ? e.message : "Test failed" });
    } finally {
      setBusy(false);
    }
  };

  const sendCampaign = async () => {
    const listName =
      list === ALL ? "all subscribed contacts" : list === ENGAGED ? "recently engaged contacts" : `the "${list}" list`;
    const pace = cap ? `, ${cap.toLocaleString()} a day` : "";
    if (!confirm(`Send "${subject}" to ${audience.toLocaleString()} people on ${listName}${pace}? This can't be undone.`)) return;
    setBusy(true);
    setNote(null);
    try {
      const data = await post({ action: "create", list, dailyLimit: cap || undefined });
      onCreated(data.campaign);
      setNote({
        ok: true,
        text: cap
          ? `Sending up to ${cap.toLocaleString()} a day. Anything left continues automatically each morning.`
          : "Sending. Keep this page open to finish fastest; anything left continues each morning.",
      });
    } catch (e) {
      setNote({ ok: false, text: e instanceof Error ? e.message : "Send failed" });
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (id: string, action: "pause" | "resume") => {
    const res = await fetch("/api/email/campaigns", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    if (res.ok) onUpdated((await res.json()).campaign);
  };

  const ctaUrlInvalid = ctaUrl !== "" && !/^https:\/\/\S+$/i.test(ctaUrl);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", alignItems: "start" }}>
        <div style={panel}>
          <div style={sectionTitle}>New campaign</div>
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>SEND TO</label>
            <select value={list} onChange={e => setList(e.target.value)} style={{ fontSize: 13, padding: "8px 10px" }}>
              <option value={ALL}>All subscribed contacts ({(summary?.byStatus.subscribed ?? 0).toLocaleString()})</option>
              <option value={ENGAGED}>Opened or clicked in the last 90 days ({(summary?.engaged ?? 0).toLocaleString()})</option>
              {summary?.lists.map(l => (
                <option key={l.name} value={l.name}>
                  {l.name} ({l.subscribed.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>DAILY LIMIT (OPTIONAL)</label>
            <input
              type="number"
              min={10}
              value={dailyLimit}
              onChange={e => setDailyLimit(e.target.value)}
              placeholder="e.g. 100 while the domain warms up"
              style={{ fontSize: 13, padding: "8px 10px" }}
            />
          </div>
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>SUBJECT</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} maxLength={200} style={{ fontSize: 13, padding: "8px 10px" }} />
          </div>
          <div className="form-input" style={{ marginBottom: 0 }}>
            <label>MESSAGE · {"{{first_name}}"} · **bold** · blank line = new paragraph</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={9} style={{ fontSize: 13 }} />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div className="form-input" style={{ marginBottom: 0, flex: 1, minWidth: 140 }}>
              <label>BUTTON TEXT (OPTIONAL)</label>
              <input value={ctaLabel} onChange={e => setCtaLabel(e.target.value)} maxLength={60} style={{ fontSize: 13, padding: "8px 10px" }} />
            </div>
            <div className="form-input" style={{ marginBottom: 0, flex: 2, minWidth: 200 }}>
              <label>BUTTON LINK</label>
              <input
                value={ctaUrl}
                onChange={e => setCtaUrl(e.target.value.trim())}
                placeholder="https://…"
                style={{ fontSize: 13, padding: "8px 10px", borderColor: ctaUrlInvalid ? "var(--danger)" : undefined }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap", paddingTop: 4 }}>
            <div className="form-input" style={{ marginBottom: 0, flex: 1, minWidth: 160 }}>
              <label>TEST TO (BLANK = YOUR LOGIN EMAIL)</label>
              <input value={testTo} onChange={e => setTestTo(e.target.value)} type="email" style={{ fontSize: 13, padding: "8px 10px" }} />
            </div>
            <button className="btn" onClick={sendTest} disabled={busy || !subject.trim() || !body.trim() || ctaUrlInvalid}>
              Send test
            </button>
          </div>
          <button
            className="btn primary lg"
            onClick={sendCampaign}
            disabled={busy || audience === 0 || !subject.trim() || !body.trim() || ctaUrlInvalid || !summary?.emailConfigured}
          >
            Send to {audience.toLocaleString()} {audience === 1 ? "person" : "people"}
          </button>
          {audience === 0 && summary && (
            <div style={hint}>
              No subscribed contacts here yet —{" "}
              <button className="btn ghost" style={{ padding: 0, fontSize: 12.5 }} onClick={onGoToContacts}>
                import a list
              </button>
              .
            </div>
          )}
          {ctaUrlInvalid && <div style={{ ...hint, color: "var(--danger)" }}>Button link must start with https://</div>}
          {ctaLabel.trim() && !ctaUrl && <div style={hint}>Add a button link to include the button.</div>}
          {note && <div style={{ ...hint, color: note.ok ? "var(--ok)" : "var(--danger)" }}>{note.text}</div>}
        </div>

        <div style={{ ...panel, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }}>
            <div className="mono" style={{ fontSize: 10.5, color: "var(--faint)", letterSpacing: "0.1em" }}>
              PREVIEW · AS SAM TAYLOR
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, marginTop: 4, color: "var(--ink)" }}>{preview.subject}</div>
          </div>
          <iframe
            title="Email preview"
            srcDoc={preview.html}
            sandbox=""
            style={{ width: "100%", height: 520, border: 0, background: "var(--paper-2)" }}
          />
        </div>
      </div>

      <div style={panel}>
        <div style={sectionTitle}>Sent campaigns</div>
        {campaigns.length === 0 ? (
          <p style={hint}>Nothing sent yet.</p>
        ) : (
          <table className="data-table" style={{ fontSize: 13 }}>
            <thead>
              <tr>
                <th>Subject</th>
                <th>List</th>
                <th>Progress</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => {
                const pct = c.total ? Math.min(100, Math.round((c.sent / c.total) * 100)) : 0;
                return (
                  <tr key={c.id} style={{ cursor: "default" }}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.subject}</div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--faint)" }}>
                        {fmtDate(c.createdAt)} · {c.createdBy}
                      </div>
                      {c.lastError && <div style={{ fontSize: 11.5, color: "var(--danger)", marginTop: 4 }}>{c.lastError}</div>}
                      {c.status === "sending" && c.capReachedOn && (
                        <div style={{ fontSize: 11.5, color: "var(--warn)", marginTop: 4 }}>
                          Daily limit of {c.dailyLimit?.toLocaleString()} reached · continues tomorrow
                        </div>
                      )}
                    </td>
                    <td>{c.list === ALL ? "All subscribed" : c.list === ENGAGED ? "Engaged (90 days)" : c.list}</td>
                    <td style={{ minWidth: 150 }}>
                      <div style={{ height: 6, background: "var(--line)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: c.status === "paused" ? "var(--warn)" : "var(--signal)" }} />
                      </div>
                      <div className="mono" style={{ fontSize: 11, marginTop: 4, color: "var(--muted)" }}>
                        {c.sent.toLocaleString()} / {c.total.toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <span className={"badge " + (c.status === "sent" ? "human" : c.status === "sending" ? "new" : "bot")}>
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {c.status === "sending" && (
                        <button className="btn ghost" style={{ padding: "2px 8px", fontSize: 11 }} onClick={() => setStatus(c.id, "pause")}>
                          Pause
                        </button>
                      )}
                      {c.status === "paused" && (
                        <button className="btn" style={{ padding: "2px 8px", fontSize: 11 }} onClick={() => setStatus(c.id, "resume")}>
                          Resume
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
