// app/api/get-nomination/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = "https://xsbsoevqqvnxmtxuytiu.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/nominations?token=eq.${token}&select=id,nominator_name,nominee_name,nominee_email,suggested_archetype,evidence,relationship,status,token&limit=1`,
    { headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` } }
  );
  const rows = await res.json();
  if (!rows?.length) return NextResponse.json({ nomination: null });
  return NextResponse.json({ nomination: rows[0] });
}
