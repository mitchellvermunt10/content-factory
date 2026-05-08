import { Hero } from "@/components/marketing/Hero";
import { Verticals } from "@/components/marketing/Verticals";
import { Deliverables } from "@/components/marketing/Deliverables";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Pricing } from "@/components/marketing/Pricing";
import { CTA } from "@/components/marketing/CTA";

export default function Home() {
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
