import { useState } from "react";

const ARCHETYPES = [
  { id: "zero-to-one", name: "Zero-to-One Builder", emoji: "🔥", tagline: "Ships before it's perfect", description: "Thrives in chaos, builds from nothing, owns everything end-to-end. The first 10 hires dream.", thrives_on: ["Ambiguity", "Full ownership", "Fast feedback loops"], struggles_with: ["Process-heavy orgs", "Long approval chains"], operating_tags: ["High ownership", "Zero-to-one", "Fast shipper"], stage_fit: ["0→1"], example_roles: ["Founding Engineer", "Early PM", "Head of Product"], color: "#ff4d00" },
  { id: "systems-architect", name: "Systems Architect", emoji: "🏗️", tagline: "Builds to last, thinks in platforms", description: "Designs infrastructure that scales 10x without rewriting. Turns chaos into elegant systems.", thrives_on: ["Scale challenges", "Technical depth", "Long-term thinking"], struggles_with: ["Frequent pivots", "Unclear requirements"], operating_tags: ["Platform thinker", "Scale-ready", "Tech lead"], stage_fit: ["1→beyond"], example_roles: ["VP Engineering", "Staff Engineer", "CTO"], color: "#6366f1" },
  { id: "growth-hacker", name: "Growth Hacker", emoji: "📈", tagline: "Channel obsessed, data-driven, scrappy", description: "Finds the non-obvious growth lever and pulls it hard. Experiments fast, kills losers faster.", thrives_on: ["Data", "Experimentation", "Distribution puzzles"], struggles_with: ["Brand-only work", "Slow experiment cycles"], operating_tags: ["Data-driven", "Scrappy", "Channel builder"], stage_fit: ["0→1", "1→beyond"], example_roles: ["Growth Lead", "Head of Marketing", "Demand Gen"], color: "#10b981" },
  { id: "founding-generalist", name: "Founding Generalist", emoji: "⚡", tagline: "Wears 5 hats without dropping any", description: "Does sales on Monday, debugging on Tuesday, hiring on Wednesday. High chaos tolerance, low ego.", thrives_on: ["Uncertainty", "Variety", "Founder proximity"], struggles_with: ["Specialisation pressure", "Corporate structure"], operating_tags: ["Multi-hat", "High chaos tolerance", "Low ego"], stage_fit: ["-1→0", "0→1"], example_roles: ["Chief of Staff", "Ops Lead", "Founding Team"], color: "#f59e0b" },
  { id: "product-intuitive", name: "Product Intuitive", emoji: "🎯", tagline: "User obsessed, ships fast, opinionated", description: "Talks to users every day. Has strong product opinions, backs them with data, ships weekly.", thrives_on: ["User research", "Fast iteration", "Opinionated debates"], struggles_with: ["Pure engineering sprints", "No user access"], operating_tags: ["User obsessed", "Opinionated", "Weekly shipper"], stage_fit: ["0→1", "1→beyond"], example_roles: ["Product Manager", "Head of Product", "CPO"], color: "#ec4899" },
  { id: "operator", name: "The Operator", emoji: "⚙️", tagline: "Runs the machine, builds the process", description: "Takes messy execution and makes it repeatable. The person who makes everyone else 2x more effective.", thrives_on: ["Process design", "Team coordination", "Execution rigour"], struggles_with: ["Early chaos stage", "No defined goals"], operating_tags: ["Process builder", "Execution rigour", "Force multiplier"], stage_fit: ["1→beyond"], example_roles: ["COO", "Head of Ops", "Program Manager"], color: "#8b5cf6" },
  { id: "deep-tech", name: "Deep Tech Builder", emoji: "🧠", tagline: "Loves hard problems, lives in the stack", description: "ML, AI, infra — the person who builds what others say can't be done. India's IIT pipeline.", thrives_on: ["Hard technical problems", "Research + application", "Long feedback loops"], struggles_with: ["Sales pressure", "Non-technical leadership"], operating_tags: ["Research-minded", "Hard problems", "Deep stack"], stage_fit: ["0→1", "1→beyond"], example_roles: ["ML Engineer", "AI Researcher", "Platform Engineer"], color: "#0ea5e9" },
  { id: "community-builder", name: "Community Builder", emoji: "🤝", tagline: "Network effects are the product", description: "Builds the audience before the product. Knows that in India, distribution is relationships.", thrives_on: ["People", "Events", "Long-term trust building"], struggles_with: ["Pure B2B sales", "Async-only teams"], operating_tags: ["Network effects", "Relationship-first", "GTM via people"], stage_fit: ["0→1"], example_roles: ["Community Lead", "Developer Relations", "Brand Partnerships"], color: "#14b8a6" },
  { id: "revenue-animal", name: "Revenue Animal", emoji: "💰", tagline: "Closes the first 10 customers founders can't", description: "Hunts, qualifies, closes. Knows that revenue solves everything. Rare at early stage, invaluable always.", thrives_on: ["Commission pressure", "Cold outreach", "Negotiation"], struggles_with: ["No product-market fit", "Long enterprise cycles"], operating_tags: ["Pipeline obsessed", "Closer", "Revenue-first"], stage_fit: ["0→1", "1→beyond"], example_roles: ["Head of Sales", "AE", "Revenue Lead"], color: "#ef4444" },
  { id: "brand-builder", name: "Brand Builder", emoji: "🎨", tagline: "Makes a startup feel inevitable", description: "Not just design — narrative, positioning, making people feel something. Rare and undervalued early.", thrives_on: ["Creative freedom", "Founder storytelling", "Brand from scratch"], struggles_with: ["Pure performance marketing", "No creative latitude"], operating_tags: ["Narrative-first", "Creative", "Positioning expert"], stage_fit: ["0→1", "1→beyond"], example_roles: ["Head of Brand", "Creative Director", "Content Lead"], color: "#f97316" },
  { id: "data-whisperer", name: "Data Whisperer", emoji: "📊", tagline: "Turns numbers into decisions fast", description: "Not just dashboards — makes data the language of the company. Bridges business and engineering.", thrives_on: ["Ambiguous data problems", "Business impact", "Self-serve analytics"], struggles_with: ["Pure research", "No business context"], operating_tags: ["Business-facing", "Decision enabler", "SQL wizard"], stage_fit: ["0→1", "1→beyond"], example_roles: ["Data Lead", "Analytics Engineer", "Head of BI"], color: "#a3e635" },
  { id: "market-maker", name: "Market Maker", emoji: "🌍", tagline: "Opens doors, thinks in ecosystems", description: "BD, partnerships, distribution. Builds the alliances that make a startup's growth non-linear.", thrives_on: ["Relationship building", "Long-term deals", "Ecosystem thinking"], struggles_with: ["Cold outbound at scale", "Pure inside sales"], operating_tags: ["Ecosystem thinker", "Deal maker", "Distribution builder"], stage_fit: ["0→1", "1→beyond"], example_roles: ["Head of BD", "Partnerships Lead", "Strategic Alliances"], color: "#2dd4bf" },
  { id: "finance-builder", name: "Finance Builder", emoji: "💸", tagline: "Unit economics obsessed, fundraise-ready", description: "Brings financial rigour to early chaos. Builds the model founders need to raise Series A.", thrives_on: ["Financial modelling", "Fundraise prep", "Unit economics"], struggles_with: ["No data to work with", "Pre-revenue stage"], operating_tags: ["FP&A", "Fundraise-ready", "Unit economics"], stage_fit: ["0→1", "1→beyond"], example_roles: ["Head of Finance", "CFO", "Financial Controller"], color: "#fbbf24" },
  { id: "pivot-survivor", name: "Pivot Survivor", emoji: "🔄", tagline: "Knows what to kill and what to keep", description: "Has been through 2-3 pivots. Calm under existential pressure. Wisdom over raw skill.", thrives_on: ["Uncertainty", "Strategic pivots", "Team morale management"], struggles_with: ["Perfect execution environments", "Rigid roadmaps"], operating_tags: ["Battle-tested", "Calm under fire", "Strategic"], stage_fit: ["-1→0", "0→1"], example_roles: ["Founding PM", "Head of Strategy", "COO"], color: "#94a3b8" },
  { id: "india-stack", name: "India Stack Expert", emoji: "🏭", tagline: "Builds on India's unique infra", description: "Deep knowledge of UPI, ONDC, Account Aggregator, Aadhaar, DPDP. Understands what India enables.", thrives_on: ["India-specific regulatory puzzles", "Gov partnerships", "Fintech/health infra"], struggles_with: ["Global-first products", "Non-India markets"], operating_tags: ["India-native", "Regulatory edge", "Stack expert"], stage_fit: ["0→1", "1→beyond"], example_roles: ["Fintech Lead", "Policy Engineer", "Head of Compliance"], color: "#4ade80" },
  { id: "global-translator", name: "Global→India Translator", emoji: "🌐", tagline: "Brings playbooks, adapts for India", description: "Has worked at global companies, knows which playbooks work in India and which to throw away.", thrives_on: ["Cross-cultural context", "Adapting global models", "International networks"], struggles_with: ["Pure India-first builds", "No global exposure needed"], operating_tags: ["Global playbooks", "India-adapted", "Cross-cultural"], stage_fit: ["1→beyond"], example_roles: ["Country Head", "GM India", "Head of International"], color: "#818cf8" },
];

