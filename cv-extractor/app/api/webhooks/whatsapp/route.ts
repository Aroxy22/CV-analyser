import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Deprecated: Twilio webhook path kept only to avoid 404s.
// Production WhatsApp integration now runs via Supabase Edge Function:
// supabase/functions/whatsapp-bot (Meta Cloud API).

export async function GET() {
  return NextResponse.json({
    ok: true,
    mode: "deprecated",
    message:
      "This endpoint is deprecated. Use Supabase edge function whatsapp-bot with Meta Cloud API.",
  });
}

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      mode: "deprecated",
      message:
        "Twilio flow removed. Configure Meta Cloud API webhook at /functions/v1/whatsapp-bot.",
    },
    { status: 410 },
  );
}
