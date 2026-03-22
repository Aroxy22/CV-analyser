# CV Extractor — Next.js App

AI-powered CV analysis with Supabase storage.

## Setup

### 1) Install
```bash
npm install
```

### 2) Configure env
Create/update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# LLM providers (at least one required)
GROQ_API_KEY=...
SARVAM_API_KEY=...
# optional
SARVAM_API_URL=https://api.sarvam.ai/v1/chat/completions
SARVAM_MODEL=sarvam-m
```

### 3) Run
```bash
npm run dev
```
Open http://localhost:3000

---

## Model routing

- Primary: **Groq** (`GROQ_API_KEY`)
- Fallback: **Sarvam** (`SARVAM_API_KEY`)
- Anthropic is no longer required.

`/api/extract` now:
- extracts text from uploaded PDF,
- combines with user goal + optional URL context,
- returns strict structured JSON used by app screens.

---

## API Routes

| Route | Purpose |
|---|---|
| `POST /api/extract` | Full CV analysis (Groq → Sarvam fallback) |
| `POST /api/extract-fast` | Fast lightweight extraction |
| `POST /api/onboarding-summary` | Builder onboarding summary |
| `POST /api/save-cv` | Save CV metadata to Supabase |
| `POST /api/save-analysis` | Save full analysis JSON to Supabase |
| `POST /api/save-jobs` | Cache job results to Supabase |
| `GET /api/save-jobs` | Load cached jobs |
| `GET /api/list-analyses` | List past analyses |
| `GET /api/get-analysis` | Load one analysis |

---

## WhatsApp integration (Meta Cloud API + Supabase Edge Function)

Use the implementation in `supabase/functions/whatsapp-bot` (not Twilio).

Flow:
1. User sends message → bot asks for CV PDF
2. User sends PDF → bot asks for goal
3. User sends goal → bot runs analysis + replies with teaser
4. Bot shares full-analysis CTA link

Detailed spec is in `docs/WHATSAPP_BOT.md`.

---

## Deploy

Set env variables in your host (Vercel/Render):
- `GROQ_API_KEY` (recommended)
- `SARVAM_API_KEY` (fallback)
- Supabase public keys (`NEXT_PUBLIC_*`)
