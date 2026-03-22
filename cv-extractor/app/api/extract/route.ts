import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

function parseBrief(brief: string) {
  return {
    isRemote:        /remote|distributed|anywhere|work from/i.test(brief),
    isRelocating:    /mov(e|ing)|relocat|return|back to|planning to/i.test(brief),
    wantsToConnect:  /connect|network|meet|talk|coffee|chat/i.test(brief),
    wantsRole:       /join|looking for|seeking|open to|role|position|job|opportunity/i.test(brief),
    isOpenToStartup: /start.?up|early.?stage|seed|series/i.test(brief),
    location:        (brief.match(/based in ([A-Za-z\s,]+?)(?:\s+but|\s+and|\s*[-–]|\s+open|\s+plan|\.|,|$)/i) || [])[1]?.trim() || "",
    targetLocation:  (brief.match(/(?:mov(?:e|ing)|relocat(?:e|ing)|back to|return(?:ing)? to)\s+(?:to\s+)?([A-Za-z\s,]+?)(?:\s+for|\s+soon|\s+in|\.|,|$)/i) || [])[1]?.trim() || "",
  };
}

// Stage-specific instructions — this is what makes the analysis feel calibrated
const STAGE_LENS = {
  "-1→0": {
    label: "Pre-zero (fresher / career starter)",
    archetypeNote: `
IMPORTANT — this person is at -1→0 (fresher, under 2 years, career starter, career switcher).
At this stage, you CANNOT assess archetype from proven work history — they haven't built enough yet.
Instead, infer archetype from:
  - What kind of work excites them (from their brief)
  - Their academic projects, internships, side projects
  - The problems they're drawn to, not just their skills
  - Their energy: do they want to build products? write code? talk to users? sell?
Be honest that this is a POTENTIAL archetype — not yet proven. Use language like:
  "Based on what draws you, you show early signals of a [archetype]"
  NOT: "You are a [archetype] because of your work at X" (they don't have work at X yet)`,
    toneNote: `
TONE FOR THIS STAGE — critical:
- They're starting out. Don't talk to them like a senior hire.
- Be encouraging but NOT condescending. Don't say "you're just starting out" — say "you're in the earliest stage, which means the right moves now compound most."
- Be specific about what early signals are GOOD — not just what's missing.
- Don't give them senior resources. Give them the RIGHT first step.
- The honest thing to say: which archetype they're trending toward, what foundational move to make, and what a realistic first startup role looks like for them.`,
    goalFitNote: `
GOAL FIT FOR -1→0:
- Most goals will be "Weak" or "Moderate" fit — that's honest and fine.
- NEVER frame Weak as failure. Frame it as: "You're 12-18 months away from this goal if you make the right moves now."
- matches: focus on raw material — curiosity, domain interest, relevant projects, mindset signals
- gaps: frame as "what you need to earn before this goal is realistic" — specific, not vague
- Be direct: "The gap isn't skills, it's proof. Here's how to start building it."`,
    resourceNote: `
RESOURCES FOR -1→0:
- learn: beginner-to-intermediate. Real starting points: specific Coursera/NPTEL/YouTube courses, specific books (e.g. "The Mom Test", "Zero to One"), specific communities to join first
- earn: internships, part-time roles, contract work, contributing to open source — realistic for their stage
- do: something buildable this week with zero experience required — a project to start, a community to post in, a person to reach out to`,
    salaryNote: `salaryBand: realistic fresher/junior range in India — typically "4-8 LPA" or "3-6 LPA depending on role"`,
    seniorityNote: `seniorityLabel: "Entry level" or "Intern / Junior" — be accurate, not flattering`,
  },
  "0→1": {
    label: "Zero-to-one (2–6 years, ready for startup)",
    archetypeNote: `
This person is at 0→1 — they have real experience, maybe 1-2 startup stints, and are ready to step up.
Infer archetype from PATTERNS in their actual work, not just job titles:
  - What have they repeatedly done well?
  - What problems did they own end-to-end?
  - Where do colleagues probably rely on them?
  - What do they seem to enjoy most from their brief?
Be specific: "You're a [archetype] because across [Company A] and [Company B] you consistently [specific pattern]"`,
    toneNote: `
TONE FOR 0→1:
- They're capable and serious. Talk to them as a peer.
- Name their actual companies, roles, specific things they've built.
- Be honest about what's there AND what's missing — they can handle it.
- The most useful thing: tell them exactly what kind of startup needs them RIGHT NOW and what the one thing is they need to level up.`,
    goalFitNote: `
GOAL FIT FOR 0→1:
- Most will be Moderate fit — they have real skills but need to close specific gaps.
- matches: specific skills or experiences they already have that transfer directly
- gaps: the one or two things that would make them significantly more attractive to the right startup
- Be concrete: "You have the product instinct but you haven't shipped with a real revenue constraint — that's the gap."`,
    resourceNote: `
RESOURCES FOR 0→1:
- learn: intermediate-to-advanced. Not intro courses. Books like "Inspired", "High Output Management", specific podcasts or communities for their domain (SaaSBOOMi, Lenny's Newsletter, specific Twitter/X accounts)
- earn: real roles they could step into — contract, fractional, or full-time. Specific enough to search for.
- do: something that stretches them and creates a visible artifact — a case study, a side project, a talk at a meetup`,
    salaryNote: `salaryBand: realistic mid-level India range — typically "15-35 LPA" depending on role and startup stage`,
    seniorityNote: `seniorityLabel: "Mid-level" or "Senior" depending on years and impact demonstrated`,
  },
  "1→beyond": {
    label: "One-to-beyond (6+ years, leadership ready)",
    archetypeNote: `
This person is at 1→beyond — serious experience, has scaled something, leadership ready.
Archetype should be assessed from OUTCOMES and IMPACT, not just activities:
  - What did they build that still runs?
  - How many people / how much revenue / what scale?
  - What's the thing they're known for professionally?
  - Do they gravitate toward people problems or system problems?
Be bold in the assessment: "You're a [archetype] — not because of your title but because you've [specific outcome]"
If they have multiple strong signals, name the primary and the secondary: "Primarily [X], with strong [Y] signals"`,
    toneNote: `
TONE FOR 1→beyond:
- Peer to peer. They know what they're doing.
- Don't over-explain. Get to the insight fast.
- The most useful thing for a senior person: honest assessment of WHERE they'd have most leverage, what kind of startup/stage fits them best, and what they might be underestimating about themselves or overestimating.
- Be willing to challenge them: "You describe yourself as X but your track record reads more like Y — here's why that's actually better for what you want."`,
    goalFitNote: `
GOAL FIT FOR 1→beyond:
- Most will be Strong or Moderate — they have real leverage.
- matches: specific outcomes and experiences that transfer directly, at scale
- gaps: be honest about the ONE thing that would unlock the next level — usually it's domain credibility, network in a specific space, or a specific type of scale they haven't hit
- Don't pad. If they're genuinely strong, say it. If there's a real gap, name it directly.`,
    resourceNote: `
RESOURCES FOR 1→beyond:
- learn: NO beginner resources. Senior resources only: specific books (e.g. "The Hard Thing About Hard Things", "Crossing the Chasm"), specific newsletters (Lenny's, First Round Review, NFX essays), specific operator communities (SaaSBOOMi operators, Reforge)
- earn: senior/leadership roles — Head of, VP, founding team, fractional CXO. Realistic for their level.
- do: something that builds visibility at their level — writing, speaking, advising, making a specific introduction`,
    salaryNote: `salaryBand: senior India range — typically "40-80 LPA" or "Remote: $100-200k USD" depending on role`,
    seniorityNote: `seniorityLabel: "Senior" or "Lead / Head of" or "VP / Founding team"`,
  },
};

