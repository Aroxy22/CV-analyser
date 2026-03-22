"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const SUPABASE_URL = "https://xsbsoevqqvnxmtxuytiu.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const ARCHETYPES: Record<string, { name: string; emoji: string; color: string; tagline: string }> = {
  "zero-to-one":         { name: "Zero-to-One Builder",      emoji: "🔥", color: "#ff4d00", tagline: "Ships before it's perfect" },
  "systems-architect":   { name: "Systems Architect",         emoji: "🏗️", color: "#6366f1", tagline: "Builds to last" },
  "growth-hacker":       { name: "Growth Hacker",             emoji: "📈", color: "#10b981", tagline: "Channel obsessed" },
  "founding-generalist": { name: "Founding Generalist",       emoji: "⚡", color: "#f59e0b", tagline: "Wears 5 hats" },
  "product-intuitive":   { name: "Product Intuitive",         emoji: "🎯", color: "#ec4899", tagline: "User obsessed" },
  "operator":            { name: "The Operator",              emoji: "⚙️", color: "#8b5cf6", tagline: "Runs the machine" },
  "deep-tech":           { name: "Deep Tech Builder",         emoji: "🧠", color: "#0ea5e9", tagline: "Loves hard problems" },
  "community-builder":   { name: "Community Builder",         emoji: "🤝", color: "#14b8a6", tagline: "Network effects first" },
  "revenue-animal":      { name: "Revenue Animal",            emoji: "💰", color: "#ef4444", tagline: "Closes deals" },
  "brand-builder":       { name: "Brand Builder",             emoji: "🎨", color: "#f97316", tagline: "Makes startups feel inevitable" },
  "data-whisperer":      { name: "Data Whisperer",            emoji: "📊", color: "#a3e635", tagline: "Numbers to decisions" },
  "market-maker":        { name: "Market Maker",              emoji: "🌍", color: "#2dd4bf", tagline: "Opens doors" },
  "finance-builder":     { name: "Finance Builder",           emoji: "💸", color: "#fbbf24", tagline: "Unit economics obsessed" },
  "pivot-survivor":      { name: "Pivot Survivor",            emoji: "🔄", color: "#94a3b8", tagline: "Battle-tested" },
  "india-stack":         { name: "India Stack Expert",        emoji: "🏭", color: "#4ade80", tagline: "UPI/ONDC expert" },
  "global-translator":   { name: "Global→India Translator",  emoji: "🌐", color: "#818cf8", tagline: "Cross-cultural edge" },
};

type Nomination = {
  id: string;
  nominator_name: string;
  nominee_name: string;
  nominee_email: string;
  suggested_archetype: string;
  evidence: string;
  relationship: string;
  status: string;
  token: string;
};

export default function NominatedPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#f5f2ee", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#9a9088", letterSpacing: 2 }}>LOADING...</div>
      </div>
    }>
      <NominatedContent />
    </Suspense>
  );
}

function NominatedContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [nomination, setNomination] = useState<Nomination | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`/api/get-nomination?token=${token}`)
      .then(r => r.json())
      .then(data => { if (data.nomination) setNomination(data.nomination); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const confirmNomination = async () => {
    if (!nomination) return;
    setConfirming(true);
    try {
      await fetch("/api/confirm-nomination", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: nomination.token }),
      });
      setConfirmed(true);
    } catch { setError("Something went wrong."); }
    finally { setConfirming(false); }
  };

  const arch = nomination ? (ARCHETYPES[nomination.suggested_archetype] || null) : null;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f5f2ee", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#9a9088", letterSpacing: 2 }}>LOADING...</div>
    </div>
  );

  if (!token || !nomination) return (
    <div style={{ minHeight: "100vh", background: "#f5f2ee", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ fontSize: 32 }}>🔍</div>
      <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 24, letterSpacing: -1 }}>Nomination not found</h1>
      <p style={{ fontSize: 14, color: "#9a9088" }}>This link may have expired or been used already.</p>
      <a href="/analyse" style={{ color: "#ff4d00", textDecoration: "none", fontWeight: 700 }}>Analyse your profile instead →</a>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5f2ee", fontFamily: "'DM Sans', system-ui, sans-serif", color: "#1a1a1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
      `}</style>

      <nav style={{ padding: "14px 40px", borderBottom: "1px solid #e8e2da", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(245,242,238,0.95)", backdropFilter: "blur(12px)" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#ff4d00" }}>◆</span>
          <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 13, letterSpacing: 1, color: "#1a1a1a" }}>JOINSTARTUP</span>
        </a>
      </nav>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "56px 24px 100px" }}>
        {confirmed ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#10b981", letterSpacing: 2, marginBottom: 12 }}>NOMINATION CONFIRMED</div>
            <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 30, fontWeight: 400, letterSpacing: -1, marginBottom: 12 }}>
              You accepted the nomination.
            </h1>
            <p style={{ fontSize: 14, color: "#6b6460", lineHeight: 1.75, marginBottom: 28, maxWidth: 400, margin: "0 auto 28px" }}>
              Now upload your CV and get your full archetype analysis — Claude will verify if you really are a{" "}
              <strong style={{ color: arch?.color || "#ff4d00" }}>{arch?.emoji} {arch?.name}</strong>.
            </p>
            <a href={`/analyse?archetype=${nomination.suggested_archetype}&email=${encodeURIComponent(nomination.nominee_email)}&from=nomination`}
              style={{ display: "inline-block", padding: "14px 32px", background: arch?.color || "#ff4d00", color: "#fff", borderRadius: 10, fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 14, textDecoration: "none" }}>
              Analyse my profile →
            </a>
          </div>
        ) : (
          <>
            {/* Archetype reveal */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 3, marginBottom: 14 }}>YOU&apos;VE BEEN NOMINATED</div>
              <div style={{ background: "#fff", border: `1.5px solid ${arch?.color || "#ff4d00"}30`, borderRadius: 16, padding: "28px", position: "relative", overflow: "hidden", marginBottom: 16 }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: arch?.color || "#ff4d00" }} />
                <div style={{ fontSize: 40, marginBottom: 12 }}>{arch?.emoji || "🚀"}</div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: arch?.color || "#ff4d00", letterSpacing: 2, marginBottom: 8 }}>
                  {nomination.nominator_name} THINKS YOU&apos;RE A
                </div>
                <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(24px,5vw,36px)", fontWeight: 400, letterSpacing: -1, lineHeight: 1.1, marginBottom: 6 }}>
                  <span style={{ color: arch?.color || "#ff4d00" }}>{arch?.name || nomination.suggested_archetype}</span>
                </h1>
                <p style={{ fontSize: 13, color: "#9a9088", fontStyle: "italic", marginBottom: 20 }}>{arch?.tagline}</p>

                {/* Evidence */}
                <div style={{ background: "#f5f2ee", borderRadius: 10, padding: "14px 16px", borderLeft: `3px solid ${arch?.color || "#ff4d00"}` }}>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 1.5, marginBottom: 6 }}>WHY THEY NOMINATED YOU</div>
                  <p style={{ fontSize: 13, color: "#333", lineHeight: 1.75, fontStyle: "italic", marginBottom: 6 }}>
                    &ldquo;{nomination.evidence}&rdquo;
                  </p>
                  <p style={{ fontSize: 11, color: "#9a9088", fontFamily: "'DM Mono',monospace" }}>
                    — {nomination.nominator_name} · {nomination.relationship === "worked_together" ? "worked with you" : "seen your work"}
                  </p>
                </div>
              </div>
            </div>

            {/* Is this you? */}
            <div style={{ background: "#fff", border: "1px solid #e8e2da", borderRadius: 14, padding: "24px 28px", marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, fontWeight: 400, letterSpacing: -0.5, marginBottom: 8 }}>
                Is this who you are as a builder?
              </h2>
              <p style={{ fontSize: 13, color: "#6b6460", lineHeight: 1.75, marginBottom: 20 }}>
                Confirm the nomination, then analyse your CV — Claude will verify your archetype, score your startup fit, and map the gaps between where you are and where you want to be.
              </p>

              {error && <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#dc2626", marginBottom: 14 }}>{error}</div>}

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={confirmNomination} disabled={confirming}
                  style={{ padding: "14px", background: arch?.color || "#ff4d00", color: "#fff", border: "none", borderRadius: 10, fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer", transition: "all .2s" }}>
                  {confirming ? "Confirming..." : `Yes, I'm a ${arch?.name || "builder"} — analyse me →`}
                </button>
                <a href="/analyse"
                  style={{ display: "block", textAlign: "center", padding: "12px", border: "1.5px solid #e0dbd4", borderRadius: 10, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13, color: "#6b6460", textDecoration: "none" }}>
                  Analyse my profile without confirming →
                </a>
              </div>
            </div>

            <p style={{ fontSize: 12, color: "#c0b8b0", textAlign: "center", fontFamily: "'DM Mono',monospace", letterSpacing: 0.5 }}>
              Nominated by {nomination.nominator_name} via joinstartup.app
            </p>
          </>
        )}
      </div>
    </div>
  );
}
