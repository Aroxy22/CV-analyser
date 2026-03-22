import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { supabase } from "@/lib/supabase";
export async function POST(req: NextRequest) {
  try {
    const { cv_id, jobs } = await req.json();
    if (!cv_id || !jobs) return NextResponse.json({ error: "cv_id and jobs required" }, { status: 400 });
    const { data, error } = await supabase.from("cv_analyses").update({ analysis_json: { jobs } }).eq("cv_id", cv_id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: "Internal server error" }, { status: 500 }); }
}