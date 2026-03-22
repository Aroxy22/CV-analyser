"use client";

import { useState, useRef, useEffect } from "react";
import TrackCard from "@/components/TrackCard";
import AppNav from "@/components/AppNav";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xsbsoevqqvnxmtxuytiu.supabase.co";
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const ARCHETYPES: Record<string, { name: string; emoji: string; tagline: string; color: string; means: string[] }> = {
  "zero-to-one":         { name: "Zero-to-One Builder",       emoji: "🔥", tagline: "Ships before it's perfect",             color: "#ff4d00", means: ["You own the full surface — product, code, and customer", "Chaos is your natural habitat, ambiguity doesn't slow you down", "Seed and Pre-seed founders are actively looking for you"] },
  "systems-architect":   { name: "Systems Architect",          emoji: "🏗️", tagline: "Builds to last, thinks in platforms",   color: "#6366f1", means: ["You think in platforms, not features", "Scale problems excite you where others see complexity", "Series B+ startups need you to make growth sustainable"] },
  "growth-hacker":       { name: "Growth Hacker",              emoji: "📈", tagline: "Channel obsessed, data-driven",         color: "#10b981", means: ["You find the lever others miss, then pull hard", "Data is your language, experiments are your process", "Consumer startups at Series A/B are your sweet spot"] },
  "founding-generalist": { name: "Founding Generalist",        emoji: "⚡", tagline: "Wears 5 hats without dropping any",    color: "#f59e0b", means: ["You do what needs doing, ego doesn't get in the way", "Early founders trust you because you figure things out", "Pre-seed and Seed teams are where you shine"] },
  "product-intuitive":   { name: "Product Intuitive",          emoji: "🎯", tagline: "User obsessed, ships fast",             color: "#ec4899", means: ["You talk to users every day and ship every week", "You have opinions and you back them with data", "Consumer and B2B startups at seed/Series A want you"] },
  "operator":            { name: "The Operator",               emoji: "⚙️", tagline: "Runs the machine, builds the process", color: "#8b5cf6", means: ["You turn chaos into repeatable process", "Growth-stage startups break without someone like you", "Series B+ is where your skills have the most impact"] },
  "deep-tech":           { name: "Deep Tech Builder",          emoji: "🧠", tagline: "Loves hard problems, lives in the stack", color: "#0ea5e9", means: ["You work on problems most engineers walk away from", "Research and product are not separate worlds for you", "AI, ML, and infra startups are your natural home"] },
  "community-builder":   { name: "Community Builder",          emoji: "🤝", tagline: "Network effects are the product",       color: "#14b8a6", means: ["You understand that trust is the real distribution channel", "You build audiences before products", "Developer tools and marketplace startups need you early"] },
  "revenue-animal":      { name: "Revenue Animal",             emoji: "💰", tagline: "Closes the first 10 customers",         color: "#ef4444", means: ["Pipeline is your religion, closing is your craft", "You make startups real by making them revenue-generating", "B2B startups at seed stage are actively hunting for you"] },
  "brand-builder":       { name: "Brand Builder",              emoji: "🎨", tagline: "Makes a startup feel inevitable",       color: "#f97316", means: ["You turn a startup into a point of view people believe in", "Positioning and narrative are your competitive weapons", "Consumer startups need you before they think they do"] },
  "data-whisperer":      { name: "Data Whisperer",             emoji: "📊", tagline: "Turns numbers into decisions fast",     color: "#a3e635", means: ["You bridge the gap between business and engineering", "Data becomes a decision-making culture because of you", "Growth-stage startups promoting data-driven culture want you"] },
  "market-maker":        { name: "Market Maker",               emoji: "🌍", tagline: "Opens doors, thinks in ecosystems",     color: "#2dd4bf", means: ["You see the partnership before others see the market", "BD and alliances are where you unlock non-linear growth", "Marketplace and platform startups at Series A+ need you"] },
  "finance-builder":     { name: "Finance Builder",            emoji: "💸", tagline: "Unit economics obsessed",               color: "#fbbf24", means: ["You know what makes a startup fundable and defensible", "Unit economics and FP&A are how you speak to founders", "Series A startups preparing for their next raise need you"] },
  "pivot-survivor":      { name: "Pivot Survivor",             emoji: "🔄", tagline: "Knows what to kill and what to keep",   color: "#94a3b8", means: ["You've seen things break and know how to rebuild smart", "Your battle scars are an unfair advantage in uncertainty", "Early stage startups in transition trust your judgment"] },
  "india-stack":         { name: "India Stack Expert",         emoji: "🏭", tagline: "Builds on India's unique infra",        color: "#4ade80", means: ["UPI, ONDC, AA framework — you know the stack cold", "Regulatory complexity is a moat you help startups build", "Fintech and commerce startups in India need you urgently"] },
  "global-translator":   { name: "Global→India Translator",   emoji: "🌐", tagline: "Brings playbooks, adapts for India",   color: "#818cf8", means: ["You've seen how it works globally and know what to adapt", "Cross-cultural nuance is a superpower most don't have", "International startups entering India want you first"] },
};

const STAGE_COLORS: Record<string, string> = { "-1→0": "#94a3b8", "0→1": "#f59e0b", "1→beyond": "#10b981" };

const GOAL_TEMPLATES = [
  { icon: "🔥", label: "FOUNDING ENGINEER", preview: "Joining a founding team with equity", intent: "Looking to join a 0→1 founding team as an engineer with equity. Open to seed/pre-seed stage." },
  { icon: "🧠", label: "AI / ML ROLE", preview: "Own the AI stack at an early-stage startup", intent: "Want to join an AI-native product team at seed stage where I can own the full AI/ML stack." },
  { icon: "🌍", label: "RELOCATING TO INDIA", preview: "Moving back — looking for early-stage role", intent: "Planning to relocate to India. Looking for a seed-stage startup role where I can add immediate value." },
  { icon: "🤝", label: "CONNECT, NOT A JOB", preview: "Meet builders, operators, founders", intent: "Not looking for a role right now — want to connect with builders and founders in the India startup ecosystem." },
  { icon: "🔄", label: "CAREER SWITCH", preview: "No startup experience yet — mapping the path", intent: "Coming from a non-startup background. Want to understand where I'd fit and what gaps I need to close to join a startup." },
  { icon: "📈", label: "GROWTH / GTM", preview: "Own growth end-to-end at Series A", intent: "Looking for a Series A startup where I can own growth, GTM, or revenue end-to-end." },
];

