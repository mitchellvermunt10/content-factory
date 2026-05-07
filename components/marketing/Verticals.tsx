"use client";

import { Marquee } from "@/components/motion/Marquee";
import { Reveal } from "@/components/motion/Reveal";
import { BUSINESS_TYPES } from "@/lib/constants";

export function Verticals() {
  return (
    <section id="verticals" className="relative py-24 md:py-32">
      <Reveal className="container">
        <div className="mb-12 flex flex-col items-center text-center md:mb-16">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
            01 · verticals
          </span>
          <h2 className="balance mt-3 max-w-2xl text-3xl font-medium tracking-tight md:text-5xl">
            <span className="text-gradient">
              Gebouwd voor lokale ondernemers
            </span>
          </h2>
          <p className="balance mt-4 max-w-xl text-text-muted md:text-lg">
            Acht verticals, elk met een eigen toon, ritme en commerciële logica.
          </p>
        </div>
      </Reveal>
      <Marquee>
        {BUSINESS_TYPES.map((t) => (
          <div
            key={t.value}
            className="flex items-center gap-3 rounded-full border border-border bg-surface/40 px-5 py-2.5 backdrop-blur-sm"
          >
            <span className="text-accent">{t.emoji}</span>
            <span className="text-sm font-medium tracking-tight text-text">
              {t.label}
            </span>
          </div>
        ))}
      </Marquee>
    </section>
  );
}
