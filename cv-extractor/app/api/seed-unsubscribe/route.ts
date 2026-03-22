// app/api/seed-unsubscribe/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = "https://xsbsoevqqvnxmtxuytiu.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect("https://joinstartup.app");

  await fetch(
    `${SUPABASE_URL}/rest/v1/seed_subscribers?unsubscribe_token=eq.${token}`,
    {
      method: "PATCH",
      headers: {
        apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json", Prefer: "return=minimal",
      },
      body: JSON.stringify({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() }),
    }
  );

  // Redirect to a simple unsubscribed confirmation page
  return NextResponse.redirect("https://joinstartup.app/unsubscribed");
}
