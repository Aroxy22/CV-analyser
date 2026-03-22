import Link from "next/link";
import { CSSProperties } from "react";

export default function AppFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid #e8e2da",
        padding: "18px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 10,
        background: "#f5f2ee",
      }}
    >
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <Link href="/jobs" style={linkStyle}>Browse Jobs</Link>
        <Link href="/founders" style={linkStyle}>For Founders</Link>
        <Link href="/seed" style={linkStyle}>The Seed</Link>
        <Link href="/pricing" style={linkStyle}>Pricing</Link>
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "14155238886"}?text=Hi%2C%20I%27d%20like%20to%20get%20my%20CV%20analysed`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...linkStyle, display: "inline-flex", alignItems: "center", gap: 6, color: "#25D366", fontWeight: 600 }}
        >
          <span>💬</span> Drop CV on WhatsApp
        </a>
      </div>
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#b0a8a0" }}>
        © 2026 JoinStartup.app
      </div>
    </footer>
  );
}

const linkStyle: CSSProperties = {
  fontSize: 12,
  color: "#9a9088",
  textDecoration: "none",
};
