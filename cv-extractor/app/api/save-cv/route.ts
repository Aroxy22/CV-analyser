import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { supabase } from "@/lib/supabase";
export async function POST(req: NextRequest) {
  try {
    const { filename, size } = await req.json();
    if (!filename) return NextResponse.json({ error: "filename required" }, { status: 400 });
    const { data, error } = await supabase.from("cvs").insert({ filename, size, uploaded_at: new Date().toISOString() }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: "Internal server error" }, { status: 500 }); }
}