"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, Calendar } from "lucide-react";
import { ImageSequence } from "@/components/sites/ImageSequence";
import { Scene, SceneText } from "@/components/sites/Scene";

// Agency hero Kling-frames — 10-sec orbit-met-zoom dolly door workspace
// naar close-up van laptop scherm. 241 frames @ 24fps premium.
const AGENCY_HERO_FRAMES = Array.from(
  { length: 241 },
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
          {/* Agency hero Kling dolly — speelt over de hele hero-scroll heen */}
          <ImageSequence
            frames={AGENCY_HERO_FRAMES}
            scrollContainerRef={
              containerRef as React.RefObject<HTMLElement | null>
            }
            fit="cover"
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

          {/* Geen pinned-scroll scene 2 meer — verticals showcase is nu
              een normale flowing sectie op page.tsx ná de hero. Zinvoller
              scroll-real-estate. */}
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
