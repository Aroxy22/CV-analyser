"use client";
import { useState } from "react";
import type { CvAnalysis, SkillGap, LearningResource } from "@/lib/types";
import { JobsTab } from "./JobsTab";

const TABS = ["Profile", "Goal Fit", "Gap & Roadmap", "Jobs"];

const FIT_CONFIG = {
  Strong:   { color: "#34d399", bg: "#34d39912", border: "#34d39930", emoji: "✅" },
  Moderate: { color: "#fbbf24", bg: "#fbbf2412", border: "#fbbf2430", emoji: "⚡" },
  Weak:     { color: "#f87171", bg: "#f8717112", border: "#f8717130", emoji: "⚠️" },
};

const IMPORTANCE_CONFIG = {
  "Critical":     { color: "#f87171", bg: "#f8717112" },
  "Important":    { color: "#fbbf24", bg: "#fbbf2412" },
  "Good to have": { color: "#34d399", bg: "#34d39912" },
};

const TYPE_ICONS: Record<string, string> = {
  course: "📚", certification: "🏆", project: "🛠️",
  bootcamp: "🎓", cohort: "👥", community: "🤝",
};

function ResourceCard({ r }: { r: LearningResource }) {
  return (
    <a href={r.url} target="_blank" rel="noreferrer"
      style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: "#0d0d18", border: "1px solid #1e1e30", borderRadius: 12, textDecoration: "none", transition: "border-color .2s" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "#7c5cfc44")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "#1e1e30")}
    >
      <div style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{TYPE_ICONS[r.type] ?? "📌"}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: "#e8e8f0", marginBottom: 3 }}>{r.name}</div>
        <div style={{ fontSize: 11, color: "#666" }}>{r.provider}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
          {r.duration && <span style={{ fontSize: 10, color: "#555", background: "#ffffff08", padding: "2px 7px", borderRadius: 8 }}>⏱ {r.duration}</span>}
          {r.cost && <span style={{ fontSize: 10, color: r.cost === "Free" ? "#34d399" : "#fbbf24", background: r.cost === "Free" ? "#34d39912" : "#fbbf2412", padding: "2px 7px", borderRadius: 8 }}>💰 {r.cost}</span>}
        </div>
      </div>
      <div style={{ color: "#333", fontSize: 12, flexShrink: 0 }}>→</div>
    </a>
  );
}

