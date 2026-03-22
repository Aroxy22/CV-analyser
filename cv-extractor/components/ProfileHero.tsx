"use client";

import { useEffect, useRef } from "react";

export default function ProfileHero() {
  const svgRef = useRef<SVGSVGElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function mid(el: HTMLElement) {
      const scene = sceneRef.current!;
      const r = el.getBoundingClientRect();
      const sr = scene.getBoundingClientRect();
      return {
        x: (r.left - sr.left + r.width / 2) / (sr.width / 680),
        y: (r.top - sr.top + r.height / 2) / (sr.height / 500),
      };
    }

    function setLine(id: string, x1: number, y1: number, x2: number, y2: number) {
      const el = document.getElementById(id);
      if (el) {
        el.setAttribute("x1", String(x1));
        el.setAttribute("y1", String(y1));
        el.setAttribute("x2", String(x2));
        el.setAttribute("y2", String(y2));
      }
    }

    function update() {
      const scene = sceneRef.current;
      const cz = scene?.querySelector(".js-center") as HTMLElement | null;
      if (!cz) return;
      const ctr = mid(cz);
      const R = 72;

      (["c1", "c2", "c3", "c4"] as const).forEach((id, i) => {
        const card = document.getElementById(id) as HTMLElement | null;
        if (!card) return;
        const cm = mid(card);
        const dx = ctr.x - cm.x, dy = ctr.y - cm.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (!len) return;
        setLine(`l${i + 1}`, cm.x, cm.y, ctr.x - (dx / len) * R, ctr.y - (dy / len) * R);
      });

      const s1 = document.getElementById("s1") as HTMLElement | null;
      const s2 = document.getElementById("s2") as HTMLElement | null;
      if (s1) { const sm = mid(s1); setLine("l5", ctr.x - 14, ctr.y + R, sm.x + 22, sm.y - 7); }
      if (s2) { const sm = mid(s2); setLine("l6", ctr.x + 14, ctr.y + R, sm.x - 22, sm.y - 7); }
    }

    const t = setTimeout(update, 80);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, []);

  return (
    <div
      ref={sceneRef}
      style={{
        width: "100%", maxWidth: 680, margin: "0 auto",
        aspectRatio: "680/500", position: "relative",
        overflow: "hidden", background: "#f5f2ee",
        borderRadius: 16, fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <style>{`
        @keyframes spinRay { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulseRing { 0%,100% { box-shadow: 0 0 0 0 #ff4d0010; } 50% { box-shadow: 0 0 0 14px #ff4d0000; } }
        @keyframes docBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes floatA { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes floatB { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes floatC { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
        @keyframes floatD { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.022); } }
        @keyframes dashMove { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -20; } }
        @keyframes outIn { from { opacity: 0; transform: scale(0.93) translateY(5px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes livePulse { 0%,100% { opacity: 1; } 50% { opacity: 0.2; } }
        .hero-rays { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; animation: spinRay 80s linear infinite; opacity: 0.045; pointer-events: none; }
        .hero-rays svg { width: 960px; height: 960px; flex-shrink: 0; }
        .hero-dropzone { width: 158px; height: 158px; border-radius: 50%; background: #ff4d000c; border: 1.5px dashed #ff4d0040; display: flex; align-items: center; justify-content: center; animation: pulseRing 3.2s ease-in-out infinite; }
        .hero-dropzone-inner { width: 112px; height: 112px; border-radius: 50%; background: #ff4d0014; border: 1.5px solid #ff4d0060; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }
        .hero-doc { width: 32px; height: 40px; background: #ff4d00; border-radius: 4px; position: relative; display: flex; flex-direction: column; gap: 3px; padding: 7px 6px 6px; animation: docBounce 2.4s ease-in-out infinite; }
        .hero-doc::before { content: ''; position: absolute; top: 0; right: 0; width: 9px; height: 9px; background: #f5f2ee; clip-path: polygon(0 0, 100% 100%, 100% 0); }
        .hero-card { position: absolute; width: 138px; background: #1c1c1c; border-radius: 9px; overflow: hidden; }
        .hero-fa { animation: floatA 3.4s ease-in-out infinite; }
        .hero-fb { animation: floatB 3.0s ease-in-out infinite 0.6s; }
        .hero-fc { animation: floatC 3.8s ease-in-out infinite 1.0s; }
        .hero-fd { animation: floatD 3.2s ease-in-out infinite 1.4s; }
        .hero-insight { position: absolute; width: 134px; border-radius: 9px; padding: 9px 12px; border-left: 2.5px solid; }
        .hero-oa { animation: breathe 4.2s ease-in-out infinite 0.3s, outIn 0.5s ease 1.0s both; }
        .hero-ob { animation: breathe 4.6s ease-in-out infinite 0.7s, outIn 0.5s ease 1.3s both; }
        .hero-live-dot { width: 4px; height: 4px; border-radius: 50%; animation: livePulse 2s ease-in-out infinite; flex-shrink: 0; }
        .hero-grid { display: grid; grid-template-columns: repeat(10, 8px); gap: 2px; margin-bottom: 6px; }
        .hero-dot { width: 8px; height: 8px; border-radius: 1.5px; }
        .hero-cl { height: 3.5px; background: #ffffff14; border-radius: 2px; margin-bottom: 3px; }
        .hero-tag { display: inline-block; padding: 1.5px 6px; border-radius: 8px; font-size: 7.5px; font-family: 'DM Mono', monospace; margin-right: 2px; margin-top: 2px; }
        .hero-dash { animation: dashMove 1.3s linear infinite; }
        .hero-dash2 { animation: dashMove 1.0s linear infinite; }
      `}</style>

      {/* Rays */}
      <div className="hero-rays">
        <svg viewBox="-480 -480 960 960" xmlns="http://www.w3.org/2000/svg">
          {[0,45,90,135,180,225,270,315].map((deg, i) => (
            <line key={i} x1={Math.cos((deg*Math.PI)/180)*0} y1={Math.sin((deg*Math.PI)/180)*0}
              x2={Math.cos((deg*Math.PI)/180)*480} y2={Math.sin((deg*Math.PI)/180)*480}
              stroke="#ff4d00" strokeWidth={i % 2 === 0 ? 1.5 : 1}
            />
          ))}
          <line x1="0" y1="-480" x2="0" y2="480" stroke="#ff4d00" strokeWidth="1.5"/>
          <line x1="-480" y1="0" x2="480" y2="0" stroke="#ff4d00" strokeWidth="1.5"/>
          <line x1="-340" y1="-340" x2="340" y2="340" stroke="#ff4d00" strokeWidth="1.5"/>
          <line x1="340" y1="-340" x2="-340" y2="340" stroke="#ff4d00" strokeWidth="1.5"/>
          <line x1="-180" y1="-440" x2="180" y2="440" stroke="#ff4d00" strokeWidth="1"/>
          <line x1="180" y1="-440" x2="-180" y2="440" stroke="#ff4d00" strokeWidth="1"/>
          <line x1="-440" y1="-180" x2="440" y2="180" stroke="#ff4d00" strokeWidth="1"/>
          <line x1="440" y1="-180" x2="-440" y2="180" stroke="#ff4d00" strokeWidth="1"/>
        </svg>
      </div>

      {/* Heading */}
      <div style={{ position:"absolute", top:0, left:0, right:0, textAlign:"center", paddingTop:15, pointerEvents:"none" }}>
        <h2 style={{ fontSize:18, fontWeight:900, color:"#1a1a1a", lineHeight:1.2, letterSpacing:-0.5, margin:0 }}>
          same person.<br /><span style={{ color:"#ff4d00" }}>three different reads.</span>
        </h2>
        <p style={{ fontSize:9, color:"#aaa", fontFamily:"'DM Mono',monospace", letterSpacing:2, marginTop:3 }}>◆ JOINSTARTUP.APP</p>
      </div>

      {/* SVG connector layer */}
      <svg ref={svgRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }} viewBox="0 0 680 500" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="hero-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </marker>
        </defs>
        <line id="l1" stroke="#ff4d00" strokeWidth="1" strokeDasharray="5 4" opacity="0.28" markerEnd="url(#hero-ah)" className="hero-dash"/>
        <line id="l2" stroke="#10b981" strokeWidth="1" strokeDasharray="5 4" opacity="0.28" markerEnd="url(#hero-ah)" className="hero-dash"/>
        <line id="l3" stroke="#6366f1" strokeWidth="1" strokeDasharray="5 4" opacity="0.28" markerEnd="url(#hero-ah)" className="hero-dash"/>
        <line id="l4" stroke="#a78bfa" strokeWidth="1" strokeDasharray="5 4" opacity="0.28" markerEnd="url(#hero-ah)" className="hero-dash"/>
        <line id="l5" stroke="#6366f1" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.32" markerEnd="url(#hero-ah)" className="hero-dash2"/>
        <line id="l6" stroke="#ec4899" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.32" markerEnd="url(#hero-ah)" className="hero-dash2"/>
      </svg>

      {/* Drop zone */}
      <div className="js-center" style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-56%)" }}>
        <div className="hero-dropzone">
          <div className="hero-dropzone-inner">
            <div className="hero-doc">
              {[1,1,1,0.55].map((w, i) => (
                <div key={i} style={{ height:"2.5px", background:"rgba(255,255,255,0.8)", borderRadius:2, width:`${w*100}%` }} />
              ))}
            </div>
            <div style={{ color:"#ff4d00", fontSize:13, fontWeight:900, lineHeight:1 }}>↓</div>
          </div>
        </div>
      </div>

      {/* Center label */}
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,46px)", textAlign:"center", width:210, pointerEvents:"none" }}>
        <p style={{ fontSize:10, fontWeight:700, color:"#ff4d00", letterSpacing:2, fontFamily:"'DM Mono',monospace", margin:0 }}>DROP YOUR PROFILE</p>
        <span style={{ fontSize:8.5, color:"#aaa", fontFamily:"'DM Mono',monospace", letterSpacing:0.5 }}>CV · GitHub · LinkedIn · Portfolio</span>
      </div>

      {/* CV card */}
      <div id="c1" className="hero-card hero-fa" style={{ top:82, left:42 }}>
        <div style={{ height:3, background:"#ff4d00" }}/>
        <div style={{ padding:"8px 10px 10px" }}>
          <div style={{ fontSize:8, fontFamily:"'DM Mono',monospace", color:"#484848", letterSpacing:1.5, marginBottom:6 }}>CV</div>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:7 }}>
            <div style={{ width:20, height:20, borderRadius:"50%", background:"#ff4d001a", color:"#ff4d00", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700 }}>A</div>
            <div style={{ flex:1 }}>
              <div className="hero-cl" style={{ width:"80%" }}/>
              <div className="hero-cl" style={{ width:"60%", marginTop:3 }}/>
            </div>
          </div>
          <span className="hero-tag" style={{ background:"#ff4d001a", color:"#ff4d00" }}>engineer</span>
          <span className="hero-tag" style={{ background:"#ffffff0e", color:"#666" }}>seed</span>
          <span className="hero-tag" style={{ background:"#ffffff0e", color:"#666" }}>0→1</span>
        </div>
      </div>

      {/* GitHub card */}
      <div id="c2" className="hero-card hero-fb" style={{ top:64, right:42 }}>
        <div style={{ height:3, background:"#10b981" }}/>
        <div style={{ padding:"8px 10px 10px" }}>
          <div style={{ fontSize:8, fontFamily:"'DM Mono',monospace", color:"#484848", letterSpacing:1.5, marginBottom:6 }}>GITHUB</div>
          <div className="hero-grid">
            {[0.15,0.5,0.9,0.25,0.75,0.45,0.95,0.2,0.6,0.35,0.4,0.15,0.85,0.95,0.25,0.65,0.35,0.8,0.15,0.55].map((op, i) => (
              <div key={i} className="hero-dot" style={{ background:"#10b981", opacity:op }}/>
            ))}
          </div>
          <div style={{ fontSize:8, fontFamily:"'DM Mono',monospace", color:"#10b981" }}>47 repos · ships daily</div>
        </div>
      </div>

      {/* LinkedIn card */}
      <div id="c3" className="hero-card hero-fc" style={{ top:224, left:24 }}>
        <div style={{ height:3, background:"#6366f1" }}/>
        <div style={{ padding:"8px 10px 10px" }}>
          <div style={{ fontSize:8, fontFamily:"'DM Mono',monospace", color:"#484848", letterSpacing:1.5, marginBottom:6 }}>LINKEDIN</div>
          <div style={{ background:"#6366f10e", borderRadius:4, padding:6, marginBottom:6, display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:16, height:16, borderRadius:"50%", background:"#6366f125", color:"#6366f1", display:"flex", alignItems:"center", justifyContent:"center", fontSize:7, fontWeight:700 }}>A</div>
            <div style={{ flex:1 }}>
              <div style={{ height:3.5, background:"#6366f125", borderRadius:2, width:"80%" }}/>
              <div style={{ height:3.5, background:"#6366f118", borderRadius:2, width:"60%", marginTop:3 }}/>
            </div>
          </div>
          <div style={{ fontSize:7.5, fontFamily:"'DM Mono',monospace", color:"#484848", marginBottom:3 }}>endorsements</div>
          <span className="hero-tag" style={{ background:"#6366f118", color:"#6366f1" }}>strategy ×12</span>
          <span className="hero-tag" style={{ background:"#ffffff0e", color:"#555" }}>ops ×3</span>
        </div>
      </div>

      {/* Portfolio card */}
      <div id="c4" className="hero-card hero-fd" style={{ top:220, right:24 }}>
        <div style={{ height:3, background:"#a78bfa" }}/>
        <div style={{ padding:"8px 10px 10px" }}>
          <div style={{ fontSize:8, fontFamily:"'DM Mono',monospace", color:"#484848", letterSpacing:1.5, marginBottom:6 }}>PORTFOLIO</div>
          <div style={{ background:"#111", borderRadius:4, overflow:"hidden", marginBottom:5 }}>
            <div style={{ padding:"4px 7px", background:"#a78bfa14", borderBottom:"1px solid #a78bfa18", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:8, fontWeight:700, color:"#a78bfa", fontFamily:"'DM Mono',monospace" }}>fintrack.so</span>
              <div style={{ display:"flex", alignItems:"center", gap:3 }}>
                <div className="hero-live-dot" style={{ background:"#10b981" }}/>
                <span style={{ fontSize:6.5, fontFamily:"'DM Mono',monospace", color:"#10b981" }}>live</span>
              </div>
            </div>
            <div style={{ padding:"4px 7px 5px", display:"flex", flexDirection:"column", gap:2.5 }}>
              <div style={{ height:3, background:"#ffffff12", borderRadius:1.5, width:"88%" }}/>
              <div style={{ height:3, background:"#ffffff0a", borderRadius:1.5, width:"65%" }}/>
              <div style={{ height:8, width:38, background:"#a78bfa", opacity:0.55, borderRadius:2, marginTop:2 }}/>
            </div>
          </div>
          <div style={{ fontSize:7.5, fontFamily:"'DM Mono',monospace", color:"#a78bfa", opacity:0.7, marginBottom:5 }}>fintrack.so/dashboard</div>
          <div style={{ display:"flex", gap:2 }}>
            {[["Next.js","#a78bfa15","#a78bfa"],["Supabase","#ffffff0c","#555"],["Stripe","#ffffff0c","#555"]].map(([label,bg,col]) => (
              <span key={label} style={{ fontSize:7, fontFamily:"'DM Mono',monospace", padding:"1px 5px", borderRadius:3, background:bg, color:col }}>{label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Founder signal */}
      <div id="s1" className="hero-insight hero-oa" style={{ bottom:52, left:38, background:"#f0eff8", borderLeftColor:"#6366f1" }}>
        <div style={{ fontSize:7.5, fontFamily:"'DM Mono',monospace", letterSpacing:1, color:"#6366f1", marginBottom:4, display:"flex", alignItems:"center", gap:4 }}>
          <div style={{ width:4, height:4, borderRadius:"50%", background:"#6366f1", flexShrink:0 }}/>
          FOUNDER READS
        </div>
        <div style={{ fontSize:13, fontWeight:900, color:"#1a1a1a", lineHeight:1.2, marginBottom:4 }}>Zero-to-one<br/>builder</div>
        <div style={{ fontSize:7.5, fontFamily:"'DM Mono',monospace", color:"#555", lineHeight:1.45, opacity:0.75 }}>seed-stage · 0→1<br/>founding eng</div>
        <span style={{ display:"inline-block", padding:"1.5px 6px", borderRadius:8, fontSize:7.5, fontFamily:"'DM Mono',monospace", background:"#6366f112", color:"#6366f1", marginTop:4 }}>archetype match</span>
      </div>

      {/* Recruiter signal */}
      <div id="s2" className="hero-insight hero-ob" style={{ bottom:48, right:38, background:"#fdf0f6", borderLeftColor:"#ec4899" }}>
        <div style={{ fontSize:7.5, fontFamily:"'DM Mono',monospace", letterSpacing:1, color:"#ec4899", marginBottom:4, display:"flex", alignItems:"center", gap:4 }}>
          <div style={{ width:4, height:4, borderRadius:"50%", background:"#ec4899", flexShrink:0 }}/>
          RECRUITER READS
        </div>
        <div style={{ fontSize:13, fontWeight:900, color:"#1a1a1a", lineHeight:1.2, marginBottom:4 }}>
          Senior SWE<br/><span style={{ fontSize:11, color:"#666", fontWeight:400 }}>₹28–42 LPA</span>
        </div>
        <div style={{ fontSize:7.5, fontFamily:"'DM Mono',monospace", color:"#555", lineHeight:1.45, opacity:0.75 }}>React · Node · AWS<br/>Series A fit</div>
        <span style={{ display:"inline-block", padding:"1.5px 6px", borderRadius:8, fontSize:7.5, fontFamily:"'DM Mono',monospace", background:"#ec489912", color:"#ec4899", marginTop:4 }}>ATS shortlist</span>
      </div>

      {/* Tagline */}
      <div style={{ position:"absolute", bottom:11, left:0, right:0, textAlign:"center", fontSize:8.5, color:"#bbb", fontFamily:"'DM Mono',monospace", letterSpacing:0.5, pointerEvents:"none" }}>
        drop any profile · see how founders, recruiters and AI read you differently
      </div>
    </div>
  );
}
