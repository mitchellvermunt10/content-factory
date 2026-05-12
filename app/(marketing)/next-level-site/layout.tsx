import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const BASE =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://nextlevelsites.nl";

export const metadata: Metadata = {
  title: "Next Level Site — Cinematische website voor lokale ondernemers",
  description:
    "Een website die voelt als een korte film. Cinematische camera door je deur, scroll-driven storytelling, live binnen 2 weken. Voor restaurants, kapsalons, garages.",
  alternates: { canonical: `${BASE}/next-level-site` },
  openGraph: {
    title: "Next Level Site — Cinematische website voor lokale ondernemers",
    description:
      "Een website die voelt als een korte film. Live binnen 2 weken. €7.500 eenmalig.",
    type: "website",
    locale: "nl_NL",
    url: `${BASE}/next-level-site`,
  },
  robots: { index: true, follow: true },
};

export default function NextLevelSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={cormorant.variable}>{children}</div>;
}
