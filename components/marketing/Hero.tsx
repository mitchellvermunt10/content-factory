"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientMesh } from "@/components/motion/GradientMesh";
import { Noise } from "@/components/motion/Noise";

const ease = [0.16, 1, 0.3, 1] as const;

const heroLines = [
  "Volledige campagnes",
  "voor lokale ondernemers,",
  "in minuten.",
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-40 pb-32 md:pt-52 md:pb-44">
      <GradientMesh intensity="medium" />
      <Noise opacity={0.04} />

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1.5 backdrop-blur-sm"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-text-muted">
            v0.1 · Next Level Sites
          </span>
        </motion.div>

        <h1 className="balance text-center font-sans text-[44px] font-medium leading-[1.02] tracking-tightest text-text sm:text-[64px] md:text-[88px] lg:text-[104px]">
          {heroLines.map((line, lineIdx) => (
            <span key={lineIdx} className="block">
              {line.split(" ").map((word, i) => (
                <motion.span
                  key={`${lineIdx}-${i}`}
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 1.1,
                    ease,
                    delay: 0.15 + lineIdx * 0.18 + i * 0.04,
                  }}
                  className="inline-block pr-[0.22em]"
                >
                  {lineIdx === 1 && i >= 2 ? (
                    <span className="text-gradient-accent">{word}</span>
                  ) : (
                    <span className="text-gradient">{word}</span>
                  )}
                </motion.span>
              ))}
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.85 }}
          className="balance mx-auto mt-8 max-w-2xl text-center text-base leading-relaxed text-text-muted md:text-lg"
        >
          Landing pages, advertenties, social, e-mail, chatbots — alles
          afgestemd op één lokale ondernemer. Cinematic. Doordacht. Klaar voor
          Vercel.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 1.05 }}
          className="mx-auto mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button asChild size="lg" variant="primary">
            <Link href="/studio/nieuw">
              Start een campagne
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href="#deliverables">
              <Sparkles className="size-4" />
              Bekijk wat je krijgt
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease, delay: 1.4 }}
          className="mx-auto mt-24 max-w-5xl"
        >
          <HeroPreview />
        </motion.div>
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-x-12 -top-12 bottom-0 -z-10 bg-gradient-to-b from-accent/10 via-transparent to-transparent blur-3xl" />
      <div className="overflow-hidden rounded-2xl border border-border bg-elevated shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]">
        <div className="flex items-center justify-between border-b border-border bg-surface/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-danger/70" />
            <span className="size-2.5 rounded-full bg-warning/70" />
            <span className="size-2.5 rounded-full bg-success/70" />
          </div>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
            campaigns / signature-salon
          </span>
          <span className="size-2.5" />
        </div>
        <div className="grid gap-px bg-border md:grid-cols-2">
          <div className="bg-elevated p-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              Landing · hero
            </span>
            <p className="mt-4 font-sans text-2xl leading-tight tracking-tight text-text">
              <span className="text-gradient">Signature Salon</span>
              <br />
              <span className="text-text-muted">
                Vakwerk dat je voelt.
              </span>
            </p>
            <div className="mt-6 flex gap-2">
              <span className="rounded-full bg-text px-3 py-1 text-[11px] font-medium text-bg">
                Plan afspraak
              </span>
              <span className="rounded-full border border-border px-3 py-1 text-[11px] text-text-muted">
                Bekijk diensten
              </span>
            </div>
          </div>
          <div className="bg-elevated p-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              Meta ads · variant 02
            </span>
            <p className="mt-4 text-sm leading-relaxed text-text">
              <span className="font-medium">De afspraak waar je naartoe leeft.</span>{" "}
              <span className="text-text-muted">
                Bij Signature Salon ben je een uur lang nergens anders dan
                hier. Plan vandaag nog.
              </span>
            </p>
            <span className="mt-6 inline-flex rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] text-accent">
              CTA: Boek nu
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
