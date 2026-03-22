import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = "https://xsbsoevqqvnxmtxuytiu.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

const headers = {
  "apikey": SUPABASE_SERVICE_KEY,
  "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
  "Content-Type": "application/json",
};

// GET — list all jobs for admin
export async function GET() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/startup_jobs?order=created_at.desc&limit=100`,
      { headers }
    );
    if (!res.ok) return NextResponse.json({ error: "Failed" }, { status: 500 });
    const jobs = await res.json();
    return NextResponse.json({ ok: true, jobs });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — approve / reject / pause / feature
export async function POST(req: NextRequest) {
  try {
    const { id, action, value } = await req.json();
    if (!id || !action) return NextResponse.json({ error: "Missing params" }, { status: 400 });

    // Get the job first
    const jobRes = await fetch(
      `${SUPABASE_URL}/rest/v1/startup_jobs?id=eq.${id}&select=*&limit=1`,
      { headers }
    );
    const [job] = await jobRes.json();
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    let patch: Record<string, unknown> = {};

    if (action === "approve") {
      patch = { status: "active" };
    } else if (action === "reject") {
      patch = { status: "paused" };
    } else if (action === "pause") {
      patch = { status: "paused" };
    } else if (action === "feature") {
      patch = { featured: value ?? true };
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    // Update the job
    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/startup_jobs?id=eq.${id}`,
      { method: "PATCH", headers: { ...headers, Prefer: "return=minimal" }, body: JSON.stringify(patch) }
    );
    if (!updateRes.ok) return NextResponse.json({ error: "Update failed" }, { status: 500 });

    // Send emails for approve/reject
    if (RESEND_API_KEY && job.contact_email) {
      if (action === "approve") {
        // Notify poster their job is live
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "JoinStartup <hello@joinstartup.app>",
            to: [job.contact_email],
            subject: `Your role is live — ${job.title} at ${job.company}`,
            html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;background:#f5f2ee;padding:40px 20px;color:#1a1a1a">
<div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e8e2da;border-radius:14px;padding:32px;border-top:3px solid #10b981">
  <div style="font-family:monospace;font-size:10px;color:#9a9088;letter-spacing:2px;margin-bottom:16px">◆ JOINSTARTUP.APP</div>
  <h2 style="font-size:20px;font-weight:900;margin-bottom:8px;color:#1a1a1a">Your role is live.</h2>
  <p style="font-size:14px;color:#6b6460;line-height:1.75;margin-bottom:20px">
    <strong style="color:#1a1a1a">${job.title}</strong> at <strong style="color:#1a1a1a">${job.company}</strong> is now live on JoinStartup and being matched to builders by archetype.
  </p>
  <a href="https://joinstartup.app/jobs" style="display:inline-block;padding:12px 24px;background:#10b981;color:#fff;border-radius:8px;font-weight:700;font-size:13px;text-decoration:none">View on JoinStartup →</a>
  <p style="font-size:12px;color:#9a9088;margin-top:20px">Your listing expires in 60 days. Reply to this email to extend or edit.</p>
</div></body></html>`
          }),
        }).catch(() => {});

        // Notify matching builders in pool
        await notifyMatchingBuilders(job);

      } else if (action === "reject") {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "JoinStartup <hello@joinstartup.app>",
            to: [job.contact_email],
            subject: `Re: Your job posting — ${job.title} at ${job.company}`,
            html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;background:#f5f2ee;padding:40px 20px;color:#1a1a1a">
<div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e8e2da;border-radius:14px;padding:32px;border-top:3px solid #e0dbd4">
  <div style="font-family:monospace;font-size:10px;color:#9a9088;letter-spacing:2px;margin-bottom:16px">◆ JOINSTARTUP.APP</div>
  <h2 style="font-size:20px;font-weight:900;margin-bottom:8px">We couldn't publish your listing.</h2>
  <p style="font-size:14px;color:#6b6460;line-height:1.75;margin-bottom:20px">
    Your role <strong style="color:#1a1a1a">${job.title}</strong> at <strong style="color:#1a1a1a">${job.company}</strong> didn't meet our listing guidelines. 
    Reply to this email and we'll help you resubmit — it's usually a quick fix.
  </p>
  <p style="font-size:13px;color:#9a9088;line-height:1.7">Common reasons: description too short, missing apply URL, or role not relevant for the India startup ecosystem.</p>
</div></body></html>`
          }),
        }).catch(() => {});
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function notifyMatchingBuilders(job: Record<string, unknown>) {
  if (!RESEND_API_KEY) return;

  try {
    // Get builders whose archetype matches this job
    const archetypes = (job.archetype_fit as string[]) || [];
    if (archetypes.length === 0) return;

    // Fetch matching builders from pool
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/builders?pool_status=eq.paid&is_visible=eq.true&select=email,name,archetype,stage_bucket`,
      { headers }
    );
    if (!res.ok) return;
    const builders: Array<{ email: string; name: string | null; archetype: string; stage_bucket: string }> = await res.json();

    const matching = builders.filter(b => archetypes.includes(b.archetype));
    if (matching.length === 0) return;

    const ARCHETYPE_NAMES: Record<string, string> = {
      "zero-to-one": "Zero-to-One Builder", "systems-architect": "Systems Architect",
      "growth-hacker": "Growth Hacker", "founding-generalist": "Founding Generalist",
      "product-intuitive": "Product Intuitive", "operator": "The Operator",
      "deep-tech": "Deep Tech Builder", "community-builder": "Community Builder",
      "revenue-animal": "Revenue Animal", "brand-builder": "Brand Builder",
      "data-whisperer": "Data Whisperer", "market-maker": "Market Maker",
      "finance-builder": "Finance Builder", "pivot-survivor": "Pivot Survivor",
      "india-stack": "India Stack Expert", "global-translator": "Global→India Translator",
    };

    // Send one email per matching builder
    for (const builder of matching) {
      const firstName = builder.name ? builder.name.split(" ")[0] : "there";
      const archetypeName = ARCHETYPE_NAMES[builder.archetype] || builder.archetype;
      
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "JoinStartup <hello@joinstartup.app>",
          to: [builder.email],
          subject: `New role for ${archetypeName}s — ${job.title as string} at ${job.company as string}`,
          html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;background:#f5f2ee;padding:40px 20px;color:#1a1a1a">
<div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e8e2da;border-radius:14px;overflow:hidden">
  <div style="height:3px;background:#ff4d00"></div>
  <div style="padding:32px">
    <div style="font-family:monospace;font-size:10px;color:#9a9088;letter-spacing:2px;margin-bottom:16px">◆ NEW ROLE MATCH</div>
    <h2 style="font-size:20px;font-weight:900;margin-bottom:6px;color:#1a1a1a">Hey ${firstName} — a new role just matched your archetype.</h2>
    <p style="font-family:monospace;font-size:11px;color:#9a9088;margin-bottom:24px">${archetypeName} · ${builder.stage_bucket}</p>
    
    <div style="background:#f5f2ee;border:1px solid #e8e2da;border-radius:10px;padding:20px;margin-bottom:24px">
      <div style="font-weight:900;font-size:17px;color:#1a1a1a;margin-bottom:4px">${job.title as string}</div>
      <div style="font-family:monospace;font-size:11px;color:#9a9088;margin-bottom:12px">${job.company as string} · ${(job.stage as string || "").replace(/-/g, " ")}</div>
      ${job.equity ? `<div style="display:inline-block;padding:3px 10px;background:#6366f112;border:1px solid #6366f125;border-radius:20px;font-family:monospace;font-size:10px;color:#6366f1;margin-right:6px">${job.equity as string} equity</div>` : ""}
      ${job.salary ? `<div style="display:inline-block;padding:3px 10px;background:#10b98112;border:1px solid #10b98125;border-radius:20px;font-family:monospace;font-size:10px;color:#10b981">${job.salary as string}</div>` : ""}
      <p style="font-size:13px;color:#6b6460;line-height:1.7;margin-top:12px">${(job.description as string || "").slice(0, 200)}...</p>
    </div>
    
    <a href="${job.apply_url as string}" style="display:inline-block;padding:13px 28px;background:#ff4d00;color:#fff;border-radius:10px;font-weight:800;font-size:14px;text-decoration:none;margin-right:10px">Apply →</a>
    <a href="https://joinstartup.app/jobs" style="display:inline-block;padding:13px 20px;border:1.5px solid #e0dbd4;border-radius:10px;font-weight:600;font-size:13px;text-decoration:none;color:#6b6460">See all roles</a>
    
    <p style="font-size:11px;color:#9a9088;margin-top:24px;line-height:1.6">You're receiving this because you're in the JoinStartup builder pool as a ${archetypeName}. <a href="https://joinstartup.app/profile/access" style="color:#9a9088">Manage your profile →</a></p>
  </div>
</div></body></html>`
        }),
      }).catch(() => {});
    }

    console.log(`[admin/jobs] Notified ${matching.length} builders for job ${job.id}`);
  } catch (e) {
    console.error("[admin/jobs] Builder notification error:", e);
  }
}
