"use client";

import { useState, Suspense, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

function AccessInner() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "notfound" | "error">("idle");

  useEffect(() => {
    authClient.auth.getUser().then(({ data }) => {
      if (data.user?.email && !email) setEmail(data.user.email);
    });
  }, []);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setStatus("loading");

    try {
      const res = await fetch(
        "https://xsbsoevqqvnxmtxuytiu.supabase.co/functions/v1/send-profile-email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), resend_type: "access" }),
        }
      );

      const data = await res.json();

      if (res.status === 404 || data.error === "Could not resolve profile token") {
        setStatus("notfound");
      } else if (data.ok === true) {
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f2ee",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      padding: "24px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
      `}</style>

      {/* Nav */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, borderBottom: "1px solid #e8e2da", padding: "14px 32px", display: "flex", alignItems: "center", gap: 8, background: "#f5f2ee" }}>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#ff4d00" }}>◆</span>
        <a href="/" style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 12, letterSpacing: 1, color: "#1a1a1a", textDecoration: "none" }}>JOINSTARTUP.APP</a>
      </div>

      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* Card */}
        <div style={{ background: "#fff", border: "1px solid #e8e2da", borderRadius: 16, padding: "36px 32px" }}>

          {status === "sent" ? (
            /* Success state */
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>📬</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#10b981", letterSpacing: 2, marginBottom: 12 }}>EMAIL SENT</div>
              <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5, marginBottom: 8 }}>Check your inbox</h2>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7 }}>
                We&apos;ve sent your profile link to <strong>{email}</strong>. Check your inbox — it arrives in under a minute.
              </p>
              <button
                onClick={() => { setEmail(""); setStatus("idle"); }}
                style={{ marginTop: 24, fontSize: 12, fontFamily: "'DM Mono',monospace", color: "#9a9088", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                Try a different email
              </button>
            </div>

          ) : status === "notfound" ? (
            /* Not found state */
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>🔍</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#ff4d00", letterSpacing: 2, marginBottom: 12 }}>NOT FOUND</div>
              <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5, marginBottom: 8 }}>No paid profile found</h2>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7 }}>
                We couldn&apos;t find a builder profile for <strong>{email}</strong>. You need to complete the analysis and join the pool first.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
                <a href="/analyse" style={{ display: "block", textAlign: "center", padding: "12px", background: "#ff4d00", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                  Analyse my profile →
                </a>
                <button
                  onClick={() => { setEmail(""); setStatus("idle"); }}
                  style={{ fontSize: 12, fontFamily: "'DM Mono',monospace", color: "#9a9088", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                  Try a different email
                </button>
              </div>
            </div>

          ) : (
            /* Default / input state */
            <>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9088", letterSpacing: 2, marginBottom: 16 }}>GET YOUR PROFILE LINK</div>
              <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5, marginBottom: 8, lineHeight: 1.2 }}>
                Find your<br />builder profile
              </h1>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, marginBottom: 28 }}>
                Enter the email you used when you joined the pool. We&apos;ll resend your profile link instantly.
              </p>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#9a9088", letterSpacing: 1, marginBottom: 8 }}>
                  YOUR EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  placeholder="you@email.com"
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    border: "1.5px solid #e8e2da",
                    borderRadius: 10,
                    fontSize: 14,
                    fontFamily: "'DM Sans',sans-serif",
                    color: "#1a1a1a",
                    background: "#f5f2ee",
                    outline: "none",
                    transition: "border-color .15s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#ff4d00")}
                  onBlur={e => (e.target.style.borderColor = "#e8e2da")}
                />
              </div>

              {status === "error" && (
                <div style={{ padding: "10px 14px", background: "#ff4d000e", border: "1px solid #ff4d0025", borderRadius: 8, fontSize: 12, color: "#ff4d00", fontFamily: "'DM Mono',monospace", marginBottom: 12 }}>
                  Something went wrong — please try again.
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={status === "loading" || !email.trim()}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: status === "loading" || !email.trim() ? "#f0ebe4" : "#ff4d00",
                  color: status === "loading" || !email.trim() ? "#b0a8a0" : "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: status === "loading" || !email.trim() ? "not-allowed" : "pointer",
                  transition: "all .2s",
                  fontFamily: "'DM Sans',sans-serif",
                }}>
                {status === "loading" ? "Sending…" : "Send my profile link →"}
              </button>

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #f0ebe4", textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "#9a9088", marginBottom: 8 }}>Don&apos;t have a profile yet?</p>
                <a href="/analyse" style={{ fontSize: 13, color: "#ff4d00", textDecoration: "none", fontWeight: 700 }}>
                  Analyse my profile →
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfileAccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#f5f2ee", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "monospace", fontSize: 12, color: "#9a9088" }}>Loading…</div>
      </div>
    }>
      <AccessInner />
    </Suspense>
  );
}
