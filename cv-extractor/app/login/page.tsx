"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { UserRole, USER_ROLE_COOKIE } from "@/lib/user-role";

function LoginInner() {
  const params = useSearchParams();
  const mode = params.get("mode") === "signup" ? "signup" : "login";
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("candidate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
            data: { role },
          },
        });
        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await authClient.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        const { data } = await authClient.auth.getUser();
        const resolvedRole = (data.user?.user_metadata?.role as UserRole) || "candidate";
        document.cookie = `${USER_ROLE_COOKIE}=${resolvedRole}; path=/; max-age=2592000; samesite=lax`;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f2ee", color: "#1a1a1a", fontFamily: "'DM Sans', system-ui, sans-serif", display: "grid", placeItems: "center", padding: 16 }}>
      <form onSubmit={onSubmit} style={{ width: "100%", maxWidth: 420, background: "#fff", border: "1px solid #e8e2da", borderRadius: 14, padding: 24 }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9088", marginBottom: 8 }}>
          JOINSTARTUP AUTH
        </div>
        <h1 style={{ margin: 0, marginBottom: 18, fontSize: 28 }}>{title}</h1>

        <label style={{ fontSize: 12, color: "#6b6460" }}>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required style={{ width: "100%", marginTop: 6, marginBottom: 14, padding: "11px 12px", borderRadius: 8, border: "1px solid #d9d2ca", fontSize: 14 }} />

        <label style={{ fontSize: 12, color: "#6b6460" }}>Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={6} required style={{ width: "100%", marginTop: 6, marginBottom: 14, padding: "11px 12px", borderRadius: 8, border: "1px solid #d9d2ca", fontSize: 14 }} />

        {mode === "signup" && (
          <>
            <label style={{ fontSize: 12, color: "#6b6460" }}>I am signing up as</label>
            <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} style={{ width: "100%", marginTop: 6, marginBottom: 14, padding: "11px 12px", borderRadius: 8, border: "1px solid #d9d2ca", fontSize: 14 }}>
              <option value="candidate">Candidate</option>
              <option value="founder">Founder</option>
              <option value="admin">Admin</option>
            </select>
          </>
        )}

        {error && (
          <div style={{ fontSize: 12, color: "#b42318", background: "#fef3f2", border: "1px solid #fecaca", padding: "8px 10px", borderRadius: 8, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px 14px", border: "none", borderRadius: 8, background: "#ff4d00", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
          {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", background: "#f5f2ee", display: "grid", placeItems: "center" }}>
          Loading...
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