function GapCard({ gap, index }: { gap: SkillGap; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const imp = IMPORTANCE_CONFIG[gap.importance] ?? IMPORTANCE_CONFIG["Good to have"];

  return (
    <div style={{ border: "1px solid #252535", borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
      {/* Header */}
      <div onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", background: "#14141e", cursor: "pointer" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: imp.color, background: imp.bg, padding: "3px 10px", borderRadius: 20, flexShrink: 0 }}>
          {gap.importance}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{gap.skill}</div>
          <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>
            {gap.current_level} → {gap.required_level} · {gap.time_to_close}
          </div>
        </div>
        <span style={{ color: "#444", fontSize: 18, transition: "transform .2s", transform: open ? "rotate(180deg)" : "none" }}>⌄</span>
      </div>

      {open && (
        <div style={{ padding: "0 20px 20px", background: "#0f0f1a" }}>
          {/* Why it matters */}
          <div style={{ padding: "12px 14px", background: "#fbbf2408", border: "1px solid #fbbf2420", borderRadius: 10, margin: "16px 0", fontSize: 13, color: "#fbbf24", lineHeight: 1.6 }}>
            💡 {gap.why_it_matters}
          </div>

          {/* 3 tracks */}
          {[
            { key: "unstructured", label: "📚 Self-paced Learning", items: gap.unstructured },
            { key: "structured",   label: "🎓 Structured Programs", items: gap.structured },
            { key: "communities",  label: "🤝 Communities to Join", items: gap.communities },
          ].map(({ label, items }) => items?.length > 0 && (
            <div key={label} style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>{label}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((r, i) => <ResourceCard key={i} r={r} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AnalysisView({ cv, analysisId, goal, onBack }: {
  cv: CvAnalysis; analysisId: string | null; goal: string; onBack: () => void;
}) {
  const [tab, setTab] = useState("Goal Fit");
  const ov = cv.overview;
  const gf = cv.goal_fit;
  const fitCfg = gf ? (FIT_CONFIG[gf.level] ?? FIT_CONFIG.Moderate) : null;

  return (
    <div className="fade-up">
      {/* Candidate header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: "#14141e", border: "1px solid #252535", borderRadius: 10, padding: "8px 14px", color: "#888", cursor: "pointer", fontSize: 13, flexShrink: 0 }}>
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22 }}>{ov?.name}</div>
          <div style={{ color: "#888", fontSize: 13, marginTop: 2 }}>{ov?.title} {ov?.location && `· ${ov.location}`}</div>
          {goal && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#a78bfa", background: "#7c5cfc12", border: "1px solid #7c5cfc30", padding: "5px 12px", borderRadius: 20, display: "inline-block" }}>
              🎯 Goal: {goal}
            </div>
          )}
        </div>
        {fitCfg && gf && (
          <div style={{ textAlign: "center", background: fitCfg.bg, border: `1px solid ${fitCfg.border}`, borderRadius: 14, padding: "10px 18px", flexShrink: 0 }}>
            <div style={{ fontSize: 20, marginBottom: 2 }}>{fitCfg.emoji}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: fitCfg.color }}>{gf.level} Fit</div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid #1a1a2e", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "10px 16px", background: "transparent", border: "none", borderBottom: tab === t ? "2px solid #7c5cfc" : "2px solid transparent", color: tab === t ? "#a78bfa" : "#555", cursor: "pointer", fontSize: 13, fontWeight: tab === t ? 600 : 400, whiteSpace: "nowrap", transition: "all .2s" }}>
            {t}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === "Profile" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <p style={{ color: "#bbb", fontSize: 14, lineHeight: 1.7 }}>{ov?.summary}</p>
            <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
              {ov?.email && <span style={{ fontSize: 12, color: "#888" }}>✉️ {ov.email}</span>}
              {ov?.phone && <span style={{ fontSize: 12, color: "#888" }}>📞 {ov.phone}</span>}
              {ov?.linkedin && <a href={ov.linkedin} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#7c5cfc" }}>🔗 LinkedIn</a>}
            </div>
          </div>

          {/* Skills */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {(["technical", "soft", "tools", "certifications"] as const).map(cat =>
              cv.skills[cat]?.length > 0 && (
                <div key={cat} className="card">
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>{cat}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {cv.skills[cat].map(s => (
                      <span key={s} className="tag" style={{ background: "#7c5cfc18", color: "#a78bfa", border: "1px solid #7c5cfc33" }}>{s}</span>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Experience */}
          {cv.experience?.map((ex, i) => (
            <div key={i} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{ex.role}</div>
                  <div style={{ color: "#888", fontSize: 13 }}>{ex.company}</div>
                </div>
                <div style={{ fontSize: 12, color: "#555" }}>{ex.duration}</div>
              </div>
              <ul style={{ paddingLeft: 18, color: "#bbb", fontSize: 13, lineHeight: 1.8 }}>
                {ex.highlights?.map((h, j) => <li key={j}>{h}</li>)}
              </ul>
              {ex.impact && <div style={{ marginTop: 8, fontSize: 12, color: "#34d399", background: "#34d39910", padding: "6px 10px", borderRadius: 8 }}>💡 {ex.impact}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Goal Fit Tab */}
      {tab === "Goal Fit" && gf && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Verdict banner */}
          <div style={{ padding: "20px 24px", background: fitCfg?.bg, border: `1px solid ${fitCfg?.border}`, borderRadius: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: fitCfg?.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              {fitCfg?.emoji} {gf.level} Match
            </div>
            <div style={{ fontSize: 15, color: "#e8e8f0", lineHeight: 1.7, marginBottom: 12 }}>{gf.summary}</div>
            <div style={{ fontSize: 13, color: "#aaa", fontStyle: "italic", lineHeight: 1.6, borderTop: "1px solid #ffffff10", paddingTop: 12 }}>
              "{gf.honest_verdict}"
            </div>
          </div>

          {/* What matches / doesn't */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="card">
              <div style={{ fontSize: 11, color: "#34d399", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>✅ Working For You</div>
              {gf.what_matches?.map((m, i) => (
                <div key={i} style={{ fontSize: 13, color: "#bbb", padding: "6px 0", borderBottom: "1px solid #1e1e30", lineHeight: 1.5 }}>{m}</div>
              ))}
            </div>
            <div className="card">
              <div style={{ fontSize: 11, color: "#f87171", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>⚠️ Working Against You</div>
              {gf.what_doesnt?.map((m, i) => (
                <div key={i} style={{ fontSize: 13, color: "#bbb", padding: "6px 0", borderBottom: "1px solid #1e1e30", lineHeight: 1.5 }}>{m}</div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="card">
            <div style={{ fontSize: 11, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>🏢 Where You Should Target</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["Company Type", gf.recommended_company_type],
                ["Stage", gf.recommended_stage],
                ["Salary Reality", gf.salary_reality_check],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 12, fontSize: 13 }}>
                  <span style={{ color: "#555", width: 120, flexShrink: 0 }}>{k}</span>
                  <span style={{ color: "#e8e8f0", flex: 1 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <button onClick={() => setTab("Gap & Roadmap")}
              style={{ background: "linear-gradient(135deg,#7c5cfc,#c084fc)", border: "none", borderRadius: 12, padding: "12px 28px", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              See Your Learning Roadmap →
            </button>
          </div>
        </div>
      )}

      {/* Gap & Roadmap Tab */}
      {tab === "Gap & Roadmap" && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 4 }}>
              {cv.gaps?.length ?? 0} gaps between you and your goal
            </div>
            <div style={{ fontSize: 13, color: "#555" }}>
              Each gap includes self-paced courses, structured programs, and communities — all India-focused
            </div>
          </div>
          {cv.gaps?.map((gap, i) => (
            <GapCard key={i} gap={gap} index={i} />
          ))}
          {(!cv.gaps || cv.gaps.length === 0) && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#444" }}>
              No significant gaps found — your CV closely matches your goal!
            </div>
          )}
        </div>
      )}

      {/* Jobs Tab */}
      {tab === "Jobs" && (
        <JobsTab cv={cv} analysisId={analysisId} goal={goal} />
      )}
    </div>
  );
}
