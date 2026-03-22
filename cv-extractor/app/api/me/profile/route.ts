import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token || !SUPABASE_URL || !SUPABASE_ANON) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user?.email) {
    return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 401 });
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/builders?email=eq.${encodeURIComponent(user.email)}&select=profile_token,pool_status`,
    { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
  );
  const rows = await res.json();
  const builder = rows?.[0];
  if (!builder?.profile_token || (builder.pool_status !== "paid" && builder.pool_status !== "nominated")) {
    return NextResponse.json({ ok: true, hasProfile: false });
  }
  return NextResponse.json({ ok: true, hasProfile: true, profileToken: builder.profile_token });
}
