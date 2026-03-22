"use client";

import { useState } from "react";

const ARCHETYPES = [
  { id: "zero-to-one",         name: "Zero-to-One Builder",      emoji: "🔥" },
  { id: "systems-architect",   name: "Systems Architect",         emoji: "🏗️" },
  { id: "growth-hacker",       name: "Growth Hacker",             emoji: "📈" },
  { id: "founding-generalist", name: "Founding Generalist",       emoji: "⚡" },
  { id: "product-intuitive",   name: "Product Intuitive",         emoji: "🎯" },
  { id: "operator",            name: "The Operator",              emoji: "⚙️" },
  { id: "deep-tech",           name: "Deep Tech Builder",         emoji: "🧠" },
  { id: "community-builder",   name: "Community Builder",         emoji: "🤝" },
  { id: "revenue-animal",      name: "Revenue Animal",            emoji: "💰" },
  { id: "brand-builder",       name: "Brand Builder",             emoji: "🎨" },
  { id: "data-whisperer",      name: "Data Whisperer",            emoji: "📊" },
  { id: "market-maker",        name: "Market Maker",              emoji: "🌍" },
  { id: "finance-builder",     name: "Finance Builder",           emoji: "💸" },
  { id: "pivot-survivor",      name: "Pivot Survivor",            emoji: "🔄" },
  { id: "india-stack",         name: "India Stack Expert",        emoji: "🏭" },
  { id: "global-translator",   name: "Global→India Translator",   emoji: "🌐" },
];

const STAGES = [
  { id: "pre-seed", label: "Pre-Seed" },
  { id: "seed",     label: "Seed" },
  { id: "series-a", label: "Series A" },
  { id: "series-b", label: "Series B+" },
  { id: "growth",   label: "Growth" },
];

const COMPANY_TYPES = [
  { id: "startup",     label: "Startup",     desc: "Early to growth stage" },
  { id: "vc",          label: "VC / Fund",   desc: "Investment firm" },
  { id: "accelerator", label: "Accelerator", desc: "YC, Surge, 100x etc." },
];

