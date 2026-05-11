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
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
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
