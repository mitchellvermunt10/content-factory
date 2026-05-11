"use client";

import { useEffect, useRef, useState } from "react";

export interface CinematicShot {
  /** URL naar het hero-frame (statisch, hoge kwaliteit) */
  imageUrl: string;
  /** Scroll-progress (0-1) waar deze shot zijn dominante moment heeft */
  startProgress: number;
  endProgress: number;
  /** Camera zoom (1.0 = neutraal, >1 = ingezoomd) */
  scale: { from: number; to: number };
  /** Camera pan in normalized coords (-0.5 tot 0.5) */
  offsetX?: { from: number; to: number };
  offsetY?: { from: number; to: number };
  /** Visueel: -1 (koel/blauw) tot 1 (warm/oranje) */
  warmth?: { from: number; to: number };
  /** 0.5 (donker) tot 1.2 (helder) */
  brightness?: { from: number; to: number };
  /** 0 (geen) tot 0.6 (zwaar) */
  vignette?: { from: number; to: number };
}

interface CinematicCanvasProps {
  shots: CinematicShot[];
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  /** Hoe lang de crossfade tussen opvolgende shots duurt (in progress-units) */
  fadeOverlap?: number;
  className?: string;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

/**
 * Parametric cinematic image-sequencer.
 *
 * Werkwijze: in plaats van 60 losse frames te tonen, nemen we 2-4 hoog-kwaliteit
 * hero-frames en synthetiseren de camera-beweging in-canvas:
 *  - drawImage met scale + offset = Ken Burns zoom/pan
 *  - color-overlay = warmth-shift (cool dusk → warm interior)
 *  - radial-gradient vignette = framing
 *  - globalAlpha crossfade = shot-overgangen
 *
 * Resultaat: cinematic dolly-in dat coherent is (zelfde scene, vloeiende
 * transformatie) en goedkoop te produceren (3 Flux-calls i.p.v. 60).
 */
export function CinematicCanvas({
  shots,
  scrollContainerRef,
  fadeOverlap = 0.1,
  className,
}: CinematicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const rafRef = useRef<number>(0);
  const [loaded, setLoaded] = useState(0);
  const total = shots.length;

  // Preload alle hero-frames
  useEffect(() => {
    let cancelled = false;
    imagesRef.current = [];
    setLoaded(0);
    let done = 0;
    shots.forEach((shot, i) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (cancelled) return;
        done += 1;
        setLoaded(done);
      };
      img.onerror = () => {
        if (cancelled) return;
        done += 1;
        setLoaded(done);
      };
      img.src = shot.imageUrl;
      imagesRef.current[i] = img;
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shots]);

  // Canvas sizing (DPR-aware)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function resize() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Hoofd-render loop, scroll-driven
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = scrollContainerRef.current;
    if (!canvas || !container) return;

    function drawShot(shot: CinematicShot, alpha: number) {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const idx = shots.indexOf(shot);
      const img = imagesRef.current[idx];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;

      // Bereken interne shot-progress (0-1) binnen dit shot's window
      const containerEl = container;
      if (!containerEl) return;
      const rect = containerEl.getBoundingClientRect();
      const vh = window.innerHeight;
      const totalScroll = rect.height - vh;
      const scrolled = -rect.top;
      const globalP = Math.max(
        0,
        Math.min(1, totalScroll > 0 ? scrolled / totalScroll : 0)
      );
      const localP = smoothstep(
        (globalP - shot.startProgress) / (shot.endProgress - shot.startProgress)
      );

      const scale = lerp(shot.scale.from, shot.scale.to, localP);
      const offsetX = shot.offsetX
        ? lerp(shot.offsetX.from, shot.offsetX.to, localP)
        : 0;
      const offsetY = shot.offsetY
        ? lerp(shot.offsetY.from, shot.offsetY.to, localP)
        : 0;
      const warmth = shot.warmth
        ? lerp(shot.warmth.from, shot.warmth.to, localP)
        : 0;
      const brightness = shot.brightness
        ? lerp(shot.brightness.from, shot.brightness.to, localP)
        : 1;
      const vignette = shot.vignette
        ? lerp(shot.vignette.from, shot.vignette.to, localP)
        : 0.15;

      // Cover-fit met scale
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const canvasRatio = cw / ch;
      const imgRatio = iw / ih;
      let baseW = cw;
      let baseH = ch;
      if (imgRatio > canvasRatio) {
        baseH = ch;
        baseW = ch * imgRatio;
      } else {
        baseW = cw;
        baseH = cw / imgRatio;
      }
      const dw = baseW * scale;
      const dh = baseH * scale;
      const dx = (cw - dw) / 2 + offsetX * cw;
      const dy = (ch - dh) / 2 + offsetY * ch;

      ctx.save();
      ctx.globalAlpha = alpha;

      // Hoofd-image
      ctx.filter = `brightness(${brightness})`;
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.filter = "none";

      // Warmth overlay (cool blue ↔ warm orange)
      if (warmth !== 0) {
        const color =
          warmth > 0
            ? `rgba(255, 160, 70, ${Math.min(0.35, warmth * 0.35)})`
            : `rgba(60, 90, 160, ${Math.min(0.35, -warmth * 0.35)})`;
        ctx.globalCompositeOperation = "soft-light";
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, cw, ch);
        ctx.globalCompositeOperation = "source-over";
      }

      // Vignette
      if (vignette > 0) {
        const grad = ctx.createRadialGradient(
          cw / 2,
          ch / 2,
          Math.min(cw, ch) * 0.4,
          cw / 2,
          ch / 2,
          Math.max(cw, ch) * 0.75
        );
        grad.addColorStop(0, "rgba(0,0,0,0)");
        grad.addColorStop(1, `rgba(0,0,0,${vignette})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cw, ch);
      }

      ctx.restore();
    }

    function tick() {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;

      // Zwarte baseline
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, cw, ch);

      const containerEl = container;
      if (!containerEl) return;
      const rect = containerEl.getBoundingClientRect();
      const vh = window.innerHeight;
      const totalScroll = rect.height - vh;
      const scrolled = -rect.top;
      const globalP = Math.max(
        0,
        Math.min(1, totalScroll > 0 ? scrolled / totalScroll : 0)
      );

      // Voor elke shot: bereken alpha en teken
      shots.forEach((shot) => {
        let alpha = 0;
        const fadeIn = shot.startProgress + fadeOverlap;
        const fadeOut = shot.endProgress - fadeOverlap;
        if (globalP < shot.startProgress) {
          alpha = 0;
        } else if (globalP < fadeIn) {
          alpha = smoothstep(
            (globalP - shot.startProgress) / Math.max(0.0001, fadeOverlap)
          );
        } else if (globalP < fadeOut) {
          alpha = 1;
        } else if (globalP < shot.endProgress) {
          alpha = smoothstep(
            (shot.endProgress - globalP) / Math.max(0.0001, fadeOverlap)
          );
        } else {
          alpha = 0;
        }
        if (alpha > 0.001) drawShot(shot, alpha);
      });
    }

    function onScroll() {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    }

    // Initial draw — wacht op eerste image
    function tryInitial() {
      const first = imagesRef.current[0];
      if (first && first.complete && first.naturalWidth > 0) {
        tick();
      } else {
        setTimeout(tryInitial, 80);
      }
    }
    tryInitial();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [shots, scrollContainerRef, fadeOverlap, loaded]);

  return (
    <div className={className}>
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
      {loaded < total ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            laden {loaded}/{total}
          </span>
        </div>
      ) : null}
    </div>
  );
}
