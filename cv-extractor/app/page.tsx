"use client";

import { useState, useEffect, useRef } from "react";
import ProfileHero from "@/components/ProfileHero";
import AppNav from "@/components/AppNav";

const TICKER_ITEMS = [
  "◆ Builders trusted by founders",
  "◆ Early-stage ready",
  "◆ 0→1 specialists",
  "◆ Founding engineers",
  "◆ Product builders",
  "◆ Growth operators",
  "◆ India's startup layer",
  "◆ Revenue animals",
  "◆ Deep tech builders",
  "◆ Brand builders",
];

const BUILDER_CARDS = [
  { emoji: "🤖", role: "AI Engineer",       stage: "0→1",    tags: ["Fast shipping", "High ownership", "Experimentation"], fit: 88, archetype: "deep-tech" },
  { emoji: "🎨", role: "Product Designer",  stage: "1→10",   tags: ["Structured", "End-to-end", "Systems thinker"],        fit: 75, archetype: "brand-builder" },
  { emoji: "⚙️", role: "Founding Engineer", stage: "0→1",    tags: ["Generalist", "Zero→1", "High ambiguity"],            fit: 95, archetype: "zero-to-one" },
  { emoji: "📈", role: "Growth Lead",       stage: "Seed→A", tags: ["Data-driven", "Scrappy", "Channel builder"],         fit: 92, archetype: "growth-hacker" },
  { emoji: "🔬", role: "Data Scientist",    stage: "Seed→B", tags: ["First-principles", "Independent", "Impact obsessed"], fit: 79, archetype: "data-whisperer" },
];

const ARCHETYPE_COLORS: Record<string, string> = {
  "deep-tech": "#0ea5e9", "brand-builder": "#f97316", "zero-to-one": "#ff4d00",
  "growth-hacker": "#10b981", "data-whisperer": "#a3e635",
};

