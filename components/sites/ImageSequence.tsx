"use client";

import { useEffect, useRef, useState } from "react";

interface ImageSequenceProps {
  /** Volledige lijst frame-URLs (in volgorde) */
  frames: string[];
  /** Ref naar het scroll-container element dat de progress bepaalt */
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  /** Optioneel: object-fit gedrag — default "cover" */
  fit?: "cover" | "contain";
  /**
   * Optioneel: mappen van globale scroll-progress (0-1) naar lokale
   * video-progress (0-1). Buiten dit bereik wordt het eerste of laatste
   * frame vastgehouden. Bv. { from: 0, to: 0.4 } = dolly speelt af in de
   * eerste 40% van de scroll, daarna camera "settled" op laatste frame.
   */
  progressRange?: { from: number; to: number };
  /**
   * Optioneel: laat de hele canvas wegfaden over deze scroll-range
   * (CSS-opacity op het canvas-element). Handig voor crossfade naar een
   * andere visual-laag eronder. Bv. { from: 0.32, to: 0.45 }.
   */
  fadeOutAfter?: { from: number; to: number };
  className?: string;
}

/**
 * Canvas-gebaseerde scroll-gedreven image-sequencer.
 *
 * Werking:
 * 1. Pre-laadt alle frames in een Image-array.
 * 2. Hangt een scroll-listener aan window die de progress (0-1) berekent
 *    binnen de scrollContainerRef-bounds.
 * 3. Tekent het overeenkomende frame in een canvas met cover/contain-logica.
 *
 * Performance: één canvas, geen DOM-thrash. requestAnimationFrame-throttled.
 */
export function ImageSequence({
  frames,
  scrollContainerRef,
  fit = "cover",
  progressRange,
  fadeOutAfter,
  className,
}: ImageSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastFractionalRef = useRef<number>(-1);
  const rafRef = useRef<number>(0);
  const [loaded, setLoaded] = useState(0);

  // Preload alle frames altijd. Frame 0 krijgt fetchPriority high (LCP)
  // — dat is de enige LCP-optimalisatie. Geen conditional rendering.
  useEffect(() => {
    let cancelled = false;
    imagesRef.current = [];
    setLoaded(0);
    let done = 0;

    frames.forEach((src, i) => {
      const img = new Image();
      if (i === 0) {
        img.fetchPriority = "high";
      } else {
        img.fetchPriority = "low";
        img.loading = "lazy";
      }
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
      img.src = src;
      imagesRef.current[i] = img;
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames]);

  // Canvas sizing — DPR-aware
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function resize() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Force re-draw na resize
      lastFractionalRef.current = -1;
    }

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Scroll → frame mapping
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = scrollContainerRef.current;
    if (!canvas || !container) return;

    function drawSingleImage(
      ctx: CanvasRenderingContext2D,
      img: HTMLImageElement,
      cw: number,
      ch: number,
      alpha: number
    ) {
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const canvasRatio = cw / ch;
      const imgRatio = iw / ih;
      let dx = 0;
      let dy = 0;
      let dw = cw;
      let dh = ch;
      if (fit === "cover") {
        if (imgRatio > canvasRatio) {
          dh = ch;
          dw = ch * imgRatio;
          dx = (cw - dw) / 2;
        } else {
          dw = cw;
          dh = cw / imgRatio;
          dy = (ch - dh) / 2;
        }
      } else {
        if (imgRatio > canvasRatio) {
          dw = cw;
          dh = cw / imgRatio;
          dy = (ch - dh) / 2;
        } else {
          dh = ch;
          dw = ch * imgRatio;
          dx = (cw - dw) / 2;
        }
      }
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.globalAlpha = 1;
    }

    /**
     * Cross-fade tussen twee opvolgende frames op basis van fractie.
     * Frame 23.6 = 40% van frame 23 + 60% van frame 24. Geeft vloeiend
     * gevoel tussen discrete frames i.p.v. harde sprong.
     */
    function drawFractional(fractionalIndex: number) {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;

      const maxIdx = frames.length - 1;
      const clamped = Math.max(0, Math.min(maxIdx, fractionalIndex));
      const lower = Math.floor(clamped);
      const upper = Math.min(maxIdx, lower + 1);
      const t = clamped - lower;

      const imgLow = imagesRef.current[lower];
      const imgHigh = imagesRef.current[upper];

      ctx.clearRect(0, 0, cw, ch);
      if (imgLow && imgLow.complete && imgLow.naturalWidth > 0) {
        drawSingleImage(ctx, imgLow, cw, ch, 1);
      }
      if (
        t > 0 &&
        imgHigh &&
        imgHigh.complete &&
        imgHigh.naturalWidth > 0 &&
        upper !== lower
      ) {
        drawSingleImage(ctx, imgHigh, cw, ch, t);
      }
    }

    function tick() {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const scrolled = -rect.top;
      const raw = total > 0 ? scrolled / total : 0;
      const globalProgress = Math.max(0, Math.min(1, raw));

      // Map globale scroll naar lokale video-progress als progressRange is opgegeven.
      // Buiten het bereik: hold first / last frame.
      let videoProgress = globalProgress;
      if (progressRange) {
        const span = progressRange.to - progressRange.from;
        if (globalProgress <= progressRange.from) {
          videoProgress = 0;
        } else if (globalProgress >= progressRange.to) {
          videoProgress = 1;
        } else if (span > 0) {
          videoProgress = (globalProgress - progressRange.from) / span;
        }
      }

      // Fractionele frame-index voor smooth cross-fade tussen frames
      const fractional = videoProgress * (frames.length - 1);
      // Skip redraw als de fractie nauwelijks is veranderd (perf)
      if (Math.abs(fractional - lastFractionalRef.current) > 0.05) {
        drawFractional(fractional);
        lastFractionalRef.current = fractional;
      }

      // CSS opacity fade-out — crossfade naar laag eronder
      if (fadeOutAfter && canvas) {
        let opacity = 1;
        if (globalProgress >= fadeOutAfter.to) {
          opacity = 0;
        } else if (globalProgress > fadeOutAfter.from) {
          const span = fadeOutAfter.to - fadeOutAfter.from;
          const t = span > 0 ? (globalProgress - fadeOutAfter.from) / span : 1;
          opacity = 1 - t;
        }
        canvas.style.opacity = String(opacity);
      }
    }

    function onScroll() {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    }

    // Initial draw — even wachten tot eerste frame geladen
    function tryInitial() {
      const first = imagesRef.current[0];
      if (first && first.complete && first.naturalWidth > 0) {
        lastFractionalRef.current = -1; // forceer eerste draw
        tick();
      } else {
        setTimeout(tryInitial, 50);
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
  }, [frames, scrollContainerRef, fit, progressRange, fadeOutAfter, loaded]);

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        aria-hidden="true"
      />
      {loaded < frames.length ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            laden {loaded}/{frames.length}
          </span>
        </div>
      ) : null}
    </div>
  );
}
