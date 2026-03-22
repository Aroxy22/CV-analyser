import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

function parseBrief(brief: string) {
  return {
    isRemote:       /remote|distributed|anywhere|work from/i.test(brief),
    isRelocating:   /mov(e|ing)|relocat|return|back to|planning to/i.test(brief),
    wantsToConnect: /connect|network|meet|talk|coffee|chat/i.test(brief),
    wantsRole:      /join|looking for|seeking|open to|role|position|job|opportunity/i.test(brief),
    location:       (brief.match(/based in ([A-Za-z\s,]+?)(?:\s+but|\s+and|\s*[-–]|\s+open|\s+plan|\.|,|$)/i) || [])[1]?.trim() || "",
    targetLocation: (brief.match(/(?:mov(?:e|ing)|relocat(?:e|ing)|back to|return(?:ing)? to)\s+(?:to\s+)?([A-Za-z\s,]+?)(?:\s+for|\s+soon|\s+in|\.|,|$)/i) || [])[1]?.trim() || "",
  };
}

function detectStage(goal: string): "-1→0" | "0→1" | "1→beyond" | null {
  const g = goal.toLowerCase();
  const yrs = parseInt((g.match(/(\d+)\s*(?:years?|yrs?)/) || [])[1] || "0");
  if (yrs >= 6) return "1→beyond";
  if (yrs >= 2) return "0→1";
  if (/fresher|student|graduate|intern|final year|first job|no experience|just started/i.test(g)) return "-1→0";
  if (/10\+|12\+|15\+|senior|lead|head of|vp|director|cto|cpo/i.test(g)) return "1→beyond";
  if (/startup|founding|seed|series|shipped|built|launched/i.test(g)) return "0→1";
  return null;
}

const SENIORITY: Record<string, string> = {
  "-1→0":     "Entry level / Intern",
  "0→1":      "Mid-level / Senior",
  "1→beyond": "Senior / Lead / Head of",
};
const SALARY: Record<string, string> = {
  "-1→0":     "4-8 LPA",
  "0→1":      "15-35 LPA",
  "1→beyond": "40-80 LPA",
};

const ARCHETYPES = [
  "zero-to-one","systems-architect","growth-hacker","founding-generalist",
  "product-intuitive","operator","deep-tech","community-builder","revenue-animal",
  "brand-builder","data-whisperer","market-maker","finance-builder",
  "pivot-survivor","india-stack","global-translator",
].join(", ");

export async function POST(req: NextRequest) {
  try {
    const { base64, goal, url, filename } = await req.json();
    if (!goal) return NextResponse.json({ error: "Missing goal" }, { status: 400 });

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) return NextResponse.json({ error: "Groq not configured" }, { status: 500 });

    const intent   = parseBrief(goal);
    const stage    = detectStage(goal);
    const seniority = SENIORITY[stage || "0→1"];
    const salary    = SALARY[stage || "0→1"];

    // Build text context — Groq can't read PDFs so we use filename + goal as signal
    let context = `GOAL: "${goal}"\n`;
    if (url) context += `URL: ${url}\n`;
    if (base64) context += `CV uploaded: ${filename || "resume.pdf"} — extract from the PDF content below if possible, otherwise use goal text.\n`;

    const prompt = `You are a startup talent classifier. Extract structured data. Return ONLY valid JSON, no markdown.

${context}

STAGE HINT: ${stage ? `Likely ${stage} based on brief — verify from CV` : "Classify from CV/brief: -1→0 (<2yr), 0→1 (2-6yr), 1→beyond (6+yr)"}
ARCHETYPES: ${ARCHETYPES}
SENIORITY FOR THIS STAGE: ${seniority}
SALARY FOR THIS STAGE: ${salary}

Return exactly this JSON — no extra fields, no missing fields:
{
  "name": "full name from CV or null",
  "email": "email from CV or null",
  "currentTitle": "most recent title + company e.g. 'Senior PM at Razorpay' or null",
  "currentCompany": "company name only or null",
  "skills": ["up to 8 key skills"],
  "companies": ["up to 6 companies from work history"],
  "domains": ["up to 4 domains e.g. fintech, B2B SaaS, AI/ML"],
  "tools": ["up to 8 tools/frameworks/platforms"],
  "rolesHeld": ["up to 5 titles most recent first"],
  "yearsExp": 0,
  "stageBucket": "-1→0",
  "stageBucketReason": "one honest sentence why this stage",
  "archetype": "one archetype id from the list",
  "goalFit": {
    "level": "Strong",
    "matches": ["2-3 specific strengths that match their goal"],
    "gaps": ["2-3 specific gaps to close"]
  },
  "recruiterView": {
    "seniorityLabel": "${seniority}",
    "topJDMatches": ["3 realistic JD titles for their actual level"],
    "keywordsToMatch": ["6-8 ATS keywords from their background"],
    "redFlags": ["1-2 honest flags a recruiter would note"],
    "interviewAngles": ["2 specific angles worth probing"],
    "salaryBand": "${salary}"
  }
}`;

    // Groq can read PDF if we pass base64 — but Groq vision not available on llama-3.1-70b
    // So we send text prompt only, CV data comes from goal + filename signal
    const messages: object[] = [{ role: "user", content: prompt }];

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        max_tokens: 1800,
        messages,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Groq error:", err);
      return NextResponse.json({ error: "Groq failed" }, { status: 500 });
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      const match = clean.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match ? match[0] : clean);
    } catch {
      return NextResponse.json({ error: "Failed to parse Groq response" }, { status: 500 });
    }

    // Always include opportunityContext
    parsed.opportunityContext = {
      remoteOk:       intent.isRemote,
      targetGeo:      intent.targetLocation || intent.location || "India",
      wantsToConnect: intent.wantsToConnect,
      intentType:     intent.wantsToConnect && !intent.wantsRole ? "connect" : "role",
    };

    return NextResponse.json(parsed);

  } catch (error) {
    console.error("Extract-fast error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
