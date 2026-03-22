"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const SUPABASE_URL = "https://xsbsoevqqvnxmtxuytiu.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzYnNvZXZxcXZueG10eHV5dGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwOTkwNzcsImV4cCI6MjA4ODY3NTA3N30.I7JnlCmHafoFowh6TqepNR4YXxTL7pZdCFJHGmVFuVE";
const ADMIN_KEY = "js2026admin";

const ARCHETYPES: Record<string, { name: string; emoji: string; color: string }> = {
  "zero-to-one":         { name: "Zero-to-One Builder",    emoji: "🔥", color: "#ff4d00" },
  "systems-architect":   { name: "Systems Architect",       emoji: "🏗️", color: "#6366f1" },
  "growth-hacker":       { name: "Growth Hacker",           emoji: "📈", color: "#10b981" },
  "founding-generalist": { name: "Founding Generalist",     emoji: "⚡", color: "#f59e0b" },
  "product-intuitive":   { name: "Product Intuitive",       emoji: "🎯", color: "#ec4899" },
  "operator":            { name: "The Operator",            emoji: "⚙️", color: "#8b5cf6" },
  "deep-tech":           { name: "Deep Tech Builder",       emoji: "🧠", color: "#0ea5e9" },
  "community-builder":   { name: "Community Builder",       emoji: "🤝", color: "#14b8a6" },
  "revenue-animal":      { name: "Revenue Animal",          emoji: "💰", color: "#ef4444" },
  "brand-builder":       { name: "Brand Builder",           emoji: "🎨", color: "#f97316" },
  "data-whisperer":      { name: "Data Whisperer",          emoji: "📊", color: "#a3e635" },
  "market-maker":        { name: "Market Maker",            emoji: "🌍", color: "#2dd4bf" },
  "finance-builder":     { name: "Finance Builder",         emoji: "💸", color: "#fbbf24" },
  "pivot-survivor":      { name: "Pivot Survivor",          emoji: "🔄", color: "#94a3b8" },
  "india-stack":         { name: "India Stack Expert",      emoji: "🏭", color: "#4ade80" },
  "global-translator":   { name: "Global→India Translator", emoji: "🌐", color: "#818cf8" },
};

type Analysis = {
  id: string;
  candidate_name: string | null;
  candidate_email: string | null;
  current_title: string | null;
  current_company: string | null;
  archetype: string | null;
  stage_bucket: string | null;
  goal_fit_level: string | null;
  analyzed_at: string;
  builder_id: string | null;
};

type Builder = {
  id: string;
  name: string | null;
  email: string;
  archetype: string;
  stage_bucket: string;
  pool_status: string;
  current_title: string | null;
  current_company: string | null;
  skills: string[];
  goal: string | null;
  created_at: string;
  profile_token: string;
};

