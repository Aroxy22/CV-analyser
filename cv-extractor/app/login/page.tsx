"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { USER_ROLE_COOKIE, getRoleFromMetadata } from "@/lib/user-role";

const MOCK_ARCHETYPES = [
  { emoji: "🔥", label: "Zero-to-One", color: "#ff4d00" },
  { emoji: "📈", label: "Growth Hacker", color: "#10b981" },
  { emoji: "🎯", label: "Product Intuitive", color: "#ec4899" },
];

function LoginInner() {
  const params = useSearchParams();
  const mode = params.get("mode") === "signup" ? "signup" : "login";
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hoveredArchetype, setHoveredArchetype] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const title = useMemo(
    () => (mode === "signup" ? "Create your account" : "Welcome back"),
    [mode],
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error: signUpError } = await authClient.auth.signUp({
          email,
          password,
          options: {
            data: { role: "user" },
          },
        });
        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await authClient.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
      const { data } = await authClient.auth.getUser();
      const resolvedRole = getRoleFromMetadata(data.user?.user_metadata);
      document.cookie = `${USER_ROLE_COOKIE}=${resolvedRole}; path=/; max-age=2592000; samesite=lax`;
      if (mode === "signup") {
        router.push("/analyse?from=signup");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="auth-split"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(165deg, #f5f2ee 0%, #f0ebe4 50%, #f5f2ee 100%)",
        color: "#1a1a1a",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        alignItems: "stretch",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        .auth-fade { opacity: 0; transform: translateY(12px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .auth-fade.in { opacity: 1; transform: translateY(0); }
        .auth-input { transition: border-color 0.2s, box-shadow 0.2s; }
        .auth-input:focus { outline: none; border-color: #ff4d00 !important; box-shadow: 0 0 0 3px rgba(255,77,0,0.12); }
        .archetype-pill { transition: transform 0.2s, box-shadow 0.2s; }
        .archetype-pill:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
        @media (max-width: 900px) {
          .auth-split { grid-template-columns: 1fr !important; }
          .auth-left { min-height: 280px; padding: 40px 24px !important; }
          .auth-right { padding: 32px 24px !important; }
        }
      `}</style>

      {/* Left panel — product identity & CV visual */}
      <div
        className="auth-left"
        style={{
          padding: "48px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: 400,
            height: 400,
            background: "radial-gradient(circle, rgba(255,77,0,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "-5%",
            width: 300,
            height: 300,
            background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          className={`auth-fade ${mounted ? "in" : ""}`}
          style={{ position: "relative", zIndex: 1 }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "#9a9088",
              letterSpacing: 1.5,
              textDecoration: "none",
              marginBottom: 40,
            }}
          >
            <span style={{ color: "#ff4d00" }}>◆</span> JOINSTARTUP
          </Link>

          <h1
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 400,
              letterSpacing: -1.5,
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Same CV.<br />
            <span style={{ color: "#ff4d00", fontStyle: "italic" }}>Three reads.</span>
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "#6b6460",
              lineHeight: 1.7,
              marginBottom: 36,
              maxWidth: 360,
            }}
          >
            Parse your profile. Get your archetype, fit score, and see how founders and recruiters read you.
          </p>

          {/* Mock analysis card */}
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #e8e2da",
              borderRadius: 14,
              padding: 20,
              maxWidth: 320,
              boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 9,
                color: "#9a9088",
                letterSpacing: 2,
                marginBottom: 12,
              }}
            >
              SAMPLE ANALYSIS
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #ff4d00 0%, #ff7a33 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                📄
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Your profile</div>
                <div style={{ fontSize: 11, color: "#9a9088" }}>Archetype · Fit · Stage</div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {MOCK_ARCHETYPES.map((a, i) => (
                <div
                  key={a.label}
                  className="archetype-pill"
                  onMouseEnter={() => setHoveredArchetype(i)}
                  onMouseLeave={() => setHoveredArchetype(null)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    background: hoveredArchetype === i ? a.color : "#f5f2ee",
                    color: hoveredArchetype === i ? "#fff" : "#4a4540",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "default",
                    border: `1px solid ${hoveredArchetype === i ? a.color : "#e8e2da"}`,
                  }}
                >
                  {a.emoji} {a.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div
        className="auth-right"
        style={{
          padding: "48px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(20px)",
          borderLeft: "1px solid rgba(232,226,218,0.8)",
        }}
      >
        <div
          className={`auth-fade ${mounted ? "in" : ""}`}
          style={{ transitionDelay: "120ms", maxWidth: 400, margin: "0 auto", width: "100%" }}
        >
          {/* Mode toggle */}
          <div
            style={{
              display: "flex",
              gap: 4,
              background: "#f0ece6",
              padding: 4,
              borderRadius: 12,
              marginBottom: 28,
              border: "1px solid #e8e2da",
            }}
          >
            <button
              type="button"
              onClick={() => router.push("/login")}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 10,
                border: "none",
                background: mode === "login" ? "#fff" : "transparent",
                color: mode === "login" ? "#1a1a1a" : "#6b6460",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: mode === "login" ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.2s",
              }}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => router.push("/login?mode=signup")}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 10,
                border: "none",
                background: mode === "signup" ? "#fff" : "transparent",
                color: mode === "signup" ? "#1a1a1a" : "#6b6460",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: mode === "signup" ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.2s",
              }}
            >
              Sign up
            </button>
          </div>

          <h2
            style={{
              margin: 0,
              marginBottom: 8,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: -0.5,
            }}
          >
            {title}
          </h2>
          <p
            style={{
              margin: 0,
              marginBottom: 24,
              fontSize: 13,
              color: "#6b6460",
              lineHeight: 1.5,
            }}
          >
            {mode === "signup"
              ? "Get your CV analysed and discover your startup fit."
              : "Enter your credentials to continue."}
          </p>

          <form onSubmit={onSubmit}>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                color: "#9a9088",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              EMAIL
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="auth-input"
              style={{
                width: "100%",
                marginBottom: 18,
                padding: "14px 16px",
                borderRadius: 10,
                border: "1.5px solid #e0dbd4",
                fontSize: 15,
                background: "#fff",
              }}
            />

            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                color: "#9a9088",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              PASSWORD
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              minLength={6}
              required
              className="auth-input"
              style={{
                width: "100%",
                marginBottom: 20,
                padding: "14px 16px",
                borderRadius: 10,
                border: "1.5px solid #e0dbd4",
                fontSize: 15,
                background: "#fff",
              }}
            />

            {error && (
              <div
                style={{
                  fontSize: 13,
                  color: "#b42318",
                  background: "#fef3f2",
                  border: "1px solid #fecaca",
                  padding: "12px 14px",
                  borderRadius: 10,
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px 18px",
                border: "none",
                borderRadius: 10,
                background: loading ? "#e8e2da" : "#ff4d00",
                color: loading ? "#9a9088" : "#fff",
                fontWeight: 700,
                fontSize: 15,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                boxShadow: loading ? "none" : "0 2px 12px rgba(255,77,0,0.25)",
              }}
            >
              {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}
            </button>
          </form>

          {mode === "signup" && (
            <p
              style={{
                marginTop: 20,
                fontSize: 12,
                color: "#9a9088",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              By signing up, you agree to our{" "}
              <Link href="/" style={{ color: "#ff4d00", textDecoration: "none", fontWeight: 600 }}>
                terms
              </Link>{" "}
              and{" "}
              <Link href="/" style={{ color: "#ff4d00", textDecoration: "none", fontWeight: 600 }}>
                privacy policy
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#f5f2ee",
            display: "grid",
            placeItems: "center",
            fontFamily: "'DM Sans', system-ui, sans-serif",
          }}
        >
          Loading...
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
