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
  const [role, setRole] = useState<UserRole>("candidate");
  const [email, setEmail] = useState<string>("");

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
      ? "Admin workspace: monitor platform, jobs, and quality."
      : role === "founder"
        ? "Founder workspace: post roles, discover builders, and shortlist."
        : "Candidate workspace: run analyses, track fit, and manage profile.";

  if (loading) {
    return <div style={{ minHeight: "100vh", background: "#f5f2ee", display: "grid", placeItems: "center" }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f2ee", color: "#1a1a1a", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <AppNav />
      <main style={{ maxWidth: 980, margin: "0 auto", padding: "28px 18px 56px" }}>
        <div style={{ background: "#fff", border: "1px solid #e8e2da", borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9088", marginBottom: 8 }}>
            ROLE-BASED DASHBOARD
          </div>
          <h1 style={{ margin: 0, marginBottom: 8, fontSize: 30 }}>Hello, {role}</h1>
          <p style={{ margin: 0, color: "#6b6460" }}>{roleText}</p>
          <p style={{ marginTop: 8, marginBottom: 0, fontSize: 13, color: "#9a9088" }}>
            Signed in as {email}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          <Link href="/analyse" style={cardStyle}>Run CV analysis</Link>
          <Link href="/jobs" style={cardStyle}>Browse jobs</Link>
          <Link href="/profile/access" style={cardStyle}>Profile access</Link>
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