function AdminContent() {
  const params = useSearchParams();
  const key = params.get("key");

  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "analysed" | "builders">("overview");
  const [filter, setFilter] = useState("");

  const sb = (path: string) =>
    fetch(`${SUPABASE_URL}/rest/v1${path}`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
    });

  useEffect(() => {
    if (key !== ADMIN_KEY) { setLoading(false); return; }
    loadData();
  }, [key]);

  const loadData = async () => {
    try {
      const [aRes, bRes] = await Promise.all([
        sb("/cv_analyses?order=analyzed_at.desc&limit=100&select=id,candidate_name,candidate_email,current_title,current_company,archetype,stage_bucket,goal_fit_level,analyzed_at,builder_id"),
        sb("/builders?order=created_at.desc&select=id,name,email,archetype,stage_bucket,pool_status,current_title,current_company,skills,goal,created_at,profile_token"),
      ]);
      const [aData, bData] = await Promise.all([aRes.json(), bRes.json()]);
      setAnalyses(aData || []);
      setBuilders(bData || []);
    } catch { /* silent */ }
    setLoading(false);
  };

  if (key !== ADMIN_KEY) return (
    <div style={{ minHeight: "100vh", background: "#07070b", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: "#333" }}>access denied</div>
    </div>
  );

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#07070b", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#333" }}>loading...</div>
    </div>
  );

  // Dedupe analyses by email (latest per email)
  const uniqueAnalyses = analyses.reduce((acc, a) => {
    const key = a.candidate_email || a.id;
    if (!acc[key] || a.analyzed_at > acc[key].analyzed_at) acc[key] = a;
    return acc;
  }, {} as Record<string, Analysis>);
  const dedupedAnalyses = Object.values(uniqueAnalyses).sort((a, b) => b.analyzed_at.localeCompare(a.analyzed_at));

  const paidBuilders = builders.filter(b => b.pool_status === "paid");
  const notPaid = dedupedAnalyses.filter(a => !a.builder_id);
  const convRate = dedupedAnalyses.length > 0 ? Math.round((paidBuilders.length / dedupedAnalyses.length) * 100) : 0;

  // Archetype breakdown
  const archetypeCounts: Record<string, number> = {};
  dedupedAnalyses.forEach(a => { if (a.archetype) archetypeCounts[a.archetype] = (archetypeCounts[a.archetype] || 0) + 1; });
  const topArchetypes = Object.entries(archetypeCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const filteredAnalyses = dedupedAnalyses.filter(a =>
    !filter || [a.candidate_name, a.candidate_email, a.current_title, a.archetype].some(f => f?.toLowerCase().includes(filter.toLowerCase()))
  );
  const filteredBuilders = builders.filter(b =>
    !filter || [b.name, b.email, b.current_title, b.archetype].some(f => f?.toLowerCase().includes(filter.toLowerCase()))
  );

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ minHeight: "100vh", background: "#07070b", color: "#e8e4da", fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .row:hover{background:#0d0d14}
        .tab{padding:8px 16px;border-radius:6px;border:none;background:transparent;color:#444;font-size:12px;font-family:'DM Mono',monospace;cursor:pointer;letter-spacing:.5px}
        .tab.on{background:#1a1a26;color:#e8e4da}
        .pill{display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-family:'DM Mono',monospace;font-weight:600}
      `}</style>

      {/* NAV */}
      <div style={{ padding: "14px 32px", borderBottom: "1px solid #111118", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#ff4d00" }}>◆</span>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#444", letterSpacing: 1 }}>JOINSTARTUP · ADMIN</span>
        </div>
        <div style={{ fontSize: 11, color: "#222", fontFamily: "'DM Mono',monospace" }}>{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 28 }}>
          {[
            { label: "CVs analysed", value: analyses.length, sub: `${dedupedAnalyses.length} unique people`, color: "#ff4d00" },
            { label: "Paid builders", value: paidBuilders.length, sub: "in the pool", color: "#10b981" },
            { label: "Not converted", value: notPaid.length, sub: "analysed, didn't pay", color: "#f59e0b" },
            { label: "Conversion", value: `${convRate}%`, sub: "analyse → paid", color: "#6366f1" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#0d0d14", border: "1px solid #1a1a26", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#333", letterSpacing: 1.5, marginBottom: 10 }}>{s.label.toUpperCase()}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: -1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#333" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* TABS + FILTER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 4 }}>
            <button className={`tab${tab === "overview" ? " on" : ""}`} onClick={() => setTab("overview")}>OVERVIEW</button>
            <button className={`tab${tab === "analysed" ? " on" : ""}`} onClick={() => setTab("analysed")}>ANALYSED ({dedupedAnalyses.length})</button>
            <button className={`tab${tab === "builders" ? " on" : ""}`} onClick={() => setTab("builders")}>BUILDERS ({builders.length})</button>
          </div>
          {tab !== "overview" && (
            <input
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Filter by name, email, archetype..."
              style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #1a1a26", background: "#0d0d14", color: "#e8e4da", fontSize: 12, fontFamily: "'DM Mono',monospace", width: 260 }}
            />
          )}
        </div>

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* Archetype breakdown */}
            <div style={{ background: "#0d0d14", border: "1px solid #1a1a26", borderRadius: 12, padding: 20 }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#333", letterSpacing: 1.5, marginBottom: 16 }}>ARCHETYPES</div>
              {topArchetypes.map(([arch, count]) => {
                const a = ARCHETYPES[arch];
                const pct = Math.round((count / dedupedAnalyses.length) * 100);
                return (
                  <div key={arch} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "#888" }}>{a?.emoji} {a?.name || arch}</span>
                      <span style={{ fontSize: 11, color: a?.color || "#666", fontFamily: "'DM Mono',monospace" }}>{count} · {pct}%</span>
                    </div>
                    <div style={{ background: "#1a1a26", borderRadius: 100, height: 3 }}>
                      <div style={{ width: `${pct}%`, height: 3, borderRadius: 100, background: a?.color || "#666" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent activity */}
            <div style={{ background: "#0d0d14", border: "1px solid #1a1a26", borderRadius: 12, padding: 20 }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#333", letterSpacing: 1.5, marginBottom: 16 }}>RECENT ACTIVITY</div>
              {dedupedAnalyses.slice(0, 8).map((a, i) => {
                const arch = ARCHETYPES[a.archetype || ""];
                const paid = !!a.builder_id;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #111118" }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{arch?.emoji || "?"}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.candidate_name || a.candidate_email || "Anonymous"}
                      </div>
                      <div style={{ fontSize: 10, color: "#333", fontFamily: "'DM Mono',monospace" }}>{fmt(a.analyzed_at)}</div>
                    </div>
                    <span className="pill" style={{ background: paid ? "#10b98115" : "#ffffff08", color: paid ? "#10b981" : "#333", border: `1px solid ${paid ? "#10b98130" : "#1a1a26"}` }}>
                      {paid ? "paid" : "free"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Not converted — follow up */}
            <div style={{ background: "#0d0d14", border: "1px solid #1a1a26", borderRadius: 12, padding: 20, gridColumn: "1 / -1" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#f59e0b", letterSpacing: 1.5 }}>ANALYSED BUT NOT PAID — FOLLOW UP</div>
                <span className="pill" style={{ background: "#f59e0b15", color: "#f59e0b", border: "1px solid #f59e0b30" }}>{notPaid.length}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {notPaid.filter(a => a.candidate_name || a.candidate_email).slice(0, 9).map((a, i) => {
                  const arch = ARCHETYPES[a.archetype || ""];
                  return (
                    <div key={i} style={{ background: "#111118", borderRadius: 8, padding: "12px 14px", border: "1px solid #1a1a26" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 16 }}>{arch?.emoji || "?"}</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#888" }}>{a.candidate_name || "—"}</div>
                          <div style={{ fontSize: 10, color: "#333", fontFamily: "'DM Mono',monospace" }}>{a.candidate_email || "no email"}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: arch?.color || "#444" }}>{arch?.name || a.archetype}</div>
                      <div style={{ fontSize: 10, color: "#333", marginTop: 2 }}>{a.current_title || "—"}</div>
                      <div style={{ fontSize: 10, color: "#222", marginTop: 4, fontFamily: "'DM Mono',monospace" }}>{fmt(a.analyzed_at)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ANALYSED TAB */}
        {tab === "analysed" && (
          <div style={{ background: "#0d0d14", border: "1px solid #1a1a26", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1a1a26" }}>
                  {["Name", "Email", "Title / Company", "Archetype", "Stage", "Fit", "Time", "Status"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#333", letterSpacing: 1, fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAnalyses.map((a, i) => {
                  const arch = ARCHETYPES[a.archetype || ""];
                  const paid = !!a.builder_id;
                  return (
                    <tr key={i} className="row" style={{ borderBottom: "1px solid #0d0d14", cursor: "default" }}>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: "#888", whiteSpace: "nowrap" }}>{a.candidate_name || <span style={{ color: "#2a2a3a" }}>—</span>}</td>
                      <td style={{ padding: "10px 14px", fontSize: 11, color: "#444", fontFamily: "'DM Mono',monospace", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.candidate_email || <span style={{ color: "#2a2a3a" }}>—</span>}</td>
                      <td style={{ padding: "10px 14px", fontSize: 11, color: "#555", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.current_title ? `${a.current_title}${a.current_company ? ` · ${a.current_company}` : ""}` : <span style={{ color: "#2a2a3a" }}>—</span>}</td>
                      <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 11, color: arch?.color || "#444" }}>{arch?.emoji} {arch?.name || a.archetype || "—"}</span>
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 10, color: "#444", fontFamily: "'DM Mono',monospace", whiteSpace: "nowrap" }}>{a.stage_bucket || "—"}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span className="pill" style={{
                          background: a.goal_fit_level === "Strong" ? "#10b98115" : a.goal_fit_level === "Moderate" ? "#f59e0b15" : "#6366f115",
                          color: a.goal_fit_level === "Strong" ? "#10b981" : a.goal_fit_level === "Moderate" ? "#f59e0b" : "#6366f1",
                          border: `1px solid ${a.goal_fit_level === "Strong" ? "#10b98130" : a.goal_fit_level === "Moderate" ? "#f59e0b30" : "#6366f130"}`,
                        }}>{a.goal_fit_level || "—"}</span>
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 10, color: "#2a2a3a", fontFamily: "'DM Mono',monospace", whiteSpace: "nowrap" }}>{fmt(a.analyzed_at)}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span className="pill" style={{ background: paid ? "#10b98115" : "#ffffff05", color: paid ? "#10b981" : "#2a2a3a", border: `1px solid ${paid ? "#10b98130" : "#1a1a26"}` }}>
                          {paid ? "✓ paid" : "free"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredAnalyses.length === 0 && (
              <div style={{ padding: "32px", textAlign: "center", fontSize: 12, color: "#2a2a3a", fontFamily: "'DM Mono',monospace" }}>no results</div>
            )}
          </div>
        )}

        {/* BUILDERS TAB */}
        {tab === "builders" && (
          <div style={{ background: "#0d0d14", border: "1px solid #1a1a26", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1a1a26" }}>
                  {["Name", "Email", "Title / Company", "Archetype", "Stage", "Status", "Joined", "Profile"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#333", letterSpacing: 1, fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredBuilders.map((b, i) => {
                  const arch = ARCHETYPES[b.archetype] || null;
                  return (
                    <tr key={i} className="row" style={{ borderBottom: "1px solid #0d0d14" }}>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: "#888", whiteSpace: "nowrap" }}>{b.name || <span style={{ color: "#2a2a3a" }}>—</span>}</td>
                      <td style={{ padding: "10px 14px", fontSize: 11, color: "#444", fontFamily: "'DM Mono',monospace", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.email}</td>
                      <td style={{ padding: "10px 14px", fontSize: 11, color: "#555", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.current_title ? `${b.current_title}${b.current_company ? ` · ${b.current_company}` : ""}` : <span style={{ color: "#2a2a3a" }}>—</span>}</td>
                      <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 11, color: arch?.color || "#444" }}>{arch?.emoji} {arch?.name || b.archetype}</span>
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 10, color: "#444", fontFamily: "'DM Mono',monospace" }}>{b.stage_bucket}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span className="pill" style={{
                          background: b.pool_status === "paid" ? "#10b98115" : b.pool_status === "nominated" ? "#f59e0b15" : "#ffffff05",
                          color: b.pool_status === "paid" ? "#10b981" : b.pool_status === "nominated" ? "#f59e0b" : "#2a2a3a",
                          border: `1px solid ${b.pool_status === "paid" ? "#10b98130" : b.pool_status === "nominated" ? "#f59e0b30" : "#1a1a26"}`,
                        }}>{b.pool_status}</span>
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 10, color: "#2a2a3a", fontFamily: "'DM Mono',monospace", whiteSpace: "nowrap" }}>{fmt(b.created_at)}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <a href={`/profile?token=${b.profile_token}`} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 10, color: "#ff4d00", fontFamily: "'DM Mono',monospace", textDecoration: "none" }}>
                          view →
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredBuilders.length === 0 && (
              <div style={{ padding: "32px", textAlign: "center", fontSize: 12, color: "#2a2a3a", fontFamily: "'DM Mono',monospace" }}>no results</div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#07070b" }} />}>
      <AdminContent />
    </Suspense>
  );
}
