"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";


const ARCHETYPES: Record<string, { name: string; emoji: string; color: string; tagline: string }> = {
  "zero-to-one":         { name: "Zero-to-One Builder",     emoji: "🔥", color: "#ff4d00", tagline: "Ships before it's perfect" },
  "systems-architect":   { name: "Systems Architect",        emoji: "🏗️", color: "#6366f1", tagline: "Thinks in platforms" },
  "growth-hacker":       { name: "Growth Hacker",            emoji: "📈", color: "#10b981", tagline: "Channel obsessed" },
  "founding-generalist": { name: "Founding Generalist",      emoji: "⚡", color: "#f59e0b", tagline: "Wears 5 hats" },
  "product-intuitive":   { name: "Product Intuitive",        emoji: "🎯", color: "#ec4899", tagline: "Talks to users every day" },
  "operator":            { name: "The Operator",             emoji: "⚙️", color: "#8b5cf6", tagline: "Turns chaos into process" },
  "deep-tech":           { name: "Deep Tech Builder",        emoji: "🧠", color: "#0ea5e9", tagline: "Loves hard problems" },
  "community-builder":   { name: "Community Builder",        emoji: "🤝", color: "#14b8a6", tagline: "Network effects first" },
  "revenue-animal":      { name: "Revenue Animal",           emoji: "💰", color: "#ef4444", tagline: "Closes deals" },
  "brand-builder":       { name: "Brand Builder",            emoji: "🎨", color: "#f97316", tagline: "Narrative-first" },
  "data-whisperer":      { name: "Data Whisperer",           emoji: "📊", color: "#a3e635", tagline: "Turns numbers into decisions" },
  "market-maker":        { name: "Market Maker",             emoji: "🌍", color: "#2dd4bf", tagline: "Opens doors" },
  "finance-builder":     { name: "Finance Builder",          emoji: "💸", color: "#fbbf24", tagline: "Unit economics obsessed" },
  "pivot-survivor":      { name: "Pivot Survivor",           emoji: "🔄", color: "#94a3b8", tagline: "Battle-tested" },
  "india-stack":         { name: "India Stack Expert",       emoji: "🏭", color: "#4ade80", tagline: "UPI/ONDC/Aadhaar expert" },
  "global-translator":   { name: "Global→India Translator", emoji: "🌐", color: "#818cf8", tagline: "Cross-cultural edge" },
};

const STAGE_LABEL: Record<string, string> = {
  "-1→0": "Pre-zero · Building foundation",
  "0→1":  "Zero-to-one · Early stage ready",
  "1→beyond": "Scaling · Series A+",
};

type Builder = {
  id: string;
  email: string;
  name: string | null;
  archetype: string;
  stage_bucket: string;
  goal: string | null;
  skills: string[];
  summary: string | null;
  experience: string | null;
  current_title: string | null;
  current_company: string | null;
  years_exp: number | null;
  domains: string[];
  tools: string[];
  companies: string[];
  pool_status: string;
  is_visible: boolean;
  pool_joined_at: string | null;
  analysis_json: Record<string, unknown> | null;
};

