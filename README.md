# Ali Agent

AI-powered call center automation for a UK mobile & SIM retail business.

- Auto-reply chats via **WhatsApp** (`/api/whatsapp/webhook`) and an embeddable **website widget** (`/widget.js`)
- Public **lead form** for ads/landing pages (`/form`)
- **Admin dashboard** for call center staff — take-over, lead scoring, broadcasts, bot prompt & KB (`/admin`)
- Backed by **Claude** (Anthropic) for chat with a built-in catalogue/KB engine + **local JSON / Supabase** storage

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Surface Status

| Surface | State |
|---|---|
| Design system, all three surfaces (`/`, `/form`, `/widget`, `/admin`) | ✅ Live |
| Persistent Store (`.data/db.json` + optional Supabase sync) | ✅ Live |
| Lead form submit (`POST /api/leads`) + CSV export + inline status updates | ✅ Live |
| Chat widget streaming (`POST /api/chat`) + session logging to Admin Inbox | ✅ Live |
| Standalone embed script (`public/widget.js` + `/widget/embed`) | ✅ Live |
| WhatsApp Webhook (`GET/POST /api/whatsapp/webhook` — Meta, Twilio & Simulator) | ✅ Live |
| Admin Bot Prompt editor, live test preview & version history (`/api/bot`) | ✅ Live |
| Admin Knowledge Base upload, URL import & bot grounding (`/api/kb`) | ✅ Live |
| Admin Broadcasts composer, templates, scheduling & dispatch (`/api/broadcasts`) | ✅ Live |
| Admin Team invites, role editor & Settings persistence (`/api/team`, `/api/settings`) | ✅ Live |
