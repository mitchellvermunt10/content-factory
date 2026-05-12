"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, Calendar } from "lucide-react";
import { ImageSequence } from "@/components/sites/ImageSequence";
import {
  CinematicCanvas,
  type CinematicShot,
} from "@/components/sites/CinematicCanvas";
import { Scene, SceneText } from "@/components/sites/Scene";
import { SmoothScrollProvider } from "@/components/sites/SmoothScrollProvider";

// Trattoria Kling dolly frames — onze échte werk als hero showcase
const TRATTORIA_FRAMES = Array.from(
  { length: 121 },
  (_, i) =>
    `/sites/italian-restaurant/intro/frames/frame_${String(i + 1).padStart(4, "0")}.jpg`
);

// Vertical-showcase shots na de dolly — Ken Burns over concept renders
const VERTICAL_SHOTS: CinematicShot[] = [
  {
    imageUrl: "/sites/concepts/salon.jpg",
    startProgress: 0.32,
    endProgress: 0.58,
    scale: { from: 1.15, to: 1.0 },
    offsetY: { from: 0.02, to: -0.02 },
    warmth: { from: 0.08, to: 0.18 },
    brightness: { from: 0.95, to: 1.0 },
    vignette: { from: 0.18, to: 0.08 },
  },
  {
    imageUrl: "/sites/concepts/garage.jpg",
    startProgress: 0.55,
    endProgress: 0.8,
    scale: { from: 1.12, to: 1.0 },
    warmth: { from: -0.05, to: 0.05 },
    brightness: { from: 0.92, to: 1.0 },
    vignette: { from: 0.2, to: 0.1 },
  },
  {
    imageUrl: "/sites/concepts/tandarts.jpg",
    startProgress: 0.77,
    endProgress: 1.0,
    scale: { from: 1.08, to: 1.0 },
    warmth: { from: 0.05, to: 0.12 },
    brightness: { from: 0.95, to: 1.0 },
    vignette: { from: 0.12, to: 0.22 },
  },
];

/**
 * Cinematic scroll-driven hero voor de agency homepage.
 *
 * Architectuur identiek aan /sites/[slug] SiteExperience maar dan gericht
 * op een agency-pitch over meerdere verticals:
 * 1. Scene 1 (0-28% scroll): Trattoria Kling dolly speelt af — onze échte work
 * 2. Scene 2-4 (32-100%): Crossfade Ken Burns door salon/garage/tandarts
 *    concepts — de breedte van wat we maken
 *
 * Na deze ~5vh van cinematic experience volgt normale homepage-content.
 */
export function AgencyHeroExperience() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <SmoothScrollProvider>
      <div ref={containerRef} className="relative bg-black text-white">
        {/* Pinned cinematic background — sticky tijdens scroll over de hero */}
        <div
          className="pointer-events-none sticky top-0 z-0 h-screen w-full"
          aria-hidden="true"
        >
          {/* Verticals Ken Burns onderaan — komt op vanaf 32% */}
          <CinematicCanvas
            shots={VERTICAL_SHOTS}
            scrollContainerRef={
              containerRef as React.RefObject<HTMLElement | null>
            }
            fadeOverlap={0.08}
            className="absolute inset-0 h-full w-full"
          />
          {/* Trattoria dolly bovenop — speelt 0-28%, fade-out 26-36% */}
          <ImageSequence
            frames={TRATTORIA_FRAMES}
            scrollContainerRef={
              containerRef as React.RefObject<HTMLElement | null>
            }
            fit="cover"
            progressRange={{ from: 0, to: 0.28 }}
            fadeOutAfter={{ from: 0.26, to: 0.36 }}
            className="absolute inset-0 h-full w-full"
          />
          {/* Vignette voor tekst-leesbaarheid */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-black/70" />
        </div>

        {/* Scenes — overlay content boven de pinned canvas */}
        <div className="relative z-10 -mt-[100vh]">
          {/* Scene 1 — Hero pitch + CTAs */}
          <Scene vhMultiplier={1.8}>
            <SceneText
              enterStart={0.0}
              enterEnd={0.18}
              exitStart={0.92}
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
                  Bekijk de Trattoria-case
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

          {/* Scene 2 — Voor kapsalons */}
          <Scene vhMultiplier={1.3}>
            <SceneText
              enterStart={0.0}
              enterEnd={0.2}
              exitStart={0.88}
              exitEnd={1.0}
              travel={40}
              className="px-6 text-center"
            >
              <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/55">
                Voor kapsalons
              </p>
              <h2 className="mt-5 font-serif text-4xl font-light leading-tight tracking-tight md:text-6xl">
                Je vakwerk
                <br />
                <span className="text-white/70">als merk.</span>
              </h2>
            </SceneText>
          </Scene>

          {/* Scene 3 — Voor autobedrijven */}
          <Scene vhMultiplier={1.3}>
            <SceneText
              enterStart={0.0}
              enterEnd={0.2}
              exitStart={0.88}
              exitEnd={1.0}
              travel={40}
              className="px-6 text-center"
            >
              <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/55">
                Voor autobedrijven
              </p>
              <h2 className="mt-5 font-serif text-4xl font-light leading-tight tracking-tight md:text-6xl">
                Vakmanschap dat
                <br />
                <span className="text-white/70">vertrouwen wekt.</span>
              </h2>
            </SceneText>
          </Scene>

          {/* Scene 4 — Voor tandartspraktijken */}
          <Scene vhMultiplier={1.3}>
            <SceneText
              enterStart={0.0}
              enterEnd={0.2}
              exitStart={0.88}
              exitEnd={1.0}
              travel={40}
              className="px-6 text-center"
            >
              <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/55">
                Voor tandartspraktijken
              </p>
              <h2 className="mt-5 font-serif text-4xl font-light leading-tight tracking-tight md:text-6xl">
                Rust voor de
                <br />
                <span className="text-white/70">eerste afspraak.</span>
              </h2>
            </SceneText>
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
    </SmoothScrollProvider>
  );
}