function generateLoadingSteps(brief: string, mode: string, url: string): string[] {
  const b = brief.trim();
  let step1 = "Reading your profile...";
  if (mode === "url" && url) { const domain = url.replace(/https?:\/\//, "").split("/")[0].replace("www.", ""); step1 = `Reading ${domain}...`; }
  else if (mode === "both" && url) { const domain = url.replace(/https?:\/\//, "").split("/")[0].replace("www.", ""); step1 = `Reading your CV and ${domain}...`; }
  else if (mode === "cv") { step1 = "Reading your CV..."; }
  const techKeywords = b.match(/\b(React|Node|Python|FastAPI|AWS|GCP|Kubernetes|k8s|LLM|RAG|AI|ML|UPI|ONDC|Figma|design|brand|growth|sales|data|finance|ops|operations|product)\b/gi);
  const companies = b.match(/\b(Google|Meta|Amazon|Microsoft|Flipkart|Swiggy|Zomato|LlamaIndex|Anthropic|OpenAI|CRED|Razorpay|Zepto|Meesho)\b/g);
  let step2 = "Identifying your builder archetype...";
  if (companies?.length) step2 = `Mapping your ${companies[0]} experience to startup archetypes...`;
  else if (techKeywords?.length) { const top = [...new Set(techKeywords)].slice(0, 2).join(" + "); step2 = `Mapping your ${top} depth to the right archetype...`; }
  return [step1, step2, "Building your roadmap...", "Almost there..."];
}

type InputMode = "cv" | "url" | "both" | "questions";

const FIVE_QUESTIONS = [
  { id: "role",  label: "What's your current or most recent role?",                  placeholder: "e.g. Product Manager at Infosys, or Final year CS student" },
  { id: "years", label: "How many years of work experience do you have?",             placeholder: "e.g. 3 years, or fresher / just graduated" },
  { id: "built", label: "What's the most significant thing you've built or shipped?", placeholder: "e.g. Led a team that launched a mobile app to 50k users" },
  { id: "want",  label: "What kind of startup role are you looking for?",             placeholder: "e.g. Founding engineer at a seed-stage AI startup" },
  { id: "gap",   label: "What do you think is your biggest gap right now?",           placeholder: "e.g. No direct startup experience, or weak on product sense" },
];

type Analysis = {
  name?: string | null;
  email?: string | null;
  currentTitle?: string | null;
  currentCompany?: string | null;
  summary: string;
  experience: string;
  skills: string[];
  companies?: string[];
  domains?: string[];
  tools?: string[];
  rolesHeld?: string[];
  yearsExp?: number;
  stageBucket: string;
  stageBucketReason: string;
  archetype: string;
  archetypeReason: string;
  goalFit: { level: string; verdict: string; matches: string[]; gaps: string[] };
  roadmap?: { gap: string; resources: { name: string; type: string; url: string }[] }[];
  nextMoves?: { gap: string; why: string; learn: { name: string; url: string; note: string }; earn: { title: string; note: string }; do: { action: string; note: string } }[];
  roadmapV2?: {
    primaryGap: string; doneLooksLike: string; totalCostEstimate: string;
    phases: { label: string; focus: string; actions: { type: "do"|"learn"|"earn"; action: string; why: string; timeCost: string; moneyCost: string; resource: { name: string; url: string } | null; doneLooksLike: string }[] }[];
  };
  opportunityContext?: { remoteOk: boolean; targetGeo: string; wantsToConnect: boolean; intentType: string };
  founderView?: { headline: string; bestFitFor: string; signalStrength: string; whyHire: string[]; watchOut: string[]; askThem: string[] };
  recruiterView?: { seniorityLabel: string; topJDMatches: string[]; keywordsToMatch: string[]; redFlags: string[]; interviewAngles: string[]; salaryBand: string };
  crossSourceDelta?: { cvSignal: string; onlineSignal: string; delta: string; founderTip: string };
  _tier?: number;
  _tierLabel?: string;
  _elapsed?: number;
};

type Job = { title: string; company: string; location: string; url: string; source: string; snippet: string; type?: string };

export default function AnalysePage() {
  const [mode, setMode] = useState<InputMode>("cv");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [goal, setGoal] = useState("");
  const [email, setEmail] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [loadingStep, setLoadingStep] = useState(-1);
  const [loadingSteps, setLoadingSteps] = useState<string[]>(["Reading your profile...", "Identifying your builder archetype...", "Building your roadmap...", "Almost there..."]);
  const [lens, setLens] = useState<"you" | "founder" | "recruiter">("you");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [jobs, setJobs] = useState<unknown[]>([]);
  const [jobSearchLinks, setJobSearchLinks] = useState<unknown[]>([]);
  const [wantsToConnect, setWantsToConnect] = useState(false);
  const [error, setError] = useState("");
  const [activeTemplate, setActiveTemplate] = useState<number | null>(null);
  const [poolStatus, setPoolStatus] = useState<"none"|"free"|"paid"|"nominated">("none");
  const [joiningPool, setJoiningPool] = useState(false);
  const [poolSuccess, setPoolSuccess] = useState(false);
  const [profileToken, setProfileToken] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fromParsePath, setFromParsePath] = useState(false);
  const [parsePathArchetype, setParsePathArchetype] = useState<string | null>(null);
  const [cvId, setCvId] = useState<string | null>(null);
  const [cvAnalysisId, setCvAnalysisId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [shareCopied, setShareCopied] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isDeepLoading, setIsDeepLoading] = useState(false);
  const [deepFailed, setDeepFailed] = useState(false);
  const [deepEnriched, setDeepEnriched] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");
    const archetypeParam = params.get("archetype");
    const emailParam = params.get("email");
    const stageParam = params.get("stage");
    if (from === "parsepath") {
      setFromParsePath(true);
      if (emailParam) setEmail(emailParam);
      if (archetypeParam) setParsePathArchetype(archetypeParam);
      if (stageParam) {
        if (stageParam === "-1→0") setActiveTemplate(4);
        else if (stageParam === "0→1") setActiveTemplate(0);
      }
    }
    // Goal param — from /jobs "Analyse without CV →" or track CTA
    const goalParam = params.get("goal");
    if (goalParam) setGoal(decodeURIComponent(goalParam));

    // Pick up CV dropped on landing page OR jobs page (same sessionStorage keys)
    if (from === "landing_drop" || from === "jobs_drop") {
      try {
        const name = sessionStorage.getItem("landing_cv_name");
        const data = sessionStorage.getItem("landing_cv_data");
        const savedGoal = sessionStorage.getItem("landing_cv_goal");
        if (name && data) {
          const byteString = atob(data);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
          const blob = new Blob([ab], { type: "application/pdf" });
          const file = new File([blob], name, { type: "application/pdf", lastModified: Date.now() });
          setFile(file);
          setMode("cv");
          // Goal: sessionStorage takes priority, then URL param
          if (savedGoal) setGoal(savedGoal);
          else if (goalParam) setGoal(decodeURIComponent(goalParam));
          sessionStorage.removeItem("landing_cv_name");
          sessionStorage.removeItem("landing_cv_size");
          sessionStorage.removeItem("landing_cv_data");
          sessionStorage.removeItem("landing_cv_goal");
        }
      } catch { /* ignore storage errors */ }
    }

    // Nomination flow — email + archetype pre-filled
    if (from === "nomination") {
      if (emailParam) setEmail(emailParam);
      if (archetypeParam) setParsePathArchetype(archetypeParam);
    }

    // Track CTA — scholar track goes to /analyse?from=track&track=scholar
    if (from === "track") {
      const trackParam = params.get("track");
      if (trackParam === "scholar") setActiveTemplate(0);
    }
  }, []);

  const handleFile = (f: File) => {
    if (f.type === "application/pdf") { setFile(f); setError(""); }
    else setError("Please upload a PDF file.");
  };

  const validate = () => {
    if (!goal.trim()) { setError("Please describe your goal."); return false; }
    if (mode === "questions") {
      const filled = FIVE_QUESTIONS.filter(q => answers[q.id]?.trim());
      if (filled.length < 3) { setError("Please answer at least 3 questions."); return false; }
      return true;
    }
    if ((mode === "cv" || mode === "both") && !file) { setError("Please upload your CV (PDF)."); return false; }
    if ((mode === "url" || mode === "both") && !url.trim()) { setError("Please enter a URL."); return false; }
    return true;
  };

  const analyse = async () => {
    if (!validate()) return;
    setError("");
    setDeepFailed(false);
    setDeepEnriched(false);
    setLoadingSteps(generateLoadingSteps(goal, mode, url));
    setLoadingStep(0);

    try {
      let base64: string | null = null;

      if (file && (mode === "cv" || mode === "both")) {
        base64 = await new Promise<string>((res, rej) => {
          const r = new FileReader();
          r.onload = () => res((r.result as string).split(",")[1]);
          r.onerror = () => rej(new Error("Read failed"));
          r.readAsDataURL(file);
        });
        fetch(`${SUPABASE_URL}/rest/v1/cvs`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, Prefer: "return=representation" },
          body: JSON.stringify({ filename: file.name, file_size: file.size, mime_type: file.type, file_data: base64, email: email || null, input_type: mode, source_url: mode === "both" ? url : null }),
        }).then(r => r.json()).then(rows => { if (Array.isArray(rows) && rows[0]?.id) setCvId(rows[0].id); }).catch(() => {});
      }

      const goalText = mode === "questions"
        ? `${goal}\n\n---\nADDITIONAL CONTEXT:\n${FIVE_QUESTIONS.map(q => answers[q.id]?.trim() ? `${q.label}\n${answers[q.id].trim()}` : null).filter(Boolean).join("\n\n")}`
        : goal;

      const payload = {
        base64: base64 || undefined,
        filename: file?.name,
        url: (mode === "url" || mode === "both") ? url : undefined,
        goal: goalText,
        questionsMode: mode === "questions",
      };

      setLoadingStep(1);

      // ── FAST PASS — 3 seconds ──────────────────────────────────────────────
      const fastRes = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!fastRes.ok) throw new Error("Analysis failed — please try again.");
      const fastParsed = await fastRes.json() as Analysis;

      if (!email && fastParsed.email) setEmail(fastParsed.email);

      // ── SHOW RESULTS IMMEDIATELY — don't wait for deep ────────────────────
      setAnalysis(fastParsed);
      setLoadingStep(-1); // exit loading state NOW

      const resolvedEmail = email || fastParsed.email || null;

      // Check pool status (non-blocking)
      if (resolvedEmail) {
        fetch("/api/check-pool", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: resolvedEmail }) })
          .then(r => r.json()).then(d => setPoolStatus(d.pool_status || "none")).catch(() => {});
      }

      // Jobs search (non-blocking, fire and forget)
      fetch("/api/search-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archetype: fastParsed.archetype, stageBucket: fastParsed.stageBucket, opportunityContext: fastParsed.opportunityContext }),
      }).then(r => r.json()).then(data => {
        setJobs(data.jobs || []);
        setJobSearchLinks(data.search_links || []);
        setWantsToConnect(data.wantsToConnect || false);
      }).catch(() => {});

      // Auto-subscribe to The Seed if email provided
      if (email) {
        fetch("/api/seed-subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            source: "analyse",
            archetype: fastParsed.archetype || null,
          }),
        }).catch(() => {});
      }

      // ── DEEP ENRICHMENT — async, enriches UI when ready ───────────────────
      setIsDeepLoading(true);

      fetch("https://xsbsoevqqvnxmtxuytiu.supabase.co/functions/v1/extract-deep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, fastResult: fastParsed }),
      })
        .then(async r => {
          if (!r.ok) { setDeepFailed(true); return; }
          const deepParsed = await r.json();

          // Merge deep into fast — deep wins on every field it provides
          setAnalysis(prev => {
            if (!prev) return prev;
            const merged: Analysis = {
              ...prev,
              summary:          deepParsed.summary         ?? prev.summary,
              experience:       deepParsed.experience      ?? prev.experience,
              archetypeReason:  deepParsed.archetypeReason ?? prev.archetypeReason,
              goalFit: { ...prev.goalFit, verdict: deepParsed.goalFit?.verdict ?? prev.goalFit?.verdict },
              founderView:      deepParsed.founderView      ?? prev.founderView,
              recruiterView:    deepParsed.recruiterView    ?? prev.recruiterView,
              crossSourceDelta: deepParsed.crossSourceDelta ?? prev.crossSourceDelta,
              roadmap:          deepParsed.roadmap          ?? prev.roadmap,
              nextMoves:        deepParsed.nextMoves        ?? prev.nextMoves,
              _tier:            deepParsed._tier,
              _tierLabel:       deepParsed._tierLabel,
              _elapsed:         deepParsed._elapsed,
            };
            // Handle roadmapV2 shape
            const rawRoadmap = (deepParsed as Record<string, unknown>).roadmap;
            if (rawRoadmap && !Array.isArray(rawRoadmap) && typeof rawRoadmap === "object" && (rawRoadmap as Record<string, unknown>).phases) {
              merged.roadmapV2 = rawRoadmap as Analysis["roadmapV2"];
              merged.roadmap = undefined;
            }
            return merged;
          });

          setDeepEnriched(true);
          setTimeout(() => setDeepEnriched(false), 4000);

          // Save enriched analysis to DB
          fetch(`${SUPABASE_URL}/rest/v1/cv_analyses`, {
            method: "POST",
            headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, Prefer: "return=representation" },
            body: JSON.stringify({
              candidate_name:    deepParsed.name          || fastParsed.name          || null,
              candidate_email:   resolvedEmail,
              candidate_title:   deepParsed.currentTitle  || fastParsed.currentTitle  || null,
              candidate_goal:    goal,
              goal_fit_level:    deepParsed.goalFit?.level || fastParsed.goalFit?.level,
              stage_bucket:      fastParsed.stageBucket,
              archetype:         fastParsed.archetype,
              archetype_tags:    fastParsed.skills,
              roadmap_json:      deepParsed.nextMoves      || fastParsed.nextMoves     || [],
              analysis_json:     { ...fastParsed, ...deepParsed },
              profile_url:       (mode === "url" || mode === "both") ? url : null,
              opportunity_context: fastParsed.opportunityContext || {},
              years_exp:         fastParsed.yearsExp        || null,
              current_title:     fastParsed.currentTitle    || null,
              current_company:   fastParsed.currentCompany  || null,
            }),
          }).then(r => r.json()).then(rows => { if (Array.isArray(rows) && rows[0]?.id) setCvAnalysisId(rows[0].id); }).catch(() => {});

          // Send analysis email
          if (resolvedEmail) {
            fetch("https://xsbsoevqqvnxmtxuytiu.supabase.co/functions/v1/send-analysis-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: resolvedEmail, name: deepParsed.name || fastParsed.name,
                archetype: fastParsed.archetype, stage_bucket: fastParsed.stageBucket,
                summary: deepParsed.summary || fastParsed.summary,
                skills: fastParsed.skills, goal,
                founderView: deepParsed.founderView, recruiterView: deepParsed.recruiterView,
                goalFit: deepParsed.goalFit || fastParsed.goalFit,
              }),
            }).catch(() => {});
          }
        })
        .catch(() => { setDeepFailed(true); })
        .finally(() => { setIsDeepLoading(false); });

    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoadingStep(-1);
      setIsDeepLoading(false);
    }
  };

  const joinPool = async () => {
    if (!email) { setError("Add your email first to join the pool."); return; }
    setJoiningPool(true);
    try {
      const res = await fetch("/api/join-pool", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email, analysis, archetype: analysis?.archetype, stageBucket: analysis?.stageBucket,
          goal, skills: analysis?.skills, summary: analysis?.summary, experience: analysis?.experience,
          profileUrl: url, name: analysis?.name || null, currentTitle: analysis?.currentTitle || null,
          currentCompany: analysis?.currentCompany || null, yearsExp: analysis?.yearsExp || null,
          domains: analysis?.domains || [], tools: analysis?.tools || [], companies: analysis?.companies || [],
          cvId: cvId || null, cvAnalysisId: cvAnalysisId || null,
        }),
      });
      const data = await res.json();
      if (data.already_member) { setPoolStatus(data.pool_status); setJoiningPool(false); return; }
      const builderPayload = data.builderPayload || {};
      if (data.dev_mode) {
        const confirmRes = await fetch("/api/confirm-payment", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dev_mode: true, builderPayload }),
        });
        const confirmData = await confirmRes.json();
        setPoolStatus("paid"); setPoolSuccess(true); setJoiningPool(false);
        if (confirmData.profile_token) {
          setProfileToken(confirmData.profile_token);
          setTimeout(() => { window.location.href = `/onboarding?token=${confirmData.profile_token}&email=${encodeURIComponent(email)}`; }, 2000);
        }
        return;
      }
      type RzpH = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
      const RzpClass = (window as unknown as { Razorpay?: new (o: object) => { open: () => void } }).Razorpay;
      if (!RzpClass) { setError("Payment failed to load — please refresh and try again."); setJoiningPool(false); return; }
      const rzp = new RzpClass({
        key: data.key_id, amount: data.amount, currency: data.currency, order_id: data.order_id,
        name: "JoinStartup", description: "Builder Pool Access — ₹499 one-time",
        prefill: { email }, theme: { color: "#ff4d00" },
        handler: async (r: RzpH) => {
          const confirmRes = await fetch("/api/confirm-payment", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...r, builderPayload }),
          });
          const confirmData = await confirmRes.json();
          setPoolStatus("paid"); setPoolSuccess(true); setJoiningPool(false);
          if (confirmData.profile_token) {
            setProfileToken(confirmData.profile_token);
            setTimeout(() => { window.location.href = `/onboarding?token=${confirmData.profile_token}&email=${encodeURIComponent(email)}`; }, 2000);
          }
        },
      });
      rzp.open();
    } catch { setError("Something went wrong — please try again."); setJoiningPool(false); }
  };

  const shareProfile = () => {
    if (!profileToken) return;
    const u = `${window.location.origin}/profile?token=${profileToken}`;
    navigator.clipboard.writeText(u).then(() => { setShareCopied(true); setTimeout(() => setShareCopied(false), 2500); });
  };

  const isInPool = poolStatus === "paid" || poolStatus === "nominated";
  const archetype = analysis ? ARCHETYPES[analysis.archetype] : null;
  const fitLevel = analysis?.goalFit?.level;
  const fitDisplay: Record<string, { label: string; color: string; sub: string }> = {
    "Strong":   { label: "Built for this",  color: "#10b981", sub: "Your background maps directly to your goal" },
    "Moderate": { label: "Getting there",   color: "#f59e0b", sub: "Strong foundation — a few moves to close the gap" },
    "Weak":     { label: "Different stage", color: "#6366f1", sub: "Your goal is ahead of you — here's the path" },
  };
  const fit = fitDisplay[fitLevel || ""] || fitDisplay["Moderate"];
  const fitColor = fit.color;
  const isLoading = loadingStep >= 0;

  const MODE_OPTIONS: { id: InputMode; label: string; emoji: string; desc: string }[] = [
    { id: "cv",        label: "Upload CV",           emoji: "📄", desc: "PDF resume" },
    { id: "url",       label: "Portfolio / LinkedIn", emoji: "🌐", desc: "Website or profile URL" },
    { id: "both",      label: "CV + URL",             emoji: "💪", desc: "Strongest signal" },
    { id: "questions", label: "No CV yet",            emoji: "💬", desc: "Answer 5 questions" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f2ee", color: "#1a1a1a", fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      <AppNav />

      <div style={{ maxWidth: 580, margin: "0 auto", padding: "52px 20px 100px" }}>

        {/* INPUT FORM */}
        {!analysis && !isLoading && (
          <div className="reveal">
            {fromParsePath && parsePathArchetype && (() => {
              const arch = ARCHETYPES[parsePathArchetype];
              return arch ? (
                <div style={{ marginBottom: 28, background: "#fff8f5", border: "1.5px solid #ff4d0022", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ fontSize: 28, flexShrink: 0 }}>{arch.emoji}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#ff4d00", marginBottom: 2, fontFamily: "'DM Mono',monospace", letterSpacing: 0.5, textTransform: "uppercase" }}>ParsePath result carried over</div>
                    <div style={{ fontSize: 14, color: "#1a1a1a", fontWeight: 600, marginBottom: 4 }}>You mapped as a {arch.name}</div>
                    <div style={{ fontSize: 13, color: "#6b6460", lineHeight: 1.6 }}>Add your email below and join the pool — or upload your CV to get the full deep analysis first.</div>
                  </div>
                </div>
              ) : null;
            })()}

            <div style={{ marginBottom: 44 }}>
              <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 44, letterSpacing: -2, lineHeight: 1.0, marginBottom: 14, color: "#1a1a1a" }}>
                Your CV.<br /><span style={{ color: "#ff4d00", fontStyle: "italic" }}>Three reads.</span>
              </h1>
              <p style={{ fontSize: 15, color: "#6b6460", lineHeight: 1.8, maxWidth: 420, marginBottom: 8 }}>How AI sees you. How a founder reads you. How a recruiter screens you.</p>
              <p style={{ fontSize: 13, color: "#9a9088", lineHeight: 1.7, maxWidth: 420 }}>Same skills — completely different reads. 8/10 builders are surprised.</p>
            </div>

            <div className="step-block">
              <div className="step-head"><span className="step-num">1</span>What do you want to share?</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {MODE_OPTIONS.map(m => (
                  <button key={m.id} onClick={() => setMode(m.id)} className={`mode-btn${mode === m.id ? " on" : ""}`}>
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{m.emoji}</div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: mode === m.id ? "#1a1a1a" : "#555", marginBottom: 3 }}>{m.label}</div>
                    <div style={{ fontSize: 12, color: "#9a9088" }}>{m.desc}</div>
                  </button>
                ))}
              </div>
              {(mode === "cv" || mode === "both") && (
                <div onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onClick={() => inputRef.current?.click()} className="drop-zone" style={{ borderColor: dragOver ? "#ff4d00" : file ? "#10b981" : undefined, background: dragOver ? "#fff8f5" : file ? "#f0fdf8" : undefined }}>
                  <input ref={inputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  {file ? (<><div style={{ fontSize: 32, marginBottom: 8 }}>✅</div><div style={{ fontWeight: 700, fontSize: 15, color: "#10b981", marginBottom: 4 }}>{file.name}</div><div style={{ fontSize: 13, color: "#888" }}>{(file.size / 1024).toFixed(0)} KB · PDF · click to change</div></>) : (<><div style={{ fontSize: 32, marginBottom: 10 }}>📄</div><div style={{ fontWeight: 700, fontSize: 15, color: "#333", marginBottom: 4 }}>Drop your CV here</div><div style={{ fontSize: 13, color: "#9a9088" }}>PDF only · or click to browse</div></>)}
                </div>
              )}
              {mode === "questions" && (
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ fontSize: 12, color: "#9a9088", fontFamily: "'DM Mono',monospace", letterSpacing: 0.5 }}>ANSWER AT LEAST 3 — we'll build your profile from this</div>
                  {FIVE_QUESTIONS.map((q) => (
                    <div key={q.id}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 6, lineHeight: 1.5 }}>{q.label}</div>
                      <textarea className="inp inp-ta" rows={2} placeholder={q.placeholder} value={answers[q.id] || ""} onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} style={{ resize: "none", lineHeight: 1.6 }} />
                    </div>
                  ))}
                </div>
              )}
              {(mode === "url" || mode === "both") && (
                <>
                  <input className="inp" style={{ marginTop: 12 }} placeholder="github.com/you  ·  yourportfolio.com  ·  linkedin.com/in/you" value={url} onChange={e => setUrl(e.target.value)} />
                  {/linkedin\.com\/in\//i.test(url) && (<div style={{ fontSize: 11, color: "#d97706", marginTop: 6, fontFamily: "'DM Mono',monospace", display: "flex", alignItems: "center", gap: 6 }}><span>⚠</span> LinkedIn blocks automated reading — upload your CV too for the best analysis</div>)}
                </>
              )}
            </div>

            <div className="step-block">
              <div className="step-head"><span className="step-num">2</span>What are you looking for?</div>
              <span className="section-tag">PICK A STARTING POINT — or write your own below</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                {GOAL_TEMPLATES.map((t, i) => {
                  const isActive = activeTemplate === i;
                  return (
                    <button key={i} onClick={() => { if (activeTemplate === i) { setGoal(goal.replace("\n\n" + t.intent, "").replace(t.intent, "").trim()); setActiveTemplate(null); } else { const prev = GOAL_TEMPLATES[activeTemplate ?? -1]; let base = prev ? goal.replace("\n\n" + prev.intent, "").replace(prev.intent, "").trim() : goal.trim(); setGoal(base ? base + "\n\n" + t.intent : t.intent); setActiveTemplate(i); } }} className={`tpl-chip${isActive ? " active" : ""}`}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><span style={{ fontSize: 18 }}>{t.icon}</span><span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", fontWeight: 600, color: isActive ? "#ff4d00" : "#9a9088", letterSpacing: .3 }}>{t.label}</span></div>
                      <div style={{ fontSize: 13, color: isActive ? "#333" : "#888", lineHeight: 1.5 }}>{t.preview}</div>
                    </button>
                  );
                })}
              </div>
              <div style={{ position: "relative" }}>
                <textarea className="inp inp-ta goal-ta" rows={5} placeholder={"Describe yourself and what you're looking for...\n\ne.g. Senior engineer, 6 yrs, Bangalore — want founding role at AI startup with equity, open to 0→1."} value={goal} onChange={e => setGoal(e.target.value)} style={{ resize: "none", paddingBottom: 40, lineHeight: 1.7 }} />
                {goal && (<button onClick={() => setGoal("")} style={{ position: "absolute", bottom: 10, right: 10, background: "#f0ece6", border: "none", color: "#888", fontSize: 12, fontFamily: "'DM Mono',monospace", cursor: "pointer", padding: "4px 10px", borderRadius: 6 }}>clear ×</button>)}
              </div>
            </div>

            <div className="step-block">
              <div className="step-head"><span className="step-num">3</span><span>Save your results <span style={{ fontWeight: 400, color: "#9a9088", fontSize: 14 }}>— optional</span></span></div>
              <input className="inp" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              {fromParsePath && email && (<div style={{ fontSize: 12, color: "#10b981", marginTop: 6, fontFamily: "'DM Mono',monospace" }}>✓ Pre-filled from ParsePath</div>)}
            </div>

            {error && (<div style={{ fontSize: 14, color: "#dc2626", marginBottom: 14, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10 }}>{error}</div>)}

            <button onClick={analyse} disabled={!goal.trim()} style={{ width: "100%", padding: "18px", borderRadius: 12, border: "none", background: goal.trim() ? "#ff4d00" : "#e8e2da", color: goal.trim() ? "#fff" : "#aaa", fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 16, cursor: goal.trim() ? "pointer" : "not-allowed", transition: "all .2s", letterSpacing: .2, boxShadow: goal.trim() ? "0 4px 20px #ff4d0030" : "none" }}>
              {goal.trim() ? "Analyse my startup fit →" : "Add your goal to continue"}
            </button>
          </div>
        )}

        {/* LOADING — only shows during fast pass (~3s) */}
        {isLoading && (
          <div style={{ padding: "80px 0", textAlign: "center" }}>
            <div className="spin" style={{ fontSize: 40, marginBottom: 28 }}>⚙️</div>
            {goal && (<div style={{ maxWidth: 360, margin: "0 auto 36px", padding: "14px 18px", background: "#fff", border: "1.5px solid #e8e2da", borderRadius: 12 }}><div style={{ fontSize: 10, color: "#9a9088", fontFamily: "'DM Mono',monospace", letterSpacing: 1, marginBottom: 6 }}>ANALYSING YOUR GOAL</div><p style={{ fontSize: 14, color: "#555", lineHeight: 1.6, fontStyle: "italic" }}>"{goal.length > 120 ? goal.slice(0, 120) + "..." : goal}"</p></div>)}
            <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 360, margin: "0 auto", textAlign: "left" }}>
              {loadingSteps.map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: i < loadingStep ? "#10b981" : i === loadingStep ? "#ff4d00" : "#e8e2da", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 800, transition: "all .4s" }}>{i < loadingStep ? "✓" : ""}</div>
                  <span style={{ fontSize: 15, color: i < loadingStep ? "#10b981" : i === loadingStep ? "#1a1a1a" : "#c0b8b0", fontWeight: i === loadingStep ? 700 : 400, transition: "color .4s" }}>{step}{i === loadingStep && <span className="pulse"> ...</span>}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULTS */}
        {analysis && !isLoading && archetype && (
          <div className="reveal">

            {/* ── 1. Deep enrichment banner — quiet, top ── */}
            {isDeepLoading && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "#fff8f5", border: "1.5px solid #ff4d0015", borderRadius: 10, marginBottom: 16 }}>
                <div style={{ width: 14, height: 14, border: "2px solid #ff4d0030", borderTopColor: "#ff4d00", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#9a9088", fontFamily: "'DM Mono',monospace", letterSpacing: 0.3 }}>
                  {mode === "both" ? "CROSS-REFERENCING CV + ONLINE PRESENCE..." : "ENRICHING FOUNDER + RECRUITER VIEWS..."}
                </span>
              </div>
            )}

            {deepEnriched && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "#f0fdf8", border: "1.5px solid #10b98125", borderRadius: 10, marginBottom: 16, animation: "fadeSlideUp 0.4s ease" }}>
                <span style={{ fontSize: 14 }}>✓</span>
                <span style={{ fontSize: 12, color: "#10b981", fontFamily: "'DM Mono',monospace", letterSpacing: 0.3 }}>
                  FULL ANALYSIS READY — FOUNDER VIEW + ROADMAP ENRICHED
                  {analysis._tierLabel && <span style={{ opacity: 0.6, marginLeft: 8 }}>via {analysis._tierLabel} in {analysis._elapsed}s</span>}
                </span>
              </div>
            )}

            {deepFailed && !isDeepLoading && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 12, color: "#d97706", fontFamily: "'DM Mono',monospace" }}>⚠ DEEP ENRICHMENT UNAVAILABLE — SHOWING FAST RESULT</span>
                <button onClick={analyse} style={{ fontSize: 12, color: "#d97706", background: "none", border: "1px solid #fde68a", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}>Retry →</button>
              </div>
            )}

            {/* ── Archetype card ── */}
            <div className="archetype-card" style={{ borderColor: `${archetype.color}35` }}>
              <div className="archetype-bar" style={{ background: archetype.color }} />
              {(analysis.name || analysis.currentTitle) && (
                <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #e8e2da", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${archetype.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{analysis.name ? analysis.name.charAt(0).toUpperCase() : "?"}</div>
                  <div>
                    {analysis.name && <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a1a" }}>{analysis.name}</div>}
                    {analysis.currentTitle && <div style={{ fontSize: 11, color: "#9a9088", fontFamily: "'DM Mono',monospace" }}>{analysis.currentTitle}</div>}
                  </div>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 42 }}>{archetype.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900, fontSize: 21, letterSpacing: -0.5, color: "#1a1a1a" }}>{archetype.name}</div>
                  <div style={{ fontSize: 12, color: archetype.color, fontStyle: "italic", marginTop: 3 }}>{archetype.tagline}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                  <span className="badge" style={{ background: `${STAGE_COLORS[analysis.stageBucket]}12`, color: STAGE_COLORS[analysis.stageBucket], borderColor: `${STAGE_COLORS[analysis.stageBucket]}35` }}>Build {analysis.stageBucket}</span>
                  <span className="badge" style={{ background: `${fitColor}12`, color: fitColor, borderColor: `${fitColor}35` }}>{fit.label}</span>
                </div>
              </div>
            </div>

            {/* ── 3. Three Reads tabs — the main event ── */}
            <div style={{ margin: "16px 0 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1, height: 1, background: "#e8e2da" }} />
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#c0b8b0", letterSpacing: 2 }}>YOUR ANALYSIS</div>
                <div style={{ flex: 1, height: 1, background: "#e8e2da" }} />
              </div>
              <div className="lens-tabs" style={{ marginBottom: 0 }}>
                {([
                  { id: "you",       icon: "👤", label: "Your roadmap",   sub: "Gaps · 90-day plan" },
                  { id: "founder",   icon: "🚀", label: "Founder view",   sub: "How a founder reads you" },
                  { id: "recruiter", icon: "📋", label: "Recruiter view", sub: "Seniority · salary band" },
                ] as const).map(l => (
                  <button key={l.id} onClick={() => setLens(l.id)} className={`lens-tab${lens === l.id ? " on" : ""}`}>
                    <div style={{ fontSize: 16, marginBottom: 3 }}>{l.icon}</div>
                    <div style={{ fontWeight: lens === l.id ? 800 : 500, fontSize: 11, color: lens === l.id ? "#1a1a1a" : "#9a9088" }}>{l.label}</div>
                    <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: lens === l.id ? "#9a9088" : "#c0b8b0", marginTop: 2 }}>{l.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── YOUR VIEW ── */}
            {lens === "you" && (<>
              <div className="card gap-16">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span className="badge" style={{ background: `${fitColor}12`, color: fitColor, borderColor: `${fitColor}35`, fontSize: 13, padding: "4px 12px" }}>{fit.label}</span>
                  <span style={{ fontSize: 12, color: "#9a9088" }}>{fit.sub}</span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.75, color: "#1a1a1a", marginBottom: 14 }}>{analysis.goalFit?.verdict}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[...(analysis.goalFit?.matches?.slice(0, 2) || []).map(m => ({ icon: "✓", text: m, color: "#10b981" })), ...(analysis.goalFit?.gaps?.slice(0, 1) || []).map(g => ({ icon: "→", text: g, color: "#d97706" }))].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span style={{ color: item.color, fontWeight: 700, fontSize: 13, marginTop: 1, flexShrink: 0 }}>{item.icon}</span>
                      <span style={{ fontSize: 13, color: "#4a4540", lineHeight: 1.6 }}>{item.text}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setExpandedSection(expandedSection === "you-full" ? null : "you-full")} style={{ marginTop: 14, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#9a9088", fontFamily: "'DM Mono',monospace", letterSpacing: 0.5, padding: 0, textAlign: "left" }}>
                  {expandedSection === "you-full" ? "▲ hide full analysis" : "▼ see full analysis"}
                </button>
              </div>

              {expandedSection === "you-full" && (<>
                <div className="card gap-16" style={{ marginTop: 12 }}>
                  <span className="section-tag">YOUR SKILLS</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{analysis.skills?.map((s, i) => (<span key={i} className="badge badge-gray">{s}</span>))}</div>
                </div>
                <div className="card gap-16" style={{ marginTop: 12 }}>
                  <div className="two-col">
                    <div>
                      <div className="section-tag text-green" style={{ color: "#10b981" }}>WHAT'S WORKING</div>
                      <div className="check-list">{analysis.goalFit?.matches?.map((m, i) => (<div key={i} className="check-item"><span className="check-icon text-green">✓</span><span className="check-text">{m}</span></div>))}</div>
                    </div>
                    <div>
                      <div className="section-tag" style={{ color: "#d97706" }}>{fitLevel === "Weak" ? "YOUR NEXT 3 MOVES" : "WHAT TO CLOSE"}</div>
                      <div className="check-list">{analysis.goalFit?.gaps?.map((g, i) => (<div key={i} className="check-item"><span className="check-icon" style={{ color: "#d97706" }}>→</span><span className="check-text">{g}</span></div>))}</div>
                    </div>
                  </div>
                </div>
                <div className="card-inset gap-32" style={{ borderLeft: `3px solid ${archetype.color}`, marginBottom: 32, marginTop: 12 }}>
                  <span className="section-tag">WHY THIS ARCHETYPE IS YOU</span>
                  <p style={{ fontSize: 13, color: "#4a4540", lineHeight: 1.75, fontStyle: "italic" }}>"{analysis.archetypeReason}"</p>
                </div>
                <hr className="divider" />
                <div className="gap-32">
                  <span className="section-tag-accent">YOUR 90-DAY ROADMAP</span>
                  {analysis.roadmapV2 ? (<>
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ background: `${archetype.color}10`, borderLeft: `3px solid ${archetype.color}`, borderRadius: "0 10px 10px 0", padding: "14px 16px", marginBottom: 10 }}>
                        <div style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: archetype.color, letterSpacing: 1, marginBottom: 6 }}>THE ONE GAP TO CLOSE</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.5 }}>{analysis.roadmapV2.primaryGap}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", background: "#f0fdf8", borderRadius: 10, border: "1px solid #a7f3d020" }}>
                        <span style={{ color: "#10b981", fontSize: 14, flexShrink: 0 }}>✓</span>
                        <div>
                          <div style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#10b981", letterSpacing: 1, marginBottom: 3 }}>90 DAYS FROM NOW</div>
                          <div style={{ fontSize: 13, color: "#4a4540", lineHeight: 1.6 }}>{analysis.roadmapV2.doneLooksLike}</div>
                        </div>
                      </div>
                      {analysis.roadmapV2.totalCostEstimate && (<div style={{ fontSize: 11, color: "#9a9088", fontFamily: "'DM Mono',monospace", marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}><span>💰</span> Total investment: <span style={{ color: "#4a4540", fontWeight: 600 }}>{analysis.roadmapV2.totalCostEstimate}</span></div>)}
                    </div>
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "absolute", left: 15, top: 24, bottom: 24, width: 1, background: "#e8e2da", zIndex: 0 }} />
                      {analysis.roadmapV2.phases.map((phase, pi) => (
                        <div key={pi} style={{ position: "relative", marginBottom: 20, paddingLeft: 44 }}>
                          <div style={{ position: "absolute", left: 8, top: 14, width: 16, height: 16, borderRadius: "50%", background: archetype.color, border: "3px solid #f5f2ee", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: 7, color: "#fff", fontWeight: 900 }}>{pi + 1}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, fontWeight: 700, color: archetype.color, letterSpacing: 0.5 }}>{phase.label.toUpperCase()}</span>
                            <span style={{ fontSize: 12, color: "#9a9088" }}>· {phase.focus}</span>
                          </div>
                          {phase.actions.map((action, ai) => {
                            const typeColor = action.type === "do" ? "#ff4d00" : action.type === "learn" ? "#6366f1" : "#10b981";
                            const typeLabel = action.type === "do" ? "DO" : action.type === "learn" ? "LEARN" : "EARN";
                            return (
                              <div key={ai} style={{ background: "#fff", border: "1.5px solid #f0ece6", borderRadius: 12, padding: "14px 16px", marginBottom: 8 }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, fontWeight: 700, color: typeColor, background: `${typeColor}12`, padding: "2px 7px", borderRadius: 20, flexShrink: 0, marginTop: 2 }}>{typeLabel}</span>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 3, lineHeight: 1.4 }}>{action.action}</div>
                                    <div style={{ fontSize: 12, color: "#9a9088", lineHeight: 1.5 }}>{action.why}</div>
                                  </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", paddingTop: 8, borderTop: "1px solid #f0ece6" }}>
                                  <span style={{ fontSize: 11, color: "#9a9088", display: "flex", alignItems: "center", gap: 4 }}><span>⏱</span> {action.timeCost}</span>
                                  <span style={{ fontSize: 11, color: action.moneyCost === "Free" || action.moneyCost === "₹0" ? "#10b981" : "#d97706", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}><span>₹</span> {action.moneyCost}</span>
                                  {action.resource?.url && (<a href={action.resource.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: archetype.color, fontFamily: "'DM Mono',monospace", textDecoration: "none", marginLeft: "auto" }}>{action.resource.name || "Open"} →</a>)}
                                </div>
                                {action.doneLooksLike && (<div style={{ marginTop: 8, fontSize: 11, color: "#10b981", fontFamily: "'DM Mono',monospace", display: "flex", gap: 5 }}><span>✓</span> {action.doneLooksLike}</div>)}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </>) : (<>
                    <p style={{ fontSize: 13, color: "#9a9088", marginBottom: 20, lineHeight: 1.65 }}>For each gap — how to learn it, earn while closing it, and do something concrete this week.</p>
                    {(analysis.nextMoves || []).map((item, i) => (
                      <div key={i} className="card" style={{ marginBottom: 12, borderColor: `${archetype.color}25`, borderLeftWidth: 3, borderLeftColor: archetype.color }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%", background: archetype.color, color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                          <div><div style={{ fontWeight: 800, fontSize: 14, color: "#1a1a1a", marginBottom: 3 }}>{item.gap}</div><div className="action-note">{item.why}</div></div>
                        </div>
                        <div className="action-row"><div className="action-tag-col"><span className="action-tag action-tag-learn">LEARN</span></div><div className="action-body"><div className="action-title">{item.learn?.name}</div><div className="action-note">{item.learn?.note}</div>{item.learn?.url && <a href={item.learn.url} target="_blank" rel="noopener noreferrer" className="action-link">Open →</a>}</div></div>
                        <div className="action-row">
                          <div className="action-tag-col"><span className={`action-tag ${wantsToConnect ? "action-tag-meet" : "action-tag-earn"}`}>{wantsToConnect ? "MEET" : "EARN"}</span></div>
                          <div className="action-body">
                            {isInPool ? (<><div className="action-title">{item.earn?.title}</div><div className="action-note">{item.earn?.note}</div></>) : (
                              <div className="paywall-box">
                                <div className="paywall-blur">{item.earn?.title} — {item.earn?.note}</div>
                                <div className="paywall-hint">{wantsToConnect ? "Join the pool to see who's actively looking for a builder like you" : "Join the builder pool to see live roles matched to your archetype + stage"}</div>
                                <button onClick={joinPool} disabled={joiningPool} className="btn btn-primary btn-sm">{joiningPool ? "Opening payment..." : "🔓 Join the pool — ₹499 one-time"}</button>
                                {!email && <div style={{ fontSize: 10, marginTop: 6, color: "#d97706", fontFamily: "'DM Mono',monospace" }}>↑ Add your email above first</div>}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="action-row"><div className="action-tag-col"><span className="action-tag action-tag-do">DO</span></div><div className="action-body"><div className="action-title">{item.do?.action}</div><div className="action-note">{item.do?.note}</div></div></div>
                      </div>
                    ))}
                  </>)}
                  {jobs.length > 0 && (
                    <div style={{ marginTop: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <span className="section-tag">MATCHED ROLES — {jobs.filter((j: Record<string, unknown>) => j.source === "joinstartup").length} CURATED + {jobs.filter((j: Record<string, unknown>) => j.source !== "joinstartup").length} LIVE</span>
                        <a href={`/jobs?archetype=${analysis.archetype}`} style={{ fontSize: 11, color: archetype.color, textDecoration: "none", fontFamily: "'DM Mono',monospace", letterSpacing: 0.5 }}>See all →</a>
                      </div>
                      {jobs.map((job: Record<string, unknown>, i: number) => {
                        const isCurated = job.source === "joinstartup";
                        const jobUrl = isCurated ? `/jobs/${job.id}` : (job.url as string);
                        const isInternal = isCurated;
                        return (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "1px solid #f0ece6" }}>
                            {/* Logo or fallback */}
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: isCurated ? `${archetype.color}15` : "#f5f2ee", border: "1px solid #e8e2da", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                              {job.logo ? (
                                <img src={job.logo as string} alt="" style={{ width: 32, height: 32, objectFit: "contain" }} />
                              ) : (
                                <span style={{ fontSize: 14, fontWeight: 800, color: isCurated ? archetype.color : "#9a9088" }}>
                                  {(job.company as string || "?").charAt(0)}
                                </span>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
                                <span style={{ fontWeight: 700, fontSize: 13, color: "#1a1a1a" }}>{job.title as string}</span>
                                {isCurated && (
                                  <span style={{ padding: "1px 6px", background: `${archetype.color}15`, border: `1px solid ${archetype.color}30`, borderRadius: 10, fontFamily: "'DM Mono',monospace", fontSize: 8, color: archetype.color, letterSpacing: 0.5 }}>CURATED</span>
                                )}
                              </div>
                              <div style={{ fontSize: 12, color: archetype.color, marginBottom: 3 }}>{job.company as string} · {job.location as string || "India"}{job.remote ? " · Remote" : ""}</div>
                              <div style={{ fontSize: 11, color: "#9a9088", lineHeight: 1.5 }}>{job.match_reason as string}</div>
                            </div>
                            <a href={jobUrl} {...(isInternal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                              style={{ padding: "7px 14px", background: isCurated ? archetype.color : "transparent", border: `1.5px solid ${isCurated ? archetype.color : "#e0dbd4"}`, borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 12, color: isCurated ? "#fff" : "#6b6460", textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap" }}>
                              {isCurated ? "View →" : "Apply →"}
                            </a>
                          </div>
                        );
                      })}
                      <div style={{ paddingTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {(jobSearchLinks || []).map((link: Record<string, unknown>, i: number) => (
                          <a key={i} href={link.url as string} {...(link.platform === "JoinStartup" ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                            style={{ fontSize: 11, color: "#9a9088", textDecoration: "none", fontFamily: "'DM Mono',monospace", padding: "4px 10px", border: "1px solid #e0dbd4", borderRadius: 20, transition: "all .2s" }}>
                            {link.label as string}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>)}
            </>)}

            {/* ── FOUNDER VIEW ── */}
            {lens === "founder" && (<>
              <div className="lens-context" style={{ background: "#eef2ff", borderColor: "#c7d2fe" }}>
                <span className="section-tag" style={{ color: "#6366f1", marginBottom: 4 }}>READING AS A FOUNDER LOOKING TO HIRE</span>
                <p style={{ fontSize: 12, color: "#6366f1", lineHeight: 1.6, opacity: 0.8 }}>This is how an early-stage founder evaluating this profile would read it.</p>

              </div>

              {isDeepLoading && !analysis.founderView && (
                <div style={{ padding: "32px 0", textAlign: "center" }}>
                  <div style={{ width: 20, height: 20, border: "2.5px solid #6366f130", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#9a9088", letterSpacing: 1 }}>FOUNDER VIEW ENRICHING...</div>
                </div>
              )}

              {analysis.founderView ? (<>
                <div className="card gap-12" style={{ borderColor: "#c7d2fe" }}>
                  <span className="section-tag" style={{ color: "#6366f1" }}>FIRST IMPRESSION</span>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.5, marginBottom: 14 }}>"{analysis.founderView.headline}"</p>
                  <span className="section-tag">BEST FIT FOR</span>
                  <p style={{ fontSize: 13, color: "#4a4540", lineHeight: 1.7 }}>{analysis.founderView.bestFitFor}</p>
                </div>

                {analysis.crossSourceDelta && (
                  <div className="card gap-12" style={{ borderColor: "#fde68a", background: "#fffbeb", marginBottom: 12 }}>
                    <span className="section-tag" style={{ color: "#d97706" }}>CV VS ONLINE PRESENCE</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, fontWeight: 700, color: "#d97706", background: "#fde68a60", padding: "2px 8px", borderRadius: 20, flexShrink: 0, marginTop: 3 }}>CV SAYS</span>
                        <span style={{ fontSize: 13, color: "#4a4540", lineHeight: 1.65 }}>{analysis.crossSourceDelta.cvSignal}</span>
                      </div>
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, fontWeight: 700, color: "#6366f1", background: "#6366f118", padding: "2px 8px", borderRadius: 20, flexShrink: 0, marginTop: 3 }}>ONLINE</span>
                        <span style={{ fontSize: 13, color: "#4a4540", lineHeight: 1.65 }}>{analysis.crossSourceDelta.onlineSignal}</span>
                      </div>
                      <div style={{ padding: "10px 14px", background: "#fff", borderRadius: 8, border: "1.5px solid #fde68a", fontSize: 13, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.6 }}>
                        {analysis.crossSourceDelta.delta}
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, fontWeight: 700, color: "#d97706", flexShrink: 0, marginTop: 2 }}>VERIFY IN PERSON</span>
                        <span style={{ fontSize: 12, color: "#6b6460", lineHeight: 1.6 }}>{analysis.crossSourceDelta.founderTip}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="two-col gap-12" style={{ marginBottom: 12 }}>
                  <div className="card"><span className="section-tag text-green">WHY YOU'D HIRE THEM</span><div className="check-list">{analysis.founderView.whyHire?.map((w, i) => (<div key={i} className="check-item"><span className="check-icon text-green">✓</span><span className="check-text">{w}</span></div>))}</div></div>
                  <div className="card"><span className="section-tag" style={{ color: "#d97706" }}>WATCH OUT FOR</span><div className="check-list">{analysis.founderView.watchOut?.map((w, i) => (<div key={i} className="check-item"><span className="check-icon" style={{ color: "#d97706" }}>⚠</span><span className="check-text">{w}</span></div>))}</div></div>
                </div>

                <div className="card">
                  <span className="section-tag" style={{ color: "#6366f1" }}>QUESTIONS A FOUNDER WOULD ASK YOU</span>
                  <p style={{ fontSize: 12, color: "#9a9088", marginBottom: 12, lineHeight: 1.5 }}>These are the things a sharp founder would probe in the first conversation:</p>
                  {analysis.founderView.askThem?.map((q, i) => (<div key={i} style={{ padding: "10px 0", borderTop: "1.5px solid #f0ece6", fontSize: 13, color: "#4a4540", lineHeight: 1.6 }}><span style={{ color: "#6366f1", fontFamily: "'DM Mono',monospace", fontSize: 10, marginRight: 8, fontWeight: 700 }}>Q{i + 1}</span>{q}</div>))}
                </div>

              </>) : (!isDeepLoading && (
                <div className="card-inset" style={{ color: "#9a9088", fontSize: 13 }}>
                  {deepFailed ? "Founder view unavailable —" : "Founder view not yet available —"}
                  <button onClick={analyse} style={{ background: "none", border: "none", color: "#ff4d00", cursor: "pointer", fontSize: 13, fontFamily: "inherit", textDecoration: "underline", marginLeft: 4 }}>retry analysis</button>
                </div>
              ))}
            </>)}

            {/* ── RECRUITER VIEW ── */}
            {lens === "recruiter" && (<>
              <div className="lens-context" style={{ background: "#fdf2f8", borderColor: "#fbcfe8" }}>
                <span className="section-tag" style={{ color: "#ec4899", marginBottom: 4 }}>READING AS A RECRUITER SCREENING CVs</span>
                <p style={{ fontSize: 12, color: "#ec4899", lineHeight: 1.6, opacity: 0.8 }}>This is how a recruiter or hiring manager scanning dozens of CVs would process yours.</p>
              </div>

              {isDeepLoading && !analysis.recruiterView && (
                <div style={{ padding: "32px 0", textAlign: "center" }}>
                  <div style={{ width: 20, height: 20, border: "2.5px solid #ec489930", borderTopColor: "#ec4899", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#9a9088", letterSpacing: 1 }}>RECRUITER VIEW ENRICHING...</div>
                </div>
              )}

              {analysis.recruiterView ? (<>
                <div className="card gap-12">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div><span className="section-tag" style={{ color: "#ec4899" }}>SENIORITY LEVEL</span><div style={{ fontWeight: 900, fontSize: 20, color: "#1a1a1a" }}>{analysis.recruiterView.seniorityLabel}</div></div>
                    <div style={{ textAlign: "right" }}><span className="section-tag" style={{ color: "#ec4899" }}>SALARY BAND</span><div style={{ fontWeight: 700, fontSize: 15, color: "#10b981" }}>{analysis.recruiterView.salaryBand}</div></div>
                  </div>
                  <span className="section-tag">JD TITLES YOU'D BE SHORTLISTED FOR</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>{analysis.recruiterView.topJDMatches?.map((t, i) => (<span key={i} className="badge" style={{ background: "#fdf2f8", color: "#ec4899", borderColor: "#fbcfe8" }}>{t}</span>))}</div>
                  <span className="section-tag">ATS / KEYWORD MATCHES</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{analysis.recruiterView.keywordsToMatch?.map((k, i) => (<span key={i} className="badge badge-gray" style={{ fontFamily: "'DM Mono',monospace" }}>{k}</span>))}</div>
                </div>
                <div className="two-col" style={{ marginTop: 12 }}>
                  <div className="card"><span className="section-tag" style={{ color: "#ef4444" }}>RED FLAGS TO PROBE</span>{analysis.recruiterView.redFlags?.length ? analysis.recruiterView.redFlags.map((f, i) => (<div key={i} className="check-item" style={{ marginBottom: 8 }}><span className="check-icon" style={{ color: "#ef4444" }}>!</span><span className="check-text">{f}</span></div>)) : <span style={{ fontSize: 12, color: "#9a9088" }}>No major red flags</span>}</div>
                  <div className="card"><span className="section-tag" style={{ color: "#8b5cf6" }}>INTERVIEW ANGLES</span>{analysis.recruiterView.interviewAngles?.map((a, i) => (<div key={i} className="check-item" style={{ marginBottom: 8 }}><span className="check-icon" style={{ color: "#8b5cf6" }}>→</span><span className="check-text">{a}</span></div>))}</div>
                </div>
              </>) : (!isDeepLoading && (
                <div className="card-inset" style={{ color: "#9a9088", fontSize: 13 }}>
                  {deepFailed ? "Recruiter view unavailable —" : "Recruiter view not yet available —"}
                  <button onClick={analyse} style={{ background: "none", border: "none", color: "#ff4d00", cursor: "pointer", fontSize: 13, fontFamily: "inherit", textDecoration: "underline", marginLeft: 4 }}>retry analysis</button>
                </div>
              ))}
            </>)}

            <hr className="divider" style={{ margin: "32px 0" }} />

            {/* ── 4. Pool CTA / Profile — appears AFTER exploring the analysis ── */}
            <div style={{ marginTop: 24 }}>
              {/* Not in pool yet */}
              {!isInPool && !poolSuccess && (
                <div style={{ background: "#1a1a1a", borderRadius: 14, padding: "24px 28px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: archetype.color }} />
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#444", letterSpacing: 2, marginBottom: 8 }}>JOIN THE BUILDER POOL</div>
                      <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, fontWeight: 400, color: "#e8e4da", letterSpacing: -0.5, lineHeight: 1.2, marginBottom: 6 }}>
                        Let founders find you as a <span style={{ color: archetype.color, fontStyle: "italic" }}>{archetype.name}</span>.
                      </div>
                      <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>One-time ₹499 · Profile link you own · Founders search by archetype</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
                      {!email ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 240 }}>
                          <div style={{ fontSize: 10, color: "#555", fontFamily: "'DM Mono',monospace", letterSpacing: 1 }}>ENTER YOUR EMAIL TO JOIN</div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <input
                              type="email"
                              placeholder="your@email.com"
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              onKeyDown={e => e.key === "Enter" && email && joinPool()}
                              autoFocus
                              style={{ flex: 1, padding: "10px 14px", background: "#111", border: "1.5px solid #333", borderRadius: 8, color: "#e8e4da", fontFamily: "'DM Sans',sans-serif", fontSize: 13, outline: "none", minWidth: 0 }}
                            />
                            <button
                              onClick={joinPool}
                              disabled={!email || joiningPool}
                              style={{ padding: "10px 16px", background: email ? archetype.color : "#333", color: "#fff", border: "none", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 13, cursor: email ? "pointer" : "not-allowed", whiteSpace: "nowrap", transition: "all .2s" }}>
                              {joiningPool ? "..." : "Join →"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={joinPool} disabled={joiningPool}
                          style={{ padding: "13px 28px", background: joiningPool ? "#333" : archetype.color, color: "#fff", border: "none", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 14, cursor: joiningPool ? "not-allowed" : "pointer", transition: "all .2s", whiteSpace: "nowrap" }}>
                          {joiningPool ? "Opening payment..." : "Join pool — ₹499 →"}
                        </button>
                      )}
                      <div style={{ fontSize: 10, color: "#333", fontFamily: "'DM Mono',monospace", textAlign: "right" }}>FREE ANALYSIS · PAY ONLY TO JOIN</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #2a2a2a", display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {[{ i: "🔍", t: "Founders search by archetype" }, { i: "📄", t: "Profile link you own" }, { i: "💼", t: "Matched to live roles" }, { i: "🚀", t: "3-lens reads included" }].map((x, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#555" }}>
                        <span style={{ fontSize: 13 }}>{x.i}</span><span>{x.t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Just paid — success */}
              {poolSuccess && (
                <div style={{ background: "#f0fdf8", border: "1.5px solid #10b98130", borderRadius: 14, padding: "24px 28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <span style={{ fontSize: 24 }}>🎉</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#10b981" }}>You&apos;re in the builder pool</div>
                      <div style={{ fontSize: 13, color: "#6b6460", marginTop: 2 }}>Founders can now find you. Profile link sent to your email.</div>
                    </div>
                  </div>
                  {profileToken && (
                    <div style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "1px solid #a7f3d0", marginBottom: 12 }}>
                      <div style={{ fontSize: 9, color: "#10b981", fontFamily: "'DM Mono',monospace", letterSpacing: 1.5, marginBottom: 8 }}>📌 YOUR PROFILE LINK — BOOKMARK THIS</div>
                      <a href={`/profile?token=${profileToken}`} style={{ fontSize: 13, color: "#10b981", fontWeight: 700, wordBreak: "break-all", textDecoration: "none", display: "block", marginBottom: 10 }}>
                        joinstartup.app/profile?token={profileToken.slice(0, 8)}...
                      </a>
                      <div style={{ display: "flex", gap: 10 }}>
                        <a href={`/profile?token=${profileToken}`}
                          style={{ padding: "10px 20px", background: "#10b981", color: "#fff", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                          View my profile →
                        </a>
                        <button onClick={shareProfile}
                          style={{ padding: "10px 20px", background: shareCopied ? "#f0fdf8" : "transparent", border: "1.5px solid #10b981", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", color: "#10b981" }}>
                          {shareCopied ? "✓ Copied!" : "Copy link"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Already in pool */}
              {isInPool && !poolSuccess && (
                <div style={{ background: "#f0fdf8", border: "1px solid #10b98130", borderRadius: 12, padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color: "#10b981", fontSize: 16 }}>✓</span>
                      <span style={{ fontSize: 13, color: "#10b981", fontFamily: "'DM Mono',monospace", letterSpacing: 0.5 }}>YOU&apos;RE IN THE POOL</span>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      {profileToken && (
                        <a href={`/profile?token=${profileToken}`}
                          style={{ padding: "8px 16px", background: "#10b981", color: "#fff", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>
                          View profile →
                        </a>
                      )}
                      <button onClick={shareProfile}
                        style={{ padding: "8px 16px", background: shareCopied ? "#f0fdf8" : "transparent", border: "1.5px solid #10b981", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer", color: "#10b981" }}>
                        {shareCopied ? "✓ Copied!" : "Share profile"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── 5. Track paths — after CTA, optional exploration ── */}
            {(isInPool || poolSuccess) && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 2, marginBottom: 10, padding: "10px 0 4px", borderTop: "1px solid #e8e2da" }}>
                  WHAT&apos;S YOUR PATH?
                </div>
                <TrackCard
                  archetype={analysis.archetype}
                  stageBucket={analysis.stageBucket}
                  name={analysis.name || undefined}
                />
              </div>
            )}

            {/* ── 6. Nominate section ── */}
            <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6, color: "#1a1a1a" }}>Know a builder who belongs here?</div>
              <p style={{ fontSize: 13, color: "#9a9088", lineHeight: 1.7, marginBottom: 20 }}>If someone gave you a shot, pay it forward — nominate them with one line of evidence.</p>
              <a href="/nominate" className="btn btn-secondary">Nominate Someone →</a>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
