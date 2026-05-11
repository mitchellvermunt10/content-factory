import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  robots: {
    // Voorlopig niet indexeren — demo-cases zijn voor prospects, niet voor Google.
    // In Phase 5 (echte klanten) zetten we dit per-slug aan.
    index: false,
    follow: false,
  },
};

export default function SitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={cormorant.variable}>{children}</div>;
}
