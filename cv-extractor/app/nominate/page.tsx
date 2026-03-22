"use client";

import { useState } from "react";

const ARCHETYPES = [
  { id: "zero-to-one",         name: "Zero-to-One Builder",      emoji: "🔥", color: "#ff4d00" },
  { id: "systems-architect",   name: "Systems Architect",         emoji: "🏗️", color: "#6366f1" },
  { id: "growth-hacker",       name: "Growth Hacker",             emoji: "📈", color: "#10b981" },
  { id: "founding-generalist", name: "Founding Generalist",       emoji: "⚡", color: "#f59e0b" },
  { id: "product-intuitive",   name: "Product Intuitive",         emoji: "🎯", color: "#ec4899" },
  { id: "operator",            name: "The Operator",              emoji: "⚙️", color: "#8b5cf6" },
  { id: "deep-tech",           name: "Deep Tech Builder",         emoji: "🧠", color: "#0ea5e9" },
  { id: "community-builder",   name: "Community Builder",         emoji: "🤝", color: "#14b8a6" },
  { id: "revenue-animal",      name: "Revenue Animal",            emoji: "💰", color: "#ef4444" },
  { id: "brand-builder",       name: "Brand Builder",             emoji: "🎨", color: "#f97316" },
  { id: "data-whisperer",      name: "Data Whisperer",            emoji: "📊", color: "#a3e635" },
  { id: "market-maker",        name: "Market Maker",              emoji: "🌍", color: "#2dd4bf" },
  { id: "finance-builder",     name: "Finance Builder",           emoji: "💸", color: "#fbbf24" },
  { id: "pivot-survivor",      name: "Pivot Survivor",            emoji: "🔄", color: "#94a3b8" },
  { id: "india-stack",         name: "India Stack Expert",        emoji: "🏭", color: "#4ade80" },
  { id: "global-translator",   name: "Global→India Translator",   emoji: "🌐", color: "#818cf8" },
];

