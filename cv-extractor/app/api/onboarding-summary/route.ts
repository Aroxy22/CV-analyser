import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function callOpenAiCompatible(endpoint: string, apiKey: string, model: string, prompt: string) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 700,
      messages: [
        { role: "system", content: "Return only valid JSON." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();
    if (!answers) return NextResponse.json({ error: "Missing answers" }, { status: 400 });

    const prompt = `You are an expert startup talent analyst for joinstartup.app.
Builder answers:\n${JSON.stringify(answers, null, 2)}

Return ONLY valid JSON:
{"headline":"6-10 word builder archetype","summary":"2-3 sentence founder-facing narrative","strengths":["tag1","tag2","tag3"],"founderMatch":"1 sentence best fit","watchout":"1 honest observation","readinessScore":7}`;

    const groqKey = process.env.GROQ_API_KEY;
    const sarvamKey = process.env.SARVAM_API_KEY;

    let raw = "";

    if (groqKey) {
      try {
        raw = await callOpenAiCompatible("https://api.groq.com/openai/v1/chat/completions", groqKey, "llama-3.3-70b-versatile", prompt);
      } catch {
        // fallback below
      }
    }

    if (!raw && sarvamKey) {
      raw = await callOpenAiCompatible(
        process.env.SARVAM_API_URL || "https://api.sarvam.ai/v1/chat/completions",
        sarvamKey,
        process.env.SARVAM_MODEL || "sarvam-m",
        prompt,
      );
    }

    if (!raw) return NextResponse.json({ error: "No provider configured" }, { status: 500 });

    const clean = raw.replace(/```json|```/g, "").trim();
    const match = clean.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : clean);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("onboarding-summary error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