export async function POST(req: NextRequest) {
  try {
    const { base64, filename, goal, url } = await req.json();

    if (!goal) return NextResponse.json({ error: "Missing goal" }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

    const intent = parseBrief(goal);
    const userContent: object[] = [];

    // URL handling
    if (url) {
      const isLinkedIn = /linkedin\.com\/in\//i.test(url);
      const isGitHub   = /github\.com\//i.test(url);

      if (isLinkedIn) {
        const handle = url.split("linkedin.com/in/")[1]?.replace(/\/$/, "") || url;
        userContent.push({ type: "text", text: `LinkedIn profile: linkedin.com/in/${handle}\n\nNote: LinkedIn blocks automated access — I cannot read their profile. Analyse based on their brief (primary source) and any uploaded CV. Do NOT invent LinkedIn content.` });
      } else {
        try {
          const fetchRes = await fetch(`https://r.jina.ai/${url}`, { headers: { Accept: "text/plain" }, signal: AbortSignal.timeout(8000) });
          if (fetchRes.ok) {
            const pageText = await fetchRes.text();
            const isUseful = pageText.length > 500 && !pageText.toLowerCase().includes("sign in to") && !pageText.toLowerCase().includes("log in to") && !pageText.toLowerCase().includes("access denied");
            userContent.push({ type: "text", text: isUseful ? `${isGitHub ? "GitHub profile" : "Portfolio"}: ${url}\n\nContent:\n${pageText.slice(0, 8000)}` : `URL provided: ${url}\n(Could not read content — use brief and CV only.)` });
          }
        } catch {
          userContent.push({ type: "text", text: `URL provided: ${url}\n(Could not fetch — use brief and CV only.)` });
        }
      }
    }

    // PDF
    if (base64) {
      userContent.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } });
    }

    const isLinkedIn = url ? /linkedin\.com\/in\//i.test(url) : false;
    const isGitHub   = url ? /github\.com\//i.test(url) : false;
    const urlLabel   = isLinkedIn ? "LinkedIn (handle only)" : isGitHub ? "GitHub profile" : url ? "portfolio/website" : "";
    const inputType  = url && base64 ? `${urlLabel} + CV` : url ? urlLabel : base64 ? "CV" : "self-description only";

    userContent.push({
      type: "text",
      text: `You are a sharp, experienced startup talent advisor — like a founder or operator who has seen hundreds of builders at every stage. You speak DIRECTLY to this person in second person ("you", "your"). Not as an assessor writing ABOUT them — as a mentor who respects their time and gives them a straight read.

## THEIR BRIEF
"${goal}"

## INPUT TYPE
${inputType}

## THEIR CONTEXT
Location: ${intent.location || "not specified"} | Moving to: ${intent.targetLocation || "not specified"}
Remote ok: ${intent.isRemote} | Relocating: ${intent.isRelocating}
Wants to connect: ${intent.wantsToConnect} | Looking for role: ${intent.wantsRole}

## STEP 1 — CLASSIFY STAGE FIRST (everything else depends on this)

Read ALL available inputs carefully. Then classify stage:
- "-1→0": fresher, under ~2 years exp, career starter, career switcher, no real startup experience yet. Still mostly academic/internship/early career.
- "0→1": 2–6 years real experience, maybe 1-2 startup stints, has shipped real things, ready to step up into a startup role
- "1→beyond": 6+ years, has scaled something meaningful, led teams or products, ready for senior/leadership/founding role

BE HONEST about stage. Do not upgrade someone to 0→1 because they want to be there. If someone is -1→0, say so — and then show them the path forward.

## STEP 2 — APPLY STAGE-SPECIFIC LENS

Once you've classified stage, apply the correct lens below for EVERYTHING you write.

### IF STAGE IS -1→0:
${STAGE_LENS["-1→0"].archetypeNote}
${STAGE_LENS["-1→0"].toneNote}
${STAGE_LENS["-1→0"].goalFitNote}
${STAGE_LENS["-1→0"].resourceNote}

### IF STAGE IS 0→1:
${STAGE_LENS["0→1"].archetypeNote}
${STAGE_LENS["0→1"].toneNote}
${STAGE_LENS["0→1"].goalFitNote}
${STAGE_LENS["0→1"].resourceNote}

### IF STAGE IS 1→beyond:
${STAGE_LENS["1→beyond"].archetypeNote}
${STAGE_LENS["1→beyond"].toneNote}
${STAGE_LENS["1→beyond"].goalFitNote}
${STAGE_LENS["1→beyond"].resourceNote}

## ARCHETYPE LIST — pick ONE (or TWO if strongly split):
- zero-to-one: Ships before it's perfect, owns everything end-to-end, thrives in chaos
- systems-architect: Thinks in platforms, designs for scale, hates one-off fixes
- growth-hacker: Channel obsessed, runs experiments, data is their language
- founding-generalist: Wears 5 hats without dropping any, high chaos tolerance, low ego
- product-intuitive: Talks to users every day, ships fast, has strong opinions
- operator: Turns chaos into process, force multiplier, makes teams run
- deep-tech: Loves hard problems, ML/AI/infra specialist, research + product
- community-builder: Network effects first, builds audiences before products
- revenue-animal: Closes deals, pipeline obsessed, makes startups real with revenue
- brand-builder: Narrative-first, positioning expert, makes startups feel inevitable
- data-whisperer: Turns numbers into decisions, bridges business and engineering
- market-maker: Opens doors, BD and partnerships, ecosystem thinker
- finance-builder: Unit economics obsessed, FP&A, knows what makes a startup fundable
- pivot-survivor: Battle-tested, calm under fire, wisdom over raw skill
- india-stack: UPI/ONDC/Aadhaar expert, regulatory edge, India-native builder
- global-translator: Global playbooks adapted for India/Asia, cross-cultural edge

## EXTRACTION (required regardless of stage):
- name: full name of the person as it appears on the CV/profile. null if not visible.
- email: email address from the CV/profile. null if not visible.
- currentTitle: their most recent/current job title e.g. "Senior Product Manager at Razorpay". null if not visible.
- currentCompany: their most recent/current employer name only e.g. "Razorpay". null if not visible.
- companies: ALL company/org names from work history including current. Empty [] if fresher/none visible. Max 6.
- domains: industry/problem spaces — e.g. "fintech", "B2B SaaS", "AI/ML", "consumer", "healthtech". Max 4.
- tools: specific tech, frameworks, platforms used or mentioned. Max 8. Empty [] if none.
- rolesHeld: actual job titles from history in chronological order, most recent first. For freshers: internship titles are fine. Max 5.
- yearsExp: total professional years as integer. 0 if fresher/student. Estimate from graduation year if not explicit.

## UNIVERSAL WRITING RULES:
- Everything in second person: "you", "your", "you've", "you're"
- summary: Talk TO them. Reference their actual background. No generic filler. If -1→0, acknowledge where they are AND what's interesting about their early signals.
- experience: One sharp honest sentence. For -1→0: "You're at the start of your career, which means X" — not flattering, not harsh.
- archetypeReason: Must cite SPECIFIC evidence — project, company, skill, interest. For -1→0 use "early signals of" language.
- goalFit.verdict: Always forward-looking. For Weak: never say "not suitable" — say "here's what the path to this goal looks like from where you are."
- nextMoves: Resources MUST match their actual stage. -1→0 gets starter resources. 1→beyond gets NO beginner resources.
- founderView.headline: For -1→0 write what a founder hiring an intern/junior would note. For 1→beyond write what stops a founder mid-scroll.
- recruiterView: ${STAGE_LENS["-1→0"].seniorityNote} / ${STAGE_LENS["0→1"].seniorityNote} / ${STAGE_LENS["1→beyond"].seniorityNote} — use the one matching their stage.
- salaryBand: ${STAGE_LENS["-1→0"].salaryNote} / ${STAGE_LENS["0→1"].salaryNote} / ${STAGE_LENS["1→beyond"].salaryNote} — use the one matching their stage.

## ROADMAP RULES:
Think of this as a personal 90-day plan, not a list of suggestions.

STRUCTURE:
- primaryGap: The ONE most important thing between them and their goal. Not 3 things — one.
- phases: 3-4 phases in chronological order. Each phase has a time horizon, a focus, and 1-2 actions.
- Each action has: what to do, why it matters, time cost (hours/week), money cost (₹ or free), and a concrete "done looks like" signal.
- doneLooksLike: One sentence — what does success look like 90 days from now?

TIME HORIZONS: "This week", "Month 1", "Month 2-3", "Month 3+"
COST FORMAT: "Free", "₹0", "₹500-2000/mo", "₹5,000-15,000 one-time", "₹20,000+" — be realistic for India
TIME COST FORMAT: "2-3 hrs/week", "1 hr/day", "One weekend", "30 min/day"

COST CALIBRATION BY STAGE:
- -1→0: Mostly free resources. Paid only if high value (specific course, bootcamp). Max ₹5,000 total.
- 0→1: Mix of free and paid. Courses, tools, events. ₹2,000-15,000 range realistic.
- 1→beyond: Senior resources. Reforge, paid communities, conferences. ₹15,000-50,000 range realistic.

Return ONLY valid JSON, no markdown, no preamble.

{
  "name": "Full name from CV/profile, or null",
  "email": "Email from CV/profile, or null",
  "currentTitle": "Most recent job title + company e.g. 'Senior Engineer at Razorpay', or null",
  "currentCompany": "Most recent employer name only, or null",
  "summary": "2-3 sentences TO them — stage-aware, specific to their background",
  "experience": "One honest sentence about their experience level and what it signals",
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "companies": [],
  "domains": [],
  "tools": [],
  "rolesHeld": [],
  "yearsExp": 0,
  "stageBucket": "-1→0" | "0→1" | "1→beyond",
  "stageBucketReason": "You're [stage] because [specific honest reason from their actual background]",
  "archetype": "one-of-16-ids",
  "archetypeReason": "Stage-appropriate reason — for -1→0 use 'early signals' language, for others cite specific evidence",
  "goalFit": {
    "level": "Strong" | "Moderate" | "Weak",
    "verdict": "Stage-aware, forward-looking, never defeatist",
    "matches": ["specific match relevant to their stage and goal"],
    "gaps": ["honest specific gap, framed as the next move not a verdict on them"]
  },
  "founderView": {
    "headline": "Stage-calibrated — what a founder actually thinks reading this",
    "bestFitFor": "Specific startup type AND stage that fits them — honest about seniority",
    "signalStrength": "Strong" | "Moderate" | "Weak",
    "whyHire": ["specific reason"],
    "watchOut": ["honest watch-out"],
    "askThem": ["specific question worth asking"]
  },
  "recruiterView": {
    "seniorityLabel": "Stage-honest label",
    "topJDMatches": ["realistic job titles for their actual level"],
    "keywordsToMatch": ["relevant ATS keywords"],
    "redFlags": ["honest flag to probe"],
    "interviewAngles": ["specific angle to probe"],
    "salaryBand": "Stage-appropriate range"
  },
  "roadmap": {
    "primaryGap": "The single most important thing between them and their goal — one sharp sentence",
    "doneLooksLike": "What success looks like 90 days from now — one concrete sentence",
    "totalCostEstimate": "Total rough cost across all phases e.g. 'Mostly free' or '₹5,000-10,000'",
    "phases": [
      {
        "label": "This week",
        "focus": "Short phrase — what this phase is about",
        "actions": [
          {
            "type": "do" | "learn" | "earn",
            "action": "Specific, concrete action — not vague",
            "why": "Why this specific action closes the gap",
            "timeCost": "e.g. 2-3 hrs/week",
            "moneyCost": "e.g. Free or ₹500/mo",
            "resource": { "name": "Resource name if applicable", "url": "https://..." } | null,
            "doneLooksLike": "One-line signal that this action is complete"
          }
        ]
      },
      {
        "label": "Month 1",
        "focus": "Short phrase",
        "actions": [...]
      },
      {
        "label": "Month 2-3",
        "focus": "Short phrase",
        "actions": [...]
      }
    ]
  },
  "nextMoves": [
    {
      "gap": "Specific gap title — action framed",
      "why": "Why this gap matters for their specific goal right now",
      "learn": { "name": "Real resource — stage-appropriate", "url": "https://...", "note": "Why this resource for this gap" },
      "earn": { "title": "Realistic role/gig for their stage", "note": "How this closes the gap" },
      "do": { "action": "Specific thing this week — doable at their level", "note": "Why this move" }
    }
  ],
  "opportunityContext": {
    "remoteOk": ${intent.isRemote},
    "targetGeo": "${intent.targetLocation || intent.location || "India"}",
    "wantsToConnect": ${intent.wantsToConnect},
    "intentType": "${intent.wantsToConnect && !intent.wantsRole ? "connect" : "role"}"
  }
}`,
    });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-6",
        max_tokens: 4000,
        messages: [{ role: "user", content: userContent }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `Claude API error: ${err}` }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    let parsed;
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      const match = clean.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match ? match[0] : clean);
    } catch {
      return NextResponse.json({ error: "Failed to parse analysis response" }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Extract error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
