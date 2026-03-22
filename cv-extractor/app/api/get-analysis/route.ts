import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { supabase } from "@/lib/supabase";
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cvId = searchParams.get("cv_id");
    if (!cvId) return NextResponse.json({ error: "cv_id required" }, { status: 400 });
    const { data, error } = await supabase.from("cv_analyses").select("*").eq("cv_id", cvId).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: "Internal server error" }, { status: 500 }); }
}