import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { supabase } from "@/lib/supabase";
export async function POST(req: NextRequest) {
  try {
    const { cv_id, analysis, goal } = await req.json();
    if (!cv_id || !analysis) return NextResponse.json({ error: "cv_id and analysis required" }, { status: 400 });
    const { data, error } = await supabase.from("cv_analyses").upsert({
      cv_id, candidate_name: analysis.candidateName || null, candidate_title: analysis.candidateTitle || null,
      candidate_email: analysis.candidateEmail || null, startup_fit_score: analysis.startupFitScore || null,
      startup_archetype: analysis.startupArchetype || null, analysis_json: analysis,
      candidate_goal: goal || null, goal_fit_level: analysis.goalFit?.level || null,
      roadmap_json: analysis.roadmap || null, stage_bucket: analysis.stageBucket || null,
      analyzed_at: new Date().toISOString(),
    }, { onConflict: "cv_id" }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: "Internal server error" }, { status: 500 }); }
}