import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const {
      job_id, job_title, company, apply_url,
      contact_email, builder_email, builder_name,
      builder_archetype, builder_stage, profile_token,
    } = await req.json();

    if (!job_id || !builder_email || !profile_token) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const profileUrl = `https://joinstartup.app/profile?token=${profile_token}`;
    const archetypeLabels: Record<string, string> = {
      "zero-to-one": "Zero-to-One Builder", "systems-architect": "Systems Architect",
      "growth-hacker": "Growth Hacker", "founding-generalist": "Founding Generalist",
      "product-intuitive": "Product Intuitive", "operator": "The Operator",
      "deep-tech": "Deep Tech Builder", "community-builder": "Community Builder",
      "revenue-animal": "Revenue Animal", "brand-builder": "Brand Builder",
      "data-whisperer": "Data Whisperer", "market-maker": "Market Maker",
      "finance-builder": "Finance Builder", "pivot-survivor": "Pivot Survivor",
      "india-stack": "India Stack Expert", "global-translator": "Global→India Translator",
    };
    const archetypeName = archetypeLabels[builder_archetype] || builder_archetype;

    if (RESEND_API_KEY && contact_email && contact_email.includes("@")) {
      // Email to the company/founder
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "JoinStartup <hello@joinstartup.app>",
          to: [contact_email],
          reply_to: builder_email,
          subject: `New applicant for ${job_title} — ${builder_name || archetypeName}`,
          html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;background:#f5f2ee;padding:40px 20px;color:#1a1a1a">
<div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e8e2da;border-radius:14px;overflow:hidden">
  <div style="height:3px;background:#ff4d00"></div>
  <div style="padding:32px">
    <div style="font-family:monospace;font-size:10px;color:#9a9088;letter-spacing:2px;margin-bottom:16px">◆ NEW APPLICATION VIA JOINSTARTUP</div>
    <h2 style="font-size:20px;font-weight:900;margin-bottom:4px">${builder_name || "A builder"} applied for ${job_title}</h2>
    <p style="font-family:monospace;font-size:11px;color:#9a9088;margin-bottom:24px">${archetypeName} · ${builder_stage}</p>
    <div style="background:#f5f2ee;border:1px solid #e8e2da;border-radius:10px;padding:16px;margin-bottom:24px">
      <p style="font-family:monospace;font-size:9px;color:#9a9088;letter-spacing:2px;margin-bottom:8px">BUILDER PROFILE</p>
      <p style="font-size:13px;color:#6b6460;margin-bottom:12px">View their full archetype analysis, founder view, recruiter view, skills, and 90-day roadmap:</p>
      <a href="${profileUrl}" style="display:inline-block;padding:12px 24px;background:#ff4d00;color:#fff;border-radius:8px;font-weight:700;font-size:13px;text-decoration:none">View Builder Profile →</a>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <tr><td style="padding:8px 0;border-bottom:1px solid #f0ebe4;color:#9a9088;width:100px">Name</td><td style="padding:8px 0;border-bottom:1px solid #f0ebe4">${builder_name || "—"}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #f0ebe4;color:#9a9088">Email</td><td style="padding:8px 0;border-bottom:1px solid #f0ebe4"><a href="mailto:${builder_email}" style="color:#ff4d00">${builder_email}</a></td></tr>
      <tr><td style="padding:8px 0;color:#9a9088">Archetype</td><td style="padding:8px 0">${archetypeName} · ${builder_stage}</td></tr>
    </table>
    <p style="font-size:11px;color:#9a9088;margin-top:20px">Reply directly to this email to contact the applicant. Their email is ${builder_email}.</p>
  </div>
</div>
</body></html>`,
        }),
      }).catch(() => {});

      // Confirmation to builder
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "JoinStartup <hello@joinstartup.app>",
          to: [builder_email],
          subject: `Application sent — ${job_title} at ${company}`,
          html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;background:#f5f2ee;padding:40px 20px;color:#1a1a1a">
<div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e8e2da;border-radius:14px;overflow:hidden">
  <div style="height:3px;background:#10b981"></div>
  <div style="padding:32px">
    <div style="font-family:monospace;font-size:10px;color:#9a9088;letter-spacing:2px;margin-bottom:16px">◆ APPLICATION SENT</div>
    <h2 style="font-size:20px;font-weight:900;margin-bottom:8px">Your profile was shared with ${company}.</h2>
    <p style="font-size:14px;color:#6b6460;line-height:1.75;margin-bottom:20px">
      Your builder profile — including your archetype analysis, founder view, and recruiter view — was sent to the hiring team at ${company} for the <strong style="color:#1a1a1a">${job_title}</strong> role.
    </p>
    <a href="${profileUrl}" style="display:inline-block;padding:12px 24px;background:#10b981;color:#fff;border-radius:8px;font-weight:700;font-size:13px;text-decoration:none;margin-bottom:20px">View your profile →</a>
    <p style="font-size:12px;color:#9a9088;line-height:1.7">If they're interested they'll reach out at ${builder_email}. In the meantime, <a href="https://joinstartup.app/jobs" style="color:#ff4d00">browse more roles →</a></p>
  </div>
</div>
</body></html>`,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
