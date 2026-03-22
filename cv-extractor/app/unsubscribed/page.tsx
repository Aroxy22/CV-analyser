export default function UnsubscribedPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f5f2ee", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',system-ui,sans-serif", padding: 40 }}>
      <div style={{ textAlign: "center", maxWidth: 380 }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9088", letterSpacing: 2, marginBottom: 16 }}>◆ THE SEED</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a", marginBottom: 10 }}>You're unsubscribed.</div>
        <div style={{ fontSize: 14, color: "#6b6460", lineHeight: 1.7, marginBottom: 28 }}>No more emails from The Seed. Your analysis and builder profile are still active.</div>
        <a href="/analyse" style={{ padding: "12px 24px", background: "#ff4d00", color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Back to joinstartup.app →</a>
      </div>
    </div>
  );
}
