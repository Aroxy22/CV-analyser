"use client";
import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/db";
import type { CvAnalysis, JobListing } from "@/lib/types";

const PLATFORM_META: Record<string, { color: string; bg: string; icon: string }> = {
  "Naukri":    { color: "#ff7555", bg: "#ff755511", icon: "N" },
  "LinkedIn":  { color: "#0077b5", bg: "#0077b511", icon: "in" },
  "Instahyre": { color: "#34d399", bg: "#34d39911", icon: "I" },
  "Wellfound": { color: "#00b4d8", bg: "#00b4d811", icon: "W" },
  "YC Jobs":   { color: "#f97316", bg: "#f9731611", icon: "Y" },
  "Other":     { color: "#7c5cfc", bg: "#7c5cfc11", icon: "?" },
};

interface SearchLink { platform: string; color: string; icon: string; url: string; label: string; }

export function JobsTab({ cv, analysisId, goal }: { cv: CvAnalysis; analysisId: string | null; goal: string }) {
  const [jobs, setJobs]         = useState<JobListing[]>([]);
  const [links, setLinks]       = useState<SearchLink[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const load = useCallback(async (forceRefresh = false) => {
    setLoading(true); setError(null);
    try {
      if (!forceRefresh && analysisId) {
        const cached = await db.getCachedJobs(analysisId);
        if (cached?.jobs_json?.jobs?.length > 0) {
          setJobs(cached.jobs_json.jobs);
          setLinks(cached.jobs_json.search_links ?? []);
          setKeywords(cached.jobs_json.keywords ?? []);
          setLoading(false); return;
        }
      }
      const result = await db.searchJobs(cv, goal);
      setJobs(result.jobs ?? []);
      setLinks(result.search_links ?? []);
      setKeywords(result.keywords ?? []);
      if (analysisId && result.jobs?.length > 0) {
        db.saveJobs(analysisId, result).catch(() => {});
      }
    } catch (e) {
      setError((e as Error).message ?? String(e));
    }
    setLoading(false);
  }, [cv, analysisId, goal]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div style={{ textAlign: "center", paddingTop: 60 }}>
      <div style={{ fontSize: 36, marginBottom: 16 }}><span className="spin">⚙️</span></div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Finding jobs for you</div>
      <div style={{ color: "#555", fontSize: 13 }}>Searching Indian job boards — ~15 seconds…</div>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: "center", padding: 60 }}>
      <div style={{ color: "#f87171", fontSize: 14, marginBottom: 12 }}>⚠️ {error}</div>
      <button onClick={() => load(true)} style={{ background: "#14141e", border: "1px solid #333", borderRadius: 8, color: "#888", padding: "8px 20px", cursor: "pointer" }}>Retry</button>
    </div>
  );

  return (
    <div>
      {keywords.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "#444" }}>Searched for:</span>
          {keywords.map(k => <span key={k} style={{ fontSize: 11, background: "#7c5cfc18", color: "#a78bfa", border: "1px solid #7c5cfc33", padding: "2px 8px", borderRadius: 10 }}>{k}</span>)}
          <button onClick={() => load(true)} style={{ marginLeft: "auto", background: "transparent", border: "1px solid #252535", borderRadius: 8, color: "#555", padding: "4px 10px", cursor: "pointer", fontSize: 11 }}>↻ Refresh</button>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{jobs.length} Jobs Found</div>
        <div style={{ fontSize: 13, color: "#555" }}>Matched to your goal{goal ? `: ${goal.slice(0, 60)}` : ""}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {jobs.map((job, i) => {
          const pm = PLATFORM_META[job.platform] ?? PLATFORM_META["Other"];
          return (
            <div key={job.id ?? i} className="job-card"
              style={{ background: "#14141e", border: "1px solid #252535", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: pm.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: pm.color, flexShrink: 0 }}>{pm.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{job.title}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{job.company} · {job.location} {job.remote && "· Remote"}</div>
                {job.salary && <div style={{ fontSize: 11, color: "#fbbf24", marginTop: 3 }}>💰 {job.salary}</div>}
                {job.match_reason && <div style={{ fontSize: 11, color: "#666", marginTop: 3 }}>{job.match_reason}</div>}
              </div>
              <a href={job.url} target="_blank" rel="noreferrer"
                style={{ fontSize: 12, fontWeight: 600, color: pm.color, textDecoration: "none", padding: "6px 14px", background: pm.bg, border: `1px solid ${pm.color}33`, borderRadius: 20, flexShrink: 0 }}>
                Apply →
              </a>
            </div>
          );
        })}
      </div>

      {jobs.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#444" }}>No jobs found. Try refreshing.</div>
      )}

      {links.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: "#555", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>🔍 Search directly on these platforms</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {links.map((sl, i) => {
              const m = PLATFORM_META[sl.platform] ?? { color: "#888", bg: "#88888811", icon: "?" };
              return (
                <a key={i} href={sl.url} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#14141e", border: `1px solid ${m.color}33`, borderRadius: 12, textDecoration: "none" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: m.color, background: m.color + "22", width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: m.color }}>{sl.platform}</div>
                    <div style={{ fontSize: 11, color: "#555" }}>{sl.label}</div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
