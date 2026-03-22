"use client";

import { useState, useEffect } from "react";

const EDGE_FN = "https://xsbsoevqqvnxmtxuytiu.supabase.co/functions/v1/get-track-advice";

type TrackDef = {
  id: string;
  label: string;
  subhead: string;
  icon: string;
  color: string;
  focus: string;
  description: string;
  cta_label: string;
  cta_href: string;
  fit_score: number;
};

type TrackAdvice = {
  headline: string;
  why_this: string;
  week1: string[];
  month1: string[];
  month2_3: string[];
  watch_out: string[];
  resources: { name: string; url: string; note: string }[];
};

type Props = {
  archetype: string;
  stageBucket: string;
  name?: string;
};

export default function TrackCard({ archetype, stageBucket, name }: Props) {
  const [tracks, setTracks] = useState<TrackDef[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [advice, setAdvice] = useState<TrackAdvice | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const firstName = name ? name.split(" ")[0] : null;

  // Load ranked tracks on mount
  useEffect(() => {
    if (!archetype || !stageBucket) return;
    fetch(EDGE_FN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archetype, stage: stageBucket }),
    })
      .then(r => r.json())
      .then(data => { if (data.tracks) setTracks(data.tracks); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [archetype, stageBucket]);

  // Load advice when a track is selected
  const selectTrack = async (trackId: string) => {
    // Toggle off
    if (selectedTrack === trackId) {
      setSelectedTrack(null);
      setAdvice(null);
      return;
    }
    setSelectedTrack(trackId);
    setAdvice(null);
    setAdviceLoading(true);
    try {
      const res = await fetch(EDGE_FN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archetype, stage: stageBucket, track: trackId }),
      });
      const data = await res.json();
      if (data.advice) setAdvice(data.advice);
    } catch { /* ignore */ }
    finally { setAdviceLoading(false); }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px 0", textAlign: "center" }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#c0b8b0", letterSpacing: 2 }}>
          LOADING YOUR TRACKS...
        </div>
      </div>
    );
  }

  if (!tracks.length) return null;

  const topTrack = tracks[0];

  return (
    <div style={{ width: "100%" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .track-card { border-radius:14px; border:1.5px solid #e8e2da; background:#fff; cursor:pointer; transition:transform .2s, box-shadow .2s, border-color .2s; position:relative; overflow:hidden; animation:fadeUp .45s ease both; }
        .track-card:hover { transform:translateY(-3px); box-shadow:0 6px 20px rgba(0,0,0,.07); }
        .track-card.active { transform:translateY(-2px); }
        .fit-bg { height:3px; background:#f0ebe4; border-radius:100px; overflow:hidden; margin-top:8px; }
        .fit-fill { height:100%; border-radius:100px; transition:width .9s ease; }
        .tag-chip { display:inline-block; padding:2px 9px; border-radius:100px; font-family:'DM Mono',monospace; font-size:9px; margin:2px 2px 0 0; }
        .phase-row { display:flex; gap:8px; align-items:flex-start; padding:8px 0; border-bottom:1px solid #f5f2ee; font-size:12px; color:#6b6460; line-height:1.55; }
        .phase-row:last-child { border-bottom:none; }
        .phase-num { width:18px; height:18px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:800; margin-top:1px; }
        .cta-btn { display:block; text-align:center; padding:11px 16px; border-radius:9px; font-family:'DM Sans',sans-serif; font-weight:800; font-size:13px; text-decoration:none; transition:all .2s; margin-top:14px; }
        .cta-btn:hover { transform:translateY(-1px); }
        @media(max-width:700px) { .track-grid { grid-template-columns:1fr !important; } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#9a9088", letterSpacing: 3, marginBottom: 8 }}>
          YOUR 90-DAY TRACKS
        </div>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(18px,3vw,24px)", fontWeight: 400, letterSpacing: -0.5, lineHeight: 1.2, marginBottom: 4 }}>
          {firstName ? `${firstName}, three paths` : "Three paths"} from here.{" "}
          <span style={{ color: "#ff4d00", fontStyle: "italic" }}>Pick your track.</span>
        </h2>
        <p style={{ fontSize: 12, color: "#9a9088", lineHeight: 1.6 }}>
          Tap a card to see your personalised 90-day plan for that path.
        </p>
      </div>

      {/* Track cards grid */}
      <div className="track-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 12 }}>
        {tracks.map((track, i) => {
          const isTop = track.id === topTrack.id;
          const isActive = selectedTrack === track.id;

          return (
            <div
              key={track.id}
              className={`track-card${isActive ? " active" : ""}`}
              style={{
                animationDelay: `${i * 0.07}s`,
                borderColor: isActive ? `${track.color}55` : isTop ? `${track.color}22` : "#e8e2da",
                boxShadow: isActive ? `0 6px 24px ${track.color}18` : isTop ? `0 2px 8px ${track.color}10` : "none",
              }}
              onClick={() => selectTrack(track.id)}
            >
              {/* Top colour bar */}
              <div style={{ height: 3, background: track.color, opacity: isActive || isTop ? 1 : 0.3 }} />

              <div style={{ padding: "16px" }}>
                {/* Best fit badge */}
                {isTop && (
                  <div style={{ position: "absolute", top: 12, right: 10, padding: "2px 7px", borderRadius: 100, background: `${track.color}15`, border: `1px solid ${track.color}30`, fontFamily: "'DM Mono',monospace", fontSize: 8, color: track.color, letterSpacing: 0.5 }}>
                    BEST FIT
                  </div>
                )}

                <div style={{ fontSize: 24, marginBottom: 8 }}>{track.icon}</div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: track.color, letterSpacing: 1.5, marginBottom: 3 }}>
                  {track.focus.toUpperCase()}
                </div>
                <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: -0.3, color: "#1a1a1a", marginBottom: 2 }}>
                  {track.label}
                </div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", marginBottom: 10 }}>
                  {track.subhead}
                </div>
                <p style={{ fontSize: 11, color: "#6b6460", lineHeight: 1.65, marginBottom: 10 }}>
                  {track.description}
                </p>

                {/* Fit score bar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, color: "#9a9088", letterSpacing: 0.5 }}>ARCHETYPE FIT</span>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: track.color, fontWeight: 700 }}>{track.fit_score}%</span>
                </div>
                <div className="fit-bg">
                  <div className="fit-fill" style={{ width: `${track.fit_score}%`, background: track.color }} />
                </div>

                {/* Tap hint / active indicator */}
                <div style={{ marginTop: 10, textAlign: "center", fontFamily: "'DM Mono',monospace", fontSize: 9, color: isActive ? track.color : "#c0b8b0", letterSpacing: 0.5 }}>
                  {isActive ? "▲ YOUR 90-DAY PLAN" : "TAP TO SEE PLAN ▼"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advice panel — expands below cards when a track is selected */}
      {selectedTrack && (() => {
        const trackDef = tracks.find(t => t.id === selectedTrack)!;

        return (
          <div style={{
            background: "#fff",
            border: `1.5px solid ${trackDef.color}30`,
            borderRadius: 14,
            overflow: "hidden",
            animation: "fadeUp .35s ease",
          }}>
            {/* Header bar */}
            <div style={{ height: 3, background: trackDef.color }} />
            <div style={{ padding: "20px 22px 0" }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: trackDef.color, letterSpacing: 2, marginBottom: 6 }}>
                {trackDef.icon} {trackDef.label.toUpperCase()} — YOUR 90-DAY PLAN
              </div>

              {adviceLoading ? (
                <div style={{ padding: "28px 0", textAlign: "center" }}>
                  <div style={{ width: 18, height: 18, border: `2px solid ${trackDef.color}30`, borderTopColor: trackDef.color, borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 10px" }} />
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9088" }}>PERSONALISING YOUR PLAN...</div>
                </div>
              ) : advice ? (
                <>
                  <h3 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 18, fontWeight: 400, letterSpacing: -0.4, marginBottom: 8, lineHeight: 1.3 }}>
                    {advice.headline}
                  </h3>
                  <p style={{ fontSize: 13, color: "#6b6460", lineHeight: 1.7, marginBottom: 18, padding: "10px 14px", background: `${trackDef.color}08`, borderLeft: `3px solid ${trackDef.color}`, borderRadius: "0 8px 8px 0" }}>
                    {advice.why_this}
                  </p>

                  {/* 3-phase timeline */}
                  {[
                    { label: "This week", items: advice.week1, color: "#ff4d00" },
                    { label: "Month 1",   items: advice.month1, color: "#6366f1" },
                    { label: "Month 2-3", items: advice.month2_3, color: "#10b981" },
                  ].map((phase, pi) => (
                    <div key={pi} style={{ marginBottom: 16 }}>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: phase.color, letterSpacing: 2, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: phase.color }} />
                        {phase.label.toUpperCase()}
                      </div>
                      {phase.items.map((item, ii) => (
                        <div key={ii} className="phase-row">
                          <div className="phase-num" style={{ background: `${phase.color}15`, color: phase.color }}>
                            {ii + 1}
                          </div>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Watch-outs */}
                  {advice.watch_out?.length > 0 && (
                    <div style={{ marginBottom: 16, padding: "12px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10 }}>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#d97706", letterSpacing: 1.5, marginBottom: 8 }}>⚠ WATCH OUT FOR</div>
                      {advice.watch_out.map((w, i) => (
                        <div key={i} style={{ fontSize: 12, color: "#6b6460", lineHeight: 1.6, marginBottom: i < advice.watch_out.length - 1 ? 6 : 0, display: "flex", gap: 7 }}>
                          <span style={{ color: "#d97706", flexShrink: 0 }}>·</span>
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Resources */}
                  {advice.resources?.length > 0 && (
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 1.5, marginBottom: 8 }}>RESOURCES FOR THIS TRACK</div>
                      {advice.resources.map((r, i) => (
                        <a key={i} href={r.url} target={r.url.startsWith("/") ? undefined : "_blank"} rel="noopener noreferrer"
                          style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 0", borderBottom: i < advice.resources.length - 1 ? "1px solid #f5f2ee" : "none", textDecoration: "none" }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: trackDef.color, flexShrink: 0, marginTop: 5 }} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: trackDef.color, marginBottom: 1 }}>{r.name} →</div>
                            <div style={{ fontSize: 11, color: "#9a9088" }}>{r.note}</div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <a href={trackDef.cta_href.replace("{archetype}", archetype || "")} className="cta-btn"
                    style={{ background: trackDef.color, color: "#fff" }}>
                    {trackDef.cta_label} →
                  </a>
                </>
              ) : null}
            </div>

            {/* Bottom note */}
            <div style={{ padding: "12px 22px 16px", marginTop: 14, borderTop: "1px solid #f5f2ee", fontSize: 11, color: "#9a9088", lineHeight: 1.6 }}>
              These tracks aren&apos;t mutually exclusive — pick the one to focus on for the next 90 days.
              Advice is personalised for your <strong style={{ color: "#1a1a1a" }}>{archetype.replace(/-/g, " ")}</strong> archetype and <strong style={{ color: "#1a1a1a" }}>{stageBucket}</strong> stage.
            </div>
          </div>
        );
      })()}
    </div>
  );
}
