import { NextRequest, NextResponse } from "next/server";

type Row = {
  file_name: string;
  archetype: string;
  seniority: string;
  salary_band: string;
  status: string;
};

export async function POST(req: NextRequest) {
  try {
    const { to, rows } = (await req.json()) as { to?: string; rows?: Row[] };

    if (!to || !to.includes("@")) {
      return NextResponse.json({ error: "Valid recipient email is required" }, { status: 400 });
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No shortlist rows found" }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ error: "Email service is not configured (missing RESEND_API_KEY)" }, { status: 500 });
    }

    const escapeHtml = (v: unknown) =>
      String(v ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const tableRows = rows
      .map(
        (r) => `<tr>
<td style="padding:8px;border-bottom:1px solid #f0ebe4">${escapeHtml(r.file_name)}</td>
<td style="padding:8px;border-bottom:1px solid #f0ebe4">${escapeHtml(r.archetype)}</td>
<td style="padding:8px;border-bottom:1px solid #f0ebe4">${escapeHtml(r.seniority)}</td>
<td style="padding:8px;border-bottom:1px solid #f0ebe4">${escapeHtml(r.salary_band)}</td>
<td style="padding:8px;border-bottom:1px solid #f0ebe4">${escapeHtml(r.status)}</td>
</tr>`,
      )
      .join("");

    const html = `
<div style="font-family:DM Sans,Arial,sans-serif;color:#1a1a1a;line-height:1.5">
  <h2 style="margin:0 0 12px">Your recruiter shortlist</h2>
  <p style="margin:0 0 16px;color:#6b6460">Here are your processed CV results from JoinStartup.</p>
  <table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead>
      <tr style="text-align:left;background:#faf7f2">
        <th style="padding:8px;border-bottom:1px solid #e8e2da">File</th>
        <th style="padding:8px;border-bottom:1px solid #e8e2da">Archetype</th>
        <th style="padding:8px;border-bottom:1px solid #e8e2da">Seniority</th>
        <th style="padding:8px;border-bottom:1px solid #e8e2da">Salary band</th>
        <th style="padding:8px;border-bottom:1px solid #e8e2da">Status</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>
</div>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "JoinStartup <hello@joinstartup.app>",
        to: [to],
        subject: "Your recruiter shortlist",
        html,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      return NextResponse.json({ error: `Failed to send email: ${errText}` }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
