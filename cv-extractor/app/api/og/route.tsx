// app/api/og/route.tsx
// Vercel OG image — 1200x630 social card for joinstartup.app
// Usage: /api/og  or  /api/og?name=Meena&archetype=Zero-to-one+Builder&stage=0→1
// Install: npm install @vercel/og

import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const name      = searchParams.get("name")      || null;
  const archetype = searchParams.get("archetype")  || "Zero-to-one Builder";
  const stage     = searchParams.get("stage")      || "0→1";
  const mode      = searchParams.get("mode")       || "default"; // default | profile

  // Profile mode — personalised card after analysis
  if (mode === "profile" && name) {
    return new ImageResponse(
      <div
        style={{
          width: "100%", height: "100%",
          background: "#f5f2ee",
          display: "flex", flexDirection: "column",
          fontFamily: "system-ui, sans-serif",
          position: "relative", overflow: "hidden",
        }}
      >
        {/* Decorative corner accent */}
        <div style={{ position:"absolute", top:0, left:0, width:6, height:"100%", background:"#ff4d00", display:"flex" }}/>

        {/* Top brand */}
        <div style={{ display:"flex", alignItems:"center", padding:"48px 72px 0", gap:12 }}>
          <div style={{ width:10, height:10, borderRadius:"50%", background:"#ff4d00", display:"flex" }}/>
          <span style={{ fontSize:14, color:"#9a9088", letterSpacing:3, fontFamily:"monospace" }}>JOINSTARTUP.APP</span>
        </div>

        {/* Main content */}
        <div style={{ display:"flex", flex:1, alignItems:"center", padding:"0 72px", gap:60 }}>
          {/* Left — identity */}
          <div style={{ display:"flex", flexDirection:"column", flex:1, gap:16 }}>
            <div style={{ fontSize:18, color:"#9a9088", fontFamily:"monospace", letterSpacing:1 }}>BUILDER ARCHETYPE</div>
            <div style={{ fontSize:64, fontWeight:900, color:"#1a1a1a", lineHeight:1.05, letterSpacing:-2 }}>
              {name}<span style={{ color:"#ff4d00" }}>.</span>
            </div>
            <div style={{ fontSize:32, fontWeight:700, color:"#ff4d00", lineHeight:1.2 }}>{archetype}</div>
            <div style={{ display:"flex", gap:10, marginTop:8 }}>
              <div style={{ padding:"6px 16px", borderRadius:20, background:"#ff4d0015", border:"1px solid #ff4d0030", fontSize:15, color:"#ff4d00", fontFamily:"monospace" }}>
                Build {stage}
              </div>
            </div>
          </div>

          {/* Right — three reads preview */}
          <div style={{ display:"flex", flexDirection:"column", gap:12, width:300 }}>
            {[
              { label:"AI reads you as", value:archetype, color:"#ff4d00", bg:"#ff4d0008" },
              { label:"Founder reads you as", value:"High-signal builder", color:"#6366f1", bg:"#6366f108" },
              { label:"Recruiter reads you as", value:"Senior Engineer", color:"#ec4899", bg:"#ec489908" },
            ].map(item => (
              <div key={item.label} style={{ padding:"14px 18px", background:item.bg, borderRadius:10, border:`1px solid ${item.color}22`, display:"flex", flexDirection:"column", gap:4 }}>
                <div style={{ fontSize:11, color:item.color, fontFamily:"monospace", letterSpacing:1 }}>{item.label.toUpperCase()}</div>
                <div style={{ fontSize:18, fontWeight:700, color:"#1a1a1a" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 72px 40px" }}>
          <div style={{ fontSize:14, color:"#c0b8b0", fontFamily:"monospace" }}>
            joinstartup.app · same person. three different reads.
          </div>
          <div style={{ padding:"8px 20px", background:"#ff4d00", borderRadius:8, fontSize:14, color:"white", fontWeight:700 }}>
            Get your reads →
          </div>
        </div>
      </div>,
      { width: 1200, height: 630 }
    );
  }

  // Default — generic site OG card
  return new ImageResponse(
    <div
      style={{
        width: "100%", height: "100%",
        background: "#f5f2ee",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        position: "relative", overflow: "hidden",
        gap: 0,
      }}
    >
      {/* Left accent bar */}
      <div style={{ position:"absolute", top:0, left:0, width:6, height:"100%", background:"#ff4d00", display:"flex" }}/>

      {/* Brand */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#ff4d00", display:"flex" }}/>
        <span style={{ fontSize:16, color:"#9a9088", letterSpacing:3, fontFamily:"monospace" }}>JOINSTARTUP.APP</span>
      </div>

      {/* Headline */}
      <div style={{ fontSize:72, fontWeight:900, color:"#1a1a1a", lineHeight:1.05, letterSpacing:-3, textAlign:"center", marginBottom:16 }}>
        same person.<br/>
        <span style={{ color:"#ff4d00" }}>three different reads.</span>
      </div>

      {/* Sub */}
      <div style={{ fontSize:22, color:"#6b6460", textAlign:"center", maxWidth:700, lineHeight:1.6, marginBottom:36 }}>
        Drop your CV, GitHub, LinkedIn, or portfolio.<br/>
        See how AI, founders, and recruiters all read you differently.
      </div>

      {/* Three read pills */}
      <div style={{ display:"flex", gap:16 }}>
        {[
          { label:"AI read", color:"#ff4d00" },
          { label:"Founder read", color:"#6366f1" },
          { label:"Recruiter read", color:"#ec4899" },
        ].map(item => (
          <div key={item.label} style={{ padding:"10px 24px", borderRadius:24, background:`${item.color}12`, border:`1.5px solid ${item.color}35`, fontSize:18, color:item.color, fontWeight:600, fontFamily:"monospace" }}>
            {item.label}
          </div>
        ))}
      </div>

      {/* Bottom tagline */}
      <div style={{ position:"absolute", bottom:36, fontSize:14, color:"#c0b8b0", fontFamily:"monospace", letterSpacing:1 }}>
        India's startup talent marketplace · ₹499 one-time
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
