// app/api/lookup-builder/route.ts
// Looks up a builder by email for the "Apply with Profile" flow
// Uses service role key server-side — email never exposed to frontend

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = "https://xsbsoevqqvnxmtxuytiu.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/builders?email=eq.${encodeURIComponent(email)}&pool_status=eq.paid&select=name,archetype,stage_bucket,profile_token&limit=1`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    if (!res.ok) return NextResponse.json({ error: "DB error" }, { status: 500 });
    const rows = await res.json();

    if (!rows?.length) {
      return NextResponse.json({ found: false });
    }

    // Return profile info but NOT the email — frontend doesn't need it
    const { name, archetype, stage_bucket, profile_token } = rows[0];
    return NextResponse.json({ found: true, name, archetype, stage_bucket, profile_token });

  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
