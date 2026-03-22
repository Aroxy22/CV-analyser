import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up — JoinStartup",
};

export default function Page() {
  const html = `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Sign Up — JoinStartup</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{--bg:#f5f2ee;--surface:#ffffff;--border:#e0dbd4;--border2:#d0c9c0;--orange:#ff4d00;--orange-d:#e63d00;--orange-t:#ff4d0012;--orange-m:#ff4d0030;--dark:#1a1a1a;--muted:#6b6460;--muted2:#9a9088;--muted3:#b0a8a0;--indigo:#6366f1;--green:#10b981;--pink:#ec4899}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--dark);font-family:'DM Sans',system-ui,sans-serif;min-height:100vh;display:flex;flex-direction:column}
nav{display:flex;align-items:center;justify-content:space-between;padding:16px 48px;border-bottom:1px solid var(--border);background:var(--bg)}
.nav-logo{display:flex;align-items:center;gap:8px;font-weight:800;font-size:14px;letter-spacing:1px;color:var(--dark);text-decoration:none}
.nav-dot{color:var(--orange)}
.nav-back{font-size:13px;color:var(--muted);text-decoration:none;font-family:'DM Mono',monospace;transition:color .2s}
.nav-back:hover{color:var(--dark)}

/* MAIN LAYOUT */
.signup-layout{flex:1;display:grid;grid-template-columns:1fr 1fr;min-height:calc(100vh - 57px)}

/* LEFT — persona select */
.left-panel{padding:64px 56px;display:flex;flex-direction:column;justify-content:center;border-right:1px solid var(--border)}
.left-panel h1{font-family:'Instrument Serif',serif;font-size:clamp(28px,3.5vw,44px);font-weight:400;letter-spacing:-1.5px;line-height:1.1;margin-bottom:12px}
.accent{color:var(--orange);font-style:italic}
.left-panel .sub{font-size:15px;color:var(--muted);line-height:1.7;margin-bottom:36px}

.persona-cards{display:flex;flex-direction:column;gap:10px}
.persona{border:1.5px solid var(--border);border-radius:12px;padding:18px 20px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:14px;text-decoration:none;color:inherit}
.persona:hover{border-color:var(--border2);transform:translateX(4px)}
.persona.active{border-color:var(--orange);background:var(--orange-t)}
.persona-icon{font-size:22px;flex-shrink:0;width:36px;text-align:center}
.persona-text h3{font-size:14px;font-weight:700;margin-bottom:3px;letter-spacing:-.2px}
.persona-text p{font-size:12px;color:var(--muted);line-height:1.4}
.persona-price{margin-left:auto;font-family:'DM Mono',monospace;font-size:11px;color:var(--muted2);white-space:nowrap;flex-shrink:0}
.persona.active .persona-price{color:var(--orange)}

/* RIGHT — form */
.right-panel{padding:64px 56px;display:flex;flex-direction:column;justify-content:center;overflow-y:auto}

.form-step{display:none}
.form-step.active{display:block}

.form-eyebrow{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--muted2);margin-bottom:20px}
.form-title{font-family:'Instrument Serif',serif;font-size:26px;font-weight:400;letter-spacing:-.5px;margin-bottom:6px}
.form-sub{font-size:13px;color:var(--muted);margin-bottom:28px;line-height:1.6}

.field{margin-bottom:18px}
.field label{display:block;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:1.5px;color:var(--muted2);margin-bottom:7px}
.field input,.field textarea,.field select{width:100%;padding:12px 14px;background:var(--bg);border:1.5px solid var(--border);border-radius:8px;color:var(--dark);font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border-color .2s;resize:none}
.field input:focus,.field textarea:focus,.field select:focus{border-color:var(--orange)}
.field select{cursor:pointer}

.submit-btn{width:100%;padding:14px;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-weight:800;font-size:14px;cursor:pointer;text-decoration:none;display:block;text-align:center;transition:all .2s;margin-top:4px}
.submit-btn:hover{transform:translateY(-1px)}

.or-divider{display:flex;align-items:center;gap:12px;margin:16px 0;font-family:'DM Mono',monospace;font-size:10px;color:var(--muted3)}
.or-divider::before,.or-divider::after{content:'';flex:1;height:1px;background:var(--border)}

.alt-link{text-align:center;font-size:13px;color:var(--muted)}
.alt-link a{color:var(--orange);text-decoration:none;font-weight:600}
.alt-link a:hover{text-decoration:underline}

/* SUCCESS */
.success-state{text-align:center;padding:40px 20px}
.success-state .check-circle{width:60px;height:60px;background:var(--orange-t);border:2px solid var(--orange-m);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 20px}
.success-state h2{font-family:'Instrument Serif',serif;font-size:26px;font-weight:400;letter-spacing:-.5px;margin-bottom:8px}
.success-state p{font-size:14px;color:var(--muted);line-height:1.7;margin-bottom:24px}

footer{border-top:1px solid var(--border);padding:18px 48px;display:flex;justify-content:space-between;align-items:center}
.footer-copy{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted3)}
.footer-links-sm{display:flex;gap:20px;list-style:none}
.footer-links-sm a{font-size:11px;color:var(--muted2);text-decoration:none}
.footer-links-sm a:hover{color:var(--dark)}

@media(max-width:768px){
  .signup-layout{grid-template-columns:1fr}
  .left-panel{border-right:none;border-bottom:1px solid var(--border);padding:40px 24px}
  .right-panel{padding:40px 24px}
  nav{padding:14px 20px}
}
</style></head><body>
<nav>
  <a href="/" class="nav-logo"><span class="nav-dot">◆</span> JOINSTARTUP</a>
  <a href="/" class="nav-back">← Back to home</a>
</nav>

<div class="signup-layout">
  <!-- LEFT — choose who you are -->
  <div class="left-panel">
    <h1>Join India's<br/><span class="accent">startup talent</span><br/>layer.</h1>
    <p class="sub">Choose how you want to use JoinStartup.</p>

    <div class="persona-cards">
      <div class="persona active" onclick="selectPersona('builder', this)">
        <div class="persona-icon">⚙️</div>
        <div class="persona-text">
          <h3>I'm a builder</h3>
          <p>Get analysed. Join the pool. Be found by founders.</p>
        </div>
        <div class="persona-price">₹499 one-time</div>
      </div>
      <div class="persona" onclick="selectPersona('founder', this)">
        <div class="persona-icon">🚀</div>
        <div class="persona-text">
          <h3>I'm a founder</h3>
          <p>Search the builder pool. Find startup-ready talent.</p>
        </div>
        <div class="persona-price">₹2,999/mo</div>
      </div>
      <div class="persona" onclick="selectPersona('recruiter', this)">
        <div class="persona-icon">📋</div>
        <div class="persona-text">
          <h3>I'm a recruiter</h3>
          <p>Batch process CVs. Get ranked shortlists.</p>
        </div>
        <div class="persona-price">₹9,999/mo</div>
      </div>
      <div class="persona" onclick="selectPersona('seed', this)">
        <div class="persona-icon">🌱</div>
        <div class="persona-text">
          <h3>Just the Sunday Seed</h3>
          <p>Weekly curated roles. Free forever.</p>
        </div>
        <div class="persona-price">Free</div>
      </div>
    </div>
  </div>

  <!-- RIGHT — form -->
  <div class="right-panel">

    <!-- BUILDER form -->
    <div class="form-step active" id="form-builder">
      <div class="form-eyebrow">BUILDER SIGNUP</div>
      <h2 class="form-title">Start with your analysis.</h2>
      <p class="form-sub">Free to analyse. ₹499 to join the pool and be visible to founders.</p>
      <div class="field"><label>YOUR GOAL</label><textarea rows="3" placeholder="e.g. Senior engineer, 5 yrs, Bangalore — want founding role at AI startup with equity"></textarea></div>
      <div class="field"><label>YOUR EMAIL</label><input type="email" placeholder="you@email.com"></div>
      <a href="/analyse" class="submit-btn" style="background:var(--orange);color:#fff">Analyse My Profile Free →</a>
      <div class="or-divider">OR</div>
      <div class="alt-link">Already analysed? <a href="/profile/access">Get your profile link →</a></div>
    </div>

    <!-- FOUNDER form -->
    <div class="form-step" id="form-founder">
      <div class="form-eyebrow">FOUNDER SIGNUP</div>
      <h2 class="form-title">Find builders who ship.</h2>
      <p class="form-sub">Search the pool by archetype and stage. 5 unlocks/month at ₹2,999.</p>
      <div class="field"><label>YOUR NAME</label><input type="text" placeholder="Arjun Mehta"></div>
      <div class="field"><label>YOUR EMAIL</label><input type="email" placeholder="you@startup.com"></div>
      <div class="field"><label>COMPANY / STARTUP</label><input type="text" placeholder="Apex Dynamics"></div>
      <div class="field"><label>STAGE</label>
        <select>
          <option value="">Select stage...</option>
          <option>Pre-Seed</option><option>Seed</option><option>Series A</option><option>Series B+</option>
        </select>
      </div>
      <button class="submit-btn" style="background:var(--indigo);color:#fff" onclick="showSuccess('founder')">Request Founder Access →</button>
      <div class="alt-link" style="margin-top:12px">Questions? <a href="mailto:hello@joinstartup.app">hello@joinstartup.app</a></div>
    </div>

    <!-- RECRUITER form -->
    <div class="form-step" id="form-recruiter">
      <div class="form-eyebrow">RECRUITER SIGNUP</div>
      <h2 class="form-title">Batch. Rank. Shortlist.</h2>
      <p class="form-sub">Upload up to 200 CVs. Get AI-ranked shortlists. Export to ATS. ₹9,999/month.</p>
      <div class="field"><label>YOUR NAME</label><input type="text" placeholder="Priya Sharma"></div>
      <div class="field"><label>YOUR EMAIL</label><input type="email" placeholder="you@recruitco.com"></div>
      <div class="field"><label>COMPANY</label><input type="text" placeholder="Talent Partners India"></div>
      <div class="field"><label>CVS PER MONTH (APPROX)</label>
        <select>
          <option>1–50</option><option>50–100</option><option>100–200</option><option>200+</option>
        </select>
      </div>
      <button class="submit-btn" style="background:var(--pink);color:#fff" onclick="showSuccess('recruiter')">Request Recruiter Access →</button>
      <div class="alt-link" style="margin-top:12px">Questions? <a href="mailto:hello@joinstartup.app">hello@joinstartup.app</a></div>
    </div>

    <!-- SEED form -->
    <div class="form-step" id="form-seed">
      <div class="form-eyebrow">THE SUNDAY SEED</div>
      <h2 class="form-title">Top 5 equity roles,<br/>every Sunday.</h2>
      <p class="form-sub">Free. No spam. Unsubscribe anytime. 2,400+ builders already subscribed.</p>
      <div class="field"><label>YOUR EMAIL</label><input type="email" placeholder="you@email.com" id="seedSignupEmail"></div>
      <button class="submit-btn" style="background:var(--orange);color:#fff" onclick="showSuccess('seed')">Send Me The Seed →</button>
      <div class="alt-link" style="margin-top:12px">Want more? <a href="/jobs">Browse all roles →</a></div>
    </div>

    <!-- SUCCESS states -->
    <div class="form-step" id="form-success-founder">
      <div class="success-state">
        <div class="check-circle">✓</div>
        <h2>Request received.</h2>
        <p>We'll set up your founder access within 24 hours. You'll receive an email at the address you provided with next steps.</p>
        <a href="/founders" style="display:inline-block;padding:12px 28px;background:var(--indigo);color:#fff;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none">Learn more about founder access →</a>
      </div>
    </div>
    <div class="form-step" id="form-success-recruiter">
      <div class="success-state">
        <div class="check-circle">✓</div>
        <h2>Request received.</h2>
        <p>We'll be in touch within 24 hours to set up your recruiter account and walk you through the batch upload tool.</p>
        <a href="/" style="display:inline-block;padding:12px 28px;background:var(--pink);color:#fff;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none">Back to home →</a>
      </div>
    </div>
    <div class="form-step" id="form-success-seed">
      <div class="success-state">
        <div class="check-circle">🌱</div>
        <h2>You're on the list.</h2>
        <p>First Seed lands this Sunday at 6 PM IST. Check your inbox — it comes from <a href="mailto:hello@joinstartup.app">hello@joinstartup.app</a> so add us to your contacts.</p>
        <a href="/jobs" style="display:inline-block;padding:12px 28px;background:var(--orange);color:#fff;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none">Browse roles in the meantime →</a>
      </div>
    </div>

  </div>
</div>

<footer>
  <div class="footer-copy">© 2026 JoinStartup.app</div>
  <ul class="footer-links-sm">
    <li><a href="/pricing">Pricing</a></li>
    <li><a href="/seed">The Seed</a></li>
    <li><a href="mailto:hello@joinstartup.app">Contact</a></li>
  </ul>
</footer>

<script>
function selectPersona(type, el) {
  document.querySelectorAll('.persona').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.form-step').forEach(f => f.classList.remove('active'));
  do`;
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
    />
  );
}
