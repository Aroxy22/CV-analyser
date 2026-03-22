"use client";
import { useState } from "react";
import AppNav from "@/components/AppNav";

export default function SeedPage() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch("/api/seed-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "seed_page" }),
      });
      setSubscribed(true);
    } catch { } finally { setLoading(false); }
  };

  return (
    <div style={{ background: "#f5f2ee", color: "#1a1a1a", fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @media(max-width:768px){.nav-links{display:none !important}}
      `}</style>

      <AppNav />

      {/* Hero */}
      <section style={{ padding: "80px 40px 0", maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 3, marginBottom: 16 }}>◆ THE SEED</div>
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(40px,6vw,72px)", fontWeight: 400, letterSpacing: -2.5, lineHeight: 1.0, marginBottom: 20 }}>
          One insight.<br/><span style={{ color: "#ff4d00", fontStyle: "italic" }}>Every Sunday.</span>
        </h1>
        <p style={{ fontSize: 16, color: "#6b6460", lineHeight: 1.75, marginBottom: 48, maxWidth: 480, margin: "0 auto 48px" }}>
          A weekly letter for builders in the Indian startup ecosystem. Pattern recognition, archetypes, and what founders actually look for — written from the data.
        </p>

        {/* Subscribe form */}
        {subscribed ? (
          <div style={{ padding: "28px 32px", background: "#fff", border: "1.5px solid #10b98130", borderRadius: 14, maxWidth: 420, margin: "0 auto" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>✓</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#10b981", marginBottom: 6 }}>You're subscribed</div>
            <div style={{ fontSize: 14, color: "#6b6460", lineHeight: 1.65 }}>First issue lands this Sunday 6 PM. Check your inbox for a confirmation.</div>
            <a href="/analyse" style={{ display: "inline-block", marginTop: 20, padding: "11px 24px", background: "#ff4d00", color: "#fff", borderRadius: 8, fontWeight: 800, fontSize: 13, textDecoration: "none" }}>Analyse my CV while you wait →</a>
          </div>
        ) : (
          <form onSubmit={subscribe} style={{ maxWidth: 420, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 10 }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="your@email.com" autoFocus
                style={{ flex: 1, padding: "14px 16px", border: "1.5px solid #e0dbd4", borderRadius: 10, fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#1a1a1a", outline: "none", background: "#fff" }}
                onFocus={e => e.target.style.borderColor = "#ff4d00"}
                onBlur={e => e.target.style.borderColor = "#e0dbd4"} />
              <button type="submit" disabled={!email || loading}
                style={{ padding: "14px 24px", background: email ? "#ff4d00" : "#e8e2da", color: email ? "#fff" : "#aaa", border: "none", borderRadius: 10, fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 14, cursor: email ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}>
                {loading ? "..." : "Subscribe →"}
              </button>
            </div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#c0b8b0", marginTop: 10, letterSpacing: 0.5 }}>
              Every Sunday 6 PM · Free · Unsubscribe anytime
            </div>
          </form>
        )}
      </section>

      {/* Issue #1 preview */}
      <section style={{ padding: "80px 40px", maxWidth: 640, margin: "0 auto" }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 2, marginBottom: 20 }}>COMING THIS SUNDAY — ISSUE #1</div>
        <div style={{ background: "#fff", border: "1.5px solid #e8e2da", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ height: 4, background: "linear-gradient(90deg,#ff4d00,#f97316)" }} />
          <div style={{ padding: "32px 36px" }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 2, marginBottom: 14 }}>THE INSIGHT</div>
            <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26, fontWeight: 400, letterSpacing: -0.8, color: "#1a1a1a", marginBottom: 18, lineHeight: 1.2 }}>
              Your builder signal is real.<br/>It's just written in the wrong language.
            </h2>
            <p style={{ fontSize: 14, color: "#6b6460", lineHeight: 1.8, marginBottom: 16 }}>
              Builders have done real 0→1 work. They've shipped scrappy products, owned outcomes without a PM, worked directly with founders. The signal is real.
            </p>
            <p style={{ fontSize: 14, color: "#6b6460", lineHeight: 1.8, marginBottom: 24 }}>
              But on their CV it reads: <em>"Led backend development for payments feature."</em> That language was designed for a different kind of hiring. A seed-stage founder scanning in 8 seconds isn't an HR team. They're asking one thing: does this person <strong>build</strong>?
            </p>
            <div style={{ padding: "18px 22px", background: "#f9f7f5", borderRadius: 10, borderLeft: "3px solid #ff4d00", marginBottom: 24 }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 2, marginBottom: 8 }}>THIS WEEK'S PROMPT</div>
              <p style={{ fontFamily: "'Instrument Serif',serif", fontSize: 17, fontStyle: "italic", color: "#1a1a1a", lineHeight: 1.6, margin: 0 }}>
                "Where in your career have you actually built from nothing — and does your CV say that clearly?"
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 20, borderTop: "1px solid #f0ece6" }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#c0b8b0" }}>ISSUE #1 · 27 MARCH 2026</div>
              <div style={{ fontSize: 13, color: "#9a9088" }}>Full issue lands Sunday 6 PM ↑</div>
            </div>
          </div>
        </div>
      </section>

      {/* Past-issues placeholder + what to expect */}
      <section style={{ padding: "0 40px 80px", maxWidth: 640, margin: "0 auto" }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 2, marginBottom: 20 }}>WHAT YOU'LL GET</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            ["The CV pattern I see in every builder who gets ignored by seed-stage founders", "Coming soon"],
            ["Why the India Stack Expert is the most in-demand and least visible archetype", "Coming soon"],
            ["What founding team experience actually signals to a seed-stage founder", "Coming soon"],
          ].map(([title, label], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "#fff", border: "1px solid #e8e2da", borderRadius: 10, gap: 20 }}>
              <span style={{ fontSize: 14, color: "#9a9088", lineHeight: 1.5, flex: 1 }}>{title}</span>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#c0b8b0", letterSpacing: 1, whiteSpace: "nowrap", flexShrink: 0 }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
