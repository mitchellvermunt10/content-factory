import type { Metadata } from "next";
import { Hero } from "@/components/marketing/Hero";
import { Verticals } from "@/components/marketing/Verticals";
import { Deliverables } from "@/components/marketing/Deliverables";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Pricing } from "@/components/marketing/Pricing";
import { CTA } from "@/components/marketing/CTA";

const BASE =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://nextlevelsites.nl";

export const metadata: Metadata = {
  title: "AI Content Factory — Complete campagnes in minuten",
  description:
    "Onze tweede service: AI-gegenereerde marketingcampagnes voor lokale ondernemers. Landing pages, advertenties, social posts, email — alles in één run. Vanaf €750 per campagne.",
  alternates: { canonical: `${BASE}/ai-content-factory` },
  openGraph: {
    title: "AI Content Factory — Complete campagnes in minuten",
    description:
      "AI-gegenereerde marketingcampagnes voor lokale ondernemers. Vanaf €750.",
    type: "website",
    locale: "nl_NL",
    url: `${BASE}/ai-content-factory`,
  },
  robots: { index: true, follow: true },
};

export default function AIContentFactoryPage() {
  return (
    <>
      <Hero />
      <Verticals />
      <Deliverables />
      <HowItWorks />
      <Pricing />
      <CTA />
    </>
  );
}
