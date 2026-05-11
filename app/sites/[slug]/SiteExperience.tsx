"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Phone } from "lucide-react";
import { SmoothScrollProvider } from "@/components/sites/SmoothScrollProvider";
import { ImageSequence } from "@/components/sites/ImageSequence";
import { CinematicCanvas } from "@/components/sites/CinematicCanvas";
import { Scene, SceneText, SceneStagger } from "@/components/sites/Scene";
import { buildRestaurantShots } from "@/lib/sites/shotPresets";
import type { NextLevelSiteData } from "@/lib/sites/types";

/**
 * De cinematic experience composer.
 *
 * Layout-trick: ÉÉN lange scroll-container (de <main>) bevat de pinned
 * image-sequence canvas EN alle scenes erbovenop. Scenes hebben zelf
 * hun sticky inhoud — de canvas zit erachter en pakt zijn progress
 * uit de totale main-container.
 */
export function SiteExperience({
  data,
  useCinematicShots = false,
}: {
  data: NextLevelSiteData;
  useCinematicShots?: boolean;
}) {
  const containerRef = useRef<HTMLElement>(null);
  const cinematicShots = useCinematicShots
    ? buildRestaurantShots({
        frames: [data.frames[0], data.frames[1], data.frames[2]] as [
          string,
          string,
          string
        ],
      })
    : null;

  return (
    <SmoothScrollProvider>
      <main ref={containerRef} className="relative bg-black text-white">
        {/* Pinned cinematic achtergrond — sticky top:0 binnen container */}
        <div
          className="pointer-events-none sticky top-0 z-0 h-screen w-full"
          aria-hidden="true"
        >
          {cinematicShots ? (
            <CinematicCanvas
              shots={cinematicShots}
              scrollContainerRef={containerRef}
              fadeOverlap={0.08}
              className="relative h-full w-full"
            />
          ) : (
            <ImageSequence
              frames={data.frames}
              scrollContainerRef={containerRef}
              fit="cover"
              className="relative h-full w-full"
            />
          )}
          {/* Vignette voor leesbaarheid van tekst over alle frames */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60" />
        </div>

        {/* Scenes — zitten boven de pinned canvas dankzij z-10 */}
        <div className="relative z-10 -mt-[100vh]">
          {/* Scene 1 — Intro: gevel + bedrijfsnaam */}
          <Scene vhMultiplier={2.5}>
            <SceneText
              enterStart={0.05}
              enterEnd={0.4}
              exitStart={0.75}
              exitEnd={0.95}
              travel={48}
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
          <Scene vhMultiplier={2.5}>
            <SceneText
              enterStart={0.1}
              enterEnd={0.45}
              exitStart={0.75}
              exitEnd={0.95}
              travel={56}
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

          {/* Scene 3 — Menu / diensten */}
          <Scene vhMultiplier={3}>
            <div className="w-full px-6">
              <div className="mx-auto max-w-4xl">
                <SceneText
                  enterStart={0.0}
                  enterEnd={0.25}
                  exitStart={0.85}
                  exitEnd={1.0}
                  travel={40}
                >
                  <p className="text-center font-mono text-xs uppercase tracking-[0.4em] text-white/50">
                    De kaart
                  </p>
                  <h2 className="mt-4 text-center font-serif text-4xl font-light md:text-5xl">
                    Wat we serveren
                  </h2>
                </SceneText>

                <SceneStagger
                  windowStart={0.2}
                  windowEnd={0.75}
                  perItemDuration={0.28}
                  exitStart={0.88}
                  exitEnd={1.0}
                  travel={32}
                  className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-white/10 md:grid-cols-2"
                >
                  {(data.items ?? []).slice(0, 6).map((item) => (
                    <div
                      key={item.name}
                      className="h-full bg-black/60 p-6 backdrop-blur-sm"
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
                </SceneStagger>
              </div>
            </div>
          </Scene>

          {/* Scene 4 — Sfeerbeelden grid */}
          <Scene vhMultiplier={2.5}>
            <div className="w-full px-6">
              <div className="mx-auto max-w-5xl">
                <SceneText
                  enterStart={0.0}
                  enterEnd={0.22}
                  exitStart={0.88}
                  exitEnd={1.0}
                  travel={40}
                >
                  <p className="text-center font-mono text-xs uppercase tracking-[0.4em] text-white/50">
                    Sfeer
                  </p>
                  <h2 className="mt-4 text-center font-serif text-4xl font-light md:text-5xl">
                    Zoals het écht voelt
                  </h2>
                </SceneText>

                <SceneStagger
                  windowStart={0.18}
                  windowEnd={0.78}
                  perItemDuration={0.32}
                  exitStart={0.9}
                  exitEnd={1.0}
                  travel={28}
                  className="mt-12 grid grid-cols-3 gap-2 md:gap-3"
                >
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
                </SceneStagger>
              </div>
            </div>
          </Scene>

          {/* Scene 5 — Contact / reservering */}
          <Scene vhMultiplier={2}>
            <SceneText
              enterStart={0.05}
              enterEnd={0.4}
              exitStart={0.85}
              exitEnd={1.0}
              travel={48}
              className="w-full px-6 text-center"
            >
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
