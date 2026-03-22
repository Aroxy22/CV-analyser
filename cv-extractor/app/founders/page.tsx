"use client";

import { useRef, useState } from "react";
import AppNav from "@/components/AppNav";

export default function FoundersPage() {
  const [mode, setMode] = useState<"brief" | "describe">("brief");
  const [briefName, setBriefName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    title?: string;
    archetype?: string;
    stage?: string;
    summary?: string;
  } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFilePicked = (file?: File) => {
    if (!file) return;
    setBriefName(file.name);
    setSelectedFile(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onFilePicked(e.dataTransfer.files?.[0]);
  };

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  async function runExtraction() {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        goal:
          mode === "describe"
            ? `Founder hiring brief: ${desc}`
            : "Founder job brief parsing: extract role intent, stage and archetype fit.",
      };
      if (mode === "brief" && selectedFile) {
        payload.filename = selectedFile.name;
        payload.base64 = await fileToBase64(selectedFile);
      }
      if (mode === "describe" && !desc.trim()) {
        throw new Error("Please describe the role first.");
      }
      if (mode === "brief" && !selectedFile) {
        throw new Error("Please upload a brief file first.");
      }
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");
      setResult({
        title: data.recruiterView?.topJDMatches?.[0] || "Role draft",
        archetype: data.archetype || "n/a",
        stage: data.stageBucket || "n/a",
        summary: data.summary || data.goalFit?.verdict || "Parsed successfully.",
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to process brief.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: "#f5f2ee", color: "#1a1a1a", fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .eyebrow{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;color:#b0a8a0;margin-bottom:12px}
        .accent{color:#ff4d00;font-style:italic}
        .chip{padding:7px 12px;border:1.5px solid #e0dbd4;border-radius:8px;background:#fff;color:#6b6460;font-size:12px;font-weight:600;cursor:pointer}
        .chip.on{border-color:#6366f1;color:#6366f1;background:#f5f5ff}
        .step{background:#fff;border:1px solid #e8e2da;border-radius:0;padding:18px 16px;position:relative}
        .step::before{content:'';position:absolute;top:0;left:0;bottom:0;width:2px;background:#6366f1;opacity:.5}
        @media(max-width:900px){.steps-grid{grid-template-columns:1fr !important}}
        @media(max-width:768px){.steps-grid{grid-template-columns:1fr !important}}
      `}</style>

      <AppNav />

      {/* Hero */}
      <section style={{ padding: "88px 24px 44px", maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
        <div className="eyebrow">For Founders</div>
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(52px,6vw,68px)", fontWeight: 400, letterSpacing: -1.7, lineHeight: 1.02, marginBottom: 14 }}>
          Find builders who<br /><span className="accent">actually ship.</span>
        </h1>
        <p style={{ fontSize: 14, color: "#6b6460", lineHeight: 1.75, maxWidth: 580, margin: "0 auto 26px" }}>
          Drop a job brief or describe the role - we'll extract it, match to archetypes, and post it to
          the builder pool in 30 seconds.
        </p>

        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 }}>
          <button className={`chip ${mode === "brief" ? "on" : ""}`} onClick={() => setMode("brief")}>Drop a brief</button>
          <button className={`chip ${mode === "describe" ? "on" : ""}`} onClick={() => setMode("describe")}>Describe the role</button>
        </div>

        {mode === "brief" ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            style={{ maxWidth: 540, margin: "0 auto", background: "#fff", border: "2px dashed #ddd4cb", borderRadius: 12, padding: "38px 18px", textAlign: "center", cursor: "pointer" }}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              style={{ display: "none" }}
              onChange={(e) => onFilePicked(e.target.files?.[0] || undefined)}
            />
            <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
            <div style={{ fontSize: 27, fontFamily: "'Instrument Serif',serif", marginBottom: 8 }}>
              {briefName ? `Selected: ${briefName}` : "Drop your job brief here"}
            </div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 1.4 }}>
              PDF · JD · DECK · OR CLICK TO BROWSE
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 540, margin: "0 auto", textAlign: "left" }}>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={5}
              placeholder="Describe the role, stage, salary/equity, must-have skills, and ideal archetype..."
              style={{ width: "100%", padding: "14px 16px", borderRadius: 10, border: "1.5px solid #ddd4cb", background: "#fff", color: "#1a1a1a", fontSize: 14, lineHeight: 1.6, resize: "vertical", outline: "none" }}
            />
          </div>
        )}
        <div style={{ marginTop: 12 }}>
          <button
            onClick={runExtraction}
            disabled={loading}
            style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}
          >
            {loading ? "Processing..." : "Process Brief →"}
          </button>
        </div>
        {error && <div style={{ marginTop: 10, fontSize: 12, color: "#b42318" }}>{error}</div>}
        {result && (
          <div style={{ marginTop: 10, background: "#fff", border: "1px solid #e8e2da", borderRadius: 10, padding: "10px 12px", textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{result.title}</div>
            <div style={{ fontSize: 12, color: "#6b6460", marginBottom: 4 }}>
              Archetype: {result.archetype} · Stage: {result.stage}
            </div>
            <div style={{ fontSize: 12, color: "#6b6460" }}>{result.summary}</div>
          </div>
        )}
      </section>

      <section style={{ padding: "6px 24px 70px", maxWidth: 1000, margin: "0 auto" }}>
        <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2 }}>
          {[
            { num: "01", title: "Drop your brief", body: "PDF, JD doc, or just describe the role in plain text. We extract title, stage, equity, salary, skills, and archetype fit." },
            { num: "02", title: "Review + post", body: "Edit any field before posting. Role goes to pending - approved within 2 hours and live in the builder pool." },
            { num: "03", title: "Builders find you", body: "Pool builders with matching archetypes get notified. Apply with Builder Profile - one click, no resume spam." },
          ].map((s, i) => (
            <div key={i} className="step">
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#6366f1", letterSpacing: 1, marginBottom: 9 }}>{s.num}</div>
              <h3 style={{ fontSize: 25, fontFamily: "'Instrument Serif',serif", fontWeight: 400, letterSpacing: -0.4, marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: "#6b6460", lineHeight: 1.7 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
