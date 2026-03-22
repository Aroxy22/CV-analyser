"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Persona = "builder" | "founder" | "recruiter" | "seed";

const PERSONAS: { id: Persona; emoji: string; title: string; desc: string; price: string }[] = [
  { id: "builder", emoji: "⚙️", title: "I'm a builder", desc: "Get analysed. Join the pool. Be found.", price: "₹499 one-time" },
  { id: "founder", emoji: "🚀", title: "I'm a founder", desc: "Search the builder pool. Find talent.", price: "₹2,999/mo" },
  { id: "recruiter", emoji: "📋", title: "I'm a recruiter", desc: "Batch CVs. Ranked shortlists.", price: "₹9,999/mo" },
  { id: "seed", emoji: "🌱", title: "The Sunday Seed", desc: "Weekly curated roles. Free.", price: "Free" },
];

export default function SignupPage() {
  const [persona, setPersona] = useState<Persona>("builder");
  const [mounted, setMounted] = useState(false);
  // Founder form
  const [fName, setFName] = useState("");
  const [fEmail, setFEmail] = useState("");
  const [fCompany, setFCompany] = useState("");
  const [fStage, setFStage] = useState("");
  const [fLoading, setFLoading] = useState(false);
  const [fSuccess, setFSuccess] = useState(false);
  // Recruiter form (mailto fallback)
  const [rName, setRName] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rCompany, setRCompany] = useState("");
  // Seed form
  const [sEmail, setSEmail] = useState("");
  const [sLoading, setSLoading] = useState(false);
  const [sSuccess, setSSuccess] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleFounderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fEmail) return;
    setFLoading(true);
    try {
      const res = await fetch("/api/founder-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fEmail,
          name: fName || undefined,
          company: fCompany || undefined,
          source: "signup_page",
        }),
      });
      if (res.ok) setFSuccess(true);
    } finally {
      setFLoading(false);
    }
  };

  const handleSeedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sEmail) return;
    setSLoading(true);
    try {
      const res = await fetch("/api/seed-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sEmail, source: "signup_page" }),
      });
      const data = await res.json();
      if (data.ok !== false) setSSuccess(true);
    } finally {
      setSLoading(false);
    }
  };

  const recruiterMailto = `mailto:hello@joinstartup.app?subject=Recruiter access request&body=Name: ${encodeURIComponent(rName || "—")}%0AEmail: ${encodeURIComponent(rEmail || "—")}%0ACompany: ${encodeURIComponent(rCompany || "—")}%0A%0AI'd like to learn more about the batch CV processing tool.`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(165deg, #f5f2ee 0%, #f0ebe4 50%, #f5f2ee 100%)",
        color: "#1a1a1a",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        alignItems: "stretch",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        .signup-fade { opacity: 0; transform: translateY(12px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .signup-fade.in { opacity: 1; transform: translateY(0); }
        .persona-card { transition: all 0.2s; cursor: pointer; }
        .persona-card:hover { transform: translateX(4px); }
        @media (max-width: 900px) {
          .signup-grid { grid-template-columns: 1fr !important; }
          .signup-left { min-height: 240px; padding: 32px 24px !important; }
          .signup-right { padding: 32px 24px !important; }
        }
      `}</style>

      {/* Left panel */}
      <div
        className="signup-left"
        style={{
          padding: "48px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: 400,
            height: 400,
            background: "radial-gradient(circle, rgba(255,77,0,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div className={`signup-fade ${mounted ? "in" : ""}`} style={{ position: "relative", zIndex: 1 }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "#9a9088",
              letterSpacing: 1.5,
              textDecoration: "none",
              marginBottom: 40,
            }}
          >
            <span style={{ color: "#ff4d00" }}>◆</span> JOINSTARTUP
          </Link>
          <h1
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 400,
              letterSpacing: -1.5,
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Join India&apos;s<br />
            <span style={{ color: "#ff4d00", fontStyle: "italic" }}>startup talent</span>
            <br />
            layer.
          </h1>
          <p style={{ fontSize: 15, color: "#6b6460", lineHeight: 1.7, maxWidth: 360, marginBottom: 32 }}>
            Choose how you want to use JoinStartup.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PERSONAS.map((p) => (
              <div
                key={p.id}
                className="persona-card"
                onClick={() => setPersona(p.id)}
                style={{
                  padding: "16px 20px",
                  borderRadius: 12,
                  border: `1.5px solid ${persona === p.id ? "#ff4d00" : "#e8e2da"}`,
                  background: persona === p.id ? "#fff8f5" : "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div style={{ fontSize: 22, flexShrink: 0 }}>{p.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: "#6b6460" }}>{p.desc}</div>
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: persona === p.id ? "#ff4d00" : "#9a9088" }}>{p.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div
        className="signup-right"
        style={{
          padding: "48px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(20px)",
          borderLeft: "1px solid rgba(232,226,218,0.8)",
        }}
      >
        <div className={`signup-fade ${mounted ? "in" : ""}`} style={{ transitionDelay: "120ms", maxWidth: 420, margin: "0 auto", width: "100%" }}>
          {persona === "builder" && (
            <>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#9a9088", letterSpacing: 2, marginBottom: 12 }}>BUILDER</div>
              <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, marginBottom: 8 }}>Start with your analysis</h2>
              <p style={{ fontSize: 14, color: "#6b6460", lineHeight: 1.6, marginBottom: 28 }}>
                Free to analyse. ₹499 to join the pool and be visible to founders.
              </p>
              <Link
                href="/analyse"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "14px 20px",
                  background: "#ff4d00",
                  color: "#fff",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: "none",
                  marginBottom: 16,
                }}
              >
                Analyse my profile free →
              </Link>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: "#e8e2da" }} />
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#9a9088" }}>or</span>
                <div style={{ flex: 1, height: 1, background: "#e8e2da" }} />
              </div>
              <Link
                href="/login?mode=signup"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "14px 20px",
                  background: "#fff",
                  color: "#1a1a1a",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: "none",
                  border: "1.5px solid #e8e2da",
                }}
              >
                Create account first →
              </Link>
              <p style={{ marginTop: 20, fontSize: 13, color: "#9a9088", textAlign: "center" }}>
                Already analysed? <Link href="/profile/access" style={{ color: "#ff4d00", fontWeight: 600, textDecoration: "none" }}>Get your profile link →</Link>
              </p>
            </>
          )}

          {persona === "founder" && (
            fSuccess ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>✓</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#10b981", letterSpacing: 2, marginBottom: 12 }}>REQUEST RECEIVED</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>We&apos;ll be in touch</h2>
                <p style={{ fontSize: 14, color: "#6b6460", lineHeight: 1.7, marginBottom: 24 }}>
                  Founder access is set up within 24 hours. Check your inbox for next steps.
                </p>
                <Link href="/founders" style={{ display: "inline-block", padding: "12px 24px", background: "#6366f1", color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Learn more →</Link>
              </div>
            ) : (
              <form onSubmit={handleFounderSubmit}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#9a9088", letterSpacing: 2, marginBottom: 12 }}>FOUNDER</div>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Find builders who ship</h2>
                <p style={{ fontSize: 14, color: "#6b6460", lineHeight: 1.6, marginBottom: 24 }}>Search the pool by archetype and stage. We&apos;ll set you up within 24 hours.</p>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#9a9088", marginBottom: 6 }}>NAME</label>
                  <input type="text" placeholder="Arjun Mehta" value={fName} onChange={(e) => setFName(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e0dbd4", fontSize: 14, background: "#fff" }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#9a9088", marginBottom: 6 }}>EMAIL *</label>
                  <input type="email" required placeholder="you@startup.com" value={fEmail} onChange={(e) => setFEmail(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e0dbd4", fontSize: 14, background: "#fff" }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#9a9088", marginBottom: 6 }}>COMPANY / STARTUP</label>
                  <input type="text" placeholder="Apex Dynamics" value={fCompany} onChange={(e) => setFCompany(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e0dbd4", fontSize: 14, background: "#fff" }} />
                </div>
                <button type="submit" disabled={fLoading || !fEmail} style={{ width: "100%", padding: "14px", background: fLoading || !fEmail ? "#e8e2da" : "#6366f1", color: fLoading || !fEmail ? "#9a9088" : "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: fLoading || !fEmail ? "not-allowed" : "pointer" }}>{fLoading ? "Sending…" : "Request founder access →"}</button>
              </form>
            )
          )}

          {persona === "recruiter" && (
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#9a9088", letterSpacing: 2, marginBottom: 12 }}>RECRUITER</div>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Batch. Rank. Shortlist.</h2>
              <p style={{ fontSize: 14, color: "#6b6460", lineHeight: 1.6, marginBottom: 24 }}>Upload up to 200 CVs. AI-ranked shortlists. Export to ATS. ₹9,999/month.</p>
              <a href="/recruiters" style={{ display: "block", textAlign: "center", padding: "14px 20px", background: "#ec4899", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none", marginBottom: 16 }}>Learn about recruiter access →</a>
              <p style={{ fontSize: 13, color: "#9a9088", textAlign: "center" }}>
                Or <a href={recruiterMailto} style={{ color: "#ec4899", fontWeight: 600, textDecoration: "none" }}>email us</a> to request access.
              </p>
            </div>
          )}

          {persona === "seed" && (
            sSuccess ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>🌱</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#10b981", letterSpacing: 2, marginBottom: 12 }}>YOU&apos;RE ON THE LIST</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>First Seed this Sunday</h2>
                <p style={{ fontSize: 14, color: "#6b6460", lineHeight: 1.7, marginBottom: 24 }}>Check your inbox. Add hello@joinstartup.app to your contacts.</p>
                <Link href="/jobs" style={{ display: "inline-block", padding: "12px 24px", background: "#ff4d00", color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Browse roles →</Link>
              </div>
            ) : (
              <form onSubmit={handleSeedSubmit}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#9a9088", letterSpacing: 2, marginBottom: 12 }}>THE SUNDAY SEED</div>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Top 5 equity roles, every Sunday</h2>
                <p style={{ fontSize: 14, color: "#6b6460", lineHeight: 1.6, marginBottom: 24 }}>Free. No spam. Unsubscribe anytime.</p>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#9a9088", marginBottom: 6 }}>YOUR EMAIL</label>
                  <input type="email" required placeholder="you@email.com" value={sEmail} onChange={(e) => setSEmail(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e0dbd4", fontSize: 14, background: "#fff" }} />
                </div>
                <button type="submit" disabled={sLoading || !sEmail} style={{ width: "100%", padding: "14px", background: sLoading || !sEmail ? "#e8e2da" : "#ff4d00", color: sLoading || !sEmail ? "#9a9088" : "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: sLoading || !sEmail ? "not-allowed" : "pointer" }}>{sLoading ? "Subscribing…" : "Send me the Seed →"}</button>
                <p style={{ marginTop: 16, fontSize: 12, color: "#9a9088" }}><Link href="/jobs" style={{ color: "#ff4d00", fontWeight: 600, textDecoration: "none" }}>Browse all roles →</Link></p>
              </form>
            )
          )}
        </div>
      </div>
    </div>
  );
}
