"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Wikkelt de cinematic site-experience in een Lenis smooth-scroll context.
 * Lenis pakt de native scroll over en geeft cinematic easing — essentieel
 * voor scroll-gedreven image-sequencing, anders krijg je hortend gedrag.
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Lerp-mode i.p.v. duration: continue interpolatie naar target-scroll.
    // Lerp 0.07 = traag-vloeiend (Awwwards/luxury sites), 0.1 = standaard.
    // Wheel multipliers lager = per scroll-tik beweeg je minder, voelt
    // alsof de pagina een gewicht heeft en glijdt na.
    const lenis = new Lenis({
      lerp: 0.07,
      smoothWheel: true,
      wheelMultiplier: 0.7,
      touchMultiplier: 1.0,
      syncTouch: true,
      syncTouchLerp: 0.075,
    });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
