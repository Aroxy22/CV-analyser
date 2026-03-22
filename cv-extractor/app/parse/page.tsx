"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const QUESTIONS = [
  {
    id: "role",
    label: "What kind of work do you do?",
    placeholder: "e.g. Full-stack engineer, 4 years at SaaS startups. Built payment systems and internal tools.",
  },
  {
    id: "goal",
    label: "What are you looking for right now?",
    placeholder: "e.g. Founding engineer role at a seed-stage B2B startup in Bangalore. Open to equity-heavy comp.",
  },
  {
    id: "proud",
    label: "What's the most impressive thing you've shipped?",
    placeholder: "e.g. Led migration of legacy monolith to microservices — cut infra costs by 40%, zero downtime.",
  },
  {
    id: "gap",
    label: "What's the one gap you know you have?",
    placeholder: "e.g. I've never led a team larger than 3 people. Strong IC, still developing as a manager.",
  },
  {
    id: "context",
    label: "Anything else a founder should know?",
    placeholder: "e.g. IIT Bombay grad, previously at Razorpay. Based in Pune but open to relocate to Bangalore.",
  },
];

type Analysis = {
  summary?: string;
  experience?: string;
  archetype?: string;
  archetypeReason?: string;
  stageBucket?: string;
  skills?: string[];
  goalFit?: {
    level?: string;
    verdict?: string;
    matches?: string[];
    gaps?: string[];
  };
  founderView?: {
    headline?: string;
    bestFitFor?: string;
    whyHire?: string[];
    watchOut?: string[];
  };
  recruiterView?: {
    seniorityLabel?: string;
    salaryBand?: string;
    keywordsToMatch?: string[];
  };
  roadmap?: {
    primaryGap?: string;
    phases?: Array<{
      label?: string;
      focus?: string;
      actions?: Array<{ action?: string; why?: string; resource?: { name?: string; url?: string } }>;
    }>;
  };
};

const ARCHETYPES: Record<string, { name: string; emoji: string; color: string }> = {
  "zero-to-one":         { name: "Zero-to-One Builder",     emoji: "🔥", color: "#ff4d00" },
  "systems-architect":   { name: "Systems Architect",        emoji: "🏗️", color: "#6366f1" },
  "growth-hacker":       { name: "Growth Hacker",            emoji: "📈", color: "#10b981" },
  "founding-generalist": { name: "Founding Generalist",      emoji: "⚡", color: "#f59e0b" },
  "product-intuitive":   { name: "Product Intuitive",        emoji: "🎯", color: "#ec4899" },
  "operator":            { name: "The Operator",             emoji: "⚙️", color: "#8b5cf6" },
  "deep-tech":           { name: "Deep Tech Builder",        emoji: "🧠", color: "#0ea5e9" },
  "community-builder":   { name: "Community Builder",        emoji: "🤝", color: "#14b8a6" },
  "revenue-animal":      { name: "Revenue Animal",           emoji: "💰", color: "#ef4444" },
  "brand-builder":       { name: "Brand Builder",            emoji: "🎨", color: "#f97316" },
  "data-whisperer":      { name: "Data Whisperer",           emoji: "📊", color: "#a3e635" },
  "market-maker":        { name: "Market Maker",             emoji: "🌍", color: "#2dd4bf" },
  "finance-builder":     { name: "Finance Builder",          emoji: "💸", color: "#fbbf24" },
  "pivot-survivor":      { name: "Pivot Survivor",           emoji: "🔄", color: "#94a3b8" },
  "india-stack":         { name: "India Stack Expert",       emoji: "🏭", color: "#4ade80" },
  "global-translator":   { name: "Global→India Translator",  emoji: "🌐", color: "#818cf8" },
};

