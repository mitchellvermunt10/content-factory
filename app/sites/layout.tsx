import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

// Robots-policy is per-slug via generateMetadata in app/sites/[slug]/page.tsx.
// Demo-cases (isDemo: true in data.ts) krijgen noindex. Echte klanten staan
// gewoon in Google.

export default function SitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={cormorant.variable}>{children}</div>;
}
