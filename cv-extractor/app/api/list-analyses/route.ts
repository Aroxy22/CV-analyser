import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { supabase } from "@/lib/supabase";
export async function GET() {
  try {
    const { data, error } = await supabase.from("cv_analyses")
      .select("id, cv_id, candidate_name, candidate_title, startup_fit_score, startup_archetype, analyzed_at, candidate_goal, goal_fit_level, stage_bucket")
      .order("analyzed_at", { ascending: false }).limit(50);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: "Internal server error" }, { status: 500 }); }
}