export default function LandingPage() {
  const [tickerOffset, setTickerOffset] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tickerRef = useRef<number>(0);
  const [dragOver, setDragOver] = useState(false);
  const [dropError, setDropError] = useState("");
  const landingFileRef = useRef<HTMLInputElement>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    setVisible(true);
    fetch("/api/health").catch(() => {});
    const warmInterval = setInterval(() => fetch("/api/health").catch(() => {}), 10 * 60 * 1000);
    const tick = () => {
      tickerRef.current += 0.4;
      setTickerOffset(tickerRef.current);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      clearInterval(warmInterval);
    };
  }, []);

  const itemWidth = 220;
  const totalWidth = TICKER_ITEMS.length * itemWidth;
  const offset = tickerOffset % totalWidth;
  const tickerContent = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f2ee", color: "#1a1a1a", fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .fade-up{opacity:0;transform:translateY(16px);transition:opacity .7s ease,transform .7s ease}
        .fade-up.in{opacity:1;transform:translateY(0)}
        .btn-primary{display:inline-flex;align-items:center;gap:8px;padding:14px 36px;border-radius:6px;background:#ff4d00;color:#fff;font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;letter-spacing:.2px;text-decoration:none;border:none;cursor:pointer;transition:all .2s}
        .btn-primary:hover{background:#e63d00;transform:translateY(-1px);box-shadow:0 6px 20px #ff4d0025}
        .btn-ghost{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:6px;background:transparent;color:#6b6460;font-family:'DM Sans',sans-serif;font-weight:600;font-size:13px;text-decoration:none;border:1px solid #e0dbd4;cursor:pointer;transition:all .2s}
        .btn-ghost:hover{border-color:#c0b8b0;color:#1a1a1a}
        .how-step{padding:28px 32px;border:1px solid #e0dbd4;border-radius:12px;background:#fff;position:relative;overflow:hidden}
        .tag-pill{display:inline-block;padding:3px 9px;border-radius:100px;font-size:9px;font-weight:600;font-family:'DM Mono',monospace;background:#f5f2ee;border:1px solid #e0dbd4;color:#9a9088}
        .fit-bar-bg{background:#e8e2da;border-radius:100px;height:3px;width:100%}
        .fit-bar{height:3px;border-radius:100px}
        .sl{font-family:'DM Mono',monospace;font-size:9px;font-weight:500;letter-spacing:2px;color:#9a9088}
        .divider{border:none;border-top:1px solid #e8e2da;margin:0}
        .builder-card{background:#fff;border:1px solid #e0dbd4;border-radius:12px;padding:20px;cursor:pointer;transition:all .25s;position:relative;overflow:hidden}
        .ticker-item{flex-shrink:0;width:220px;font-family:'DM Mono',monospace;font-size:11px;color:#c0b8b0;letter-spacing:1px;display:flex;align-items:center;padding:0 12px}
        .nav-link{font-size:13px;color:#6b6460;text-decoration:none;font-weight:500;transition:color .2s;white-space:nowrap}
        .nav-link:hover{color:#1a1a1a}
        @media(max-width:900px){
          .how-grid{grid-template-columns:1fr !important}
          .cards-grid{grid-template-columns:1fr 1fr !important}
          .nav-links-desktop{display:none !important}
          .hero-h1{font-size:clamp(38px,8vw,56px) !important;letter-spacing:-2px !important}
        }
        @media(max-width:640px){
          nav{padding:14px 20px !important}
          .cards-grid{grid-template-columns:1fr !important}
        }
      `}</style>

      <AppNav />

      {/* ── HERO ── */}
      <section style={{ position: "relative", overflow: "hidden", paddingBottom: 0 }}>

        {/* Ambient glow */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 1200, height: 600, background: "radial-gradient(ellipse at 50% 10%, #ff4d0008 0%, transparent 60%)", pointerEvents: "none" }} />

        {/* Headline */}
        <div className={`fade-up${visible ? " in" : ""}`} style={{ transitionDelay: "0ms", textAlign: "center", padding: "56px 24px 28px", position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9088", letterSpacing: 3, marginBottom: 18 }}>
            INDIA&apos;S STARTUP TALENT LAYER
          </div>
          <h1 className="hero-h1" style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(48px, 6.5vw, 86px)", letterSpacing: -3, lineHeight: 0.92, fontWeight: 400 }}>
            Same CV.<br />
            <span style={{ color: "#ff4d00", fontStyle: "italic" }}>Three reads.</span>
          </h1>
          <p style={{ fontSize: 15, color: "#6b6460", marginTop: 20, lineHeight: 1.7 }}>
            Drop any profile — see how AI, founders, and recruiters each read you.
          </p>
        </div>

        {/* ProfileHero */}
        <div className={`fade-up${visible ? " in" : ""}`} style={{ transitionDelay: "100ms", position: "relative", zIndex: 1, padding: "0 16px" }}>
          <div style={{ maxWidth: 1000, width: "100%", margin: "0 auto", borderRadius: "16px 16px 0 0", overflow: "hidden", border: "1px solid #e0dbd4", borderBottom: "none", boxShadow: "0 -20px 60px -10px #ff4d0008" }}>
            <ProfileHero />
          </div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 32, background: "linear-gradient(transparent, #f5f2ee)", pointerEvents: "none" }} />
        </div>

        {/* CTA + Drop Zone */}
        <div className={`fade-up${visible ? " in" : ""}`} style={{ transitionDelay: "200ms", textAlign: "center", padding: "32px 24px 64px", position: "relative", zIndex: 2 }}>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f?.type === "application/pdf") {
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    sessionStorage.setItem("landing_cv_name", f.name);
                    sessionStorage.setItem("landing_cv_size", String(f.size));
                    sessionStorage.setItem("landing_cv_data", (reader.result as string).split(",")[1]);
                  } catch { /* storage full */ }
                  window.location.href = "/analyse?from=landing_drop";
                };
                reader.readAsDataURL(f);
              } else {
                setDropError("PDF only — drop a PDF file");
                setTimeout(() => setDropError(""), 3000);
              }
            }}
            onClick={() => landingFileRef.current?.click()}
            style={{
              maxWidth: 480,
              margin: "0 auto 20px",
              padding: dragOver ? "28px 24px" : "22px 24px",
              border: `2px dashed ${dragOver ? "#ff4d00" : dropError ? "#ef4444" : "#d0c9c0"}`,
              borderRadius: 14,
              background: dragOver ? "#fff8f5" : "#fff",
              cursor: "pointer",
              transition: "all .2s",
              position: "relative",
            }}
          >
            <input
              ref={landingFileRef}
              type="file"
              accept=".pdf"
              style={{ display: "none" }}
              onChange={e => {
                const f = e.target.files?.[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    sessionStorage.setItem("landing_cv_name", f.name);
                    sessionStorage.setItem("landing_cv_size", String(f.size));
                    sessionStorage.setItem("landing_cv_data", (reader.result as string).split(",")[1]);
                  } catch { /* storage full */ }
                  window.location.href = "/analyse?from=landing_drop";
                };
                reader.readAsDataURL(f);
              }}
            />
            {dragOver ? (
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#ff4d00", letterSpacing: 1 }}>DROP IT →</div>
            ) : dropError ? (
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#ef4444" }}>{dropError}</div>
            ) : (
              <div>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 4 }}>Drop your CV here</div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#c0b8b0", letterSpacing: 1.5 }}>PDF ONLY · OR CLICK TO BROWSE</div>
              </div>
            )}
          </div>

          {/* Or divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 480, margin: "0 auto 16px" }}>
            <div style={{ flex: 1, height: 1, background: "#e8e2da" }} />
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#c0b8b0", letterSpacing: 2 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "#e8e2da" }} />
          </div>

          <a href="/analyse" className="btn-primary" style={{ fontSize: 14, padding: "13px 40px" }}>
            Analyse with text / URL →
          </a>
          <div style={{ marginTop: 12, fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#c0b8b0", letterSpacing: 2 }}>
            FREE · 30 SECONDS · NO SIGNUP
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ borderTop: "1px solid #e8e2da", borderBottom: "1px solid #e8e2da", padding: "13px 0", overflow: "hidden", background: "#fff" }}>
        <div style={{ display: "flex", willChange: "transform", transform: `translateX(-${offset}px)` }}>
          {tickerContent.map((item, i) => (
            <div key={i} className="ticker-item">{item}</div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section style={{ padding: "100px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="sl" style={{ marginBottom: 14 }}>HOW IT WORKS</div>
          <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(28px,4vw,44px)", letterSpacing: -1.5, fontWeight: 400 }}>
            Upload once. See all three reads.
          </h2>
          <p style={{ fontSize: 14, color: "#6b6460", marginTop: 12, maxWidth: 460, margin: "12px auto 0", lineHeight: 1.8 }}>
            8 out of 10 builders are surprised by how differently a founder reads their CV.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }} className="how-grid">
          {[
            { step: "01 — YOUR READ",      title: "Know your archetype",       desc: "Upload your CV or answer 5 questions. We map your operating style, stage fit, and the gap between where you are and where you want to be.", color: "#ff4d00" },
            { step: "02 — FOUNDER VIEW",   title: "See how founders read you",  desc: "A founder scanning 50 CVs reads yours differently than you do. We show exactly what signals they'd pick up, what they'd question, and whether they'd reach out.", color: "#6366f1" },
            { step: "03 — RECRUITER VIEW", title: "Know how you'd be screened", desc: "Seniority level, salary band, JD matches, ATS keywords. How a recruiter would categorise you — and how to change that read if you want.", color: "#10b981" },
          ].map((s, i) => (
            <div key={i} className="how-step">
              <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: s.color, opacity: .6 }} />
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: s.color, letterSpacing: 2, marginBottom: 14 }}>{s.step}</div>
              <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: -0.5, marginBottom: 10, color: "#1a1a1a" }}>{s.title}</div>
              <p style={{ fontSize: 13, color: "#6b6460", lineHeight: 1.8 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, padding: "28px 32px", background: "#fff", border: "1px solid #e8e2da", borderRadius: 12, borderLeft: "3px solid #ff4d00", maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
          <p style={{ fontFamily: "'Instrument Serif',serif", fontSize: 17, color: "#6b6460", lineHeight: 1.7, fontStyle: "italic", marginBottom: 10 }}>
            &ldquo;They described themselves as operators. Founders read them as pre-zero-to-one. Same CV. Completely different read.&rdquo;
          </p>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 1 }}>8/10 BUILDERS SURPRISED — INDIA PILOT · 2026</div>
        </div>
      </section>

      <hr className="divider" />

      {/* BUILDER POOL */}
      <section style={{ padding: "100px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 20 }}>
          <div>
            <div className="sl" style={{ marginBottom: 12 }}>BUILDER POOL</div>
            <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(24px,3.5vw,38px)", letterSpacing: -1.5, fontWeight: 400 }}>
              Founder-nominated builders
            </h2>
            <p style={{ fontSize: 13, color: "#6b6460", marginTop: 8, lineHeight: 1.7 }}>
              Trusted by founders. Ready for early-stage startups.
            </p>
          </div>
          <a href="/nominate" className="btn-ghost">Nominate a builder →</a>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }} className="cards-grid">
          {BUILDER_CARDS.map((card, i) => {
            const color = ARCHETYPE_COLORS[card.archetype] || "#ff4d00";
            const isHovered = hoveredCard === i;
            return (
              <div key={i} className="builder-card"
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ borderColor: isHovered ? `${color}40` : "#e0dbd4", boxShadow: isHovered ? `0 4px 20px ${color}10` : "none" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: color, opacity: isHovered ? 1 : 0.2, transition: "opacity .2s" }} />
                <div style={{ fontSize: 26, marginBottom: 12 }}>{card.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: -0.3, marginBottom: 4, color: "#1a1a1a" }}>{card.role}</div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", marginBottom: 10 }}>Stage {card.stage}</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 100, background: "#10b98110", border: "1px solid #10b98120", fontSize: 9, color: "#10b981", fontFamily: "'DM Mono',monospace", fontWeight: 600, marginBottom: 12 }}>⭐ Nominated</div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 1, marginBottom: 6 }}>Operating style</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 }}>
                  {card.tags.map((tag, j) => <span key={j} className="tag-pill">{tag}</span>)}
                </div>
                <div className="fit-bar-bg" style={{ marginBottom: 6 }}>
                  <div className="fit-bar" style={{ width: `${card.fit}%`, background: color }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{card.fit}% fit</span>
                  <a href="/analyse" style={{ fontSize: 10, color: "#9a9088", textDecoration: "none", fontWeight: 600, transition: "color .15s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = color)}
                    onMouseLeave={e => (e.currentTarget.style.color = "#9a9088")}>
                    Get my fit →
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <a href="/analyse" className="btn-primary">Add yourself to the pool →</a>
        </div>
      </section>

      <hr className="divider" />

      {/* PRICING */}
      <section style={{ padding: "100px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="sl" style={{ marginBottom: 14 }}>PRICING</div>
          <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(28px,4vw,44px)", letterSpacing: -1.5, fontWeight: 400, lineHeight: 1.05 }}>
            Simple. Everyone pays.<br />
            <span style={{ color: "#ff4d00", fontStyle: "italic" }}>No free directories.</span>
          </h2>
          <p style={{ fontSize: 13, color: "#6b6460", marginTop: 14, maxWidth: 400, margin: "14px auto 0" }}>
            Analysis is always free. You pay to be found, to search, or to shortlist.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {[
            {
              label: "FOR BUILDERS", price: "₹499", sub: "one-time", color: "#ff4d00",
              desc: "Join the builder pool. Get seen by founders and recruiters actively hiring.",
              features: ["Full archetype + startup fit analysis", "Visible to founders searching the pool", "Recruiter-ready profile with keywords", "Notified when a match is found", "Profile link — no login needed"],
              cta: "Analyse + Join Pool →", href: "/analyse",
            },
            {
              label: "FOR FOUNDERS", price: "₹2,999", sub: "/month", color: "#6366f1",
              alt: "or ₹7,999/mo unlimited",
              desc: "Search the builder pool by archetype, stage, and domain.",
              features: ["Search by archetype + stage", "5 builder unlocks per month", "Founder + recruiter view on each profile", "Post paid trials", "Unlimited unlocks on ₹7,999 plan"],
              cta: "Get Founder Access →", href: "/founders",
            },
            {
              label: "FOR RECRUITERS", price: "₹9,999", sub: "/month", color: "#ec4899",
              desc: "Batch process CVs, get a ranked shortlist, export to ATS.",
              features: ["Batch upload up to 200 CVs", "AI-ranked shortlist with fit scores", "Archetype + stage per candidate", "CSV export with ATS keywords", "Send invite emails from the tool"],
              cta: "Get Recruiter Access →", href: "mailto:hello@joinstartup.app?subject=Recruiter access",
            },
          ].map((tier, i) => (
            <div key={i} style={{ background: "#fff", border: `1.5px solid ${tier.color}25`, borderRadius: 16, padding: "32px 28px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: tier.color }} />
              <div style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: tier.color, letterSpacing: 2, marginBottom: 12 }}>{tier.label}</div>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 28, color: "#1a1a1a", marginBottom: 4, letterSpacing: -0.5 }}>
                {tier.price} <span style={{ fontSize: 13, color: "#9a9088", fontFamily: "'DM Sans',sans-serif" }}>{tier.sub}</span>
              </div>
              {tier.alt && <div style={{ fontSize: 11, color: "#9a9088", marginBottom: 4 }}>or <span style={{ color: tier.color, fontWeight: 600 }}>{tier.alt.replace("or ", "")}</span></div>}
              <div style={{ fontSize: 13, color: "#6b6460", marginBottom: 24, lineHeight: 1.7, marginTop: 8 }}>{tier.desc}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28, flex: 1 }}>
                {tier.features.map((f, j) => (
                  <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: tier.color, fontSize: 12, marginTop: 1, flexShrink: 0 }}>◆</span>
                    <span style={{ fontSize: 12, color: "#6b6460", lineHeight: 1.6 }}>{f}</span>
                  </div>
                ))}
              </div>
              <a href={tier.href} style={{ display: "block", textAlign: "center", padding: "13px", background: tier.color, color: "#fff", borderRadius: 10, fontWeight: 800, fontSize: 13, textDecoration: "none", fontFamily: "'DM Sans',sans-serif", transition: "all .2s" }}>
                {tier.cta}
              </a>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 28, fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 1 }}>
          ANALYSIS IS ALWAYS FREE — PAY ONLY TO BE FOUND OR TO SEARCH
        </div>
      </section>

      <hr className="divider" />

      {/* FOOTER CTA */}
      <section style={{ padding: "80px 40px", textAlign: "center", background: "#1a1a1a" }}>
        <div className="sl" style={{ marginBottom: 20, color: "#333" }}>FREE TOOL</div>
        <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(28px,4vw,52px)", letterSpacing: -2, fontWeight: 400, lineHeight: 1.05, marginBottom: 16, color: "#e8e4da" }}>
          Know your fit.<br />
          <span style={{ color: "#ff4d00", fontStyle: "italic" }}>Before you apply.</span>
        </h2>
        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.8, maxWidth: 400, margin: "0 auto 36px" }}>
          Drop your profile. Get your archetype, stage fit, and 90-day roadmap — free.
        </p>
        <a href="/analyse" className="btn-primary" style={{ fontSize: 15, padding: "16px 48px" }}>
          Analyse my profile →
        </a>
      </section>

    </div>
  );
}
