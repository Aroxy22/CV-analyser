"use client";

import { useState, useEffect } from "react";
import AppNav from "@/components/AppNav";

const SUPABASE_FN = "https://xsbsoevqqvnxmtxuytiu.supabase.co/functions/v1/get-jobs";

const ARCHETYPES = [
  { id: "zero-to-one",         name: "Zero-to-One",       emoji: "🔥", color: "#ff4d00" },
  { id: "systems-architect",   name: "Systems Architect",  emoji: "🏗️", color: "#6366f1" },
  { id: "growth-hacker",       name: "Growth Hacker",      emoji: "📈", color: "#10b981" },
  { id: "founding-generalist", name: "Generalist",         emoji: "⚡", color: "#f59e0b" },
  { id: "product-intuitive",   name: "Product",            emoji: "🎯", color: "#ec4899" },
  { id: "operator",            name: "Operator",           emoji: "⚙️", color: "#8b5cf6" },
  { id: "deep-tech",           name: "Deep Tech",          emoji: "🧠", color: "#0ea5e9" },
  { id: "revenue-animal",      name: "Revenue",            emoji: "💰", color: "#ef4444" },
  { id: "data-whisperer",      name: "Data",               emoji: "📊", color: "#a3e635" },
  { id: "india-stack",         name: "India Stack",        emoji: "🏭", color: "#4ade80" },
];

const STAGES = [
  { id: "pre-seed", label: "Pre-Seed" },
  { id: "seed",     label: "Seed" },
  { id: "series-a", label: "Series A" },
  { id: "series-b", label: "Series B" },
  { id: "growth",   label: "Growth" },
];

type Job = {
  id: string;
  title: string;
  company: string;
  company_type: string;
  stage: string;
  location: string;
  remote: boolean;
  equity: string | null;
  salary: string | null;
  description: string;
  archetype_fit: string[];
  tags: string[];
  apply_url: string;
  featured: boolean;
  created_at: string;
};