function ProfileInner() {
  const params = useSearchParams();
  const token = params.get("token");
  const [builder, setBuilder] = useState<Builder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { setError("No profile token provided."); setLoading(false); return; }

   const fetchBuilder = async () => {
    try {
    const res = await fetch(
        `https://xsbsoevqqvnxmtxuytiu.supabase.co/functions/v1/get-profile?token=${token}`
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error === "Profile not found" ? "Profile not found." : "Failed to load profile.");
        return;
      }
      setBuilder(data.builder);
    } catch {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
    };

    fetchBuilder();
  }, [token]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f5f2ee", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#9a9088", letterSpacing: 2 }}>LOADING PROFILE…</div>
    </div>
  );

  if (error || !builder) return (
    <div style={{ minHeight: "100vh", background: "#f5f2ee", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#ff4d00" }}>PROFILE NOT FOUND</div>
      <p style={{ fontSize: 14, color: "#9a9088" }}>{error || "This profile link may be invalid or expired."}</p>
      <a href="/" style={{ fontSize: 13, color: "#ff4d00", textDecoration: "none", fontFamily: "'DM Mono',monospace" }}>← back to joinstartup.app</a>
    </div>
  );

  const arch = ARCHETYPES[builder.archetype] || { name: builder.archetype, emoji: "🚀", color: "#ff4d00", tagline: "" };
  const analysis = builder.analysis_json as Record<string, unknown> | null;
  const founderView = analysis?.founderView as Record<string, unknown> | null;
  const recruiterView = analysis?.recruiterView as Record<string, unknown> | null;
  const roadmap = analysis?.roadmap as Record<string, unknown> | null;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f2ee", fontFamily: "'DM Sans',system-ui,sans-serif", color: "#1a1a1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .pill{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-family:'DM Mono',monospace;margin:3px 3px 0 0}
        .card{background:#fff;border:1px solid #e8e2da;border-radius:14px;padding:28px 32px;margin-bottom:16px}
        .label{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;color:#9a9088;margin-bottom:8px}
        .section-title{font-size:13px;font-weight:700;color:#1a1a1a;margin-bottom:12px;letter-spacing:-0.2px}
      `}</style>

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #e8e2da", padding: "14px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f5f2ee", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#ff4d00" }}>◆</span>
          <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 12, letterSpacing: 1 }}>JOINSTARTUP.APP</span>
        </div>
        <a href="/profile/access" style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9088", textDecoration: "none", letterSpacing: 1 }}>
          GET PROFILE LINK →
        </a>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Header card */}
        <div className="card" style={{ position: "relative", overflow: "hidden", marginBottom: 16 }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: arch.color }} />

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${arch.color}15`, border: `1px solid ${arch.color}30`, borderRadius: 20, padding: "4px 12px", fontFamily: "'DM Mono',monospace", fontSize: 10, color: arch.color, letterSpacing: 1, marginBottom: 14 }}>
                {arch.emoji} {builder.archetype.toUpperCase().replace(/-/g, " ")}
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5, marginBottom: 4 }}>
                {builder.name || "Builder"}
              </h1>
              {builder.current_title && (
                <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
                  {builder.current_title}{builder.current_company ? ` · ${builder.current_company}` : ""}
                </div>
              )}
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#9a9088" }}>
                {arch.name} · {STAGE_LABEL[builder.stage_bucket] || builder.stage_bucket}
              </div>
            </div>

            {/* Pool badge */}
            <div style={{ textAlign: "right" }}>
              {builder.pool_status === "paid" && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", background: "#10b98112", border: "1px solid #10b98130", borderRadius: 8, fontSize: 11, color: "#10b981", fontFamily: "'DM Mono',monospace" }}>
                  ✓ IN BUILDER POOL
                </div>
              )}
              {builder.pool_joined_at && (
                <div style={{ fontSize: 10, color: "#c0b8b0", fontFamily: "'DM Mono',monospace", marginTop: 6 }}>
                  joined {new Date(builder.pool_joined_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        {builder.summary && (
          <div className="card">
            <div className="label">SUMMARY</div>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "#333" }}>{builder.summary}</p>
          </div>
        )}

        {/* Goal */}
        {builder.goal && (
          <div className="card">
            <div className="label">WHAT I&apos;M LOOKING FOR</div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "#333" }}>{builder.goal}</p>
          </div>
        )}

        {/* Skills + domains */}
        {(builder.skills?.length > 0 || builder.domains?.length > 0) && (
          <div className="card">
            {builder.skills?.length > 0 && (
              <>
                <div className="label">SKILLS</div>
                <div style={{ marginBottom: builder.domains?.length > 0 ? 16 : 0 }}>
                  {builder.skills.map((s, i) => (
                    <span key={i} className="pill" style={{ background: `${arch.color}12`, color: arch.color, border: `1px solid ${arch.color}25` }}>{s}</span>
                  ))}
                </div>
              </>
            )}
            {builder.domains?.length > 0 && (
              <>
                <div className="label" style={{ marginTop: 8 }}>DOMAINS</div>
                <div>
                  {builder.domains.map((d, i) => (
                    <span key={i} className="pill" style={{ background: "#f5f2ee", color: "#666", border: "1px solid #e8e2da" }}>{d}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Founder view */}
        {founderView && (
          <div className="card">
            <div className="label">🚀 FOUNDER VIEW</div>
            {founderView.headline && (
              <p style={{ fontSize: 15, fontWeight: 700, color: "#6366f1", marginBottom: 10, lineHeight: 1.4 }}>
                &ldquo;{founderView.headline as string}&rdquo;
              </p>
            )}
            {founderView.bestFitFor && (
              <p style={{ fontSize: 13, color: "#555", marginBottom: 14, lineHeight: 1.6 }}>
                Best fit for: {founderView.bestFitFor as string}
              </p>
            )}
            {Array.isArray(founderView.whyHire) && founderView.whyHire.length > 0 && (
              <>
                <div className="section-title">Why hire</div>
                {(founderView.whyHire as string[]).map((w, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 13, color: "#333", lineHeight: 1.5 }}>
                    <span style={{ color: "#6366f1", flexShrink: 0, fontWeight: 700 }}>◆</span>
                    {w}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Recruiter view */}
        {recruiterView && (
          <div className="card">
            <div className="label">📋 RECRUITER VIEW</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {recruiterView.seniorityLabel && (
                <div>
                  <div style={{ fontSize: 10, color: "#9a9088", fontFamily: "'DM Mono',monospace", letterSpacing: 1, marginBottom: 4 }}>SENIORITY</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{recruiterView.seniorityLabel as string}</div>
                </div>
              )}
              {recruiterView.salaryBand && (
                <div>
                  <div style={{ fontSize: 10, color: "#9a9088", fontFamily: "'DM Mono',monospace", letterSpacing: 1, marginBottom: 4 }}>SALARY BAND</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#10b981" }}>{recruiterView.salaryBand as string}</div>
                </div>
              )}
            </div>
            {Array.isArray(recruiterView.keywordsToMatch) && (
              <>
                <div style={{ fontSize: 10, color: "#9a9088", fontFamily: "'DM Mono',monospace", letterSpacing: 1, marginBottom: 8 }}>ATS KEYWORDS</div>
                <div style={{ marginBottom: 8 }}>
                  {(recruiterView.keywordsToMatch as string[]).map((k, i) => (
                    <span key={i} className="pill" style={{ background: "#f5f2ee", color: "#444", border: "1px solid #e8e2da" }}>{k}</span>
                  ))}
                </div>
              </>
            )}
            {Array.isArray(recruiterView.topJDMatches) && (
              <>
                <div style={{ fontSize: 10, color: "#9a9088", fontFamily: "'DM Mono',monospace", letterSpacing: 1, marginBottom: 8, marginTop: 12 }}>JD MATCHES</div>
                <div>
                  {(recruiterView.topJDMatches as string[]).map((j, i) => (
                    <span key={i} className="pill" style={{ background: "#10b98112", color: "#10b981", border: "1px solid #10b98125" }}>{j}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Roadmap */}
        {roadmap && (roadmap.primaryGap || Array.isArray(roadmap.phases)) && (
          <div className="card">
            <div className="label">90-DAY ROADMAP</div>
            {roadmap.primaryGap && (
              <div style={{ padding: "12px 16px", background: "#ff4d0008", borderLeft: "3px solid #ff4d00", borderRadius: "0 8px 8px 0", marginBottom: 16, fontSize: 13, color: "#333", lineHeight: 1.6 }}>
                <span style={{ fontWeight: 700, color: "#ff4d00" }}>Primary gap: </span>{roadmap.primaryGap as string}
              </div>
            )}
            {Array.isArray(roadmap.phases) && (roadmap.phases as Array<Record<string, unknown>>).map((phase, i) => (
              <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < (roadmap.phases as unknown[]).length - 1 ? "1px solid #f0ebe4" : "none" }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: arch.color, letterSpacing: 1, marginBottom: 6 }}>
                  {phase.label as string} — {phase.focus as string}
                </div>
                {Array.isArray(phase.actions) && (phase.actions as Array<Record<string, unknown>>).map((action, j) => (
                  <div key={j} style={{ fontSize: 13, color: "#444", lineHeight: 1.6, marginBottom: 4, paddingLeft: 12 }}>
                    → {action.action as string}
                    {action.resource && (action.resource as Record<string, unknown>).url && (
                      <a href={(action.resource as Record<string, unknown>).url as string} target="_blank" rel="noopener noreferrer"
                        style={{ color: arch.color, textDecoration: "none", marginLeft: 6, fontSize: 11, fontFamily: "'DM Mono',monospace" }}>
                        [{(action.resource as Record<string, unknown>).name as string}]
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Footer CTA */}
        <div style={{ textAlign: "center", padding: "32px 0 0" }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#c0b8b0", letterSpacing: 2, marginBottom: 12 }}>
            JOINSTARTUP.APP · INDIA&apos;S STARTUP TALENT LAYER
          </div>
          <a href="/analyse" style={{ display: "inline-block", padding: "12px 28px", background: "#ff4d00", color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
            Analyse another profile →
          </a>
        </div>

      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#f5f2ee", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#9a9088", letterSpacing: 2 }}>LOADING…</div>
      </div>
    }>
      <ProfileInner />
    </Suspense>
  );
}
