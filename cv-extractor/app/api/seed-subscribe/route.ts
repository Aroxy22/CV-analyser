// app/api/seed-subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_FN = "https://xsbsoevqqvnxmtxuytiu.supabase.co/functions/v1/send-seed-newsletter";
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${SUPABASE_FN}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data);
}