function ParsePathInner() {
  const params = useSearchParams();
  const router = useRouter();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [phase, setPhase] = useState<"questions" | "loading" | "result">("questions");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const [email, setEmail] = useState(params.get("email") || "");

  const currentQ = QUESTIONS[currentStep];
  const currentAnswer = answers[currentQ?.id] || "";
  const progress = ((currentStep) / QUESTIONS.length) * 100;

  const handleNext = () => {
    if (!currentAnswer.trim()) return;
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      runAnalysis();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const runAnalysis = async () => {
    setPhase("loading");
    setError("");

    const goal = [
      answers.role,
      answers.goal,
      answers.proud ? `Key achievement: ${answers.proud}` : "",
      answers.gap ? `Known gap: ${answers.gap}` : "",
      answers.context,
    ].filter(Boolean).join(". ");

    try {
      // Fast pass first
      const fastRes = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, questionsMode: true }),
      });
      const fastParsed = await fastRes.json();

      // Deep pass
      const deepRes = await fetch("/api/extract-deep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          questionsMode: true,
          fastResult: fastParsed,
        }),
      });
      const deepParsed = await deepRes.json();

      const merged: Analysis = {
        ...fastParsed,
        summary:         deepParsed.summary         ?? fastParsed.summary,
        experience:      deepParsed.experience      ?? fastParsed.experience,
        archetypeReason: deepParsed.archetypeReason ?? fastParsed.archetypeReason,
        goalFit: {
          ...fastParsed.goalFit,
          verdict: deepParsed.goalFit?.verdict ?? fastParsed.goalFit?.verdict,
        },
        founderView:  deepParsed.founderView  ?? fastParsed.founderView,
        recruiterView: deepParsed.recruiterView ?? fastParsed.recruiterView,
        roadmap:      deepParsed.roadmap      ?? fastParsed.roadmap,
      };

      setAnalysis(merged);
      setPhase("result");

      // Fire analysis email if email provided
      if (email) {
        fetch("https://xsbsoevqqvnxmtxuytiu.supabase.co/functions/v1/send-analysis-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name: undefined,
            archetype: merged.archetype,
            stage_bucket: merged.stageBucket,
            summary: merged.summary,
            skills: merged.skills,
            goal,
            founderView: merged.founderView,
            recruiterView: merged.recruiterView,
            goalFit: merged.goalFit,
          }),
        }).catch(() => {});
      }

    } catch {
      setError("Something went wrong — please try again.");
      setPhase("questions");
    }
  };

  const goToAnalyse = () => {
    const goal = [answers.role, answers.goal, answers.proud, answers.gap, answers.context]
      .filter(Boolean).join(". ");
    const params = new URLSearchParams({ fromParsePath: "true" });
    if (email) params.set("email", email);
    router.push(`/analyse?${params.toString()}`);
  };

  const arch = analysis?.archetype ? ARCHETYPES[analysis.archetype] : null;

  // ── LOADING ──
  if (phase === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f2ee", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ width: 32, height: 32, border: "2.5px solid #e0dbd4", borderTopColor: "#ff4d00", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#9a9088", letterSpacing: 2 }}>READING YOUR PROFILE…</div>
      </div>
    );
  }

  // ── RESULT ──
  if (phase === "result" && analysis) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f2ee", fontFamily: "'DM Sans',system-ui,sans-serif", color: "#1a1a1a" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&family=DM+Mono:wght@400;500&display=swap');
          *{box-sizing:border-box;margin:0;padding:0}
          .pill{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-family:'DM Mono',monospace;margin:3px 3px 0 0}
          .card{background:#fff;border:1px solid #e8e2da;border-radius:14px;padding:24px 28px;margin-bottom:14px}
          .label{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;color:#9a9088;margin-bottom:8px}
        `}</style>

        {/* Nav */}
        <nav style={{ borderBottom: "1px solid #e8e2da", padding: "14px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f5f2ee", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#ff4d00" }}>◆</span>
            <a href="/" style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 12, letterSpacing: 1, color: "#1a1a1a", textDecoration: "none" }}>JOINSTARTUP.APP</a>
          </div>
          <button onClick={goToAnalyse} style={{ padding: "8px 18px", background: "#ff4d00", color: "#fff", border: "none", borderRadius: 6, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Join Builder Pool →
          </button>
        </nav>

        <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 24px 80px" }}>

          {/* Archetype header */}
          {arch && (
            <div className="card" style={{ position: "relative", overflow: "hidden", marginBottom: 14 }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: arch.color }} />
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${arch.color}15`, border: `1px solid ${arch.color}30`, borderRadius: 20, padding: "3px 12px", fontFamily: "'DM Mono',monospace", fontSize: 10, color: arch.color, letterSpacing: 1, marginBottom: 12 }}>
                {arch.emoji} {analysis.archetype?.toUpperCase().replace(/-/g, " ")}
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5, marginBottom: 4 }}>
                You&apos;re a <span style={{ color: arch.color }}>{arch.name}</span>
              </h1>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#9a9088", marginBottom: analysis.archetypeReason ? 12 : 0 }}>
                {analysis.stageBucket}
              </div>
              {analysis.archetypeReason && (
                <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7, borderTop: "1px solid #f0ebe4", paddingTop: 12, marginTop: 4 }}>{analysis.archetypeReason}</p>
              )}
            </div>
          )}

          {/* Summary */}
          {analysis.summary && (
            <div className="card">
              <div className="label">SUMMARY</div>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: "#333" }}>{analysis.summary}</p>
            </div>
          )}

          {/* Skills */}
          {analysis.skills && analysis.skills.length > 0 && (
            <div className="card">
              <div className="label">SKILLS</div>
              {analysis.skills.map((s, i) => (
                <span key={i} className="pill" style={{ background: `${arch?.color || "#ff4d00"}12`, color: arch?.color || "#ff4d00", border: `1px solid ${arch?.color || "#ff4d00"}25` }}>{s}</span>
              ))}
            </div>
          )}

          {/* Goal fit */}
          {analysis.goalFit && (
            <div className="card">
              <div className="label">STARTUP FIT — {analysis.goalFit.level?.toUpperCase()}</div>
              {analysis.goalFit.verdict && <p style={{ fontSize: 14, lineHeight: 1.75, color: "#333", marginBottom: 14 }}>{analysis.goalFit.verdict}</p>}
              {analysis.goalFit.gaps && analysis.goalFit.gaps.length > 0 && (
                <>
                  <div className="label" style={{ marginTop: 8 }}>GAPS</div>
                  {analysis.goalFit.gaps.map((g, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "#555", marginBottom: 6, lineHeight: 1.6 }}>
                      <span style={{ color: "#ff4d00", flexShrink: 0 }}>↳</span>{g}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Founder view */}
          {analysis.founderView && (
            <div className="card">
              <div className="label">🚀 FOUNDER VIEW</div>
              {analysis.founderView.headline && (
                <p style={{ fontSize: 15, fontWeight: 700, color: "#6366f1", marginBottom: 10, lineHeight: 1.4 }}>
                  &ldquo;{analysis.founderView.headline}&rdquo;
                </p>
              )}
              {analysis.founderView.bestFitFor && (
                <p style={{ fontSize: 13, color: "#555", marginBottom: 12, lineHeight: 1.6 }}>
                  Best fit for: {analysis.founderView.bestFitFor}
                </p>
              )}
              {analysis.founderView.whyHire && analysis.founderView.whyHire.map((w, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "#333", marginBottom: 7, lineHeight: 1.5 }}>
                  <span style={{ color: "#6366f1", flexShrink: 0, fontWeight: 700 }}>◆</span>{w}
                </div>
              ))}
            </div>
          )}

          {/* Recruiter view */}
          {analysis.recruiterView && (
            <div className="card">
              <div className="label">📋 RECRUITER VIEW</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: analysis.recruiterView.keywordsToMatch ? 16 : 0 }}>
                {analysis.recruiterView.seniorityLabel && (
                  <div>
                    <div style={{ fontSize: 9, color: "#9a9088", fontFamily: "'DM Mono',monospace", letterSpacing: 1, marginBottom: 4 }}>SENIORITY</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{analysis.recruiterView.seniorityLabel}</div>
                  </div>
                )}
                {analysis.recruiterView.salaryBand && (
                  <div>
                    <div style={{ fontSize: 9, color: "#9a9088", fontFamily: "'DM Mono',monospace", letterSpacing: 1, marginBottom: 4 }}>SALARY BAND</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#10b981" }}>{analysis.recruiterView.salaryBand}</div>
                  </div>
                )}
              </div>
              {analysis.recruiterView.keywordsToMatch && (
                <>
                  <div style={{ fontSize: 9, color: "#9a9088", fontFamily: "'DM Mono',monospace", letterSpacing: 1, marginBottom: 6 }}>ATS KEYWORDS</div>
                  {analysis.recruiterView.keywordsToMatch.map((k, i) => (
                    <span key={i} className="pill" style={{ background: "#f5f2ee", color: "#444", border: "1px solid #e8e2da" }}>{k}</span>
                  ))}
                </>
              )}
            </div>
          )}

          {/* CTA */}
          <div style={{ background: "#1a1a1a", borderRadius: 12, padding: "28px 28px", textAlign: "center", marginTop: 8 }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 10 }}>WANT FOUNDERS TO FIND YOU?</div>
            <p style={{ fontSize: 17, fontWeight: 900, color: "#fff", letterSpacing: -0.3, marginBottom: 8 }}>Join the builder pool — ₹499</p>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 20, lineHeight: 1.6 }}>
              Upload your CV for a deeper analysis, then pay to join the pool.<br/>Founders searching for a {arch?.name || "builder"} will see your profile.
            </p>
            {!email && (
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", background: "#111", border: "1px solid #333", borderRadius: 8, color: "#fff", fontFamily: "'DM Mono',monospace", fontSize: 12, outline: "none", marginBottom: 12 }}
              />
            )}
            <button onClick={goToAnalyse} style={{ width: "100%", padding: "13px", background: "#ff4d00", color: "#fff", border: "none", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
              Analyse CV + Join Pool →
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ── QUESTIONS ──
  return (
    <div style={{ minHeight: "100vh", background: "#f5f2ee", fontFamily: "'DM Sans',system-ui,sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        textarea{resize:none;outline:none}
        textarea:focus{border-color:#ff4d00 !important}
      `}</style>

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #e8e2da", padding: "14px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f5f2ee" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#ff4d00" }}>◆</span>
          <a href="/" style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 12, letterSpacing: 1, color: "#1a1a1a", textDecoration: "none" }}>JOINSTARTUP.APP</a>
        </div>
        <a href="/analyse" style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9088", textDecoration: "none" }}>UPLOAD CV INSTEAD →</a>
      </nav>

      {/* Progress bar */}
      <div style={{ height: 2, background: "#e0dbd4" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "#ff4d00", transition: "width 0.3s ease" }} />
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 560 }}>

          {/* Step counter */}
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9088", letterSpacing: 2, marginBottom: 20 }}>
            QUESTION {currentStep + 1} OF {QUESTIONS.length}
          </div>

          {/* Question */}
          <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5, lineHeight: 1.2, marginBottom: 20, color: "#1a1a1a" }}>
            {currentQ.label}
          </h2>

          {/* Answer textarea */}
          <textarea
            rows={4}
            value={currentAnswer}
            onChange={e => setAnswers(a => ({ ...a, [currentQ.id]: e.target.value }))}
            onKeyDown={e => { if (e.key === "Enter" && e.metaKey) handleNext(); }}
            placeholder={currentQ.placeholder}
            style={{
              width: "100%",
              padding: "14px 16px",
              background: "#fff",
              border: "1.5px solid #e0dbd4",
              borderRadius: 10,
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 14,
              color: "#1a1a1a",
              lineHeight: 1.7,
              marginBottom: 16,
            }}
          />

          {/* Email (last step) */}
          {currentStep === QUESTIONS.length - 1 && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 2, color: "#9a9088", marginBottom: 7 }}>
                YOUR EMAIL — to receive your analysis
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                style={{ width: "100%", padding: "12px 14px", background: "#fff", border: "1.5px solid #e0dbd4", borderRadius: 8, fontFamily: "'DM Mono',monospace", fontSize: 13, color: "#1a1a1a", outline: "none" }}
              />
            </div>
          )}

          {error && (
            <div style={{ padding: "10px 14px", background: "#ff4d000e", border: "1px solid #ff4d0025", borderRadius: 8, fontSize: 12, color: "#ff4d00", fontFamily: "'DM Mono',monospace", marginBottom: 14 }}>
              {error}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            {currentStep > 0 && (
              <button onClick={handleBack} style={{ padding: "12px 20px", background: "transparent", border: "1.5px solid #e0dbd4", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 14, color: "#6b6460", cursor: "pointer" }}>
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!currentAnswer.trim()}
              style={{
                flex: 1,
                padding: "13px",
                background: currentAnswer.trim() ? "#ff4d00" : "#f0ebe4",
                color: currentAnswer.trim() ? "#fff" : "#b0a8a0",
                border: "none",
                borderRadius: 8,
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: 700,
                fontSize: 14,
                cursor: currentAnswer.trim() ? "pointer" : "not-allowed",
                transition: "all 0.2s",
              }}
            >
              {currentStep < QUESTIONS.length - 1 ? "Next →" : "Analyse My Profile →"}
            </button>
          </div>

          <div style={{ marginTop: 14, textAlign: "center", fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#c0b8b0" }}>
            {currentStep < QUESTIONS.length - 1 ? "⌘↵ to continue" : "Free analysis — no card required"}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ParsePathPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#f5f2ee", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "monospace", fontSize: 12, color: "#9a9088" }}>Loading…</div>
      </div>
    }>
      <ParsePathInner />
    </Suspense>
  );
}
