"use client";

import { useState, useEffect } from "react";

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || "";

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
  contact_email: string;
  posted_by: string | null;
  status: string;
  featured: boolean;
  source: string;
  created_at: string;
  expires_at: string;
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: "#fef3c7", color: "#d97706" },
  active:  { bg: "#d1fae5", color: "#065f46" },
  filled:  { bg: "#e0e7ff", color: "#4338ca" },
  paused:  { bg: "#fee2e2", color: "#991b1b" },
};

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "paused">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);

  const ADMIN_PW = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "joinstartup2026";

  useEffect(() => {
    // Check session storage for auth
    if (typeof window !== "undefined" && sessionStorage.getItem("admin_authed") === "1") {
      setAuthed(true);
      loadJobs();
    }
  }, []);

  const checkPassword = () => {
    if (pw === ADMIN_PW) {
      sessionStorage.setItem("admin_authed", "1");
      setAuthed(true);
      loadJobs();
    } else {
      setPwError(true);
      setTimeout(() => setPwError(false), 2000);
    }
  };

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/jobs");
      const data = await res.json();
      if (data.ok) setJobs(data.jobs);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const action = async (id: string, act: string, value?: boolean) => {
    setActionLoading(`${id}-${act}`);
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: act, value }),
      });
      const data = await res.json();
      if (data.ok) {
        showToast(act === "approve" ? "✓ Job approved and live" : act === "reject" ? "✗ Job rejected" : act === "feature" ? "★ Featured toggled" : "✓ Done");
        loadJobs();
      }
    } finally { setActionLoading(null); }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const filtered = jobs.filter(j => filter === "all" || j.status === filter);
  const counts = {
    pending: jobs.filter(j => j.status === "pending").length,
    active:  jobs.filter(j => j.status === "active").length,
    paused:  jobs.filter(j => j.status === "paused").length,
  };

  if (!authed) return (
    <div style={{ minHeight: "100vh", background: "#f5f2ee", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ background: "#fff", border: "1px solid #e8e2da", borderRadius: 14, padding: "40px 36px", width: 340, textAlign: "center" }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#ff4d00", marginBottom: 20, letterSpacing: 1 }}>◆ JOINSTARTUP ADMIN</div>
        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && checkPassword()}
          style={{ width: "100%", padding: "12px 14px", border: `1.5px solid ${pwError ? "#ef4444" : "#e0dbd4"}`, borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: "none", marginBottom: 12, color: "#1a1a1a", background: pwError ? "#fef2f2" : "#fff", transition: "all .2s" }}
          autoFocus
        />
        {pwError && <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 10, fontFamily: "'DM Mono',monospace" }}>Incorrect password</div>}
        <button onClick={checkPassword} style={{ width: "100%", padding: "12px", background: "#ff4d00", color: "#fff", border: "none", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
          Enter →
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5f2ee", fontFamily: "'DM Sans', system-ui, sans-serif", color: "#1a1a1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .btn{padding:7px 14px;border-radius:6px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:12px;cursor:pointer;border:none;transition:all .15s}
        .btn:disabled{opacity:.5;cursor:not-allowed}
        .tab{padding:8px 16px;border-radius:100px;font-family:'DM Mono',monospace;font-size:10px;cursor:pointer;border:1.5px solid #e0dbd4;background:#fff;color:#6b6460;transition:all .2s}
        .tab.on{background:#1a1a1a;border-color:#1a1a1a;color:#fff}
      `}</style>

      {/* Nav */}
      <nav style={{ padding: "14px 40px", borderBottom: "1px solid #e8e2da", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="/" style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#ff4d00", textDecoration: "none" }}>◆ JOINSTARTUP</a>
          <span style={{ color: "#e0dbd4" }}>|</span>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#9a9088", letterSpacing: 1 }}>ADMIN / JOBS</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/admin" style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9088", textDecoration: "none" }}>← Admin home</a>
        </div>
      </nav>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, padding: "12px 20px", background: "#1a1a1a", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 13, zIndex: 100, boxShadow: "0 4px 20px rgba(0,0,0,.2)" }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* Header + stats */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 2, marginBottom: 8 }}>JOB MODERATION</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5 }}>Job Listings</h1>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { label: "PENDING", count: counts.pending, color: "#d97706" },
              { label: "ACTIVE",  count: counts.active,  color: "#10b981" },
              { label: "PAUSED",  count: counts.paused,  color: "#ef4444" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.count}</div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {(["pending", "active", "all", "paused"] as const).map(f => (
            <button key={f} className={`tab${filter === f ? " on" : ""}`} onClick={() => setFilter(f)}>
              {f.toUpperCase()} {f !== "all" && counts[f as keyof typeof counts] !== undefined ? `(${counts[f as keyof typeof counts]})` : ""}
            </button>
          ))}
          <button onClick={loadJobs} style={{ marginLeft: "auto", padding: "8px 14px", border: "1.5px solid #e0dbd4", borderRadius: 100, background: "#fff", fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#6b6460", cursor: "pointer" }}>
            ↻ Refresh
          </button>
        </div>

        {/* Jobs list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#9a9088", letterSpacing: 2 }}>LOADING...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9a9088" }}>No {filter} jobs.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(job => {
              const sc = STATUS_COLORS[job.status] || STATUS_COLORS.paused;
              return (
                <div key={job.id} style={{ background: "#fff", border: "1px solid #e0dbd4", borderRadius: 12, padding: "20px 24px", position: "relative", overflow: "hidden" }}>
                  {job.featured && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2.5, background: "#ff4d00" }} />}

                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                    {/* Left — job info */}
                    <div style={{ flex: 1, minWidth: 240 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{job.title}</span>
                        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9088" }}>@ {job.company}</span>
                        <span style={{ padding: "2px 8px", borderRadius: 100, fontSize: 9, fontFamily: "'DM Mono',monospace", fontWeight: 600, background: sc.bg, color: sc.color }}>
                          {job.status.toUpperCase()}
                        </span>
                        {job.featured && <span style={{ padding: "2px 8px", borderRadius: 100, fontSize: 9, fontFamily: "'DM Mono',monospace", background: "#fff8f5", color: "#ff4d00", border: "1px solid #ff4d0025" }}>★ FEATURED</span>}
                      </div>

                      <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#9a9088", fontFamily: "'DM Mono',monospace", marginBottom: 10, flexWrap: "wrap" }}>
                        <span>{job.stage}</span>
                        <span>·</span>
                        <span>{job.location || "India"} {job.remote ? "· Remote" : ""}</span>
                        {job.equity && <><span>·</span><span style={{ color: "#6366f1" }}>{job.equity} equity</span></>}
                        {job.salary && <><span>·</span><span style={{ color: "#10b981" }}>{job.salary}</span></>}
                      </div>

                      <p style={{ fontSize: 13, color: "#6b6460", lineHeight: 1.65, marginBottom: 10 }}>
                        {job.description.slice(0, 180)}{job.description.length > 180 ? "..." : ""}
                      </p>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                        {(job.archetype_fit || []).map((a, i) => (
                          <span key={i} style={{ padding: "2px 8px", borderRadius: 100, fontSize: 9, fontFamily: "'DM Mono',monospace", background: "#f5f2ee", border: "1px solid #e0dbd4", color: "#6b6460" }}>{a}</span>
                        ))}
                      </div>

                      <div style={{ fontSize: 11, color: "#9a9088", fontFamily: "'DM Mono',monospace" }}>
                        Posted by {job.posted_by || "—"} · {job.contact_email} · {new Date(job.created_at).toLocaleDateString("en-IN")}
                        {" · "}<a href={job.apply_url} target="_blank" rel="noopener noreferrer" style={{ color: "#ff4d00", textDecoration: "none" }}>Apply URL ↗</a>
                      </div>
                    </div>

                    {/* Right — actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
                      {job.status === "pending" && (
                        <>
                          <button className="btn" onClick={() => action(job.id, "approve")}
                            disabled={actionLoading === `${job.id}-approve`}
                            style={{ background: "#10b981", color: "#fff", minWidth: 100 }}>
                            {actionLoading === `${job.id}-approve` ? "..." : "✓ Approve"}
                          </button>
                          <button className="btn" onClick={() => action(job.id, "reject")}
                            disabled={actionLoading === `${job.id}-reject`}
                            style={{ background: "#fee2e2", color: "#991b1b", minWidth: 100 }}>
                            {actionLoading === `${job.id}-reject` ? "..." : "✗ Reject"}
                          </button>
                        </>
                      )}
                      {job.status === "active" && (
                        <button className="btn" onClick={() => action(job.id, "pause")}
                          disabled={actionLoading === `${job.id}-pause`}
                          style={{ background: "#f5f2ee", color: "#6b6460", border: "1px solid #e0dbd4", minWidth: 100 }}>
                          {actionLoading === `${job.id}-pause` ? "..." : "⏸ Pause"}
                        </button>
                      )}
                      {job.status === "paused" && (
                        <button className="btn" onClick={() => action(job.id, "approve")}
                          disabled={actionLoading === `${job.id}-approve`}
                          style={{ background: "#10b981", color: "#fff", minWidth: 100 }}>
                          {actionLoading === `${job.id}-approve` ? "..." : "▶ Reactivate"}
                        </button>
                      )}
                      <button className="btn" onClick={() => action(job.id, "feature", !job.featured)}
                        disabled={actionLoading === `${job.id}-feature`}
                        style={{ background: job.featured ? "#fff8f5" : "#f5f2ee", color: job.featured ? "#ff4d00" : "#6b6460", border: `1px solid ${job.featured ? "#ff4d0025" : "#e0dbd4"}`, minWidth: 100 }}>
                        {job.featured ? "★ Unfeature" : "☆ Feature"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
