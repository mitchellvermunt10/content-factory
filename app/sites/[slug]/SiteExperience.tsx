"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Phone } from "lucide-react";
import { SmoothScrollProvider } from "@/components/sites/SmoothScrollProvider";
import { ImageSequence } from "@/components/sites/ImageSequence";
import { Scene, SceneText } from "@/components/sites/Scene";
import type { NextLevelSiteData } from "@/lib/sites/types";

/**
 * De cinematic experience composer.
 *
 * Layout-trick: ÉÉN lange scroll-container (de <main>) bevat de pinned
 * image-sequence canvas EN alle scenes erbovenop. Scenes hebben zelf
 * hun sticky inhoud — de canvas zit erachter en pakt zijn progress
 * uit de totale main-container.
 */
export function SiteExperience({ data }: { data: NextLevelSiteData }) {
  const containerRef = useRef<HTMLElement>(null);

  return (
    <SmoothScrollProvider>
      <main ref={containerRef} className="relative bg-black text-white">
        {/* Pinned image-sequence achtergrond — sticky top:0 binnen container */}
        <div
          className="pointer-events-none sticky top-0 z-0 h-screen w-full"
          aria-hidden="true"
        >
          <ImageSequence
            frames={data.frames}
            scrollContainerRef={containerRef}
            fit="cover"
            className="relative h-full w-full"
          />
          {/* Vignette voor leesbaarheid van tekst over alle frames */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60" />
        </div>

        {/* Scenes — zitten boven de pinned canvas dankzij z-10 */}
        <div className="relative z-10 -mt-[100vh]">
          {/* Scene 1 — Intro: gevel + bedrijfsnaam */}
          <Scene vhMultiplier={2}>
            <SceneText
              enterAt={0.05}
              exitAt={0.7}
              className="px-6 text-center"
            >
              <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/60">
                {data.business.city} · {data.business.vertical}
              </p>
              <h1 className="mt-6 font-serif text-6xl font-light leading-[0.95] tracking-tight md:text-8xl">
                {data.business.name}
              </h1>
              <p className="mt-8 max-w-xl text-balance text-base text-white/70 md:text-lg">
                {data.business.tagline}
              </p>
            </SceneText>
          </Scene>

          {/* Scene 2 — Aankomst: je bent binnen */}
          <Scene vhMultiplier={2}>
            <SceneText
              enterAt={0.15}
              exitAt={0.75}
              className="px-6 text-center"
            >
              <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/50">
                Welkom binnen
              </p>
              <h2 className="mt-6 max-w-3xl font-serif text-4xl font-light leading-tight md:text-6xl">
                {(data.scenes[1]?.content?.headline as string) ??
                  "Een plek die je voelt zodra je binnenkomt."}
              </h2>
              {data.business.reservationUrl ? (
                <Link
                  href={data.business.reservationUrl}
                  className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
                >
                  Reserveer een tafel
                  <ArrowRight className="size-4" />
                </Link>
              ) : null}
            </SceneText>
          </Scene>

          {/* Scene 3 — Menu / diensten (placeholder voor Phase 3) */}
          <Scene vhMultiplier={2.5}>
            <SceneText className="w-full px-6">
              <div className="mx-auto max-w-4xl">
                <p className="text-center font-mono text-xs uppercase tracking-[0.4em] text-white/50">
                  De kaart
                </p>
                <h2 className="mt-4 text-center font-serif text-4xl font-light md:text-5xl">
                  Wat we serveren
                </h2>
                <div className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-white/10 md:grid-cols-2">
                  {(data.items ?? []).slice(0, 6).map((item) => (
                    <div
                      key={item.name}
                      className="bg-black/60 p-6 backdrop-blur-sm"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="font-serif text-lg font-medium">
                          {item.name}
                        </h3>
                        {item.price ? (
                          <span className="font-mono text-sm text-white/60">
                            {item.price}
                          </span>
                        ) : null}
                      </div>
                      {item.description ? (
                        <p className="mt-2 text-sm leading-relaxed text-white/60">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </SceneText>
          </Scene>

          {/* Scene 4 — Sfeerbeelden grid */}
          <Scene vhMultiplier={2}>
            <SceneText className="w-full px-6">
              <div className="mx-auto max-w-5xl">
                <p className="text-center font-mono text-xs uppercase tracking-[0.4em] text-white/50">
                  Sfeer
                </p>
                <h2 className="mt-4 text-center font-serif text-4xl font-light md:text-5xl">
                  Zoals het écht voelt
                </h2>
                <div className="mt-12 grid grid-cols-3 gap-2 md:gap-3">
                  {(data.photos ?? []).slice(0, 6).map((p, i) => (
                    <div
                      key={i}
                      className="aspect-square overflow-hidden rounded-lg bg-white/5"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.url}
                        alt={p.alt ?? ""}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </SceneText>
          </Scene>

          {/* Scene 5 — Contact / reservering */}
          <Scene vhMultiplier={1.5}>
            <SceneText className="w-full px-6 text-center">
              <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/50">
                Tot snel
              </p>
              <h2 className="mt-4 font-serif text-5xl font-light md:text-7xl">
                Kom langs
              </h2>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/70">
                {data.business.address ? (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="size-4" />
                    {data.business.address}
                  </span>
                ) : null}
                {data.business.phone ? (
                  <a
                    href={`tel:${data.business.phone.replace(/\s/g, "")}`}
                    className="inline-flex items-center gap-2 hover:text-white"
                  >
                    <Phone className="size-4" />
                    {data.business.phone}
                  </a>
                ) : null}
              </div>
              {data.business.reservationUrl ? (
                <Link
                  href={data.business.reservationUrl}
                  className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
                >
                  Reserveer nu
                  <ArrowRight className="size-4" />
                </Link>
              ) : null}
            </SceneText>
          </Scene>
        </div>

        {/* Footer — buiten de pinned-canvas zone */}
        <footer className="relative z-10 border-t border-white/10 bg-black px-6 py-12 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
            Gemaakt door Next Level Sites
          </p>
        </footer>
      </main>
    </SmoothScrollProvider>
  );
}
