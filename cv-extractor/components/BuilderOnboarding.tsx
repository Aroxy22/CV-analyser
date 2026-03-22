"use client";
import { useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ── Types ──────────────────────────────────────────────
interface Question {
  id: string;
  type: "textarea" | "radio";
  label: string;
  hint?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
}
interface Step {
  id: string;
  section: string;
  emoji: string;
  questions: Question[];
}
interface AISummary {
  headline: string;
  summary: string;
  strengths: string[];
  founderMatch: string;
  watchout: string;
  readinessScore: number;
}
interface Props {
  prefillEmail?: string;
  onComplete?: () => void;
}

// ── Steps config ───────────────────────────────────────
const STEPS: Step[] = [
  {
    id: "career_journey", section: "Career & Transitions", emoji: "🔍",
    questions: [
      { id: "career_walk", type: "textarea", label: "Walk us through your career so far", hint: "Include gaps, pivots, or breaks — what you did and what you learned", placeholder: "e.g. Started as a backend engineer, took a year off to build a side project..." },
      { id: "gap_reason",  type: "textarea", label: "If you took a break or made a non-linear move, what were you solving for?", hint: "No judgment — we want to understand the decision, not the gap", placeholder: "e.g. Wanted to explore building independently, needed time to recalibrate..." },
    ],
  },
  {
    id: "builder_identity", section: "Builder Identity", emoji: "⚙️",
    questions: [
      { id: "proudest_build", type: "textarea", label: "What's one thing you've built that you're proud of?", hint: "Shipped product, launched feature, ran experiment — walk us through it", placeholder: "e.g. Built a real-time notifications system that reduced support tickets by 40%..." },
      { id: "work_mode", type: "radio", label: "What's your default mode?", options: [
        { value: "zero_to_one", label: "Zero to one — I thrive in ambiguity and love building from scratch" },
        { value: "scaling",     label: "Scaling — I do best when there's something to grow and optimise" },
        { value: "both",        label: "Both — depends on the context and team" },
      ]},
      { id: "collaboration_style", type: "radio", label: "How do you typically start building?", options: [
        { value: "solo_first",         label: "Solo first — I prototype alone, then bring others in" },
        { value: "collab_early",       label: "Collaborators early — I think better with others from day one" },
        { value: "context_dependent",  label: "Depends on the problem" },
      ]},
    ],
  },
  {
    id: "startup_readiness", section: "Startup Readiness", emoji: "🚀",
    questions: [
      { id: "startup_experience", type: "radio", label: "Have you worked at a startup before?", options: [
        { value: "early_stage", label: "Yes — early stage (pre-seed / seed)" },
        { value: "growth_stage", label: "Yes — growth stage (Series A+)" },
        { value: "multiple",     label: "Yes — multiple stages" },
        { value: "no",           label: "No — but I'm ready" },
      ]},
      { id: "smallest_team", type: "radio", label: "What's the smallest team you've shipped something meaningful with?", options: [
        { value: "solo",      label: "Just me" },
        { value: "two_three", label: "2–3 people" },
        { value: "four_ten",  label: "4–10 people" },
        { value: "larger",    label: "Larger teams only" },
      ]},
      { id: "deadline_self", type: "radio", label: "Your relationship with deadlines when no one's enforcing them?", options: [
        { value: "self_driven",        label: "I set my own and stick to them" },
        { value: "need_accountability", label: "I work better with external accountability" },
        { value: "milestone_driven",   label: "I focus on milestones, not dates" },
      ]},
    ],
  },
  {
    id: "founder_fit", section: "Founder Fit", emoji: "🤝",
    questions: [
      { id: "founder_needs",  type: "textarea", label: "Working directly with a founder — what do you need from them?", hint: "Communication style, autonomy, feedback cadence", placeholder: "e.g. Clear problem framing but autonomy on the solution, weekly syncs..." },
      { id: "problem_space",  type: "textarea", label: "What problem spaces excite you — and which drain you?", hint: "Be honest — this helps us match you to the right founders", placeholder: "e.g. Excited by fintech infra and dev tools. Drain: enterprise SaaS..." },
    ],
  },
  {
    id: "self_awareness", section: "Self-Awareness", emoji: "🧠",
    questions: [
      { id: "working_style",    type: "textarea", label: "What do you wish your last team had known about how you work?", hint: "This goes straight to founders considering a trial with you", placeholder: "e.g. I need context before I can execute well..." },
      { id: "strengths_growth", type: "textarea", label: "Where are you strongest right now — and where are you actively growing?", hint: "Both matter equally", placeholder: "e.g. Strong: backend architecture. Growing: product sense..." },
    ],
  },
];

// ── Safe merge — only writes onboarding key, never CV columns ──
async function saveOnboarding(
  email: string,
  answers: Record<string, string>,
  summary: AISummary | null
) {
  // Fetch existing row to get current analysis_json
  const fetchRes = await fetch(
    `${SUPABASE_URL}/rest/v1/builders?email=eq.${encodeURIComponent(email)}&select=id,analysis_json`,
    { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
  );
  const rows = await fetchRes.json();

  const onboardingPayload = {
    answers,
    ai_summary: summary,
    completed_at: new Date().toISOString(),
  };

  if (rows.length > 0) {
    // EXISTING builder — merge onboarding key, preserve everything CV-derived
    const existing = rows[0].analysis_json || {};
    const merged = { ...existing, onboarding: onboardingPayload };
    await fetch(
      `${SUPABASE_URL}/rest/v1/builders?email=eq.${encodeURIComponent(email)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${SUPABASE_ANON}`,
          Prefer: "return=minimal",
        },
        // SAFE: only goal + analysis_json->onboarding
        // NOT writing: archetype, stage_bucket, summary, skills, domains, tools, years_exp
        body: JSON.stringify({
          goal: answers.problem_space || null,
          analysis_json: merged,
        }),
      }
    );
  } else {
    // NEW builder (edge case — no CV yet)
    await fetch(`${SUPABASE_URL}/rest/v1/builders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
      },
      body: JSON.stringify({
        email,
        goal: answers.problem_space || null,
        analysis_json: { onboarding: onboardingPayload },
        pool_status: "free",
        is_visible: false,
      }),
    });
  }
}

async function generateAISummary(answers: Record<string, string>): Promise<AISummary> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      messages: [{
        role: "user",
        content: `You are an expert startup talent analyst for joinstartup.app.

Builder answers:
CAREER: ${answers.career_walk || ""} | Break: ${answers.gap_reason || ""}
BUILDER: Built: ${answers.proudest_build || ""} | Mode: ${answers.work_mode || ""} | Collab: ${answers.collaboration_style || ""}
STARTUP: Exp: ${answers.startup_experience || ""} | Team: ${answers.smallest_team || ""} | Deadlines: ${answers.deadline_self || ""}
FOUNDER FIT: Needs: ${answers.founder_needs || ""} | Space: ${answers.problem_space || ""}
SELF: Style: ${answers.working_style || ""} | Strengths: ${answers.strengths_growth || ""}

Return ONLY valid JSON, no markdown:
{"headline":"6-10 word builder archetype","summary":"2-3 sentence founder-facing narrative","strengths":["tag1","tag2","tag3"],"founderMatch":"1 sentence best fit","watchout":"1 honest observation","readinessScore":7}`,
      }],
    }),
  });
  const data = await res.json();
  const text = data.content.map((i: { text?: string }) => i.text || "").join("");
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

// ── Component ──────────────────────────────────────────
export default function BuilderOnboarding({ prefillEmail = "", onComplete }: Props) {
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone]       = useState(false);
  const [aiSummary, setAiSummary]   = useState<AISummary | null>(null);
  const [loading, setLoading] = useState(false);
  const email = prefillEmail;

  const current = STEPS[step];
  const isComplete = current.questions.every(q => answers[q.id]?.trim());
  const isLast = step === STEPS.length - 1;
  const pct = ((step + 1) / STEPS.length) * 100;

  async function handleNext() {
    if (!isComplete) return;
    if (!isLast) { setStep(s => s + 1); return; }

    setDone(true);
    setLoading(true);
    try {
      const summary = await generateAISummary(answers);
      setAiSummary(summary);
      await saveOnboarding(email, answers, summary);
    } catch (e) {
      console.error("Onboarding save error:", e);
    } finally {
      setLoading(false);
    }
  }

  // ── Styles — match existing app palette ───────────────
  const s = {
    wrap:      { minHeight: "100vh", background: "#f5f2ee", color: "#1a1a1a", fontFamily: "'DM Sans', system-ui, sans-serif" } as React.CSSProperties,
    nav:       { padding: "14px 24px", borderBottom: "1.5px solid #e8e2da", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky" as const, top: 0, background: "#f5f2ee", zIndex: 10 },
    brand:     { fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#9a9088", letterSpacing: 1, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 } as React.CSSProperties,
    inner:     { maxWidth: 580, margin: "0 auto", padding: "48px 20px 100px" },
    card:      { background: "#fff", border: "1.5px solid #e8e2da", borderRadius: 14, padding: "24px", marginBottom: 16 },
    label:     { fontSize: 14, fontWeight: 600, color: "#1a1a1a", marginBottom: 4, lineHeight: 1.5, display: "block" } as React.CSSProperties,
    hint:      { fontSize: 12, color: "#9a9088", marginBottom: 10, lineHeight: 1.6 },
    textarea:  { width: "100%", background: "#f9f7f4", border: "1.5px solid #e8e2da", borderRadius: 10, padding: "12px 14px", color: "#1a1a1a", fontSize: 13, resize: "vertical" as const, lineHeight: 1.65, fontFamily: "inherit", minHeight: 90, boxSizing: "border-box" as const },
    radioOpt:  (sel: boolean) => ({ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${sel ? "#ff4d00" : "#e8e2da"}`, background: sel ? "#fff8f5" : "transparent", cursor: "pointer", transition: "all .15s", marginBottom: 8 }),
    radioDot:  (sel: boolean) => ({ width: 15, height: 15, borderRadius: "50%", border: `2px solid ${sel ? "#ff4d00" : "#ccc"}`, background: sel ? "#ff4d00" : "transparent", flexShrink: 0, transition: "all .15s" }),
    radioTxt:  (sel: boolean) => ({ fontSize: 13, color: sel ? "#1a1a1a" : "#6b6460", lineHeight: 1.45 }),
    btnPrim:   (active: boolean) => ({ width: "100%", padding: 16, borderRadius: 12, border: "none", background: active ? "#ff4d00" : "#e8e2da", color: active ? "#fff" : "#aaa", fontFamily: "inherit", fontWeight: 800, fontSize: 15, cursor: active ? "pointer" : "not-allowed", transition: "all .2s" }),
    btnGhost:  { background: "transparent", border: "1.5px solid #e8e2da", color: "#9a9088", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontFamily: "inherit" } as React.CSSProperties,
    progBar:   { height: 3, background: "#e8e2da", borderRadius: 4, overflow: "hidden", marginBottom: 32 },
    progFill:  { height: "100%", background: "#ff4d00", borderRadius: 4, width: `${pct}%`, transition: "width .5s cubic-bezier(.4,0,.2,1)" },
    secHead:   { display: "flex", alignItems: "center", gap: 12, marginBottom: 24 },
    secIcon:   { width: 40, height: 40, borderRadius: 10, background: "#fff8f5", border: "1.5px solid #ff4d0020", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
    tag:       { fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#9a9088", letterSpacing: 1, textTransform: "uppercase" as const },
    dots:      { display: "flex", justifyContent: "center", gap: 6, marginTop: 28 },
  };

  // ── Done screen ────────────────────────────────────────
  if (done) {
    return (
      <div style={s.wrap}>
        <nav style={s.nav}>
          <span style={s.brand}><span style={{ color: "#ff4d00" }}>◆</span> JOINSTARTUP</span>
        </nav>
        <div style={s.inner}>
          <div style={{ textAlign: "center", padding: "32px 0 28px" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>{loading ? "⚙️" : "🎉"}</div>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 32, letterSpacing: -1, marginBottom: 8 }}>
              {loading ? "Building your summary..." : "You're all set"}
            </h2>
            <p style={{ fontSize: 14, color: "#9a9088", lineHeight: 1.7 }}>
              {loading ? "Analysing your answers..." : "Your builder profile is complete. Taking you to your profile now."}
            </p>
          </div>

          {aiSummary && !loading && (
            <div style={{ ...s.card, borderColor: "#ff4d0020", borderLeftWidth: 4, borderLeftColor: "#ff4d00" }}>
              <div style={s.tag}>Your builder summary</div>
              <div style={{ fontWeight: 800, fontSize: 18, margin: "8px 0 10px", letterSpacing: -0.3 }}>{aiSummary.headline}</div>
              <p style={{ fontSize: 13, color: "#6b6460", lineHeight: 1.75, marginBottom: 14 }}>{aiSummary.summary}</p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {aiSummary.strengths.map((t, i) => (
                  <span key={i} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#fff8f5", border: "1px solid #ff4d0020", color: "#ff4d00", fontFamily: "'DM Mono',monospace" }}>{t}</span>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid #ff4d00", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#fff8f5" }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#ff4d00", lineHeight: 1 }}>{aiSummary.readinessScore}</span>
                  <span style={{ fontSize: 9, color: "#9a9088", fontFamily: "'DM Mono',monospace" }}>/10</span>
                </div>
                <div>
                  <div style={s.tag}>Startup readiness</div>
                  <div style={{ fontSize: 13, color: "#4a4540", lineHeight: 1.5 }}>{aiSummary.founderMatch}</div>
                </div>
              </div>

              {onComplete && (
                <button
                  onClick={onComplete}
                  style={{ ...s.btnPrim(true), marginTop: 20 }}
                >
                  Go to my profile →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Form screen ────────────────────────────────────────
  return (
    <div style={s.wrap}>
      <nav style={s.nav}>
        <span style={s.brand}><span style={{ color: "#ff4d00" }}>◆</span> JOINSTARTUP</span>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#c0b8b0", letterSpacing: 1 }}>
          {step + 1} / {STEPS.length}
        </span>
      </nav>

      <div style={s.inner}>
        <div style={s.progBar}><div style={s.progFill} /></div>

        <div style={s.secHead}>
          <div style={s.secIcon}>{current.emoji}</div>
          <div>
            <div style={s.tag}>Section {step + 1}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a", marginTop: 2 }}>{current.section}</div>
          </div>
        </div>

        <div style={s.card}>
          {current.questions.map((q, qi) => (
            <div key={q.id} style={{ marginBottom: qi < current.questions.length - 1 ? 28 : 0 }}>
              <label style={s.label}>{q.label}</label>
              {q.hint && <p style={s.hint}>{q.hint}</p>}

              {q.type === "textarea" && (
                <textarea
                  style={s.textarea}
                  rows={4}
                  placeholder={q.placeholder}
                  value={answers[q.id] || ""}
                  onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                />
              )}

              {q.type === "radio" && q.options?.map(opt => {
                const sel = answers[q.id] === opt.value;
                return (
                  <div key={opt.value} style={s.radioOpt(sel)} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.value }))}>
                    <div style={s.radioDot(sel)} />
                    <span style={s.radioTxt(sel)}>{opt.label}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {step > 0 && (
            <button style={{ ...s.btnGhost, width: 80, flexShrink: 0 }} onClick={() => setStep(s => s - 1)}>← Back</button>
          )}
          <button style={s.btnPrim(isComplete)} disabled={!isComplete} onClick={handleNext}>
            {isLast ? "Complete & get summary →" : "Next →"}
          </button>
        </div>

        <div style={s.dots}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              onClick={() => i < step && setStep(i)}
              style={{ height: 4, borderRadius: 4, width: i === step ? 20 : 4, background: i <= step ? "#ff4d00" : "#e8e2da", opacity: i < step ? 0.45 : 1, cursor: i < step ? "pointer" : "default", transition: "all .3s" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