export default function NominatePage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nominator_name: "",
    nominator_email: "",
    nominee_name: "",
    nominee_email: "",
    relationship: "" as "worked_together" | "seen_their_work" | "",
    suggested_archetype: "",
    evidence: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setError(""); };

  const selectedArch = ARCHETYPES.find(a => a.id === form.suggested_archetype);

  const submit = async () => {
    if (!form.nominee_name || !form.nominee_email || !form.relationship || !form.suggested_archetype || !form.evidence) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Insert to Supabase via API route (no anon key in frontend)
      const res = await fetch("/api/nominate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nominator_name:     form.nominator_name,
          nominator_email:    form.nominator_email,
          nominee_name:       form.nominee_name,
          nominee_email:      form.nominee_email,
          relationship:       form.relationship,
          suggested_archetype: form.suggested_archetype,
          evidence:           form.evidence,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setDone(false);
    setStep(1);
    setForm({ nominator_name: "", nominator_email: "", nominee_name: "", nominee_email: "", relationship: "", suggested_archetype: "", evidence: "" });
    setError("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f2ee", color: "#1a1a1a", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .inp{width:100%;background:#fff;border:1.5px solid #e0dbd4;border-radius:9px;padding:12px 14px;color:#1a1a1a;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border-color .15s}
        .inp:focus{border-color:#ff4d00}
        .inp::placeholder{color:#c0b8b0}
        .btn-primary{padding:13px 24px;border-radius:9px;font-weight:800;font-size:14px;cursor:pointer;border:none;font-family:'DM Sans',sans-serif;background:#ff4d00;color:#fff;transition:all .2s;width:100%}
        .btn-primary:hover{background:#e63d00;transform:translateY(-1px)}
        .btn-primary:disabled{background:#e8e2da;color:#b0a8a0;cursor:not-allowed;transform:none}
        .btn-back{padding:13px 20px;border-radius:9px;font-weight:700;font-size:14px;cursor:pointer;border:1.5px solid #e0dbd4;font-family:'DM Sans',sans-serif;background:transparent;color:#6b6460;transition:all .2s;flex-shrink:0}
        .btn-back:hover{border-color:#c0b8b0;color:#1a1a1a}
        .rel-btn{padding:14px 16px;border-radius:10px;border:1.5px solid #e0dbd4;background:#fff;color:#6b6460;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;transition:all .2s;text-align:left;width:100%}
        .rel-btn:hover{border-color:#c0b8b0}
        .rel-btn.on{border-color:#ff4d00;background:#fff8f5;color:#1a1a1a}
        .arch-btn{padding:10px 12px;border-radius:9px;border:1.5px solid #e0dbd4;background:#fff;color:#6b6460;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;transition:all .2s;display:flex;align-items:center;gap:7px;text-align:left}
        .arch-btn:hover{border-color:#c0b8b0;color:#1a1a1a}
        .arch-btn.on{color:#1a1a1a}
        .step-dot{width:6px;height:6px;border-radius:50%;background:#e0dbd4;transition:all .25s}
        .step-dot.on{background:#ff4d00;width:20px;border-radius:3px}
      `}</style>

      {/* Nav */}
      <nav style={{ padding: "14px 40px", borderBottom: "1px solid #e8e2da", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(245,242,238,0.95)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#ff4d00" }}>◆</span>
          <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 13, letterSpacing: 1, color: "#1a1a1a" }}>JOINSTARTUP</span>
        </a>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {[1, 2, 3].map(n => (
            <div key={n} className={`step-dot${step === n ? " on" : ""}`} />
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "48px 24px 100px" }}>

        {/* SUCCESS */}
        {done ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#10b98112", border: "1.5px solid #10b98130", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 20px" }}>🎯</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#10b981", letterSpacing: 2, marginBottom: 12 }}>NOMINATION SENT</div>
            <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 30, fontWeight: 400, letterSpacing: -1, marginBottom: 12 }}>
              Nomination sent.
            </h1>
            <p style={{ fontSize: 14, color: "#6b6460", lineHeight: 1.75, marginBottom: 28, maxWidth: 380, margin: "0 auto 28px" }}>
              We&apos;ve notified <strong style={{ color: "#1a1a1a" }}>{form.nominee_name}</strong> that you nominated them as a{" "}
              <strong style={{ color: selectedArch?.color || "#ff4d00" }}>
                {selectedArch?.emoji} {selectedArch?.name}
              </strong>.
              They&apos;ll confirm their archetype and analyse their CV.
            </p>
            <button onClick={reset} style={{ padding: "12px 24px", background: "transparent", border: "1.5px solid #e0dbd4", borderRadius: 9, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13, color: "#6b6460", cursor: "pointer" }}>
              Nominate someone else
            </button>
          </div>

        ) : (
          <>
            {/* STEP 1 — Who you are */}
            {step === 1 && (
              <div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#ff4d00", letterSpacing: 2, marginBottom: 14 }}>STEP 1 OF 3</div>
                <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 32, fontWeight: 400, letterSpacing: -1, lineHeight: 1.1, marginBottom: 8 }}>
                  Who are you?
                </h1>
                <p style={{ fontSize: 13, color: "#6b6460", lineHeight: 1.75, marginBottom: 32 }}>
                  Your nomination carries more weight when people know who it&apos;s from.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  <div>
                    <label style={{ display: "block", fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 2, marginBottom: 7 }}>YOUR NAME</label>
                    <input className="inp" placeholder="Arjun Mehta" value={form.nominator_name} onChange={e => set("nominator_name", e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 2, marginBottom: 7 }}>YOUR EMAIL</label>
                    <input className="inp" type="email" placeholder="you@email.com" value={form.nominator_email} onChange={e => set("nominator_email", e.target.value)} />
                  </div>
                </div>
                {error && <div style={{ fontSize: 12, color: "#dc2626", marginBottom: 12, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8 }}>{error}</div>}
                <button className="btn-primary" onClick={() => { if (form.nominator_name && form.nominator_email) { setError(""); setStep(2); } else setError("Please fill in your name and email."); }}>
                  Continue →
                </button>
              </div>
            )}

            {/* STEP 2 — Who you're nominating */}
            {step === 2 && (
              <div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#ff4d00", letterSpacing: 2, marginBottom: 14 }}>STEP 2 OF 3</div>
                <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 32, fontWeight: 400, letterSpacing: -1, lineHeight: 1.1, marginBottom: 8 }}>
                  Who are you nominating?
                </h1>
                <p style={{ fontSize: 13, color: "#6b6460", lineHeight: 1.75, marginBottom: 32 }}>
                  Someone whose work you&apos;ve seen or built alongside.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  <div>
                    <label style={{ display: "block", fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 2, marginBottom: 7 }}>THEIR NAME</label>
                    <input className="inp" placeholder="Priya Sharma" value={form.nominee_name} onChange={e => set("nominee_name", e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 2, marginBottom: 7 }}>THEIR EMAIL</label>
                    <input className="inp" type="email" placeholder="them@email.com" value={form.nominee_email} onChange={e => set("nominee_email", e.target.value)} />
                  </div>
                </div>

                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 2, marginBottom: 10 }}>YOUR RELATIONSHIP</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
                  <button className={`rel-btn${form.relationship === "worked_together" ? " on" : ""}`} onClick={() => set("relationship", "worked_together")}>
                    <div style={{ fontWeight: 800, marginBottom: 3, color: "#1a1a1a" }}>🤝 Worked together</div>
                    <div style={{ fontSize: 12, color: "#9a9088", fontWeight: 400 }}>You&apos;ve built something together — same team, same project</div>
                  </button>
                  <button className={`rel-btn${form.relationship === "seen_their_work" ? " on" : ""}`} onClick={() => set("relationship", "seen_their_work")}>
                    <div style={{ fontWeight: 800, marginBottom: 3, color: "#1a1a1a" }}>👁️ Seen their work</div>
                    <div style={{ fontSize: 12, color: "#9a9088", fontWeight: 400 }}>You follow their work, read their writing, or watched them build</div>
                  </button>
                </div>

                {error && <div style={{ fontSize: 12, color: "#dc2626", marginBottom: 12, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8 }}>{error}</div>}

                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-back" onClick={() => { setError(""); setStep(1); }}>←</button>
                  <button className="btn-primary" style={{ flex: 1, width: "auto" }} onClick={() => { if (form.nominee_name && form.nominee_email && form.relationship) { setError(""); setStep(3); } else setError("Please fill in all fields."); }}>
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 — The call */}
            {step === 3 && (
              <div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#ff4d00", letterSpacing: 2, marginBottom: 14 }}>STEP 3 OF 3</div>
                <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 32, fontWeight: 400, letterSpacing: -1, lineHeight: 1.1, marginBottom: 8 }}>
                  Make your call.
                </h1>
                <p style={{ fontSize: 13, color: "#6b6460", lineHeight: 1.75, marginBottom: 32 }}>
                  What kind of builder are they? One line of evidence — the specific thing you saw them do.
                </p>

                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 2, marginBottom: 12 }}>THEIR ARCHETYPE</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 24 }}>
                  {ARCHETYPES.map(a => (
                    <button
                      key={a.id}
                      className={`arch-btn${form.suggested_archetype === a.id ? " on" : ""}`}
                      onClick={() => set("suggested_archetype", a.id)}
                      style={{
                        borderColor: form.suggested_archetype === a.id ? a.color : undefined,
                        background: form.suggested_archetype === a.id ? `${a.color}10` : undefined,
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{a.emoji}</span>
                      <span style={{ fontSize: 10, color: form.suggested_archetype === a.id ? a.color : "#6b6460" }}>{a.name}</span>
                    </button>
                  ))}
                </div>

                {selectedArch && (
                  <div style={{ padding: "12px 16px", background: `${selectedArch.color}10`, border: `1px solid ${selectedArch.color}25`, borderRadius: 10, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{selectedArch.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: selectedArch.color }}>{selectedArch.name}</div>
                      <div style={{ fontSize: 11, color: "#9a9088", fontFamily: "'DM Mono',monospace" }}>selected</div>
                    </div>
                  </div>
                )}

                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 2, marginBottom: 8 }}>YOUR EVIDENCE</div>
                <textarea
                  className="inp"
                  rows={3}
                  placeholder={`e.g. "Shipped the MVP in 3 weeks at Setu, owned the full stack alone" or "Their Substack on India Stack is the clearest writing I've read on UPI"`}
                  value={form.evidence}
                  onChange={e => set("evidence", e.target.value)}
                  style={{ resize: "none", marginBottom: 20, lineHeight: 1.7 }}
                />

                {error && <div style={{ fontSize: 12, color: "#dc2626", marginBottom: 12, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8 }}>{error}</div>}

                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-back" onClick={() => { setError(""); setStep(2); }}>←</button>
                  <button
                    className="btn-primary"
                    style={{ flex: 1, width: "auto" }}
                    onClick={submit}
                    disabled={loading}
                  >
                    {loading ? "Sending nomination..." : `Nominate ${form.nominee_name || "them"} →`}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
