"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { UserRole, USER_ROLE_COOKIE, getRoleFromMetadata } from "@/lib/user-role";

type NavLink = { href: string; label: string };

const baseLinks: NavLink[] = [
  { href: "/analyse", label: "Analyse" },
  { href: "/jobs", label: "Jobs" },
  { href: "/founders", label: "Founders" },
  { href: "/pricing", label: "Pricing" },
];

function roleLinks(role: UserRole): NavLink[] {
  if (role === "admin") return [{ href: "/admin", label: "Admin" }];
  if (role === "founder") return [{ href: "/dashboard", label: "Founder Hub" }];
  return [{ href: "/dashboard", label: "My Dashboard" }];
}

export default function AppNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [role, setRole] = useState<UserRole>("candidate");
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    setMounted(true);

    async function loadSession() {
      // Fast path to avoid nav flicker on route changes.
      const cookieRole = document.cookie
        .split("; ")
        .find((x) => x.startsWith(`${USER_ROLE_COOKIE}=`))
        ?.split("=")[1];
      if (cookieRole && mounted) {
        setIsAuthed(true);
        if (cookieRole === "candidate" || cookieRole === "founder" || cookieRole === "admin") {
          setRole(cookieRole);
        }
      }

      const { data } = await authClient.auth.getUser();
      if (!mounted) return;
      const user = data.user;
      if (!user) {
        setIsAuthed(false);
        setRole("candidate");
        setLoading(false);
        return;
      }
      const resolvedRole = getRoleFromMetadata(user.user_metadata);
      document.cookie = `${USER_ROLE_COOKIE}=${resolvedRole}; path=/; max-age=2592000; samesite=lax`;
      setRole(resolvedRole);
      setIsAuthed(true);
      setLoading(false);
    }

    loadSession();
    const { data: listener } = authClient.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (!user) {
        setIsAuthed(false);
        setRole("candidate");
        document.cookie = `${USER_ROLE_COOKIE}=; path=/; max-age=0; samesite=lax`;
        return;
      }
      const resolvedRole = getRoleFromMetadata(user.user_metadata);
      setRole(resolvedRole);
      setIsAuthed(true);
      document.cookie = `${USER_ROLE_COOKIE}=${resolvedRole}; path=/; max-age=2592000; samesite=lax`;
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const links = [...baseLinks];

  async function handleLogout() {
    await authClient.auth.signOut();
    document.cookie = `${USER_ROLE_COOKIE}=; path=/; max-age=0; samesite=lax`;
    setIsAuthed(false);
    setMenuOpen(false);
    window.location.href = "/";
  }

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid #e8e2da", background: "rgba(245,242,238,0.95)", backdropFilter: "blur(12px)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, position: "relative" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#ff4d00" }}>◆</span>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: "#1a1a1a", letterSpacing: 0.9, fontWeight: 700 }}>JOINSTARTUP</span>
        </Link>

        <div className="app-nav-desktop" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22, position: "absolute", left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: 15,
                color: pathname === link.href ? "#1a1a1a" : "#6b6460",
                textDecoration: "none",
                fontWeight: pathname === link.href ? 700 : 600,
                borderBottom: pathname === link.href ? "2px solid #facc15" : "2px solid transparent",
                paddingBottom: 4,
                lineHeight: 1,
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative", marginLeft: "auto" }}>
          <Link href="/analyse" style={{ fontSize: 12, color: "#fff", background: "#ff4d00", textDecoration: "none", padding: "8px 12px", borderRadius: 6, fontWeight: 700 }}>
            Analyse Profile
          </Link>
          {mounted && !loading && !isAuthed && (
            <Link href="/login?mode=signup" style={{ fontSize: 12, color: "#fff", background: "#ff4d00", textDecoration: "none", padding: "8px 12px", borderRadius: 6, fontWeight: 700 }}>
              Sign up
            </Link>
          )}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            style={{ border: "1px solid #d7d0c8", borderRadius: 6, background: "#fff", padding: "8px 12px", fontSize: 12, fontWeight: 700, color: "#6b6460", cursor: "pointer" }}
          >
            Menu
          </button>

          {menuOpen && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, minWidth: 180, background: "#fff", border: "1px solid #e7e0d8", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", padding: 8 }}>
              {[
                { href: "/nominate", label: "Nominate" },
                { href: "/seed", label: "The Seed" },
                { href: "/dashboard", label: "My Dashboard" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: pathname === item.href ? "#1a1a1a" : "#444",
                    textDecoration: "none",
                    padding: "8px 10px",
                    borderRadius: 6,
                    background: pathname === item.href ? "#fffbe6" : "transparent",
                    fontWeight: pathname === item.href ? 700 : 500,
                  }}
                >
                  {item.label}
                </Link>
              ))}
              {mounted && !loading && !isAuthed && (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: pathname === "/login" ? "#1a1a1a" : "#444",
                    textDecoration: "none",
                    padding: "8px 10px",
                    borderRadius: 6,
                    background: pathname === "/login" ? "#fffbe6" : "transparent",
                    fontWeight: pathname === "/login" ? 700 : 500,
                  }}
                >
                  Log in
                </Link>
              )}
              {mounted && !loading && isAuthed && (
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: "none",
                    background: "transparent",
                    fontSize: 13,
                    color: "#b42318",
                    textDecoration: "none",
                    padding: "8px 10px",
                    borderRadius: 6,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Log out
                </button>
              )}
              {mounted && !loading && isAuthed && role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  style={{ display: "block", fontSize: 13, color: pathname === "/admin" ? "#1a1a1a" : "#444", textDecoration: "none", padding: "8px 10px", borderRadius: 6, background: pathname === "/admin" ? "#fffbe6" : "transparent", fontWeight: pathname === "/admin" ? 700 : 500 }}
                >
                  Admin
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
