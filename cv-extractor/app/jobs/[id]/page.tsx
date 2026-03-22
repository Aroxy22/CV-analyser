"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const SUPABASE_URL = "https://xsbsoevqqvnxmtxuytiu.supabase.co";
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const ARCHETYPE_MAP: Record<string, { name: string; emoji: string; color: string }> = {
  "zero-to-one":         { name: "Zero-to-One Builder",      emoji: "🔥", color: "#ff4d00" },
  "systems-architect":   { name: "Systems Architect",         emoji: "🏗️", color: "#6366f1" },
  "growth-hacker":       { name: "Growth Hacker",             emoji: "📈", color: "#10b981" },
  "founding-generalist": { name: "Founding Generalist",       emoji: "⚡", color: "#f59e0b" },
  "product-intuitive":   { name: "Product Intuitive",         emoji: "🎯", color: "#ec4899" },
  "operator":            { name: "The Operator",              emoji: "⚙️", color: "#8b5cf6" },
  "deep-tech":           { name: "Deep Tech Builder",         emoji: "🧠", color: "#0ea5e9" },
  "community-builder":   { name: "Community Builder",         emoji: "🤝", color: "#14b8a6" },
  "revenue-animal":      { name: "Revenue Animal",            emoji: "💰", color: "#ef4444" },
  "brand-builder":       { name: "Brand Builder",             emoji: "🎨", color: "#f97316" },
  "data-whisperer":      { name: "Data Whisperer",            emoji: "📊", color: "#a3e635" },
  "market-maker":        { name: "Market Maker",              emoji: "🌍", color: "#2dd4bf" },
  "finance-builder":     { name: "Finance Builder",           emoji: "💸", color: "#fbbf24" },
  "pivot-survivor":      { name: "Pivot Survivor",            emoji: "🔄", color: "#94a3b8" },
  "india-stack":         { name: "India Stack Expert",        emoji: "🏭", color: "#4ade80" },
  "global-translator":   { name: "Global→India Translator",  emoji: "🌐", color: "#818cf8" },
};

const STAGE_LABELS: Record<string, string> = {
  "pre-seed": "Pre-Seed", "seed": "Seed", "series-a": "Series A",
  "series-b": "Series B", "series-f": "Series F", "growth": "Growth",
};

type Job = {
  id: string; title: string; company: string; company_type: string;
  stage: string; location: string; remote: boolean;
  equity: string | null; salary: string | null; description: string;
  archetype_fit: string[]; tags: string[]; apply_url: string;
  featured: boolean; source: string; created_at: string; expires_at: string;
  company_logo: string | null; company_website: string | null;
  company_size: string | null; company_about: string | null;
  company_investors: string[] | null; team_size: number | null;
  reporting_to: string | null; interview_process: string | null;
  why_join: string[] | null;
};