const STAGE_COLORS: Record<string, string> = {
  "pre-seed": "#94a3b8",
  "seed":     "#f59e0b",
  "series-a": "#ff4d00",
  "series-b": "#6366f1",
  "growth":   "#10b981",
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedArchetype, setSelectedArchetype] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [stats, setStats] = useState({ total: 0, remote: 0, featured: 0 });

  useEffect(() => {
    // Read URL params on mount — so /jobs?remote=true and /jobs?archetype=xxx work
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("remote") === "true") setRemoteOnly(true);
      if (params.get("archetype")) setSelectedArchetype(params.get("archetype")!);
      if (params.get("stage")) setSelectedStage(params.get("stage")!);
      if (params.get("search")) setSearch(params.get("search")!);
    }
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(SUPABASE_FN);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setJobs(data.jobs || []);
      setStats(data.stats || { total: 0, remote: 0, featured: 0 });
    } catch {
      setError("Failed to load jobs — please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = jobs.filter(j => {
    if (remoteOnly && !j.remote) return false;
    if (selectedStage && j.stage !== selectedStage) return false;
    if (selectedArchetype && !j.archetype_fit?.includes(selectedArchetype)) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        j.title.toLowerCase().includes(s) ||
        j.company.toLowerCase().includes(s) ||
        j.description?.toLowerCase().includes(s) ||
        j.tags?.some(t => t.toLowerCase().includes(s))
      );
    }
    return true;
  });

  const clearFilters = () => {
    setSearch("");
    setSelectedArchetype("");
    setSelectedStage("");
    setRemoteOnly(false);
  };

  const hasFilters = search || selectedArchetype || selectedStage || remoteOnly;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f2ee", fontFamily: "'DM Sans', system-ui, sans-serif", color: "#1a1a1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .filter-btn{padding:7px 14px;border:1.5px solid #e0dbd4;border-radius:100px;background:#fff;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.5px;color:#6b6460;cursor:pointer;transition:all .2s;white-space:nowrap}
        .filter-btn:hover{border-color:#c0b8b0;color:#1a1a1a}
        .filter-btn.on{background:#ff4d00;border-color:#ff4d00;color:#fff}
        .arch-btn{padding:6px 12px;border:1.5px solid #e0dbd4;border-radius:100px;background:#fff;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;color:#6b6460;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:5px;white-space:nowrap}
        .arch-btn:hover{border-color:#c0b8b0;color:#1a1a1a}
        .arch-btn.on{color:#fff;border-color:transparent}
        .job-card{background:#fff;border:1px solid #e0dbd4;border-radius:12px;padding:24px;transition:all .22s;cursor:pointer;position:relative;overflow:hidden;display:block;text-decoration:none;color:inherit}
        .job-card:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(0,0,0,.06);border-color:#c0b8b0}
        .tag{display:inline-block;padding:2px 8px;border-radius:100px;font-family:'DM Mono',monospace;font-size:9px;font-weight:500;background:#f5f2ee;border:1px solid #e0dbd4;color:#6b6460;margin:2px 2px 0 0}
        .pill{display:inline-block;padding:3px 10px;border-radius:100px;font-family:'DM Mono',monospace;font-size:10px;font-weight:600}
        input[type=search]::-webkit-search-cancel-button{display:none}
        @media(max-width:768px){nav{padding:14px 20px !important}.nav-links{display:none !important}}
      `}</style>

      <AppNav />

      {/* Header */}
      <div style={{ padding: "56px 40px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 3, marginBottom: 12 }}>REAL ROLES. REAL EQUITY.</div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: 400, letterSpacing: -1.5, lineHeight: 1.05 }}>
            High-equity startup roles,<br />
            <span style={{ color: "#ff4d00", fontStyle: "italic" }}>curated for builders.</span>
          </h1>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 28, fontWeight: 400, color: "#1a1a1a" }}>{stats.total}</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 1 }}>OPEN ROLES</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 28, fontWeight: 400, color: "#1a1a1a" }}>{stats.remote}</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 1 }}>REMOTE</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 28, fontWeight: 400, color: "#ff4d00" }}>{stats.featured}</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 1 }}>FEATURED</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9a9088", fontSize: 14 }}>🔍</span>
          <input
            type="search"
            placeholder="Search roles, companies, skills..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "13px 14px 13px 40px", background: "#fff", border: "1.5px solid #e0dbd4", borderRadius: 10, fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#1a1a1a", outline: "none", transition: "border-color .2s" }}
            onFocus={e => (e.target.style.borderColor = "#ff4d00")}
            onBlur={e => (e.target.style.borderColor = "#e0dbd4")}
          />
        </div>

        {/* Stage filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <button className={`filter-btn${!selectedStage ? " on" : ""}`} onClick={() => setSelectedStage("")}>All Stages</button>
          {STAGES.map(s => (
            <button key={s.id} className={`filter-btn${selectedStage === s.id ? " on" : ""}`}
              onClick={() => setSelectedStage(selectedStage === s.id ? "" : s.id)}
              style={selectedStage === s.id ? { background: STAGE_COLORS[s.id], borderColor: STAGE_COLORS[s.id] } : {}}>
              {s.label}
            </button>
          ))}
          <button
            className={`filter-btn${remoteOnly ? " on" : ""}`}
            onClick={() => setRemoteOnly(!remoteOnly)}
            style={{ marginLeft: "auto" }}>
            🌍 Remote only
          </button>
        </div>

        {/* Archetype filters */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
          <button className={`arch-btn${!selectedArchetype ? " on" : ""}`}
            onClick={() => setSelectedArchetype("")}
            style={!selectedArchetype ? { background: "#1a1a1a", borderColor: "#1a1a1a" } : {}}>
            All Archetypes
          </button>
          {ARCHETYPES.map(a => (
            <button key={a.id}
              className={`arch-btn${selectedArchetype === a.id ? " on" : ""}`}
              onClick={() => setSelectedArchetype(selectedArchetype === a.id ? "" : a.id)}
              style={selectedArchetype === a.id ? { background: a.color, borderColor: a.color } : {}}>
              <span style={{ fontSize: 13 }}>{a.emoji}</span>
              {a.name}
            </button>
          ))}
        </div>

        {/* Results header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9088", letterSpacing: 1 }}>
            {loading ? "LOADING..." : `${filtered.length} ROLE${filtered.length !== 1 ? "S" : ""}`}
            {hasFilters && ` · FILTERED`}
          </div>
          {hasFilters && (
            <button onClick={clearFilters} style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9088", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              clear filters
            </button>
          )}
        </div>
      </div>

      {/* Jobs grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px 80px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9a9088", fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: 2 }}>
            LOADING ROLES...
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ color: "#dc2626", marginBottom: 12 }}>{error}</div>
            <button onClick={loadJobs} style={{ padding: "10px 20px", background: "#ff4d00", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🔍</div>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, marginBottom: 8 }}>No roles match your filters</div>
            <div style={{ fontSize: 13, color: "#9a9088", marginBottom: 20 }}>Try removing some filters or checking back next week</div>
            <button onClick={clearFilters} style={{ padding: "10px 20px", background: "#ff4d00", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>Clear filters</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
            {filtered.map(job => {
              const stageColor = STAGE_COLORS[job.stage] || "#9a9088";
              const archetypeEmojis = (job.archetype_fit || []).slice(0, 2).map(id => ARCHETYPES.find(a => a.id === id)?.emoji || "");
              return (
                <a key={job.id} href={`/jobs/${job.id}`} className="job-card">
                  {job.featured && (
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2.5, background: "#ff4d00" }} />
                  )}

                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.3, marginBottom: 3, lineHeight: 1.3 }}>{job.title}</div>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#9a9088" }}>
                        {job.company}
                        {job.company_type === 'vc' && <span style={{ marginLeft: 6, color: "#6366f1" }}>· VC</span>}
                      </div>
                    </div>
                    {job.featured && (
                      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, padding: "3px 8px", background: "#ff4d0012", border: "1px solid #ff4d0025", borderRadius: 20, color: "#ff4d00", flexShrink: 0 }}>FEATURED</span>
                    )}
                  </div>

                  {/* Pills row */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                    {job.stage && (
                      <span className="pill" style={{ background: `${stageColor}12`, color: stageColor, border: `1px solid ${stageColor}25` }}>
                        {job.stage?.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    )}
                    {job.equity && (
                      <span className="pill" style={{ background: "#6366f112", color: "#6366f1", border: "1px solid #6366f125" }}>
                        {job.equity} equity
                      </span>
                    )}
                    {job.remote && (
                      <span className="pill" style={{ background: "#10b98112", color: "#10b981", border: "1px solid #10b98125" }}>
                        Remote
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: 13, color: "#6b6460", lineHeight: 1.7, marginBottom: 14 }}>
                    {job.description?.slice(0, 120)}...
                  </p>

                  {/* Tags */}
                  {job.tags && job.tags.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      {job.tags.slice(0, 5).map((t, i) => <span key={i} className="tag">{t}</span>)}
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid #f0ebe4" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {archetypeEmojis.map((emoji, i) => (
                        <span key={i} style={{ fontSize: 14 }}>{emoji}</span>
                      ))}
                      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", marginLeft: 4 }}>
                        {(job.archetype_fit || []).length} archetype match{(job.archetype_fit || []).length !== 1 ? "es" : ""}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {job.salary && (
                        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#10b981", fontWeight: 600 }}>{job.salary}</span>
                      )}
                      <span style={{ fontSize: 12, color: "#ff4d00", fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>Apply →</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* Post a job CTA */}
        <div style={{ marginTop: 64, padding: "36px 40px", background: "#1a1a1a", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#444", letterSpacing: 2, marginBottom: 8 }}>FOR STARTUPS & VCs</div>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, fontWeight: 400, color: "#e8e4da", letterSpacing: -0.5, marginBottom: 6 }}>
              Hiring a builder?
            </div>
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>
              Post your role and get seen by archetype-matched builders in the pool.
            </div>
          </div>
          <a href="mailto:hello@joinstartup.app?subject=Post a Job"
            style={{ padding: "13px 28px", background: "#ff4d00", color: "#fff", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14, textDecoration: "none", flexShrink: 0 }}>
            Post a Role →
          </a>
        </div>
      </div>
    </div>
  );
}
