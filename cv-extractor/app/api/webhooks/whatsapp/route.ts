import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEFAULT_GOAL = "Analyse my CV for startup roles — looking for founding or early-stage opportunities in India.";

const ARCHETYPE_LABELS: Record<string, string> = {
  "zero-to-one": "Zero-to-One Builder",
  "systems-architect": "Systems Architect",
  "growth-hacker": "Growth Hacker",
  "founding-generalist": "Founding Generalist",
  "product-intuitive": "Product Intuitive",
  "operator": "The Operator",
  "deep-tech": "Deep Tech Builder",
  "community-builder": "Community Builder",
  "revenue-animal": "Revenue Animal",
  "brand-builder": "Brand Builder",
  "data-whisperer": "Data Whisperer",
  "market-maker": "Market Maker",
  "finance-builder": "Finance Builder",
  "pivot-survivor": "Pivot Survivor",
  "india-stack": "India Stack Expert",
  "global-translator": "Global→India Translator",
};

export async function POST(req: NextRequest) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cv-analyser-ebon.vercel.app";

    if (!accountSid || !authToken || !fromNumber) {
      console.error("[whatsapp] Missing Twilio config");
      return new NextResponse("Server config error", { status: 500 });
    }

    // Twilio sends form-urlencoded
    const formData = await req.formData();
    const body = formData.get("Body") as string | null;
    const from = formData.get("From") as string | null; // whatsapp:+91...
    const numMedia = parseInt((formData.get("NumMedia") as string) || "0", 10);

    if (!from) {
      return new NextResponse("Missing From", { status: 400 });
    }

    // Text-only: help message
    if (numMedia === 0) {
      const helpText = body?.toLowerCase().trim();
      if (helpText === "hi" || helpText === "hello" || helpText === "help" || !helpText) {
        await sendTwilioMessage(accountSid, authToken, from, fromNumber, 
          `📄 *JoinStartup CV Analysis*\n\nSend your CV as a *PDF* to get:\n• Your builder archetype\n• Stage fit\n• Founder & recruiter views\n\nJust drop the PDF here and we'll analyse it.`);
        return new NextResponse("<Response></Response>", {
          headers: { "Content-Type": "text/xml" },
        });
      }
      // Could add: if body looks like email, save profile. For now, ask for CV.
      await sendTwilioMessage(accountSid, authToken, from, fromNumber,
        `Send your CV as a PDF to get analysed. 📄`);
      return new NextResponse("<Response></Response>", {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Find first PDF
    let mediaUrl: string | null = null;
    let mediaType: string | null = null;
    for (let i = 0; i < numMedia; i++) {
      const url = formData.get(`MediaUrl${i}`) as string | null;
      const ct = (formData.get(`MediaContentType${i}`) as string) || "";
      if (ct.includes("pdf") || (url && !mediaUrl)) {
        mediaUrl = url;
        mediaType = ct;
        if (ct.includes("pdf")) break;
      }
    }

    if (!mediaUrl) {
      await sendTwilioMessage(accountSid, authToken, from, fromNumber,
        `Please send your CV as a *PDF* file. Images and other formats aren't supported yet.`);
      return new NextResponse("<Response></Response>", {
        headers: { "Content-Type": "text/xml" },
      });
    }

    if (!mediaType?.includes("pdf")) {
      await sendTwilioMessage(accountSid, authToken, from, fromNumber,
        `We need a PDF file. Please send your CV as a PDF.`);
      return new NextResponse("<Response></Response>", {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Acknowledge receipt
    await sendTwilioMessage(accountSid, authToken, from, fromNumber,
      `📄 Got your CV. Analysing... (30–60 seconds)`);

    // Download media — Twilio requires Basic Auth
    const mediaRes = await fetch(mediaUrl, {
      headers: {
        Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
      },
    });
    if (!mediaRes.ok) {
      console.error("[whatsapp] Failed to download media:", mediaRes.status);
      await sendTwilioMessage(accountSid, authToken, from, fromNumber,
        `Couldn't download your file. Please try again.`);
      return new NextResponse("<Response></Response>", {
        headers: { "Content-Type": "text/xml" },
      });
    }

    const buffer = await mediaRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const goal = (body?.trim() && body.length > 10) ? body.trim() : DEFAULT_GOAL;

    // Call extract API (uses Anthropic + base64 PDF)
    const extractRes = await fetch(`${appUrl}/api/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base64,
        goal,
        filename: "cv.pdf",
      }),
    });

    if (!extractRes.ok) {
      const err = await extractRes.text();
      console.error("[whatsapp] Extract failed:", err);
      await sendTwilioMessage(accountSid, authToken, from, fromNumber,
        `Analysis failed. Please try again or use the web: ${appUrl}/analyse`);
      return new NextResponse("<Response></Response>", {
        headers: { "Content-Type": "text/xml" },
      });
    }

    const analysis = await extractRes.json();
    const archLabel = ARCHETYPE_LABELS[analysis.archetype] || analysis.archetype || "Builder";
    const stage = analysis.stageBucket || "—";
    const summary = analysis.summary?.slice(0, 120) || analysis.experience?.slice(0, 120) || "Your profile has been analysed.";
    const founderHeadline = analysis.founderView?.headline;
    const salaryBand = analysis.recruiterView?.salaryBand;

    let reply = `✅ *Your CV read*

*Archetype:* ${archLabel}
*Stage:* ${stage}
${salaryBand ? `*Salary band:* ${salaryBand}\n` : ""}${founderHeadline ? `*Founder view:* "${founderHeadline.slice(0, 80)}${founderHeadline.length > 80 ? "…" : ""}"\n\n` : "\n"}
🔗 *Full analysis* (founder + recruiter views, roadmap):
${appUrl}/analyse

Reply with your *email* to save your profile and join the pool.`;

    await sendTwilioMessage(accountSid, authToken, from, fromNumber, reply);

    return new NextResponse("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (err) {
    console.error("[whatsapp] Error:", err);
    return new NextResponse("Internal error", { status: 500 });
  }
}

async function sendTwilioMessage(
  accountSid: string,
  authToken: string,
  to: string,
  from: string,
  body: string
) {
  const params = new URLSearchParams();
  params.set("To", to);
  params.set("From", from);
  params.set("Body", body);

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
      },
      body: params.toString(),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Twilio send failed: ${err}`);
  }
}
