"use client";

import { useEffect, useRef, useState } from "react";

interface SceneProps {
  /** Hoogte van de scene als veelvoud van viewport-height. Bepaalt scroll-duur. */
  vhMultiplier?: number;
  /** Inhoud die over de pinned image-sequence verschijnt */
  children: React.ReactNode;
  className?: string;
}

/**
 * Eén scene = een verticaal segment dat zoveel viewports duurt als opgegeven.
 * De inhoud wordt sticky-gepind op het midden zodat tekst stilstaat terwijl
 * de scroll voortdoet — vergelijkbaar met Apple's productpagina's.
 */
export function Scene({ vhMultiplier = 2, children, className = "" }: SceneProps) {
  return (
    <section
      style={{ height: `${vhMultiplier * 100}vh` }}
      className={`relative ${className}`}
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center">
        {children}
      </div>
    </section>
  );
}

/**
 * Toont kinder-inhoud alleen wanneer de scene in zicht is, met fade-in/out
 * gedrag voor cinematic gevoel. Pakt zelf de scroll-progress binnen het
 * eerstvolgende parent <section> element.
 */
export function SceneText({
  children,
  enterAt = 0.1,
  exitAt = 0.9,
  className = "",
}: {
  children: React.ReactNode;
  /** Bij welke scene-progress (0-1) de tekst volledig zichtbaar is */
  enterAt?: number;
  /** Bij welke scene-progress de tekst weer onzichtbaar wordt */
  exitAt?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(0);
  const [translateY, setTranslateY] = useState(24);

  useEffect(() => {
    function tick() {
      const el = ref.current;
      if (!el) return;
      // Vind dichtstbijzijnde parent section (de Scene-host)
      const section = el.closest("section");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const scrolled = -rect.top;
      const raw = total > 0 ? scrolled / total : 0;
      const p = Math.max(0, Math.min(1, raw));

      // Trapezoidaal: 0 → enterAt fade-in, enterAt → exitAt full, exitAt → 1 fade-out
      let o = 1;
      if (p < enterAt) o = p / enterAt;
      else if (p > exitAt) o = 1 - (p - exitAt) / (1 - exitAt);
      o = Math.max(0, Math.min(1, o));
      setOpacity(o);
      setTranslateY((1 - o) * 24);
    }

    function onScroll() {
      requestAnimationFrame(tick);
    }
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enterAt, exitAt]);

  return (
    <div
      ref={ref}
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        willChange: "opacity, transform",
      }}
      className={className}
    >
      {children}
    </div>
  );
}