export default function JobPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [builderEmail, setBuilderEmail] = useState("");
  const [applyStep, setApplyStep] = useState<"idle" | "email" | "sent">("idle");
  const [builderProfile, setBuilderProfile] = useState<{ name: string | null; archetype: string; stage_bucket: string; profile_token: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`${SUPABASE_URL}/rest/v1/startup_jobs?id=eq.${id}&status=eq.active&select=*&limit=1`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
    })
      .then(r => r.json())
      .then(rows => { if (rows?.[0]) setJob(rows[0]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const lookupBuilder = async () => {
    if (!builderEmail.trim()) return;
    setApplying(true);
    try {
        const res = await fetch("/api/lookup-builder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: builderEmail }),
        });
            const rows = await res.json();
      if (rows?.[0]) setBuilderProfile(rows[0]);
    } finally { setApplying(false); }
  };

  const applyWithProfile = async () => {
    if (!job || !builderProfile) return;
    setApplying(true);
    try {
      await fetch("/api/apply-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: job.id,
          job_title: job.title,
          company: job.company,
          apply_url: job.apply_url,
          contact_email: job.apply_url.replace("mailto:", ""),
          builder_email: builderEmail,
          builder_name: builderProfile.name,
          builder_archetype: builderProfile.archetype,
          builder_stage: builderProfile.stage_bucket,
          profile_token: builderProfile.profile_token,
        }),
      });
      setApplyStep("sent");
    } finally { setApplying(false); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f5f2ee", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#9a9088", letterSpacing: 2 }}>LOADING...</div>
    </div>
  );

  if (!job) return (
    <div style={{ minHeight: "100vh", background: "#f5f2ee", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#ff4d00" }}>ROLE NOT FOUND</div>
      <p style={{ fontSize: 14, color: "#9a9088" }}>This role may have been filled or removed.</p>
      <a href="/jobs" style={{ color: "#ff4d00", textDecoration: "none", fontFamily: "'DM Mono',monospace", fontSize: 11 }}>← Back to all roles</a>
    </div>
  );

  const primaryArch = ARCHETYPE_MAP[job.archetype_fit?.[0]] || null;
  const stageColor = { "pre-seed": "#94a3b8", "seed": "#f59e0b", "series-a": "#ff4d00", "series-b": "#6366f1", "series-f": "#10b981", "growth": "#10b981" }[job.stage] || "#9a9088";

  return (
    <div style={{ minHeight: "100vh", background: "#f5f2ee", fontFamily: "'DM Sans', system-ui, sans-serif", color: "#1a1a1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .card{background:#fff;border:1px solid #e8e2da;border-radius:14px;padding:28px 32px;margin-bottom:14px}
        .label{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;color:#9a9088;margin-bottom:8px}
        .pill{display:inline-block;padding:3px 10px;border-radius:100px;font-family:'DM Mono',monospace;font-size:10px;font-weight:500;margin:2px 3px 0 0}
        .inp{width:100%;padding:12px 14px;background:#f5f2ee;border:1.5px solid #e0dbd4;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;color:#1a1a1a;outline:none;transition:border-color .2s}
        .inp:focus{border-color:#ff4d00}
        .inp::placeholder{color:#c0b8b0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:900px){.layout{grid-template-columns:1fr !important}.sticky-aside{position:static !important}}
        @media(max-width:640px){nav{padding:14px 20px !important}}
      `}</style>

      {/* Nav */}
      <nav style={{ padding: "14px 40px", borderBottom: "1px solid #e8e2da", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(245,242,238,0.95)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#ff4d00" }}>◆</span>
            <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 13, letterSpacing: 1, color: "#1a1a1a" }}>JOINSTARTUP</span>
          </a>
          <span style={{ color: "#e0dbd4" }}>/</span>
          <a href="/jobs" style={{ fontSize: 12, color: "#9a9088", textDecoration: "none" }}>Browse Jobs</a>
          <span style={{ color: "#e0dbd4" }}>/</span>
          <span style={{ fontSize: 12, color: "#1a1a1a", fontWeight: 600, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.title}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={copyLink} style={{ padding: "8px 14px", border: "1.5px solid #e0dbd4", borderRadius: 6, background: "transparent", fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#6b6460", cursor: "pointer" }}>
            {copied ? "✓ Copied" : "Share"}
          </button>
          <a href="/analyse" style={{ padding: "9px 18px", background: "#ff4d00", color: "#fff", borderRadius: 6, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>Get My Reads →</a>
        </div>
      </nav>

      {/* Featured bar */}
      {job.featured && <div style={{ height: 3, background: "#ff4d00" }} />}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div className="layout" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, alignItems: "start" }}>

          {/* LEFT — main content */}
          <div>
            {/* Job header card */}
            <div className="card" style={{ position: "relative", overflow: "hidden", marginBottom: 14 }}>
              {primaryArch && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: primaryArch.color }} />}

              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  {/* Company line */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    {job.company_logo ? (
                      <img src={job.company_logo} alt={job.company} style={{ width: 36, height: 36, borderRadius: 8, objectFit: "contain", border: "1px solid #e8e2da" }} />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: `${primaryArch?.color || "#ff4d00"}15`, border: `1px solid ${primaryArch?.color || "#ff4d00"}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                        {job.company_type === "vc" ? "🏦" : "🚀"}
                      </div>
                    )}
                    <div>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#9a9088" }}>
                        {job.company}
                        {job.company_type === "vc" && <span style={{ marginLeft: 6, color: "#6366f1" }}>· VC</span>}
                      </div>
                      {job.company_website && (
                        <a href={job.company_website} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#c0b8b0", textDecoration: "none" }}>
                          {job.company_website.replace("https://", "")} ↗
                        </a>
                      )}
                    </div>
                  </div>

                  <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(22px,4vw,34px)", fontWeight: 400, letterSpacing: -1, lineHeight: 1.15, marginBottom: 14 }}>
                    {job.title}
                  </h1>

                  {/* Meta pills */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                    <span className="pill" style={{ background: `${stageColor}12`, color: stageColor, border: `1px solid ${stageColor}25` }}>
                      {STAGE_LABELS[job.stage] || job.stage}
                    </span>
                    {job.equity && <span className="pill" style={{ background: "#6366f112", color: "#6366f1", border: "1px solid #6366f125" }}>{job.equity} equity</span>}
                    {job.salary && <span className="pill" style={{ background: "#10b98112", color: "#10b981", border: "1px solid #10b98125" }}>{job.salary}</span>}
                    {job.remote && <span className="pill" style={{ background: "#f5f2ee", color: "#6b6460", border: "1px solid #e0dbd4" }}>🌍 Remote-friendly</span>}
                    {job.location && <span className="pill" style={{ background: "#f5f2ee", color: "#6b6460", border: "1px solid #e0dbd4" }}>📍 {job.location}</span>}
                    {job.reporting_to && <span className="pill" style={{ background: "#f5f2ee", color: "#6b6460", border: "1px solid #e0dbd4" }}>Reports to {job.reporting_to}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* About the company */}
            {job.company_about && (
              <div className="card">
                <div className="label">ABOUT {job.company.toUpperCase()}</div>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: "#333", marginBottom: job.company_investors?.length ? 16 : 0 }}>{job.company_about}</p>
                {job.company_investors && job.company_investors.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", paddingTop: 12, borderTop: "1px solid #f0ebe4" }}>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 1 }}>BACKED BY</span>
                    {job.company_investors.map((inv, i) => (
                      <span key={i} className="pill" style={{ background: "#f5f2ee", color: "#6b6460", border: "1px solid #e0dbd4" }}>{inv}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Org structure */}
            <div className="card">
              <div className="label">THE ROLE</div>
              <p style={{ fontSize: 14, lineHeight: 1.85, color: "#333", whiteSpace: "pre-line" }}>{job.description}</p>

              {/* Tags */}
              {job.tags && job.tags.length > 0 && (
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #f0ebe4" }}>
                  <div className="label">SKILLS / STACK</div>
                  <div>{job.tags.map((t, i) => <span key={i} className="pill" style={{ background: "#f5f2ee", border: "1px solid #e0dbd4", color: "#444" }}>{t}</span>)}</div>
                </div>
              )}
            </div>

            {/* Org context */}
            {(job.team_size || job.reporting_to || job.company_size) && (
              <div className="card">
                <div className="label">TEAM & ORG</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                  {job.company_size && (
                    <div>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 1, marginBottom: 4 }}>COMPANY SIZE</div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{job.company_size}</div>
                      <div style={{ fontSize: 11, color: "#9a9088" }}>employees</div>
                    </div>
                  )}
                  {job.team_size && (
                    <div>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 1, marginBottom: 4 }}>TEAM SIZE</div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{job.team_size}</div>
                      <div style={{ fontSize: 11, color: "#9a9088" }}>on the team</div>
                    </div>
                  )}
                  {job.reporting_to && (
                    <div>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 1, marginBottom: 4 }}>REPORTS TO</div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{job.reporting_to}</div>
                      <div style={{ fontSize: 11, color: "#9a9088" }}>direct line</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Why join */}
            {job.why_join && job.why_join.length > 0 && (
              <div className="card">
                <div className="label">WHY JOIN</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {job.why_join.map((reason, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ color: primaryArch?.color || "#ff4d00", flexShrink: 0, fontWeight: 700, marginTop: 1 }}>◆</span>
                      <span style={{ fontSize: 14, color: "#333", lineHeight: 1.65 }}>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interview process */}
            {job.interview_process && (
              <div className="card">
                <div className="label">INTERVIEW PROCESS</div>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.75 }}>{job.interview_process}</p>
              </div>
            )}

            {/* Archetype fit */}
            {job.archetype_fit && job.archetype_fit.length > 0 && (
              <div className="card">
                <div className="label">THIS ROLE IS FOR</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {job.archetype_fit.map(id => {
                    const a = ARCHETYPE_MAP[id];
                    if (!a) return null;
                    return (
                      <div key={id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: `${a.color}08`, borderRadius: 10, border: `1px solid ${a.color}20` }}>
                        <span style={{ fontSize: 20, flexShrink: 0 }}>{a.emoji}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: a.color }}>{a.name}</div>
                          <a href="/analyse" style={{ fontSize: 11, color: "#9a9088", textDecoration: "none" }}>Not sure if that&apos;s you? Find your archetype free →</a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — sticky apply panel */}
          <div className="sticky-aside" style={{ position: "sticky", top: 72 }}>

            {/* Apply CTA card */}
            <div style={{ background: "#fff", border: "1.5px solid #e8e2da", borderRadius: 16, padding: "28px", marginBottom: 14, position: "relative", overflow: "hidden" }}>
              {primaryArch && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: primaryArch.color }} />}

              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 2, marginBottom: 12 }}>APPLY FOR THIS ROLE</div>

              {applyStep === "sent" ? (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>🎉</div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Application sent!</div>
                  <p style={{ fontSize: 13, color: "#6b6460", lineHeight: 1.65 }}>Your builder profile was shared with {job.company}. They&apos;ll reach out at {builderEmail}.</p>
                </div>
              ) : applyStep === "email" ? (
                <div>
                  <p style={{ fontSize: 13, color: "#6b6460", lineHeight: 1.65, marginBottom: 16 }}>
                    Already in the builder pool? Enter your email to apply with your profile — no CV needed.
                  </p>
                  <div style={{ marginBottom: 10 }}>
                    <label className="label">YOUR POOL EMAIL</label>
                    <input className="inp" type="email" placeholder="you@email.com" value={builderEmail} onChange={e => setBuilderEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && lookupBuilder()} />
                  </div>

                  {builderProfile ? (
                    <div style={{ padding: "12px 14px", background: `${ARCHETYPE_MAP[builderProfile.archetype]?.color || "#ff4d00"}10`, borderRadius: 10, border: `1px solid ${ARCHETYPE_MAP[builderProfile.archetype]?.color || "#ff4d00"}25`, marginBottom: 14 }}>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: ARCHETYPE_MAP[builderProfile.archetype]?.color || "#ff4d00", letterSpacing: 1, marginBottom: 4 }}>PROFILE FOUND</div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{builderProfile.name || "Builder"}</div>
                      <div style={{ fontSize: 11, color: "#9a9088" }}>
                        {ARCHETYPE_MAP[builderProfile.archetype]?.emoji} {ARCHETYPE_MAP[builderProfile.archetype]?.name} · {builderProfile.stage_bucket}
                      </div>
                    </div>
                  ) : builderEmail.includes("@") && (
                    <button onClick={lookupBuilder} disabled={applying} style={{ width: "100%", padding: "11px", background: "#f5f2ee", border: "1.5px solid #e0dbd4", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, color: "#1a1a1a", cursor: "pointer", marginBottom: 10 }}>
                      {applying ? "Looking up..." : "Find my profile →"}
                    </button>
                  )}

                  {builderProfile && (
                    <button onClick={applyWithProfile} disabled={applying} style={{ width: "100%", padding: "13px", background: primaryArch?.color || "#ff4d00", color: "#fff", border: "none", borderRadius: 10, fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer", marginBottom: 8 }}>
                      {applying ? "Sending..." : `Apply as ${builderProfile.name || "Builder"} →`}
                    </button>
                  )}

                  <div style={{ textAlign: "center", marginTop: 8 }}>
                    <button onClick={() => { setApplyStep("idle"); setBuilderProfile(null); setBuilderEmail(""); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#9a9088" }}>
                      Apply directly instead →
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Primary: Apply with profile */}
                  <button onClick={() => setApplyStep("email")} style={{ width: "100%", padding: "14px", background: primaryArch?.color || "#ff4d00", color: "#fff", border: "none", borderRadius: 10, fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer", marginBottom: 10 }}>
                    Apply with Builder Profile →
                  </button>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", textAlign: "center", marginBottom: 16, letterSpacing: 1 }}>
                    IN THE POOL? SHARE YOUR PROFILE DIRECTLY
                  </div>

                  {/* Secondary: direct apply */}
                  <a href={job.apply_url} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", padding: "12px", border: "1.5px solid #e0dbd4", borderRadius: 10, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13, color: "#6b6460", textDecoration: "none" }}>
                    Apply directly →
                  </a>

                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f0ebe4", textAlign: "center" }}>
                    <p style={{ fontSize: 12, color: "#9a9088", marginBottom: 8 }}>Not in the builder pool yet?</p>
                    <a href="/analyse" style={{ fontSize: 13, color: primaryArch?.color || "#ff4d00", textDecoration: "none", fontWeight: 700 }}>Get analysed free + join the pool →</a>
                  </div>
                </div>
              )}
            </div>

            {/* Company quick-facts */}
            <div style={{ background: "#fff", border: "1px solid #e8e2da", borderRadius: 14, padding: "20px 22px", marginBottom: 14 }}>
              <div className="label" style={{ marginBottom: 14 }}>COMPANY SNAPSHOT</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Stage", value: STAGE_LABELS[job.stage] || job.stage },
                  { label: "Size", value: job.company_size ? `${job.company_size} people` : null },
                  { label: "Team", value: job.team_size ? `${job.team_size} on this team` : null },
                  { label: "Location", value: job.location || "India" },
                  { label: "Remote", value: job.remote ? "Remote-friendly" : "In-office" },
                  { label: "Equity", value: job.equity || null },
                  { label: "Salary", value: job.salary || null },
                ].filter(r => r.value).map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: "1px solid #f5f2ee" }}>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9088" }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{row.value}</span>
                  </div>
                ))}
                {job.company_website && (
                  <a href={job.company_website} target="_blank" rel="noopener noreferrer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9088" }}>Website</span>
                    <span style={{ fontSize: 12, color: "#ff4d00" }}>{job.company_website.replace("https://", "")} ↗</span>
                  </a>
                )}
              </div>
            </div>

            {/* Similar roles */}
            <a href={`/jobs?archetype=${job.archetype_fit?.[0] || ""}`} style={{ display: "block", padding: "14px 18px", background: "#f5f2ee", border: "1px solid #e0dbd4", borderRadius: 12, textDecoration: "none", color: "#6b6460", fontSize: 13, fontWeight: 600, textAlign: "center" }}>
              See similar roles →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
