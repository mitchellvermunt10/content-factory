"use client";

import { Reveal, RevealStagger, RevealItem } from "@/components/motion/Reveal";
import { Badge } from "@/components/ui/badge";
import { DELIVERABLES, MVP_GENERATORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Deliverables() {
  return (
    <section id="deliverables" className="relative py-24 md:py-36">
      <Reveal className="container">
        <div className="mb-14 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between md:mb-20">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
              02 · deliverables
            </span>
            <h2 className="balance mt-3 max-w-2xl text-3xl font-medium tracking-tight md:text-5xl">
              <span className="text-gradient">
                Zestien assets. Eén intake. Eén ochtend.
              </span>
            </h2>
          </div>
          <p className="max-w-md text-text-muted md:text-lg">
            We starten met de vier kerndeliverables. De rest staat in de pijplijn
            — modulair en op aanvraag.
          </p>
        </div>
      </Reveal>

      <div className="container">
        <RevealStagger className="grid gap-3 md:grid-cols-3 lg:grid-cols-4" stagger={0.04}>
          {DELIVERABLES.map((d) => {
            const isLive = (MVP_GENERATORS as readonly string[]).includes(d.id);
            return (
              <RevealItem key={d.id}>
                <div
                  className={cn(
                    "group relative h-full overflow-hidden rounded-2xl border border-border bg-surface/50 p-6 transition-all duration-500 ease-expo-out",
                    "hover:border-border-strong hover:bg-surface/90 hover:-translate-y-0.5"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                      {String(DELIVERABLES.indexOf(d) + 1).padStart(2, "0")}
                    </span>
                    {isLive ? (
                      <Badge variant="accent">Live</Badge>
                    ) : (
                      <Badge variant="outline">Soon</Badge>
                    )}
                  </div>
                  <h3 className="mt-8 text-base font-medium tracking-tight text-text">
                    {d.label}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">
                    {d.desc}
                  </p>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
}