const STAGE_FILTERS = ["All", "-1→0", "0→1", "1→beyond"];

export default function BuilderArchetypeCards() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const [hovered, setHovered] = useState(null);

  const filtered = filter === "All"
    ? ARCHETYPES
    : ARCHETYPES.filter(a => a.stage_fit.includes(filter));

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080808",
      color: "#f0ede6",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      padding: "0 0 80px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;600&family=DM+Sans:wght@400;500;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .arch-card {
          background: #0e0e06;
          border: 1px solid #1a1a10;
          border-radius: 16px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .arch-card:hover {
          border-color: var(--card-color);
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
        }
        .arch-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--card-color);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .arch-card:hover::before { opacity: 1; }
        .tag {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 700;
          background: #ffffff08;
          border: 1px solid #2a2a1a;
          color: #888;
        }
        .stage-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 100px;
          font-size: 10px;
          font-weight: 800;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.5px;
        }
        .filter-btn {
          padding: 8px 18px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid #2a2a1a;
          background: transparent;
          color: #666;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }
        .filter-btn.active {
          background: #ff4d00;
          border-color: #ff4d00;
          color: #fff;
        }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          z-index: 100;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 20px;
          backdrop-filter: blur(8px);
        }
        .modal {
          background: #0e0e06;
          border: 1px solid #2a2a1a;
          border-radius: 20px 20px 0 0;
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 32px 28px;
          position: relative;
        }
        .close-btn {
          position: absolute;
          top: 20px; right: 20px;
          background: #1a1a10;
          border: none;
          color: #666;
          width: 32px; height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          display: flex; align-items: center; justify-content: center;
        }
        .section-label {
          font-size: 9px;
          color: #666;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          display: block;
          margin-bottom: 10px;
          font-family: 'DM Mono', monospace;
        }
        .list-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 8px 0;
          border-bottom: 1px solid #1a1a10;
          font-size: 13px;
          line-height: 1.5;
          color: #aaa;
        }
        .list-item:last-child { border-bottom: none; }
        .dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; margin-top: 6px; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a1a; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "60px 20px 40px", textAlign: "center" }}>
        <span style={{ fontSize: 9, color: "#ff4d00", letterSpacing: 2, fontWeight: 700, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", display: "block", marginBottom: 14 }}>
          16 Archetypes · Indian Startup Ecosystem
        </span>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(32px, 8vw, 56px)", letterSpacing: -2, lineHeight: 1.05, marginBottom: 14 }}>
          Which builder<br />
          <span style={{ color: "#ff4d00", fontStyle: "italic" }}>are you?</span>
        </h1>
        <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7, maxWidth: 440, margin: "0 auto 32px" }}>
          Every great startup hire fits one of these archetypes. Tap any card to see what makes them thrive — and where they struggle.
        </p>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {STAGE_FILTERS.map(f => (
            <button key={f} className={`filter-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
              {f === "All" ? "All Archetypes" : `Build ${f}`}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 16, fontSize: 11, color: "#333", fontFamily: "'DM Mono', monospace" }}>
          {filtered.length} archetypes
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{ padding: "0 16px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, maxWidth: 1200, margin: "0 auto" }}>
        {filtered.map((arch) => (
          <div
            key={arch.id}
            className="arch-card"
            style={{ "--card-color": arch.color }}
            onClick={() => setSelected(arch)}
            onMouseEnter={() => setHovered(arch.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Top accent glow on hover */}
            {hovered === arch.id && (
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 60, background: `linear-gradient(to bottom, ${arch.color}12, transparent)`, pointerEvents: "none" }} />
            )}

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 32 }}>{arch.emoji}</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {arch.stage_fit.map(s => (
                  <span key={s} className="stage-badge" style={{ background: `${arch.color}20`, color: arch.color, border: `1px solid ${arch.color}40` }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: -0.3, marginBottom: 4 }}>{arch.name}</div>
            <div style={{ fontSize: 12, color: arch.color, fontWeight: 600, marginBottom: 12, fontStyle: "italic" }}>{arch.tagline}</div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 16 }}>
              {arch.operating_tags.map(t => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>

            <div style={{ fontSize: 11, color: "#444", fontFamily: "'DM Mono', monospace", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: arch.color }}>→</span> Tap to explore
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelected(null)}>✕</button>

            {/* Modal header */}
            <div style={{ height: 3, background: selected.color, borderRadius: 2, marginBottom: 24 }} />

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ fontSize: 40 }}>{selected.emoji}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.4 }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: selected.color, fontStyle: "italic", marginTop: 2 }}>{selected.tagline}</div>
              </div>
            </div>

            <p style={{ fontSize: 14, color: "#aaa", lineHeight: 1.7, marginBottom: 24 }}>{selected.description}</p>

            {/* Stage fit */}
            <div style={{ marginBottom: 20 }}>
              <span className="section-label">Stage Fit</span>
              <div style={{ display: "flex", gap: 8 }}>
                {["-1→0", "0→1", "1→beyond"].map(s => (
                  <span key={s} className="stage-badge" style={
                    selected.stage_fit.includes(s)
                      ? { background: `${selected.color}20`, color: selected.color, border: `1px solid ${selected.color}40`, padding: "5px 12px" }
                      : { background: "#ffffff05", color: "#333", border: "1px solid #1a1a10", padding: "5px 12px" }
                  }>{s}</span>
                ))}
              </div>
            </div>

            {/* Thrives on */}
            <div style={{ marginBottom: 20 }}>
              <span className="section-label">Thrives on</span>
              <div>
                {selected.thrives_on.map(t => (
                  <div key={t} className="list-item">
                    <div className="dot" style={{ background: "#c8f135" }} />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Struggles with */}
            <div style={{ marginBottom: 20 }}>
              <span className="section-label">Struggles with</span>
              <div>
                {selected.struggles_with.map(t => (
                  <div key={t} className="list-item">
                    <div className="dot" style={{ background: "#ff4d00" }} />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Example roles */}
            <div style={{ marginBottom: 24 }}>
              <span className="section-label">Example Roles</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {selected.example_roles.map(r => (
                  <span key={r} style={{ padding: "5px 12px", background: `${selected.color}15`, border: `1px solid ${selected.color}30`, borderRadius: 100, fontSize: 12, color: selected.color, fontWeight: 600 }}>{r}</span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button style={{ width: "100%", padding: "14px", background: selected.color, border: "none", borderRadius: 10, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
              onClick={() => window.open('https://app.joinstartup.app', '_blank')}>
              Analyse My CV → Get My Archetype
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
