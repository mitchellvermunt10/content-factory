"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="relative py-24 md:py-32">
      <Reveal className="container">
        <div className="relative overflow-hidden rounded-[28px] border border-border bg-gradient-to-b from-elevated to-bg px-8 py-20 text-center md:px-16 md:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 left-1/2 -z-0 h-[480px] w-[720px] -translate-x-1/2 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, hsl(var(--accent) / 0.35), transparent 70%)",
            }}
          />
          <div className="relative">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
              Klaar om te starten
            </span>
            <h2 className="balance mx-auto mt-4 max-w-3xl text-4xl font-medium leading-tight tracking-tightest md:text-6xl">
              <span className="text-gradient-accent">
                Eén intake. Een complete campagne.
              </span>
            </h2>
            <p className="balance mx-auto mt-6 max-w-xl text-text-muted md:text-lg">
              Begin met een testcampagne. Mock-mode draait zonder API-key — zo
              voel je het ritme voordat je verdergaat.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" variant="accent">
                <Link href="/studio/nieuw">
                  Start een campagne
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="/studio">Bekijk Studio</Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
