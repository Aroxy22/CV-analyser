import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const supabaseUrl = process.env.SUPABASE_URL || "https://xsbsoevqqvnxmtxuytiu.supabase.co";
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseKey) {
      console.error("[extract-deep proxy] Missing SUPABASE_ANON_KEY");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const res = await fetch(
      `${supabaseUrl}/functions/v1/extract-deep`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });

  } catch (error) {
    console.error("[extract-deep proxy] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
