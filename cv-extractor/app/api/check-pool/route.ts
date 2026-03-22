// app/api/check-pool/route.ts
import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://xsbsoevqqvnxmtxuytiu.supabase.co";
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzYnNvZXZxcXZueG10eHV5dGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwOTkwNzcsImV4cCI6MjA4ODY3NTA3N30.I7JnlCmHafoFowh6TqepNR4YXxTL7pZdCFJHGmVFuVE";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ pool_status: "none" });

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/builders?email=eq.${encodeURIComponent(email)}&select=pool_status,is_visible,archetype,stage_bucket`,
      { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
    );
    const rows = await res.json();
    if (!rows?.length) return NextResponse.json({ pool_status: "none" });

    return NextResponse.json({
      pool_status: rows[0].pool_status, // free | paid | nominated
      is_visible: rows[0].is_visible,
      archetype: rows[0].archetype,
      stage_bucket: rows[0].stage_bucket,
    });
  } catch {
    return NextResponse.json({ pool_status: "none" });
  }
}
