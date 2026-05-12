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
    <Scene vhMultiplier={2}>
      <div className="w-full px-6">
        <div className="mx-auto max-w-4xl">
          <SceneText
            enterStart={0.0}
            enterEnd={0.22}
            exitStart={0.88}
            exitEnd={1.0}
            travel={32}
          >
            <p className="text-center font-mono text-xs uppercase tracking-[0.4em] text-white/50">
              Wat gasten zeggen
            </p>
            {socialProof.google ? (
              <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
                ★ {socialProof.google.rating.toFixed(1)} Google · {socialProof.google.count} recensies
              </p>
            ) : null}
          </SceneText>

          <SceneStagger
            windowStart={0.15}
            windowEnd={0.65}
            perItemDuration={0.28}
            exitStart={0.88}
            exitEnd={1.0}
            travel={28}
            className="mt-16 flex flex-col gap-12 sm:gap-16"
          >
            {testimonials.map((t, i) => (
              <blockquote key={i} className="text-center">
                <p className="font-serif text-2xl font-light leading-snug text-white/85 md:text-3xl">
                  {`"${t.quote}"`}
                </p>
                <footer className="mt-5 font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
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
