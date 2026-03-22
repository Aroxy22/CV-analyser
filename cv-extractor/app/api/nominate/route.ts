import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = "https://xsbsoevqqvnxmtxuytiu.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nominator_name, nominator_email,
      nominee_name, nominee_email,
      relationship, suggested_archetype, evidence,
    } = body;

    if (!nominee_name || !nominee_email || !relationship || !suggested_archetype || !evidence) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Insert using service role key — bypasses RLS safely server-side
    const res = await fetch(`${SUPABASE_URL}/rest/v1/nominations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        nominator_name,
        nominator_email,
        nominee_name,
        nominee_email,
        relationship,
        suggested_archetype,
        evidence,
        status: "pending",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[nominate] Supabase error:", err);
      return NextResponse.json({ error: "Failed to save nomination" }, { status: 500 });
    }

    const [row] = await res.json();

    // Fire nomination email — non-blocking
    fetch(`${SUPABASE_URL}/functions/v1/send-nomination-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ record: row }),
    }).catch(e => console.error("[nominate] email error:", e));

    return NextResponse.json({ ok: true, token: row?.token });

  } catch (error) {
    console.error("[nominate] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
