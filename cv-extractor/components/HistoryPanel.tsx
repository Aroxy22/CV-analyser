"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import type { AnalysisSummary } from "@/lib/types";

const FIT_COLORS: Record<string, string> = { Strong: "#34d399", Moderate: "#fbbf24", Weak: "#f87171" };

export function HistoryPanel({ onSelect, onClose }: { onSelect: (id: string) => void; onClose: () => void }) {
  const [records, setRecords] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.listAnalyses().then(setRecords).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 380, background: "#0d0d18", borderLeft: "1px solid #1e1e30", padding: 24, overflowY: "auto", animation: "fadeUp .3s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18 }}>Past Analyses</div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#555", cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>

        {loading && <div style={{ color: "#555", fontSize: 14, textAlign: "center", paddingTop: 40 }}>Loading…</div>}
        {!loading && records.length === 0 && (
          <div style={{ color: "#444", fontSize: 14, textAlign: "center", paddingTop: 40 }}>No saved analyses yet.</div>
        )}

        {records.map(r => (
          <div key={r.id} onClick={() => onSelect(r.id)}
            style={{ padding: "14px 16px", background: "#14141e", border: "1px solid #252535", borderRadius: 12, marginBottom: 10, cursor: "pointer", transition: "border-color .2s" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#7c5cfc55")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "#252535")}
          >
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{r.candidate_name ?? "Unknown Candidate"}</div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>{r.candidate_title ?? "—"}</div>
            {r.candidate_goal && (
              <div style={{ fontSize: 11, color: "#a78bfa", marginBottom: 6, background: "#7c5cfc12", padding: "3px 8px", borderRadius: 8, display: "inline-block" }}>
                🎯 {r.candidate_goal.slice(0, 50)}{r.candidate_goal.length > 50 ? "…" : ""}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {r.goal_fit_level && (
                <span style={{ fontSize: 12, fontWeight: 700, color: FIT_COLORS[r.goal_fit_level] ?? "#888" }}>
                  {r.goal_fit_level} Fit
                </span>
              )}
              <span style={{ fontSize: 11, color: "#444", marginLeft: "auto" }}>
                {new Date(r.analyzed_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
