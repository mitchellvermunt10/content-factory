import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Content Factory — Studio Vermunt",
    template: "%s — AI Content Factory",
  },
  description:
    "Volledige campagnes voor lokale ondernemers, gegenereerd in minuten. Landing pages, advertenties, social en meer — door Studio Vermunt.",
  metadataBase: new URL("https://contentfactory.studio-vermunt.nl"),
  openGraph: {
    title: "AI Content Factory — Studio Vermunt",
    description:
      "Volledige campagnes voor lokale ondernemers, gegenereerd in minuten.",
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
      className={`${GeistSans.variable} ${GeistMono.variable}`}
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
