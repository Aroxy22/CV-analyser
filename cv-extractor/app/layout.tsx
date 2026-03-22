import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import AppFooter from "@/components/AppFooter";

export const metadata: Metadata = {
  title: "JoinStartup — Find your archetype. Fit. Become one.",
  description: "Know your startup fit. Get your builder archetype, gap analysis, and live opportunities matched to where you are and where you're going.",
   // ── ADD FROM HERE ──
  openGraph: {
    title: "JoinStartup — same person. three different reads.",
    description: "Drop your CV, GitHub, LinkedIn or portfolio. See how AI, founders and recruiters read you differently.",
    url: "https://joinstartup.app",
    siteName: "JoinStartup",
    images: [{ url: "https://joinstartup.app/api/og", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JoinStartup — same person. three different reads.",
    description: "Drop your profile. See how founders, recruiters and AI read you differently.",
    images: ["https://joinstartup.app/api/og"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500;600&family=DM+Sans:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      
      </head>
      <body>
        {children}
        <AppFooter />
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
