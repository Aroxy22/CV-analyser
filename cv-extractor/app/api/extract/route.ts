import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type LlmPayload = {
  model: string;
  temperature: number;
  max_tokens: number;
  messages: Array<{ role: "system" | "user"; content: string }>;
};

function parseBrief(brief: string) {
  return {
    isRemote: /remote|distributed|anywhere|work from/i.test(brief),
    isRelocating: /mov(e|ing)|relocat|return|back to|planning to/i.test(brief),
    wantsToConnect: /connect|network|meet|talk|coffee|chat/i.test(brief),
    wantsRole: /join|looking for|seeking|open to|role|position|job|opportunity/i.test(brief),
    location:
      (brief.match(/based in ([A-Za-z\s,]+?)(?:\s+but|\s+and|\s*[-–]|\s+open|\s+plan|\.|,|$)/i) || [])[1]?.trim() ||
      "",
    targetLocation:
      (brief.match(/(?:mov(?:e|ing)|relocat(?:e|ing)|back to|return(?:ing)? to)\s+(?:to\s+)?([A-Za-z\s,]+?)(?:\s+for|\s+soon|\s+in|\.|,|$)/i) ||
        [])[1]?.trim() || "",
  };
}

async function extractPdfText(base64: string) {
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const buf = Buffer.from(base64, "base64");
    const result = await pdfParse(buf);
    return (result?.text || "").slice(0, 24000);
  } catch {
    return "";
  }
}

async function fetchUrlText(url: string) {
  try {
    const response = await fetch(`https://r.jina.ai/${url}`, {
      headers: { Accept: "text/plain" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return "";
    const text = await response.text();
    return text.slice(0, 10000);
  } catch {
    return "";
  }
}

function buildPrompt(goal: string, intent: ReturnType<typeof parseBrief>, cvText: string, url: string, urlText: string) {
  const context = [
    `GOAL: ${goal}`,
    `Location: ${intent.location || "not specified"}`,
    `Moving to: ${intent.targetLocation || "not specified"}`,
    `Remote ok: ${intent.isRemote}`,
    `Wants to connect: ${intent.wantsToConnect}`,
    url ? `URL provided: ${url}` : "URL provided: none",
    urlText ? `URL content:\n${urlText}` : "",
    cvText ? `CV content:\n${cvText}` : "CV content unavailable",
  ]
    .filter(Boolean)
    .join("\n\n");

  return `${context}

You are an expert startup talent analyst.
Return ONLY valid JSON (no markdown). Be concise, specific, and honest.

Use one archetype from:
zero-to-one, systems-architect, growth-hacker, founding-generalist, product-intuitive, operator, deep-tech, community-builder, revenue-animal, brand-builder, data-whisperer, market-maker, finance-builder, pivot-survivor, india-stack, global-translator

Schema:
{
  "name": string|null,
  "email": string|null,
  "currentTitle": string|null,
  "currentCompany": string|null,
  "summary": string,
  "experience": string,
  "skills": string[],
  "companies": string[],
  "domains": string[],
  "tools": string[],
  "rolesHeld": string[],
  "yearsExp": number,
  "stageBucket": "-1→0"|"0→1"|"1→beyond",
  "stageBucketReason": string,
  "archetype": string,
  "archetypeReason": string,
  "goalFit": {
    "level": "Strong"|"Moderate"|"Weak",
    "verdict": string,
    "matches": string[],
    "gaps": string[]
  },
  "founderView": {
    "headline": string,
    "bestFitFor": string,
    "signalStrength": "Strong"|"Moderate"|"Weak",
    "whyHire": string[],
    "watchOut": string[],
    "askThem": string[]
  },
  "recruiterView": {
    "seniorityLabel": string,
    "topJDMatches": string[],
    "keywordsToMatch": string[],
    "redFlags": string[],
    "interviewAngles": string[],
    "salaryBand": string
  },
  "roadmap": {
    "primaryGap": string,
    "doneLooksLike": string,
    "totalCostEstimate": string,
    "phases": [
      {
        "label": string,
        "focus": string,
        "actions": [
          {
            "type": "do"|"learn"|"earn",
            "action": string,
            "why": string,
            "timeCost": string,
            "moneyCost": string,
            "resource": {"name": string, "url": string}|null,
            "doneLooksLike": string
          }
        ]
      }
    ]
  },
  "nextMoves": [
    {
      "gap": string,
      "why": string,
      "learn": {"name": string, "url": string, "note": string},
      "earn": {"title": string, "note": string},
      "do": {"action": string, "note": string}
    }
  ]
}`;
}

async function callOpenAiCompatible(endpoint: string, apiKey: string, payload: LlmPayload) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}

function parseJson(text: string) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : cleaned);
}

export async function POST(req: NextRequest) {
  try {
    const { base64, goal, url } = await req.json();
    if (!goal) return NextResponse.json({ error: "Missing goal" }, { status: 400 });

    const groqKey = process.env.GROQ_API_KEY;
    const sarvamKey = process.env.SARVAM_API_KEY;

    if (!groqKey && !sarvamKey) {
      return NextResponse.json(
        { error: "No model configured. Add GROQ_API_KEY or SARVAM_API_KEY." },
        { status: 500 },
      );
    }

    const intent = parseBrief(goal);
    const cvText = base64 ? await extractPdfText(base64) : "";
    const urlText = url ? await fetchUrlText(url) : "";

    const system = "You are a strict JSON generator. Return only valid JSON.";
    const prompt = buildPrompt(goal, intent, cvText, url || "", urlText);

    const payload: LlmPayload = {
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 2200,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    };

    let raw = "";
    let providerUsed = "";

    if (groqKey) {
      try {
        raw = await callOpenAiCompatible("https://api.groq.com/openai/v1/chat/completions", groqKey, payload);
        providerUsed = "groq";
      } catch {
        // try fallback below
      }
    }

    if (!raw && sarvamKey) {
      const sarvamEndpoint = process.env.SARVAM_API_URL || "https://api.sarvam.ai/v1/chat/completions";
      raw = await callOpenAiCompatible(sarvamEndpoint, sarvamKey, {
        ...payload,
        model: process.env.SARVAM_MODEL || "sarvam-m",
      });
      providerUsed = "sarvam";
    }

    if (!raw) {
      return NextResponse.json({ error: "Analysis failed on both providers" }, { status: 500 });
    }

    const parsed = parseJson(raw);
    parsed.provider = providerUsed;
    parsed.opportunityContext = {
      remoteOk: intent.isRemote,
      targetGeo: intent.targetLocation || intent.location || "India",
      wantsToConnect: intent.wantsToConnect,
      intentType: intent.wantsToConnect && !intent.wantsRole ? "connect" : "role",
    };

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Extract error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
