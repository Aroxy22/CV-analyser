// app/api/confirm-payment/route.ts
// Verifies payment then CREATES builder row (not upsert — only paid builders exist)
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const SUPABASE_URL  = "https://xsbsoevqqvnxmtxuytiu.supabase.co";
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzYnNvZXZxcXZueG10eHV5dGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwOTkwNzcsImV4cCI6MjA4ODY3NTA3N30.I7JnlCmHafoFowh6TqepNR4YXxTL7pZdCFJHGmVFuVE";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

const sb = (path: string, opts: RequestInit = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...opts,
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(opts.headers || {}),
    },
  });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      dev_mode,
      // full builder payload from join-pool
      builderPayload,
    } = body;

    const {
      email, analysis, archetype, stageBucket, goal, skills, summary,
      experience, profileUrl, name, currentTitle, currentCompany,
      yearsExp, domains, tools, companies, cvId, cvAnalysisId,
    } = builderPayload || {};

    console.log("[confirm-payment] called — email:", email, "dev_mode:", dev_mode,
                "cvId:", cvId, "cvAnalysisId:", cvAnalysisId);

    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

    // 1 — verify Razorpay signature (skip in dev)
    if (!dev_mode && RAZORPAY_KEY_SECRET) {
      const expected = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
      if (expected !== razorpay_signature)
        return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // 2 — check if builder already exists (double payment protection)
    const existingRes = await sb(`/builders?email=eq.${encodeURIComponent(email)}&select=id,pool_status,profile_token`);
    const existing = await existingRes.json();
    const alreadyPaid = existing?.[0]?.pool_status === "paid" || existing?.[0]?.pool_status === "nominated";

    if (alreadyPaid) {
      console.log("[confirm-payment] already paid — returning existing token");
      return NextResponse.json({
        success: true,
        pool_status: "paid",
        profile_token: existing[0].profile_token,
      });
    }

    // 3 — record payment
    const paymentRes = await sb("/payments", {
      method: "POST",
      body: JSON.stringify({
        email,
        persona:             "builder",
        plan:                "pool_access",
        amount_inr:          499,
        status:              "paid",
        razorpay_order_id:   razorpay_order_id || "dev",
        razorpay_payment_id: razorpay_payment_id || "dev",
        paid_at:             new Date().toISOString(),
      }),
    });
    const paymentRows = await paymentRes.json();
    const paymentId = Array.isArray(paymentRows) ? paymentRows[0]?.id : null;
    console.log("[confirm-payment] payment recorded:", paymentId);

    // 4 — CREATE builder row (only paid builders exist in this table)
    const builderData: Record<string, unknown> = {
      email,
      name:            name || null,
      archetype:       archetype || "zero-to-one",
      stage_bucket:    stageBucket || "0→1",
      goal:            goal || null,
      skills:          skills || [],
      domains:         domains || [],
      tools:           tools || [],
      companies:       companies || [],
      summary:         summary || "",
      experience:      experience || "",
      profile_url:     profileUrl || null,
      analysis_json:   analysis || {},
      roadmap_json:    analysis?.nextMoves || [],
      goal_fit_level:  analysis?.goalFit?.level || null,
      current_title:   currentTitle || null,
      current_company: currentCompany || null,
      years_exp:       yearsExp || null,
      pool_status:     "paid",
      is_visible:      true,
      pool_joined_at:  new Date().toISOString(),
      payment_id:      paymentId || null,
    };

    // Link CV and analysis if available
    if (cvId) builderData.cv_id = cvId;
    if (cvAnalysisId) builderData.cv_analysis_id = cvAnalysisId;

    const builderRes = await sb("/builders", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(builderData),
    });

    const builderRows = await builderRes.json();
    const builder = Array.isArray(builderRows) ? builderRows[0] : null;

    console.log("[confirm-payment] builder created:", builder?.id, "token:", builder?.profile_token,
                "cv_id:", builder?.cv_id, "cv_analysis_id:", builder?.cv_analysis_id);

    if (!builder) {
      console.error("[confirm-payment] builder insert failed — response:", JSON.stringify(builderRows));
      return NextResponse.json({ success: true, pool_status: "paid", profile_token: null });
    }

    const profileToken = builder.profile_token;

    // 5 — update cv_analyses to link back to builder if we have the id
    if (cvAnalysisId && builder.id) {
      sb(`/cv_analyses?id=eq.${cvAnalysisId}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ builder_id: builder.id }),
      }).catch(e => console.error("[confirm-payment] cv_analyses link error:", e));
    }

    // 6 — send profile email (fire and forget)
    fetch(`${SUPABASE_URL}/functions/v1/send-profile-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_ANON}` },
      body: JSON.stringify({
        email,
        name:          builder.name || null,
        archetype_id:  builder.archetype,
        stage_bucket:  builder.stage_bucket,
        profile_token: profileToken,
        goal:          builder.goal,
      }),
    })
      .then(r => r.json())
      .then(d => console.log("[confirm-payment] email result:", JSON.stringify(d)))
      .catch(e => console.error("[confirm-payment] email failed:", e));

    // 7 — welcome notification
    if (builder.id) {
      sb("/builder_notifications", {
        method: "POST",
        body: JSON.stringify({
          builder_id: builder.id,
          type:       "welcome",
          message:    "You're in the builder pool. Founders and recruiters can now find you.",
        }),
      }).catch(() => {});
    }

    console.log("[confirm-payment] done — profile_token:", profileToken);

    return NextResponse.json({
      success:       true,
      pool_status:   "paid",
      profile_token: profileToken || null,
    });

  } catch (e) {
    console.error("[confirm-payment] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
