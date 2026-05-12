"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, Calendar } from "lucide-react";
import { ImageSequence } from "@/components/sites/ImageSequence";
import { Scene, SceneText } from "@/components/sites/Scene";

// Agency hero Kling-frames — cinematic dolly-in naar laptop met website,
// representeert wat WIJ maken voor de bezoeker (niet één specifieke klant).
const AGENCY_HERO_FRAMES = Array.from(
  { length: 121 },
  (_, i) =>
    `/sites/lifestyle/agency-hero/frames/frame_${String(i + 1).padStart(4, "0")}.jpg`
);

/**
 * Cinematic scroll-driven hero voor de agency homepage.
 *
 * 1. Scene 1 (0-50% scroll): Kling dolly-in toward a laptop showing a
 *    beautiful website — vertelt direct WAT we maken
 * 2. Scene 2 (50-100%): Verticals-showcase met bridging context —
 *    "Hetzelfde format voor elk vakgebied" + 3 concept-stills naast elkaar
 *
 * Na deze ~3.5vh van cinematic experience volgt normale homepage-content.
 */
export function AgencyHeroExperience() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={containerRef} className="relative bg-black text-white">
        {/* Pinned cinematic background — sticky tijdens scroll over de hero */}
        <div
          className="pointer-events-none sticky top-0 z-0 h-screen w-full"
          aria-hidden="true"
        >
          {/* Agency hero Kling dolly — speelt 0-45%, fade-out 42-55% naar pure black */}
          <ImageSequence
            frames={AGENCY_HERO_FRAMES}
            scrollContainerRef={
              containerRef as React.RefObject<HTMLElement | null>
            }
            fit="cover"
            progressRange={{ from: 0, to: 0.45 }}
            fadeOutAfter={{ from: 0.42, to: 0.55 }}
            className="absolute inset-0 h-full w-full"
          />
          {/* Vignette voor tekst-leesbaarheid */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-black/70" />
        </div>

        {/* Scenes — overlay content boven de pinned canvas */}
        <div className="relative z-10 -mt-[100vh]">
          {/* Scene 1 — Hero pitch + CTAs */}
          <Scene vhMultiplier={2.2}>
            <SceneText
              enterStart={0.0}
              enterEnd={0.15}
              exitStart={0.93}
              exitEnd={1.0}
              travel={48}
              className="px-6 text-center"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/55 sm:text-xs">
                Premium maatwerk · Voor lokale ondernemers
              </p>
              <h1 className="mt-6 font-serif text-5xl font-light leading-[0.95] tracking-tight sm:text-7xl md:text-8xl">
                De website die je
                <br />
                <span className="text-white/70">zaak verdient.</span>
              </h1>
              <p className="mx-auto mt-8 max-w-2xl text-pretty text-lg text-white/70 sm:text-xl">
                Premium maatwerk voor restaurants, kapsalons en lokale
                ondernemers die opvallen tussen de templated rest. Een website
                die klanten binnenbrengt — niet alleen mooi om naar te kijken.
              </p>

              <div className="mt-12 flex flex-wrap justify-center gap-3">
                <Link
                  href="/sites/trattoria-sole"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
                >
                  Bekijk een live voorbeeld
                  <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="mailto:mitchell@nextlevelsites.nl?subject=Proposal aanvraag Next Level Site"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  <Calendar className="size-4" />
                  Vraag een proposal aan
                </a>
              </div>

              <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
                Scroll om verder te kijken ↓
              </p>
            </SceneText>
          </Scene>

          {/* Scene 2 — Verticals showcase: één scene met 3 concepts + bridging copy */}
          <Scene vhMultiplier={2.2}>
            <div className="w-full px-6">
              <div className="mx-auto max-w-6xl">
                <SceneText
                  enterStart={0.0}
                  enterEnd={0.15}
                  exitStart={0.93}
                  exitEnd={1.0}
                  travel={40}
                  className="text-center"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/55">
                    Voor elke vakman
                  </p>
                  <h2 className="mt-5 font-serif text-4xl font-light leading-tight tracking-tight md:text-6xl">
                    Hetzelfde cinematic format.
                    <br />
                    <span className="text-white/70">Voor elke branche.</span>
                  </h2>
                  <p className="mx-auto mt-6 max-w-2xl text-base text-white/65 sm:text-lg">
                    Restaurants nu live. Kapsalons, autobedrijven en
                    tandartsen volgen — dezelfde scrolldriven ervaring, per
                    branche eigen scènes en sfeer.
                  </p>
                </SceneText>

                <SceneText
                  enterStart={0.15}
                  enterEnd={0.35}
                  exitStart={0.93}
                  exitEnd={1.0}
                  travel={32}
                  className="mt-12"
                >
                  <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                    {[
                      {
                        label: "Kapsalons",
                        image: "/sites/concepts/salon.jpg",
                        line: "Vakwerk als merk",
                      },
                      {
                        label: "Autobedrijven",
                        image: "/sites/concepts/garage.jpg",
                        line: "Vakmanschap dat vertrouwen wekt",
                      },
                      {
                        label: "Tandartspraktijken",
                        image: "/sites/concepts/tandarts.jpg",
                        line: "Rust voor de eerste afspraak",
                      },
                    ].map((v) => (
                      <div
                        key={v.label}
                        className="group relative overflow-hidden rounded-2xl border border-white/15 bg-black/40 backdrop-blur-md"
                      >
                        <div className="relative aspect-[4/5] overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={v.image}
                            alt={`Concept voor ${v.label}`}
                            className="h-full w-full scale-105 object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                          <div className="absolute left-3 top-3 rounded-full border border-white/25 bg-black/55 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.3em] text-white/75 backdrop-blur-md">
                            Concept
                          </div>
                          <div className="absolute inset-x-0 bottom-0 p-5">
                            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/55">
                              {v.label}
                            </p>
                            <p className="mt-2 font-serif text-xl leading-tight md:text-2xl">
                              {v.line}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </SceneText>
              </div>
            </div>
          </Scene>
        </div>

        {/* Stats-strip — transitie naar de rest van de pagina */}
        <div className="relative z-10 border-t border-white/10 bg-black px-6 py-12 sm:px-10">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
            {[
              { label: "Vanaf", value: "€3.500" },
              { label: "Levertijd", value: "1-2 weken" },
              { label: "Onderhoud", value: "vanaf €197" },
              { label: "Verticals", value: "Horeca, MKB" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
                  {stat.label}
                </p>
                <p className="mt-1 font-serif text-2xl">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
