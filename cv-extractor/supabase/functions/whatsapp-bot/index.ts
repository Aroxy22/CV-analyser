// Supabase Edge Function: whatsapp-bot
// Meta Cloud API webhook + state machine (Groq primary, Sarvam fallback)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const WHATSAPP_TOKEN = Deno.env.get("WHATSAPP_TOKEN") || "";
const WHATSAPP_PHONE_ID = Deno.env.get("WHATSAPP_PHONE_ID") || "";
const WHATSAPP_VERIFY_TOKEN = Deno.env.get("WHATSAPP_VERIFY_TOKEN") || "joinstartup_verify";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") || "";
const SARVAM_API_KEY = Deno.env.get("SARVAM_API_KEY") || "";

const APP_URL = Deno.env.get("APP_URL") || "https://joinstartup.app";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  try {
    if (req.method === "GET") return handleVerify(req);
    if (req.method === "POST") return handleWebhook(req);
    return new Response("Method not allowed", { status: 405 });
  } catch (e) {
    console.error("whatsapp-bot error", e);
    return new Response("Internal error", { status: 500 });
  }
});

function handleVerify(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

async function handleWebhook(req: Request) {
  const body = await req.json();
  const messages = body?.entry?.[0]?.changes?.[0]?.value?.messages || [];
  if (!messages.length) return new Response("ok", { status: 200 });

  for (const msg of messages) {
    await processMessage(msg);
  }

  return new Response("ok", { status: 200 });
}

async function processMessage(msg: any) {
  const waId = msg?.from;
  if (!waId) return;

  const session = await getSession(waId);

  const text = msg?.text?.body?.trim() || "";
  const document = msg?.document;

  if (session.state === "idle") {
    await sendWhatsAppText(waId, "Hey! Send me your CV as PDF and I’ll return your builder archetype teaser.");
    await setSession(waId, { state: "waiting_cv" });
    return;
  }

  if (session.state === "waiting_cv") {
    if (!document || document?.mime_type !== "application/pdf") {
      await sendWhatsAppText(waId, "Please send your CV as a PDF file.");
      return;
    }

    const mediaId = document.id;
    const base64 = await downloadMetaMediaAsBase64(mediaId);
    if (!base64) {
      await sendWhatsAppText(waId, "Couldn’t read that PDF. Please try again.");
      return;
    }

    await setSession(waId, { state: "waiting_goal", cv_base64: base64, file_name: document.filename || "cv.pdf" });
    await sendWhatsAppText(waId, "Got your CV! What are you looking for?");
    return;
  }

  if (session.state === "waiting_goal") {
    if (!text) {
      await sendWhatsAppText(waId, "Tell me what kind of role/opportunity you want.");
      return;
    }

    await setSession(waId, { state: "analysing", goal: text });
    await sendWhatsAppText(waId, "Analysing... ⏳");

    const analysis = await runAnalysis({
      goal: text,
      base64: session.cv_base64,
      filename: session.file_name || "cv.pdf",
    });

    if (!analysis) {
      await setSession(waId, { state: "done" });
      await sendWhatsAppText(waId, `Couldn’t finish analysis right now. Try again in a bit or use ${APP_URL}/analyse`);
      return;
    }

    const teaser = buildTeaser(analysis);
    await setSession(waId, { state: "done", analysis_json: analysis });
    await sendWhatsAppText(waId, teaser);
    return;
  }

  if (session.state === "done") {
    const t = text.toLowerCase();
    if (/(again|redo)/.test(t)) {
      await setSession(waId, { state: "waiting_cv", cv_base64: null, goal: null, analysis_json: null });
      await sendWhatsAppText(waId, "Cool — send your next CV PDF.");
      return;
    }

    if (/(full|roadmap)/.test(t)) {
      await sendWhatsAppText(waId, `Full analysis: ${APP_URL}/analyse`);
      return;
    }

    if (/(pool|join|499)/.test(t)) {
      await sendWhatsAppText(waId, `Join the pool (₹499 one-time): ${APP_URL}/analyse`);
      return;
    }

    await sendWhatsAppText(waId, "Type ‘again’ to restart, or ‘full’ for full analysis link.");
  }
}

async function getSession(wa_id: string) {
  const { data } = await supabase
    .from("whatsapp_sessions")
    .select("*")
    .eq("wa_id", wa_id)
    .maybeSingle();

  return data || { wa_id, state: "idle" };
}

async function setSession(wa_id: string, patch: Record<string, unknown>) {
  await supabase
    .from("whatsapp_sessions")
    .upsert({ wa_id, updated_at: new Date().toISOString(), ...patch }, { onConflict: "wa_id" });
}

async function downloadMetaMediaAsBase64(mediaId: string): Promise<string | null> {
  if (!WHATSAPP_TOKEN) return null;
  try {
    const infoRes = await fetch(`https://graph.facebook.com/v20.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
    });
    if (!infoRes.ok) return null;

    const info = await infoRes.json();
    const mediaUrl = info?.url;
    if (!mediaUrl) return null;

    const fileRes = await fetch(mediaUrl, { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } });
    if (!fileRes.ok) return null;

    const buf = await fileRes.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  } catch {
    return null;
  }
}

async function runAnalysis(input: { goal: string; base64: string; filename: string }) {
  const prompt = `Return strict JSON for startup CV analysis. Goal: ${input.goal}.`;

  if (GROQ_API_KEY) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.2,
          max_tokens: 600,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return safeJson(data?.choices?.[0]?.message?.content || "{}");
      }
    } catch {
      // fallback below
    }
  }

  if (SARVAM_API_KEY) {
    try {
      const res = await fetch(Deno.env.get("SARVAM_API_URL") || "https://api.sarvam.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SARVAM_API_KEY}`,
        },
        body: JSON.stringify({
          model: Deno.env.get("SARVAM_MODEL") || "sarvam-m",
          temperature: 0.2,
          max_tokens: 600,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return safeJson(data?.choices?.[0]?.message?.content || "{}");
      }
    } catch {
      return null;
    }
  }

  return null;
}

function safeJson(raw: string) {
  const clean = raw.replace(/```json|```/g, "").trim();
  const match = clean.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : clean);
}

function buildTeaser(analysis: any) {
  const archetype = analysis?.archetype || "Builder";
  const summary = analysis?.summary || analysis?.experience || "Strong early signals for startup roles.";
  const founder = analysis?.founderView?.headline || "Founder read unavailable";
  const recruiter = analysis?.recruiterView?.seniorityLabel || "Recruiter read unavailable";

  return `🔥 Your builder archetype: ${archetype}\n\n${summary}\n\nFounder read: ${founder}\nRecruiter read: ${recruiter}\n\n———\nFull analysis → ${APP_URL}/analyse\nJoin the pool → ₹499 one-time`;
}

async function sendWhatsAppText(to: string, text: string) {
  if (!WHATSAPP_PHONE_ID || !WHATSAPP_TOKEN) return;

  await fetch(`https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });
}
