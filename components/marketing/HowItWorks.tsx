"use client";

import { Reveal, RevealStagger, RevealItem } from "@/components/motion/Reveal";

const steps = [
  {
    n: "01",
    title: "Brief",
    body: "Een korte intake. Type bedrijf, USPs, tone of voice, brand colors. Onder de twee minuten.",
  },
  {
    n: "02",
    title: "Generatie",
    body: "Vier generatoren draaien parallel. Landing, SEO, ads en Instagram — in één run.",
  },
  {
    n: "03",
    title: "Verfijnen",
    body: "Voorbeeld op het scherm. Per artifact opnieuw genereren tot het ritme klopt.",
  },
  {
    n: "04",
    title: "Exporteren",
    body: "Eén klik. JSON-export voor het hele pakket. Klaar voor implementatie.",
  },
];

export function HowItWorks() {
  return (
    <section id="werkwijze" className="relative py-24 md:py-36">
      <Reveal className="container">
        <div className="mb-14 max-w-3xl md:mb-20">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
            03 · werkwijze
          </span>
          <h2 className="balance mt-3 text-3xl font-medium tracking-tight md:text-5xl">
            <span className="text-gradient">
              Vier stappen, één ochtend, klaar om te lanceren.
            </span>
          </h2>
        </div>
      </Reveal>
      <div className="container">
        <RevealStagger className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4" stagger={0.08}>
          {steps.map((s) => (
            <RevealItem
              key={s.n}
              className="bg-surface p-8 transition-colors duration-500 hover:bg-elevated"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                {s.n}
              </span>
              <h3 className="mt-6 text-2xl font-medium tracking-tight text-text">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-muted pretty">
                {s.body}
              </p>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
