import type { Metadata } from "next";
import AppNav from "@/components/AppNav";

export const metadata: Metadata = {
  title: "Pricing — JoinStartup",
};

export default function Page() {
  return (
    <div style={{ minHeight: "100vh", background: "#f5f2ee", color: "#1a1a1a", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
      `}</style>
      <AppNav />
      <main style={{ maxWidth: 1160, margin: "0 auto", padding: "44px 22px 72px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9088", letterSpacing: 2, marginBottom: 8 }}>
            PRICING
          </div>
          <h1 style={{ margin: 0, fontSize: "clamp(34px,5vw,62px)", lineHeight: 1.04, fontFamily: "'Instrument Serif',serif", fontWeight: 400, letterSpacing: -1.5 }}>
            Simple pricing.
            <span style={{ color: "#ff4d00", fontStyle: "italic" }}> No free directories.</span>
          </h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 18 }}>
          <Card
            label="FOR BUILDERS"
            price="₹499"
            sub="one-time"
            color="#ff4d00"
            cta="/analyse"
            ctaLabel="Analyse + Join Pool"
            desc="Join the pool once. Stay forever."
            features={[
              "AI archetype analysis (16 types)",
              "Founder view - how a founder reads your CV",
              "Recruiter view - seniority, salary band, ATS keywords",
              "90-day roadmap with specific actions",
              "Permanent profile link you own",
              "Founders search for you by archetype + stage",
              "Matched to live startup roles",
              "One-time payment - no subscription",
            ]}
          />
          <Card
            label="FOR FOUNDERS"
            price="₹2,999"
            sub="/month"
            color="#6366f1"
            cta="/founders"
            ctaLabel="Get Founder Access"
            alt="or ₹7,999/mo for unlimited access"
            features={[
              "Search + filter by archetype, stage, skills",
              "5 full profile unlocks per month",
              "Founder view + recruiter view on each profile",
              "90-day roadmap visibility",
              "Post paid trials (2-week)",
              "Trust scores from completed trials",
              "Unlimited unlocks on ₹7,999 plan",
              "Cancel anytime",
            ]}
          />
          <Card
            label="FOR RECRUITERS"
            price="₹9,999"
            sub="/month"
            color="#ec4899"
            cta="/recruiters"
            ctaLabel="Get Recruiter Access"
            desc="Full batch access to the pool"
            features={[
              "Batch upload up to 200 CVs",
              "AI archetype + fit scoring on each",
              "Ranked shortlist with match scores",
              "Export to CSV or send invite emails",
              "Access to full builder pool",
              "Search + filter by archetype, stage, skills",
              "Recruiter view on every profile",
              "Dedicated support",
            ]}
          />
        </div>

        <section
          style={{
            marginTop: 34,
            background: "#fff",
            border: "1px solid #e8e2da",
            borderRadius: 18,
            padding: "22px 24px",
            maxWidth: 860,
            marginLeft: "auto",
            marginRight: "auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 10,
              color: "#9a9088",
              letterSpacing: 1.7,
              marginBottom: 10,
            }}
          >
            WHY EVERYONE PAYS
          </div>
          <p style={{ margin: 0, fontSize: "clamp(15px,1.7vw,20px)", color: "#6b6460", lineHeight: 1.6, fontFamily: "'Instrument Serif',serif", letterSpacing: -0.2 }}>
            Free directories attract noise. When builders pay to be listed, the pool stays high
            signal. When founders pay to search, they take the matches seriously. No ads, no free
            tiers, no spray-and-pray.
          </p>
        </section>
      </main>
    </div>
  );
}

function Card(props: {
  label: string;
  price: string;
  sub: string;
  color: string;
  cta: string;
  ctaLabel: string;
  desc?: string;
  alt?: string;
  features: string[];
}) {
  const allFeatures = props.features;
  return (
    <div style={{ background: "#fff", border: `1.5px solid ${props.color}30`, borderRadius: 16, padding: "0 20px 20px", minHeight: 620, display: "flex", flexDirection: "column" }}>
      <div style={{ height: 3, background: props.color, borderRadius: "0 0 3px 3px", marginBottom: 12 }} />
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: props.color, letterSpacing: 1.6, marginBottom: 10, display: "inline-flex", padding: "3px 10px", borderRadius: 999, background: `${props.color}10`, border: `1px solid ${props.color}25` }}>
        {props.label}
      </div>
      <div style={{ fontSize: 50, fontFamily: "'Instrument Serif',serif", fontWeight: 400, color: "#1a1a1a", lineHeight: 1 }}>
        {props.price}
        <span style={{ fontSize: 15, color: "#9a9088", marginLeft: 6, fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>{props.sub}</span>
      </div>
      {props.alt && (
        <div style={{ marginTop: 4, fontSize: 12, color: "#6b6460" }}>
          {props.alt}
        </div>
      )}
      {props.desc && (
        <div style={{ marginTop: 10, fontSize: 15, color: "#6b6460" }}>
          {props.desc}
        </div>
      )}
      <div style={{ marginTop: 14, marginBottom: 14, display: "grid", gap: 0 }}>
        {allFeatures.map((f, idx) => (
          <div key={f} style={{ fontSize: 14, color: "#6b6460", lineHeight: 1.4, display: "flex", gap: 8, padding: "9px 0", borderBottom: idx === allFeatures.length - 1 ? "none" : "1px solid #f1ece6" }}>
            <span style={{ color: props.color, fontWeight: 700 }}>◆</span>
            <span>{f}</span>
          </div>
        ))}
      </div>
      <a href={props.cta} style={{ display: "block", marginTop: "auto", background: props.color, color: "#fff", textDecoration: "none", borderRadius: 10, padding: "13px 12px", fontWeight: 800, fontSize: 14, textAlign: "center" }}>
        {props.ctaLabel} →
      </a>
    </div>
  );
}
