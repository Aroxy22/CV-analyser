import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = "https://xsbsoevqqvnxmtxuytiu.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title, company, company_type, stage, location, remote,
      equity, salary, description, archetype_fit, tags,
      apply_url, contact_email, posted_by,
    } = body;

    // Basic validation
    if (!title || !company || !stage || !description || !archetype_fit?.length || !apply_url || !contact_email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Normalise apply_url — add mailto: if it looks like an email
    const normalizedUrl = apply_url.includes("@") && !apply_url.startsWith("mailto:")
      ? `mailto:${apply_url}`
      : apply_url;

    // Insert to Supabase — status pending until reviewed
    const res = await fetch(`${SUPABASE_URL}/rest/v1/startup_jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        title,
        company,
        company_type: company_type || "startup",
        stage,
        location: location || "India",
        remote: remote ?? true,
        equity: equity || null,
        salary: salary || null,
        description,
        archetype_fit,
        tags: tags || [],
        apply_url: normalizedUrl,
        contact_email,
        posted_by: posted_by || null,
        status: "pending", // reviewed before going live
        source: "direct",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[post-job] Supabase error:", err);
      return NextResponse.json({ error: "Failed to save job listing" }, { status: 500 });
    }

    const [row] = await res.json();

    // Send notification email to hello@joinstartup.app
    if (RESEND_API_KEY) {
      const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;background:#f5f2ee;padding:40px 20px;color:#1a1a1a">
<div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e8e2da;border-radius:14px;padding:32px;border-top:3px solid #ff4d00">
  <div style="font-family:monospace;font-size:10px;color:#9a9088;letter-spacing:2px;margin-bottom:16px">◆ NEW JOB SUBMISSION</div>
  <h2 style="font-size:20px;font-weight:900;margin-bottom:4px">${title}</h2>
  <div style="font-size:13px;color:#9a9088;margin-bottom:24px">${company} · ${stage}</div>
  <table style="width:100%;border-collapse:collapse;font-size:13px">
    <tr><td style="padding:8px 0;border-bottom:1px solid #f0ebe4;color:#9a9088;width:120px">Posted by</td><td style="padding:8px 0;border-bottom:1px solid #f0ebe4">${posted_by || "—"}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #f0ebe4;color:#9a9088">Contact</td><td style="padding:8px 0;border-bottom:1px solid #f0ebe4">${contact_email}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #f0ebe4;color:#9a9088">Location</td><td style="padding:8px 0;border-bottom:1px solid #f0ebe4">${location || "—"} ${remote ? "· Remote" : ""}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #f0ebe4;color:#9a9088">Equity</td><td style="padding:8px 0;border-bottom:1px solid #f0ebe4">${equity || "—"}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #f0ebe4;color:#9a9088">Salary</td><td style="padding:8px 0;border-bottom:1px solid #f0ebe4">${salary || "—"}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #f0ebe4;color:#9a9088">Apply URL</td><td style="padding:8px 0;border-bottom:1px solid #f0ebe4">${normalizedUrl}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #f0ebe4;color:#9a9088">Archetypes</td><td style="padding:8px 0;border-bottom:1px solid #f0ebe4">${archetype_fit.join(", ")}</td></tr>
  </table>
  <div style="margin-top:20px;padding:16px;background:#f5f2ee;border-radius:8px;font-size:13px;color:#555;line-height:1.7">
    ${description}
  </div>
  <div style="margin-top:24px;display:flex;gap:10px">
    <a href="https://supabase.com/dashboard/project/xsbsoevqqvnxmtxuytiu/editor" style="display:inline-block;padding:12px 20px;background:#ff4d00;color:#fff;border-radius:8px;font-weight:700;font-size:13px;text-decoration:none">Review in Supabase →</a>
  </div>
</div>
</body></html>`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "JoinStartup <hello@joinstartup.app>",
          to: ["hello@joinstartup.app"],
          subject: `New job post: ${title} at ${company}`,
          html,
        }),
      }).catch(e => console.error("[post-job] email error:", e));

      // Also send confirmation to poster
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "JoinStartup <hello@joinstartup.app>",
          to: [contact_email],
          subject: `We received your job posting — ${title} at ${company}`,
          html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;background:#f5f2ee;padding:40px 20px;color:#1a1a1a">
<div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e8e2da;border-radius:14px;padding:32px;border-top:3px solid #ff4d00">
  <div style="font-family:monospace;font-size:10px;color:#9a9088;letter-spacing:2px;margin-bottom:16px">◆ JOINSTARTUP.APP</div>
  <h2 style="font-size:22px;font-weight:900;margin-bottom:8px">Job received — we'll review it shortly.</h2>
  <p style="font-size:14px;color:#6b6460;line-height:1.75;margin-bottom:20px">
    We received your listing for <strong style="color:#1a1a1a">${title}</strong> at <strong style="color:#1a1a1a">${company}</strong>. 
    We review all submissions within 24 hours. Once approved, your role will be live on joinstartup.app/jobs and matched to builders by archetype.
  </p>
  <div style="padding:16px;background:#f5f2ee;border-radius:8px;font-family:monospace;font-size:12px;color:#6b6460">
    <div>Archetypes targeted: ${archetype_fit.join(", ")}</div>
    <div style="margin-top:4px">Stage: ${stage}</div>
    ${equity ? `<div style="margin-top:4px">Equity: ${equity}</div>` : ""}
  </div>
  <p style="font-size:13px;color:#9a9088;margin-top:20px;line-height:1.7">
    Questions? Reply to this email or reach us at hello@joinstartup.app
  </p>
</div>
</body></html>`,
        }),
      }).catch(e => console.error("[post-job] confirmation email error:", e));
    }

    return NextResponse.json({ ok: true, id: row?.id });

  } catch (error) {
    console.error("[post-job] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
