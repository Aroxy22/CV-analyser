// app/api/join-pool/route.ts
// ONLY creates a Razorpay order — does NOT touch builders table
// Builder row is created in confirm-payment AFTER payment is verified
import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL  = "https://xsbsoevqqvnxmtxuytiu.supabase.co";
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzYnNvZXZxcXZueG10eHV5dGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwOTkwNzcsImV4cCI6MjA4ODY3NTA3N30.I7JnlCmHafoFowh6TqepNR4YXxTL7pZdCFJHGmVFuVE";
const RAZORPAY_KEY_ID     = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const POOL_FEE_INR = 499;

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      // analysis data — passed through to confirm-payment via order notes
      analysis, archetype, stageBucket, goal, skills, summary,
      experience, profileUrl, name, currentTitle, currentCompany,
      yearsExp, domains, tools, companies,
      // links
      cvId, cvAnalysisId,
    } = await req.json();

    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    // 1 — check if already paid/nominated (don't double-charge)
    const check = await fetch(
      `${SUPABASE_URL}/rest/v1/builders?email=eq.${encodeURIComponent(email)}&select=pool_status`,
      { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
    );
    const existing = await check.json();
    if (existing?.[0]?.pool_status === "paid" || existing?.[0]?.pool_status === "nominated") {
      return NextResponse.json({ already_member: true, pool_status: existing[0].pool_status });
    }

    // 2 — dev mode (no Razorpay keys) — pass all data through for confirm-payment
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json({
        dev_mode: true,
        order_id: "dev_order_" + Date.now(),
        amount: POOL_FEE_INR * 100,
        currency: "INR",
        key_id: "rzp_test_placeholder",
        // pass builder data back so frontend can send to confirm-payment
        builderPayload: {
          email, analysis, archetype, stageBucket, goal, skills, summary,
          experience, profileUrl, name, currentTitle, currentCompany,
          yearsExp, domains, tools, companies, cvId, cvAnalysisId,
        },
      });
    }

    // 3 — create Razorpay order
    // Store builder data in notes (max 512 chars each) so confirm-payment can use it
    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64"),
      },
      body: JSON.stringify({
        amount: POOL_FEE_INR * 100,
        currency: "INR",
        receipt: `builder_${Date.now()}`,
        notes: {
          email,
          archetype:    archetype || "",
          stage_bucket: stageBucket || "",
          name:         name || "",
          cv_id:        cvId || "",
          cv_analysis_id: cvAnalysisId || "",
        },
      }),
    });

    if (!orderRes.ok) {
      const err = await orderRes.text();
      return NextResponse.json({ error: `Razorpay error: ${err}` }, { status: 500 });
    }

    const order = await orderRes.json();

    return NextResponse.json({
      order_id:   order.id,
      amount:     order.amount,
      currency:   order.currency,
      key_id:     RAZORPAY_KEY_ID,
      // pass full builder payload back to frontend to forward to confirm-payment
      builderPayload: {
        email, analysis, archetype, stageBucket, goal, skills, summary,
        experience, profileUrl, name, currentTitle, currentCompany,
        yearsExp, domains, tools, companies, cvId, cvAnalysisId,
      },
    });

  } catch (e) {
    console.error("[join-pool] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
