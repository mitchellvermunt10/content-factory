"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Sticky-pinned manifesto moment. Section is 2× viewport hoog, inhoud
 * pinned in midden. Tijdens scroll: opacity + scale animaties op de tekst
 * geven een 'breathing' feel. Cinematic backdrop met parallax.
 */
export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Tekst fades in 0.2-0.4, holds 0.4-0.7, fades out 0.7-0.9
  const opacity = useTransform(
    scrollYProgress,
    [0.1, 0.3, 0.7, 0.95],
    [0, 1, 1, 0]
  );
  const scale = useTransform(scrollYProgress, [0.1, 0.5, 0.95], [0.92, 1, 1.05]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <section
      ref={ref}
      className="relative h-[200vh] overflow-hidden border-t border-white/10"
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        {/* Parallax cinematic backdrop */}
        <motion.div
          style={{ scale: bgScale, y: bgY }}
          className="absolute inset-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sites/italian-restaurant/post-2-ambiance.jpg"
            alt=""
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/85" />
        </motion.div>

        {/* Manifesto content */}
        <motion.div
          style={{ opacity, scale }}
          className="relative z-10 mx-auto max-w-5xl px-6 text-center"
        >
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/55">
            Ons werk
          </p>
          <h2 className="mt-8 font-serif text-5xl font-light leading-[1.05] tracking-tight md:text-7xl lg:text-[6rem]">
            We bouwen
            <br />
            <span className="italic text-white/75">
              één site per maand.
            </span>
            <br />
            Met de aandacht
            <br />
            <span className="text-white/75">die jouw vak verdient.</span>
          </h2>
        </motion.div>
      </div>
    </section>
  );
}
