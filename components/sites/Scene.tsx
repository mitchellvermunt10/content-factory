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
 * Apple-style ease-out-expo curve. Snel begin, lang uitloop.
 * Geeft cinematic "aankomen" gevoel i.p.v. mechanische lineaire fade.
 */
function easeOutExpo(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return 1 - Math.pow(2, -10 * t);
}

/**
 * Toont kinder-inhoud alleen wanneer de scene in zicht is, met fade-in/out
 * gedrag voor cinematic gevoel. Pakt zelf de scroll-progress binnen het
 * eerstvolgende parent <section> element.
 *
 * Timing (defaults zijn rustig — bewust trager dan voorheen):
 *  - 0 → enterStart  : volledig onzichtbaar, 60px naar onder
 *  - enterStart → enterEnd : fade-in met ease-out-expo
 *  - enterEnd → exitStart : volledig zichtbaar, geen beweging
 *  - exitStart → 1   : fade-out met spiegel-easing
 */
export function SceneText({
  children,
  enterStart = 0.0,
  enterEnd = 0.35,
  exitStart = 0.75,
  exitEnd = 1.0,
  travel = 60,
  className = "",
}: {
  children: React.ReactNode;
  /** Scene-progress (0-1) waar fade-in begint */
  enterStart?: number;
  /** Scene-progress waar fade-in voltooid is */
  enterEnd?: number;
  /** Scene-progress waar fade-out begint */
  exitStart?: number;
  /** Scene-progress waar fade-out voltooid is */
  exitEnd?: number;
  /** Hoeveel px de inhoud naar boven beweegt tijdens fade-in (rustig = hoger) */
  travel?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(0);
  const [translateY, setTranslateY] = useState(travel);

  useEffect(() => {
    function tick() {
      const el = ref.current;
      if (!el) return;
      const section = el.closest("section");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const scrolled = -rect.top;
      const raw = total > 0 ? scrolled / total : 0;
      const p = Math.max(0, Math.min(1, raw));

      // Vier-fase trapezoid met ease-out-expo op de overgangen
      let o = 0;
      if (p <= enterStart) {
        o = 0;
      } else if (p < enterEnd) {
        const local = (p - enterStart) / (enterEnd - enterStart);
        o = easeOutExpo(local);
      } else if (p < exitStart) {
        o = 1;
      } else if (p < exitEnd) {
        const local = (p - exitStart) / (exitEnd - exitStart);
        // Spiegel — eerst lang vol, dan snel weg = ease-in-expo
        o = 1 - easeOutExpo(local);
      } else {
        o = 0;
      }

      setOpacity(o);
      setTranslateY((1 - o) * travel);
    }

    function onScroll() {
      requestAnimationFrame(tick);
    }
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enterStart, enterEnd, exitStart, exitEnd, travel]);

  return (
    <div
      ref={ref}
      style={{
        opacity,
        transform: `translate3d(0, ${translateY}px, 0)`,
        willChange: "opacity, transform",
      }}
      className={className}
    >
      {children}
    </div>
  );
}

/**
 * Wrap een rij/grid kinderen in dit component voor cinematic stagger.
 * Elk kind wordt gewrapped in een SceneText met progressief enterStart-window.
 *
 * Bijvoorbeeld 6 items met windowStart=0.15, windowEnd=0.6, stagger=0.06:
 *   item 0 fade van 0.15 → 0.42
 *   item 1 fade van 0.21 → 0.48
 *   item 2 fade van 0.27 → 0.54
 *   ...
 */
export function SceneStagger({
  children,
  windowStart = 0.15,
  windowEnd = 0.6,
  perItemDuration = 0.3,
  exitStart = 0.85,
  exitEnd = 1.0,
  travel = 40,
  className = "",
  itemClassName = "",
}: {
  children: React.ReactNode[];
  windowStart?: number;
  windowEnd?: number;
  perItemDuration?: number;
  exitStart?: number;
  exitEnd?: number;
  travel?: number;
  className?: string;
  itemClassName?: string;
}) {
  const items = children.filter(Boolean);
  const count = items.length;
  if (count === 0) return null;

  // Spreid de start-momenten gelijk uit over windowStart → windowEnd
  // zodat het laatste item zijn fade-in heeft afgerond bij windowEnd.
  const span = Math.max(0.0001, windowEnd - windowStart - perItemDuration);
  const step = count > 1 ? span / (count - 1) : 0;

  return (
    <div className={className}>
      {items.map((child, i) => {
        const eStart = windowStart + i * step;
        const eEnd = eStart + perItemDuration;
        return (
          <SceneText
            key={i}
            enterStart={eStart}
            enterEnd={eEnd}
            exitStart={exitStart}
            exitEnd={exitEnd}
            travel={travel}
            className={itemClassName}
          >
            {child}
          </SceneText>
        );
      })}
    </div>
  );
}
