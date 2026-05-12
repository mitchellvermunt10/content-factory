"use client";

import { useRef } from "react";
import { Scene, SceneText, SceneStagger } from "@/components/sites/Scene";
import type { NextLevelSiteData } from "@/lib/sites/types";

interface Props {
  socialProof: NonNullable<NextLevelSiteData["socialProof"]>;
}

/**
 * Cinematic reviews-scene: drie quotes in serif, staggered fade-in, geen
 * sterren-iconen of badges (te druk voor het premium design). Alleen taal,
 * grote witregels, micro-attribution onderaan.
 */
export function ReviewsSection({ socialProof }: Props) {
  const testimonials = socialProof.testimonials?.slice(0, 3) ?? [];
  if (testimonials.length === 0) return null;

  return (
    <Scene vhMultiplier={2.4}>
      <div className="relative w-full">
        {/* Letterbox-style dark band achter de reviews voor leesbaarheid.
            Fade-in/out aan boven- en onderkant zodat het niet harde kantjes
            heeft tegen de cinematic Ken Burns laag eronder. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[120%] -translate-y-1/2 bg-gradient-to-b from-transparent via-black/70 to-transparent"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-4xl px-6">
          <SceneText
            enterStart={0.0}
            enterEnd={0.12}
            exitStart={0.95}
            exitEnd={1.0}
            travel={32}
          >
            <p className="text-center font-mono text-xs uppercase tracking-[0.4em] text-white/70">
              Wat gasten zeggen
            </p>
            {socialProof.google ? (
              <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-white/55">
                ★ {socialProof.google.rating.toFixed(1)} Google · {socialProof.google.count} recensies
              </p>
            ) : null}
          </SceneText>

          <SceneStagger
            windowStart={0.12}
            windowEnd={0.5}
            perItemDuration={0.2}
            exitStart={0.95}
            exitEnd={1.0}
            travel={28}
            className="mt-16 flex flex-col gap-12 sm:gap-16"
          >
            {testimonials.map((t, i) => (
              <blockquote key={i} className="text-center">
                <p
                  className="font-serif text-2xl font-light leading-snug text-white md:text-3xl"
                  style={{ textShadow: "0 2px 24px rgba(0,0,0,0.55)" }}
                >
                  {`"${t.quote}"`}
                </p>
                <footer className="mt-5 font-mono text-[10px] uppercase tracking-[0.3em] text-white/65">
                  — {t.author}
                  {t.source ? ` · ${t.source}` : ""}
                  {t.date ? ` · ${t.date}` : ""}
                </footer>
              </blockquote>
            ))}
          </SceneStagger>
        </div>
      </div>
    </Scene>
  );
}
