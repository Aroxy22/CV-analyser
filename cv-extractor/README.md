# CV Extractor — Next.js App

AI-powered CV analysis with real Supabase storage.

## Setup (5 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Add your Anthropic API key
Edit `.env.local` and replace the placeholder:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```
Get your key at https://console.anthropic.com

### 3. Run locally
```bash
npm run dev
```
Open http://localhost:3000

---

## How it works

All API calls go through **Next.js server-side API routes** (`/app/api/`), which have full network access. There is no sandbox restriction — Supabase is called directly from the server.

```
Browser → Next.js API route (server) → Supabase / Anthropic API
```

### API Routes
| Route | Purpose |
|-------|---------|
| `POST /api/extract` | Extract CV with Claude (Anthropic API) |
| `POST /api/save-cv` | Save CV metadata to Supabase |
| `POST /api/save-analysis` | Save full analysis JSON to Supabase |
| `POST /api/save-jobs` | Cache job results to Supabase |
| `GET  /api/save-jobs` | Load cached jobs |
| `GET  /api/list-analyses` | List all past analyses |
| `GET  /api/get-analysis` | Load a specific analysis |
| `POST /api/search-jobs` | Search real jobs via Claude web search |

### Supabase Project
- **Project:** CV Extractor (`xsbsoevqqvnxmtxuytiu`)
- **Tables:** `cvs`, `cv_analyses`, `job_listings`

---

## Deploy to Vercel (optional)
```bash
npx vercel
```
Add `ANTHROPIC_API_KEY` as an environment variable in the Vercel dashboard.
The Supabase keys are already public-safe (anon key).
