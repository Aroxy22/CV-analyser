# WhatsApp CV Bot — Implementation Plan

**Goal:** Let users drop their CV to a WhatsApp number and get the same analysis as the web flow.

## Flow

1. User sends a PDF (or image of CV) to a JoinStartup WhatsApp number
2. Bot acknowledges receipt
3. Backend extracts CV content, runs existing `extract-fast` / `extract-deep` pipeline
4. Bot replies with: archetype, fit summary, and a link to full analysis on web
5. Optionally: user replies with email → we save to builders, send profile link

## Prerequisites

- **WhatsApp Business API** — via Meta or a provider (Twilio, MessageBird, 360dialog, WATI)
- **Webhook endpoint** — receives incoming messages and media
- **Server** that can:
  - Download media from WhatsApp
  - Call existing extract APIs
  - Send templated replies

## Architecture

```
WhatsApp → Webhook (Next.js API or separate service)
                ↓
         Download PDF/media
                ↓
         POST /api/extract-fast or /api/extract-deep (reuse existing)
                ↓
         Format result for WhatsApp (short text + link)
                ↓
         Send reply via WhatsApp Cloud API
```

## Implementation Steps

### 1. WhatsApp Business API setup

- Create Meta Business Account, register app, get WhatsApp Business API access
- Or use provider: [Twilio WhatsApp](https://www.twilio.com/whatsapp), [360dialog](https://www.360dialog.com/), [WATI](https://www.wati.io/)
- Get webhook URL verified (GET) and handle incoming events (POST)

### 2. Webhook API route

Create `/api/webhooks/whatsapp/route.ts`:

- **GET:** Verify webhook (Meta sends `hub.mode`, `hub.verify_token`, `hub.challenge`)
- **POST:** Parse incoming message, extract:
  - `from` (phone/wa_id)
  - `type` (text, image, document)
  - `document` or `image` URL (need to fetch via WhatsApp Media API)

### 3. Media handling

- WhatsApp sends media ID, not raw file
- Call `GET https://graph.facebook.com/v18.0/{media_id}` with access token to get URL
- Download file (PDF or image)
- If image: convert to text via OCR (e.g. Tesseract, or use Vision API) before extract
- If PDF: pass to existing extract pipeline

### 4. Reuse extract pipeline

- Use `/api/extract-fast` or `/api/extract-deep` with base64 PDF
- Or call the same logic internally (extract-fast route handler)
- Parse response for archetype, stage, summary, founder view headline

### 5. Reply format

WhatsApp has a 4096-char limit. Keep reply short:

```
📄 Got your CV.

Your read: {archetype}
Stage: {stage_bucket}
Fit: {one-line summary}

🔗 Full analysis (founder + recruiter views, roadmap):
{baseUrl}/analyse?from=whatsapp&token={oneTimeToken}

Reply with your email to save your profile and join the pool.
```

### 6. Optional: save profile via reply

- Store `wa_id → session` mapping (Redis/DB)
- When user replies with text that looks like email:
  - Call join-pool or a lightweight "save from WhatsApp" flow
  - Create builder row, send profile link in reply

## Environment variables (Twilio)

```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_WHATSAPP_NUMBER=14155238886
```

`NEXT_PUBLIC_WHATSAPP_NUMBER` is shown on the site — users tap it to open WhatsApp. Use the number without `+` (e.g. `14155238886` for US, `919876543210` for India).

## Twilio webhook setup

1. Go to [Twilio Console](https://console.twilio.com) → Messaging → Try it out → Send a WhatsApp message
2. Under "Sandbox settings" or your WhatsApp sender, set **When a message comes in** to:
   ```
   https://your-app.vercel.app/api/webhooks/whatsapp
   ```
3. Method: **POST**
4. Save. Twilio will POST incoming messages to this URL.

## Cost considerations

- WhatsApp Business API: per-conversation pricing (Meta)
- Provider fees (Twilio, etc.)
- Extract API: existing OpenAI/Anthropic costs

## Security

- Validate webhook signature (Meta sends `X-Hub-Signature-256`)
- Rate limit by `wa_id` to prevent abuse
- Validate media type/size before processing

## Next steps

1. Choose provider (Meta direct vs Twilio/360dialog)
2. Create webhook route and verify handshake
3. Implement media download + extract pipeline
4. Add templated reply logic
5. Test end-to-end with a real WhatsApp number
