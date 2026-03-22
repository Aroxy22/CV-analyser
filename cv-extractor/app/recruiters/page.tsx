"use client";

import { useMemo, useRef, useState } from "react";
import AppNav from "@/components/AppNav";

type CvItem = {
  id: string;
  fileName: string;
  archetype?: string;
  seniority?: string;
  salaryBand?: string;
  status: "processing" | "done" | "error";
  error?: string;
};

export default function RecruitersPage() {
  const [rolePrompt, setRolePrompt] = useState("");
  const [items, setItems] = useState<CvItem[]>([]);
  const [mail, setMail] = useState("");
  const [mailSent, setMailSent] = useState(false);
  const [batchError, setBatchError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const processed = useMemo(() => items.filter((x) => x.status === "done" || x.status === "error").length, [items]);
  const hasItems = items.length > 0;

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  async function processSingle(file: File, id: string) {
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64,
          filename: file.name,
          goal: rolePrompt?.trim() || "Screen this CV for startup roles and recruiter fit.",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setItems((prev) =>
        prev.map((x) =>
          x.id === id
            ? {
                ...x,
                status: "done",
                archetype: (data.archetype || "n/a").toString(),
                seniority: (data.recruiterView?.seniorityLabel || "n/a").toString(),
                salaryBand: (data.recruiterView?.salaryBand || "n/a").toString(),
              }
            : x,
        ),
      );
    } catch (err: unknown) {
      setBatchError("Analysis failed for one or more CVs. Add GROQ_API_KEY (or SARVAM_API_KEY) and retry.");
      setItems((prev) =>
        prev.map((x) =>
          x.id === id
            ? {
                ...x,
                status: "error",
                error: err instanceof Error ? err.message : "Failed",
              }
            : x,
        ),
      );
    }
  }

  async function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    setBatchError("");
    const files = Array.from(fileList).filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (!files.length) return;

    const next: CvItem[] = files.slice(0, 200).map((f) => ({
      id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
      fileName: f.name.replace(/\.pdf$/i, ""),
      status: "processing",
    }));

    setItems(next);
    await Promise.all(next.map((item, idx) => processSingle(files[idx], item.id)));
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  }

  function downloadCsv() {
    const rows = [
      ["file_name", "archetype", "seniority", "salary_band", "status"],
      ...items.map((x) => [x.fileName, x.archetype, x.seniority, x.salaryBand, x.status]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recruiter-shortlist.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f2ee", color: "#1a1a1a", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
      `}</style>
      <AppNav />
      <main style={{ maxWidth: 940, margin: "0 auto", padding: "50px 18px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9088", letterSpacing: 2, marginBottom: 8 }}>
            FOR RECRUITERS
          </div>
          <h1 style={{ margin: 0, fontFamily: "'Instrument Serif',serif", fontWeight: 400, fontSize: "clamp(34px,5vw,62px)", lineHeight: 1.03, letterSpacing: -1.5 }}>
            Drop 200 CVs.
            <span style={{ color: "#ec4899", fontStyle: "italic" }}> Get a ranked shortlist.</span>
          </h1>
        </div>

        <p style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 20px", fontSize: 14, color: "#6b6460", lineHeight: 1.7 }}>
          Every CV gets archetype classification, stage fit, seniority label, and salary band.
          Results appear inline as they process. Download CSV or email yourself the shortlist.
        </p>

        <div style={{ maxWidth: 780, margin: "0 auto 20px" }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 1.2, marginBottom: 6 }}>
            WHAT ROLE ARE YOU SCREENING FOR?
          </div>
          <input
            value={rolePrompt}
            onChange={(e) => setRolePrompt(e.target.value)}
            placeholder="e.g. Founding engineer, seed stage fintech, UPI experience, Bangalore — equity ok"
            style={{
              width: "100%",
              padding: "12px 14px",
              background: "#fff",
              border: "1.5px solid #e3dcd4",
              borderRadius: 10,
              color: "#1a1a1a",
              fontSize: 13,
              outline: "none",
            }}
          />
          <div style={{ fontSize: 10, color: "#c0b8b0", marginTop: 6 }}>
            Optional, but recommended - each CV will be scored against this role
          </div>
        </div>
        {batchError && (
          <div style={{ maxWidth: 780, margin: "0 auto 12px", background: "#fff3cd", border: "1px solid #fde68a", color: "#92400e", borderRadius: 8, padding: "8px 10px", fontSize: 12 }}>
            {batchError}
          </div>
        )}

        {!hasItems && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              maxWidth: 780,
              margin: "0 auto 20px",
              background: "#fff",
              border: "2px dashed #e3dcd4",
              borderRadius: 14,
              padding: "44px 22px",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              style={{ display: "none" }}
              onChange={(e) => addFiles(e.target.files)}
            />
            <div style={{ fontSize: 30, marginBottom: 8 }}>📁</div>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8, fontFamily: "'Instrument Serif',serif" }}>
              Drop up to 200 CVs here
            </div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9088", letterSpacing: 1.5 }}>
              PDF ONLY · SELECT MULTIPLE · OR CLICK TO BROWSE
            </div>
          </div>
        )}

        {hasItems && (
          <div style={{ maxWidth: 780, margin: "0 auto 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9088" }}>
                {processed}/{items.length} PROCESSED
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    setItems([]);
                    setMailSent(false);
                    setMail("");
                    inputRef.current?.click();
                  }}
                  style={{ border: "1px solid #e3dcd4", background: "#fff", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#6b6460", cursor: "pointer" }}
                >
                  ← New batch
                </button>
                <button
                  onClick={downloadCsv}
                  style={{ border: "none", background: "#ec4899", borderRadius: 8, padding: "8px 14px", fontSize: 12, color: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  Download CSV
                </button>
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e8e2da", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: "1px solid #f3ece5" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 999, background: item.status === "done" ? "#10b981" : item.status === "error" ? "#ef4444" : "#c0b8b0", display: "inline-block" }} />
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{item.fileName.toUpperCase()}</span>
                    {item.archetype && <span style={{ fontSize: 10, border: "1px solid #d9f3e9", background: "#f0fdf8", color: "#10b981", borderRadius: 999, padding: "2px 6px" }}>{item.archetype}</span>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>
                      {item.status === "done" ? item.seniority : item.status === "error" ? "Failed" : "Processing..."}
                    </div>
                    <div style={{ fontSize: 11, color: "#9a9088" }}>{item.status === "done" ? item.salaryBand : item.status === "error" ? item.error : "Calculating..."}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: "#111", borderRadius: 12, padding: "12px", border: "1px solid #252525" }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#777", letterSpacing: 1.2, marginBottom: 8 }}>
                EMAIL ME THIS SHORTLIST
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={mail}
                  onChange={(e) => setMail(e.target.value)}
                  placeholder="your@email.com"
                  style={{ flex: 1, background: "#0b0b0b", border: "1px solid #2d2d2d", borderRadius: 8, color: "#fff", padding: "10px 12px", fontSize: 13, outline: "none" }}
                />
                <button
                  onClick={() => setMailSent(Boolean(mail))}
                  style={{ border: "none", background: "#ec4899", borderRadius: 8, padding: "10px 14px", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  Email →
                </button>
              </div>
              {mailSent && <div style={{ marginTop: 8, fontSize: 11, color: "#10b981" }}>Shortlist sent.</div>}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
