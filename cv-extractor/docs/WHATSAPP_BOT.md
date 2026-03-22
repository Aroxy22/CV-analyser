# WhatsApp Business Integration — Spec

## Status

| Component | Status |
|---|---|
| `whatsapp_sessions` DB table | ✅ Live |
| `whatsapp-bot` Supabase edge function | ✅ v1 ready |
| Meta Cloud API setup | ⏳ Pending |
| Edge function env vars | ⏳ Pending |

---

## ⚠ Number setup first

You cannot use a personal WhatsApp number for Cloud API production.
Use one dedicated number:
- New SIM (Jio/Airtel etc.) and migrate to WhatsApp Business, or
- Verified virtual number provider.

---

## Meta Cloud API setup (one-time)

1. Go to `developers.facebook.com` → Create App → **Business**
2. Add **WhatsApp** product
3. In **Getting Started**, add your phone number
4. Note:
   - `Phone Number ID`
   - Permanent Access Token (System User token from Business settings)
5. Configure webhook:
   - URL: `https://xsbsoevqqvnxmtxuytiu.supabase.co/functions/v1/whatsapp-bot`
   - Verify token: `joinstartup_verify`
   - Subscribe to: `messages`
6. Add edge function env vars:
   - `WHATSAPP_TOKEN`
   - `WHATSAPP_PHONE_ID`
   - `WHATSAPP_VERIFY_TOKEN=joinstartup_verify`
   - `GROQ_API_KEY`
   - `SARVAM_API_KEY` (fallback)

---

## Conversation flow

1. Builder sends any message
2. Bot replies: “Hey! Send me your CV as PDF…”
3. Builder sends PDF
4. Bot replies: “Got your CV! What are you looking for?”
5. Builder sends goal text
6. Bot replies: “Analysing... ⏳”
7. Analysis runs (Groq primary, Sarvam fallback)
8. Bot sends teaser:
   - Archetype
   - 2-3 sentence summary
   - Founder read
   - Recruiter read
   - CTA to full analysis

---

## Conversation states

- `idle` → first greeting + ask CV
- `waiting_cv` → waiting for PDF
- `waiting_goal` → ask what they are looking for
- `analysing` → run analysis
- `done` → teaser + links

Keywords in `done` state:
- `again` / `redo` → restart flow
- `full` / `roadmap` → send full-analysis link
- `pool` / `join` / `499` → explain pool + link

---

## Edge function responsibilities (`whatsapp-bot`)

- `GET` → webhook verification (Meta requirement)
- `POST` → incoming messages, state machine, media download, analysis call, outbound reply

---

## Landing page CTA

Add button in nav/hero:

`Try on WhatsApp →`

Link:
`https://wa.me/[YOUR_NUMBER]?text=Hi`

Use number without `+` (e.g., `9198XXXXXXXX`).
