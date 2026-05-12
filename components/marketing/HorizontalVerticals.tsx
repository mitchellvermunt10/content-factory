"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const VERTICALS = [
  {
    label: "Voor kapsalons",
    image: "/sites/concepts/salon.jpg",
    title: "Vakwerk",
    titleAccent: "als merk.",
    body: "Een website die je sfeer en handwerk laat zien zonder generieke agency-look. Klanten kiezen voor jou omdat ze jou zien — niet een template.",
  },
  {
    label: "Voor autobedrijven",
    image: "/sites/concepts/garage.jpg",
    title: "Vakmanschap",
    titleAccent: "dat vertrouwen wekt.",
    body: "Een site die laat zien wie er aan hun auto sleutelt en waarom dat goud waard is. Geen poespas, gewoon vakmanschap met cinema-kwaliteit eromheen.",
  },
  {
    label: "Voor tandartspraktijken",
    image: "/sites/concepts/tandarts.jpg",
    title: "Rust",
    titleAccent: "voor de eerste afspraak.",
    body: "Patiënten landen op je site met angst. Ze moeten in 5 seconden voelen dat ze bij jou veilig zijn — voordat ze de telefoon pakken.",
  },
];

/**
 * Horizontal-scroll cinematic verticals showcase.
 *
 * Section is 3× viewport-hoog. Een sticky div binnenin pint zich aan de top
 * en bevat een horizontale flexbox met 3 panels (elk full-screen breed).
 * Scroll-progress vertaalt naar X-translate. Resultaat: scrolt verticaal,
 * voelt horizontaal. Awwwards-klassieker.
 */
export function HorizontalVerticals() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  // 3 panels van 100vw, moet vertalen tot -200vw zichtbaar (eerste blijft op 0, derde eindigt op -200vw)
  const x = useTransform(scrollYProgress, [0.05, 0.95], ["0%", "-66.667%"]);

  return (
    <section
      ref={ref}
      className="relative h-[300vh] border-t border-white/10 bg-black"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Eyebrow + H2 — pinned bovenin, blijft constant zichtbaar */}
        <div className="absolute inset-x-0 top-0 z-20 px-6 pb-8 pt-28 sm:pt-32">
          <div className="mx-auto max-w-6xl text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/55 sm:text-xs">
              Voor elke vakman
            </p>
            <h2 className="mt-4 font-serif text-3xl font-light leading-tight tracking-tight md:text-5xl">
              Hetzelfde format. Voor elke branche.
            </h2>
          </div>
        </div>

        {/* Horizontal-scrolling panel-rij */}
        <motion.div
          style={{ x }}
          className="flex h-full"
        >
          {VERTICALS.map((v) => (
            <div
              key={v.label}
              className="relative flex h-full w-screen shrink-0 items-end"
            >
              {/* Full-bleed cinematic backdrop */}
              <div className="absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.image}
                  alt=""
                  className="h-full w-full scale-110 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/55 to-black/25" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 sm:pb-32 sm:px-12">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-3 rounded-full border border-white/25 bg-black/55 px-4 py-1.5 backdrop-blur-md">
                    <span className="size-1.5 rounded-full bg-accent" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/85">
                      Concept · {v.label}
                    </span>
                  </div>

                  <h3 className="mt-6 font-serif text-5xl font-light leading-[0.95] tracking-tight text-white sm:text-7xl md:text-8xl">
                    {v.title}
                    <br />
                    <span className="text-white/65">{v.titleAccent}</span>
                  </h3>

                  <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-white/80 sm:text-lg">
                    {v.body}
                  </p>
                </div>
              </div>

              {/* Scroll-indicator op de eerste panel */}
              {v === VERTICALS[0] ? (
                <div className="absolute bottom-6 right-6 z-10 hidden font-mono text-[10px] uppercase tracking-[0.3em] text-white/55 sm:block">
                  Scroll →
                </div>
              ) : null}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
