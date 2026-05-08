"use client";

import Link from "next/link";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import { Reveal, RevealStagger, RevealItem } from "@/components/motion/Reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tier = {
  id: string;
  badge?: string;
  highlight?: boolean;
  name: string;
  price: string;
  priceSuffix?: string;
  tagline: string;
  features: string[];
  cta: { label: string; href: string };
  footnote?: string;
};

const TIERS: Tier[] = [
  {
    id: "single",
    name: "Eenmalig",
    price: "€750",
    priceSuffix: "per campagne",
    tagline: "Eén complete campagne — landingspagina, ads, social, video.",
    features: [
      "8 deliverables in één run",
      "Cinematic video + voice-over",
      "JSON + MP4 export",
      "Klant-presentatie via /c/[id]",
      "1× revisie inbegrepen",
    ],
    cta: { label: "Start losse campagne", href: "/studio/nieuw" },
  },
  {
    id: "always-on",
    badge: "Meest gekozen",
    highlight: true,
    name: "Always-On",
    price: "€497",
    priceSuffix: "per maand",
    tagline: "Maandelijks verse content. Pauze wanneer je wilt.",
    features: [
      "4 campagne-refreshes per maand",
      "Brand Brain — onthoudt je merk",
      "Prioriteit support (binnen 24u)",
      "Onbeperkte revisies",
      "Maandelijks opzegbaar",
    ],
    cta: { label: "Start abonnement", href: "/studio/nieuw?plan=always-on" },
    footnote:
      "Founding-deal: eerste 3 abonnees krijgen €297/mnd levenslang vast.",
  },
  {
    id: "white-label",
    name: "White-label",
    price: "Op aanvraag",
    tagline: "Voor bureaus die onder eigen merk willen leveren.",
    features: [
      "Eigen domein + branding",
      "Wholesale-tarief vanaf 5 klanten",
      "Reseller-dashboard",
      "Co-marketing met Next Level Sites",
      "Onboarding-sessie inbegrepen",
    ],
    cta: { label: "Plan kennismaking", href: "mailto:mitchell@nextlevelsites.nl?subject=White-label%20interesse" },
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 md:py-36">
      <Reveal className="container">
        <div className="mb-14 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between md:mb-20">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
              04 · pricing
            </span>
            <h2 className="balance mt-3 max-w-2xl text-3xl font-medium tracking-tight md:text-5xl">
              <span className="text-gradient">
                Eén losse campagne, of een maand-abonnement.
              </span>
            </h2>
          </div>
          <p className="max-w-md text-text-muted md:text-lg">
            Begin klein. Schaal op als het werkt. Geen lock-in, geen jaarcontract.
          </p>
        </div>
      </Reveal>

      <div className="container">
        <RevealStagger
          className="grid gap-4 md:grid-cols-3"
          stagger={0.08}
        >
          {TIERS.map((tier) => (
            <RevealItem key={tier.id}>
              <div
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden rounded-2xl border p-8 transition-all duration-500 ease-expo-out",
                  tier.highlight
                    ? "border-accent/60 bg-gradient-to-b from-accent/5 to-surface/80 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]"
                    : "border-border bg-surface/50 hover:border-border-strong hover:bg-surface/90 hover:-translate-y-0.5"
                )}
              >
                {tier.badge ? (
                  <div className="absolute right-6 top-6">
                    <Badge variant="accent">
                      <Sparkles className="mr-1 size-3" />
                      {tier.badge}
                    </Badge>
                  </div>
                ) : null}

                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                    {tier.name}
                  </span>
                  <div className="mt-6 flex items-baseline gap-2">
                    <span
                      className={cn(
                        "text-4xl font-medium tracking-tight md:text-5xl",
                        tier.highlight ? "text-gradient-accent" : "text-text"
                      )}
                    >
                      {tier.price}
                    </span>
                    {tier.priceSuffix ? (
                      <span className="text-sm text-text-muted">
                        {tier.priceSuffix}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-text-muted pretty">
                    {tier.tagline}
                  </p>
                </div>

                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-text"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
                          tier.highlight
                            ? "bg-accent/20 text-accent"
                            : "bg-elevated text-text-muted"
                        )}
                      >
                        <Check className="size-3" strokeWidth={2.5} />
                      </span>
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  <Button
                    asChild
                    size="lg"
                    variant={tier.highlight ? "accent" : "ghost"}
                    className="w-full"
                  >
                    <Link href={tier.cta.href}>
                      {tier.cta.label}
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                  {tier.footnote ? (
                    <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-accent/80">
                      {tier.footnote}
                    </p>
                  ) : null}
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>

        <Reveal className="mx-auto mt-12 max-w-2xl text-center">
          <p className="text-sm text-text-subtle">
            Alle prijzen excl. btw. Always-On is maandelijks opzegbaar — geen
            opzegtermijn, geen kleine lettertjes.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