export default function PostJobPage() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [companyType, setCompanyType] = useState("startup");
  const [stage, setStage] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(true);
  const [equity, setEquity] = useState("");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");
  const [archetypeFit, setArchetypeFit] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [applyUrl, setApplyUrl] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [postedBy, setPostedBy] = useState("");

  const toggleArchetype = (id: string) => {
    setArchetypeFit(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const validate = () => {
    if (!title.trim())              { setError("Job title is required."); return false; }
    if (!company.trim())            { setError("Company name is required."); return false; }
    if (!stage)                     { setError("Please select company stage."); return false; }
    if (description.length < 80)   { setError("Description must be at least 80 characters."); return false; }
    if (archetypeFit.length === 0) { setError("Select at least one archetype."); return false; }
    if (!applyUrl.trim())           { setError("Apply URL or email is required."); return false; }
    if (!contactEmail.trim())       { setError("Your contact email is required."); return false; }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/post-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, company, company_type: companyType, stage,
          location, remote, equity, salary, description,
          archetype_fit: archetypeFit,
          tags: tags.split(",").map(t => t.trim()).filter(Boolean),
          apply_url: applyUrl, contact_email: contactEmail, posted_by: postedBy,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f2ee", fontFamily: "'DM Sans', system-ui, sans-serif", color: "#1a1a1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .inp{width:100%;background:#fff;border:1.5px solid #e0dbd4;border-radius:9px;padding:12px 14px;color:#1a1a1a;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border-color .15s}
        .inp:focus{border-color:#ff4d00}
        .inp::placeholder{color:#c0b8b0}
        .lbl{display:block;font-family:'DM Mono',monospace;font-size:9px;color:#9a9088;letter-spacing:2px;margin-bottom:8px}
        .field{margin-bottom:20px}
        .section{background:#fff;border:1px solid #e8e2da;border-radius:14px;padding:28px 32px;margin-bottom:16px}
        .sec-title{font-family:'DM Mono',monospace;font-size:10px;color:#9a9088;letter-spacing:2px;margin-bottom:20px}
        .type-btn{padding:14px 16px;border:1.5px solid #e0dbd4;border-radius:10px;background:#fff;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;text-align:left;width:100%}
        .type-btn.on{border-color:#ff4d00;background:#fff8f5}
        .stage-btn{padding:8px 14px;border:1.5px solid #e0dbd4;border-radius:100px;background:#fff;cursor:pointer;font-family:'DM Mono',monospace;font-size:10px;color:#6b6460;transition:all .2s}
        .stage-btn.on{border-color:#ff4d00;background:#ff4d00;color:#fff}
        .arch-btn{padding:8px 12px;border:1.5px solid #e0dbd4;border-radius:8px;background:#fff;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;color:#6b6460;transition:all .2s;display:flex;align-items:center;gap:6px;text-align:left}
        .arch-btn.on{border-color:#ff4d00;background:#fff8f5;color:#1a1a1a}
        @media(max-width:640px){nav{padding:14px 20px !important}.grid2{grid-template-columns:1fr !important}}
      `}</style>

      <nav style={{ padding: "14px 40px", borderBottom: "1px solid #e8e2da", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(245,242,238,0.95)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#ff4d00" }}>◆</span>
          <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 13, letterSpacing: 1, color: "#1a1a1a" }}>JOINSTARTUP</span>
        </a>
        <a href="/jobs" style={{ fontSize: 13, color: "#6b6460", textDecoration: "none" }}>← Back to jobs</a>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 100px" }}>

        {done ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#10b98112", border: "1.5px solid #10b98130", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 20px" }}>✓</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#10b981", letterSpacing: 2, marginBottom: 12 }}>JOB SUBMITTED</div>
            <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 32, fontWeight: 400, letterSpacing: -1, marginBottom: 12 }}>Role submitted for review.</h1>
            <p style={{ fontSize: 14, color: "#6b6460", lineHeight: 1.75, maxWidth: 400, margin: "0 auto 32px" }}>
              We&apos;ll review and publish within 24 hours. Confirmation sent to <strong style={{ color: "#1a1a1a" }}>{contactEmail}</strong>.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/jobs" style={{ padding: "12px 24px", background: "#ff4d00", color: "#fff", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Browse all roles →</a>
              <button onClick={() => { setDone(false); setTitle(""); setCompany(""); setStage(""); setDescription(""); setArchetypeFit([]); setApplyUrl(""); setContactEmail(""); setPostedBy(""); setTags(""); setEquity(""); setSalary(""); setLocation(""); }} style={{ padding: "12px 24px", background: "transparent", border: "1.5px solid #e0dbd4", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13, color: "#6b6460", cursor: "pointer" }}>Post another</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 3, marginBottom: 12 }}>FOR STARTUPS & VCs</div>
              <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(28px,5vw,44px)", fontWeight: 400, letterSpacing: -1.5, lineHeight: 1.05, marginBottom: 12 }}>
                Post a role.<br /><span style={{ color: "#ff4d00", fontStyle: "italic" }}>Reach archetype-matched builders.</span>
              </h1>
              <p style={{ fontSize: 14, color: "#6b6460", lineHeight: 1.75 }}>Free to post. Reviewed within 24 hours. Live for 60 days.</p>
            </div>

            {/* Section 1 — Company */}
            <div className="section">
              <div className="sec-title">01 — ABOUT YOUR COMPANY</div>
              <div className="grid2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div className="field" style={{ margin: 0 }}>
                  <label className="lbl">COMPANY NAME *</label>
                  <input className="inp" placeholder="Sarvam AI" value={company} onChange={e => setCompany(e.target.value)} />
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label className="lbl">YOUR NAME</label>
                  <input className="inp" placeholder="Who&apos;s posting this?" value={postedBy} onChange={e => setPostedBy(e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label className="lbl">COMPANY TYPE</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                  {COMPANY_TYPES.map(t => (
                    <button key={t.id} className={`type-btn${companyType === t.id ? " on" : ""}`} onClick={() => setCompanyType(t.id)}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a1a", marginBottom: 2 }}>{t.label}</div>
                      <div style={{ fontSize: 11, color: "#9a9088" }}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="lbl">COMPANY STAGE *</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {STAGES.map(s => (
                    <button key={s.id} className={`stage-btn${stage === s.id ? " on" : ""}`} onClick={() => setStage(s.id)}>{s.label}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2 — Role */}
            <div className="section">
              <div className="sec-title">02 — THE ROLE</div>
              <div className="field">
                <label className="lbl">JOB TITLE *</label>
                <input className="inp" placeholder="Founding Engineer, Head of Growth, AI/ML Engineer" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="grid2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div className="field" style={{ margin: 0 }}>
                  <label className="lbl">LOCATION</label>
                  <input className="inp" placeholder="Bangalore, Mumbai, Remote" value={location} onChange={e => setLocation(e.target.value)} />
                </div>
                <div className="field" style={{ margin: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "12px 14px", background: remote ? "#f0fdf8" : "#fff", border: `1.5px solid ${remote ? "#10b981" : "#e0dbd4"}`, borderRadius: 9, transition: "all .2s" }} onClick={() => setRemote(!remote)}>
                    <div style={{ width: 20, height: 20, borderRadius: 4, background: remote ? "#10b981" : "#fff", border: `1.5px solid ${remote ? "#10b981" : "#e0dbd4"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {remote && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: remote ? "#10b981" : "#6b6460" }}>Remote-friendly</span>
                  </label>
                </div>
              </div>
              <div className="grid2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div className="field" style={{ margin: 0 }}>
                  <label className="lbl">EQUITY RANGE</label>
                  <input className="inp" placeholder="0.5-1.0%" value={equity} onChange={e => setEquity(e.target.value)} />
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label className="lbl">SALARY BAND</label>
                  <input className="inp" placeholder="₹18-28 LPA" value={salary} onChange={e => setSalary(e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label className="lbl">ROLE DESCRIPTION * <span style={{ color: "#c0b8b0" }}>(min 80 chars — {description.length} now)</span></label>
                <textarea className="inp" rows={5} placeholder={"What will they build? What does ownership look like?\n\ne.g. Build the core product at a YC-backed B2B fintech. Own the full stack — payments infrastructure, dashboards, and the API layer. First 10 engineering hire."} value={description} onChange={e => setDescription(e.target.value)} style={{ resize: "vertical", lineHeight: 1.7, minHeight: 120 }} />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="lbl">SKILLS / TAGS <span style={{ color: "#c0b8b0" }}>(comma separated)</span></label>
                <input className="inp" placeholder="Next.js, Python, B2B SaaS, Fintech" value={tags} onChange={e => setTags(e.target.value)} />
              </div>
            </div>

            {/* Section 3 — Archetype fit */}
            <div className="section">
              <div className="sec-title">03 — WHO IS THIS ROLE FOR? * ({archetypeFit.length} selected)</div>
              <p style={{ fontSize: 13, color: "#6b6460", lineHeight: 1.7, marginBottom: 20 }}>Builders with these archetypes will see your listing prominently.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 6 }}>
                {ARCHETYPES.map(a => (
                  <button key={a.id} className={`arch-btn${archetypeFit.includes(a.id) ? " on" : ""}`} onClick={() => toggleArchetype(a.id)}>
                    <span style={{ fontSize: 16 }}>{a.emoji}</span>
                    <span style={{ fontSize: 12 }}>{a.name}</span>
                    {archetypeFit.includes(a.id) && <span style={{ marginLeft: "auto", color: "#ff4d00" }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 4 — Apply */}
            <div className="section">
              <div className="sec-title">04 — HOW TO APPLY</div>
              <div className="field">
                <label className="lbl">APPLY URL OR EMAIL *</label>
                <input className="inp" placeholder="https://jobs.yourco.com/role  or  hiring@yourco.com" value={applyUrl} onChange={e => setApplyUrl(e.target.value)} />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="lbl">YOUR CONTACT EMAIL * <span style={{ color: "#c0b8b0" }}>(for our review — not shown publicly)</span></label>
                <input className="inp" type="email" placeholder="founder@yourco.com" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
              </div>
            </div>

            {error && (
              <div style={{ padding: "14px 18px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, fontSize: 13, color: "#dc2626", marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button onClick={submit} disabled={loading} style={{ width: "100%", padding: "16px", background: loading ? "#e8e2da" : "#ff4d00", color: loading ? "#b0a8a0" : "#fff", border: "none", borderRadius: 10, fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", transition: "all .2s", marginBottom: 12 }}>
              {loading ? "Submitting..." : "Submit role for review →"}
            </button>
            <div style={{ textAlign: "center", fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#c0b8b0", letterSpacing: 1 }}>
              FREE TO POST · REVIEWED WITHIN 24 HOURS · LIVE FOR 60 DAYS
            </div>
          </>
        )}
      </div>
    </div>
  );
}
