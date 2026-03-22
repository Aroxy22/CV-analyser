"use client";

import { CSSProperties, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppNav from "@/components/AppNav";
import { authClient } from "@/lib/auth-client";
import { UserRole, USER_ROLE_COOKIE, getRoleFromMetadata } from "@/lib/user-role";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>("user");
  const [email, setEmail] = useState<string>("");
  const [profileToken, setProfileToken] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await authClient.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }
      const userRole = getRoleFromMetadata(data.user.user_metadata);
      setRole(userRole);
      setEmail(data.user.email || "");
      document.cookie = `${USER_ROLE_COOKIE}=${userRole}; path=/; max-age=2592000; samesite=lax`;
      const session = await authClient.auth.getSession();
      const token = session.data.session?.access_token;
      if (token) {
        const res = await fetch("/api/me/profile", { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        if (json.hasProfile && json.profileToken) setProfileToken(json.profileToken);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function logout() {
    await authClient.auth.signOut();
    document.cookie = `${USER_ROLE_COOKIE}=; path=/; max-age=0; samesite=lax`;
    router.push("/");
  }

  const roleText =
    role === "admin"
      ? "Admin: monitor platform quality and jobs."
      : role === "founder"
        ? "Post roles, discover builders, and shortlist."
        : "Run CV analyses, save history, and track fit.";

  if (loading) {
    return <div style={{ minHeight: "100vh", background: "#f5f2ee", display: "grid", placeItems: "center" }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f2ee", color: "#1a1a1a", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />
      <main style={{ maxWidth: 980, margin: "0 auto", padding: "28px 18px 56px" }}>
        <div style={{ background: "#fff", border: "1px solid #e8e2da", borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9088", marginBottom: 8 }}>
            DASHBOARD
          </div>
          <h1 style={{ margin: 0, marginBottom: 8, fontSize: 30 }}>
            {role === "admin" ? "Admin" : role === "founder" ? "Founder hub" : "Your workspace"}
          </h1>
          <p style={{ margin: 0, color: "#6b6460" }}>{roleText}</p>
          <p style={{ marginTop: 8, marginBottom: 0, fontSize: 13, color: "#9a9088" }}>
            Signed in as {email}
          </p>
        </div>

        {!profileToken && (
          <div style={{ background: "linear-gradient(135deg, #fff8f5 0%, #f0fdf8 100%)", border: "1.5px solid #ff4d0025", borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#ff4d00", letterSpacing: 1.5, marginBottom: 8 }}>NEXT STEP</div>
            <h2 style={{ margin: 0, marginBottom: 8, fontSize: 18, fontWeight: 700 }}>Build your profile</h2>
            <p style={{ margin: 0, marginBottom: 14, fontSize: 13, color: "#6b6460", lineHeight: 1.6 }}>
              Run a free CV analysis to get your archetype, fit score, and founder/recruiter reads. Then join the pool to be found.
            </p>
            <Link href="/analyse" style={{ display: "inline-block", padding: "12px 24px", background: "#ff4d00", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
              Build my profile →
            </Link>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          <Link href="/analyse" style={cardStyle}>{profileToken ? "Run another analysis" : "Run CV analysis"}</Link>
          {profileToken && (
            <Link href={`/profile?token=${profileToken}`} style={{ ...cardStyle, borderColor: "#10b98140", background: "#f0fdf8" }}>View my profile</Link>
          )}
          <Link href="/profile/access" style={cardStyle}>{profileToken ? "Get profile link" : "Profile access"}</Link>
          <Link href="/jobs" style={cardStyle}>Browse jobs</Link>
          {(role === "founder" || role === "admin") && <Link href="/jobs/post" style={cardStyle}>Post a job</Link>}
          {role === "admin" && <Link href="/admin" style={cardStyle}>Open admin</Link>}
        </div>

        <button onClick={logout} style={{ marginTop: 18, border: "1px solid #d8d0c8", borderRadius: 8, background: "#fff", padding: "10px 14px", cursor: "pointer" }}>
          Log out
        </button>
      </main>
    </div>
  );
}

const cardStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #e8e2da",
  borderRadius: 12,
  padding: "14px 16px",
  textDecoration: "none",
  color: "#1a1a1a",
  fontWeight: 700,
};
