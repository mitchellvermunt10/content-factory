import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Cormorant_Garamond } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default:
      "Next Level Sites — Cinematische websites voor lokale ondernemers",
    template: "%s — Next Level Sites",
  },
  description:
    "Een website die voelt als een korte film. Cinematische camera door je deur, scroll-driven storytelling, live binnen 2 weken. Voor restaurants, kapsalons, garages en andere lokale zaken.",
  metadataBase: new URL("https://nextlevelsites.nl"),
  openGraph: {
    title:
      "Next Level Sites — Cinematische websites voor lokale ondernemers",
    description:
      "Een website die voelt als een korte film. Live binnen 2 weken. €7.500 eenmalig of €497 per maand.",
    type: "website",
    locale: "nl_NL",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="nl"
      className={`${GeistSans.variable} ${GeistMono.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-bg text-text font-sans antialiased">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "hsl(240 6% 10%)",
              border: "1px solid hsl(240 6% 16%)",
              color: "hsl(40 12% 96%)",
            },
          }}
        />
      </body>
    </html>
  );
}
