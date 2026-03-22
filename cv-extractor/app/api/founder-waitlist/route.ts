// app/api/founder-waitlist/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = "https://xsbsoevqqvnxmtxuytiu.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const { email, source = "founders-page", company, name } = await req.json();
    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

    // Insert into founders table
    await fetch(`${SUPABASE_URL}/rest/v1/founders`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        email, name: name || null, company: company || null,
        source, status: "waitlist", created_at: new Date().toISOString(),
      }),
    });

    // Notify hello@joinstartup.app
    if (RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "JoinStartup <hello@joinstartup.app>",
          to: ["hello@joinstartup.app"],
          subject: `New founder waitlist signup — ${email}`,
          html: `<p>New founder signup from ${source}:</p><p><strong>${email}</strong>${name ? ` (${name})` : ""}${company ? ` at ${company}` : ""}</p>`,
        }),
      }).catch(() => {});

      // Confirmation to founder
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "JoinStartup <hello@joinstartup.app>",
          to: [email],
          subject: "You're on the JoinStartup founder waitlist",
          html: `
<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:40px 20px">
  <p style="font-family:monospace;font-size:10px;color:#9a9088;letter-spacing:2px;margin-bottom:16px">◆ JOINSTARTUP.APP</p>
  <h2 style="font-size:20px;font-weight:900;margin-bottom:8px">You're on the list.</h2>
  <p style="font-size:14px;color:#6b6460;line-height:1.75;margin-bottom:16px">
    We're setting up founder access manually right now — we'll have you searching the builder pool within 24 hours.
  </p>
  <p style="font-size:13px;color:#9a9088">In the meantime, reply to this email if you want to jump the queue or have specific requirements.</p>
  <p style="font-size:13px;color:#9a9088;margin-top:20px">— Meena, JoinStartup</p>
</div>`,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
