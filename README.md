# Ali Agent

AI-powered call-center automation for a UK mobile & SIM retailer.

- **WhatsApp** (Meta Cloud API or Twilio) and an embeddable **website chat widget** (`public/widget.js`), answered by Claude grounded in the plan catalogue + knowledge base
- Public **lead form** (`/form`) and **checkout** (`/checkout`) feeding the CRM
- **Admin desk** (`/admin`, login required): shared inbox with human takeover, leads, orders, email marketing, bot prompt, KB, team, settings
- **Supabase** for storage and staff login (local dev falls back to `.data/db.json` with auth off)

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without Supabase keys the admin desk is open and data lives in `.data/db.json`.

## Surface Status

| Surface | State |
|---|---|
| Design system, all three surfaces (`/`, `/form`, `/widget`, `/admin`) | ✅ Live |
| Persistent Store (Supabase `records` + `app_state`; `.data/db.json` only in local dev) | ✅ Live |
| Admin auth (Supabase Auth + email allowlist, `/login`, `src/proxy.ts`) | ✅ Live |
| Email marketing: spreadsheet import, Resend campaigns, one-click unsubscribe, bounce suppression (`/admin/email`) | ✅ Live |
| Staff replies delivered (WhatsApp via Meta/Twilio; widget polls `/api/chat/session`) + per-thread bot pause | ✅ Live |
| One bot brain for web + WhatsApp (`lib/bot.ts`: escalation rules → Claude → catalogue fallback) | ✅ Live |
| Business hours awareness (handoff + callback messages) | ✅ Live |
| Email alerts: new lead, handoff, new order; customer order confirmation + dispatch email | ✅ Live |
| Rate limiting on public endpoints (Supabase `hit_rate_limit`) | ✅ Live |
| KB import from URL (SSRF-guarded) + re-sync | ✅ Live |
| Email daily send cap, engaged-audience, daily cron top-up (`/api/cron/email`) | ✅ Live |
| WhatsApp broadcasts | ⏸ Drafts only (needs Meta-approved templates) |
| WhatsApp signature checks (Meta `X-Hub-Signature-256`, Twilio `X-Twilio-Signature`) | ✅ Live |
| Lead form submit (`POST /api/leads`) + CSV export + inline status updates | ✅ Live |
| Chat widget streaming (`POST /api/chat`) + session logging to Admin Inbox | ✅ Live |
| Standalone embed script (`public/widget.js` + `/widget/embed`) | ✅ Live |
| WhatsApp Webhook (`GET/POST /api/whatsapp/webhook` — Meta, Twilio & Simulator) | ✅ Live |
| Admin Bot Prompt editor, live test preview & version history (`/api/bot`) | ✅ Live |
| Admin Knowledge Base upload, URL import & bot grounding (`/api/kb`) | ✅ Live |
| Admin Broadcasts composer, templates, scheduling & dispatch (`/api/broadcasts`) | ✅ Live |
| Admin Team invites, role editor & Settings persistence (`/api/team`, `/api/settings`) | ✅ Live |

## Going live

1. Create a Supabase project and run `supabase/schema.sql` in the SQL editor.
2. Supabase → Authentication → Sign In / Providers: **turn off "Allow new users to sign up"**, then add staff under Authentication → Users (email + password).
3. Set Vercel env vars (see `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAILS`, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_APP_URL`, plus the WhatsApp provider's vars (`META_APP_SECRET` is required for Meta webhooks to be accepted).
4. Admin access = signed in **and** email in `ADMIN_EMAILS` or on the Team page. Removing someone from Team revokes access.

The first request seeds bot config, settings and KB articles into Supabase; demo conversations/leads/orders are only seeded in local file mode.

### Email marketing setup

1. Resend → Domains: add a sending subdomain (e.g. `mail.yourdomain.co.uk`) and add its DNS records. Also add a DMARC record (`_dmarc` TXT, `v=DMARC1; p=none;` to start); Gmail/Yahoo require it for bulk mail.
2. Set `RESEND_API_KEY`, `EMAIL_FROM` (on that domain), `UNSUBSCRIBE_SECRET` (random, never change it).
3. Resend → Webhooks: point to `https://<app>/api/email/webhook` with `email.bounced` + `email.complained`; set `RESEND_WEBHOOK_SECRET`.
4. Only import people who opted in or are past customers (PECR). Keep the sending page open while a campaign goes out; it pauses safely if closed and resumes where it left off.

### WhatsApp (Meta Cloud API) setup

1. Meta for Developers → create an app → add WhatsApp. Use a number that isn't already on WhatsApp.
2. Webhook URL `https://<app>/api/whatsapp/webhook`, verify token = `META_WA_VERIFY_TOKEN`, subscribe to `messages`.
3. Set `META_APP_SECRET`, `META_WA_PHONE_NUMBER_ID`, and a **permanent system-user** `META_WA_ACCESS_TOKEN` (the temporary token dies in 24h).
4. Free-form replies only work within 24h of the customer's last message; after that Meta requires approved templates.

### Automation notes

- Set `CRON_SECRET` in Vercel; `vercel.json` runs `/api/cron/email` daily at 09:00 UTC to continue capped or unattended campaigns.
- Turn on open/click tracking for the domain in Resend and add `email.opened` + `email.clicked` to the webhook, or the "engaged" audience stays empty.
- Alerts go to Settings → General → Contact email; they need `RESEND_API_KEY` + `EMAIL_FROM`.
