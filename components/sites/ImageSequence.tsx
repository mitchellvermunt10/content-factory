"use client";

import { useEffect, useRef, useState } from "react";

interface ImageSequenceProps {
  /** Volledige lijst frame-URLs (in volgorde) */
  frames: string[];
  /** Ref naar het scroll-container element dat de progress bepaalt */
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  /** Optioneel: object-fit gedrag — default "cover" */
  fit?: "cover" | "contain";
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
  className,
}: ImageSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastFrameRef = useRef<number>(-1);
  const rafRef = useRef<number>(0);
  const [loaded, setLoaded] = useState(0);

  // Preload alle frames
  useEffect(() => {
    let cancelled = false;
    imagesRef.current = [];
    setLoaded(0);

    const total = frames.length;
    let done = 0;

    frames.forEach((src, i) => {
      const img = new Image();
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
    // We willen deze pre-load alleen runnen bij frame-list change
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
      lastFrameRef.current = -1;
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

    function draw(frameIndex: number) {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = imagesRef.current[frameIndex];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
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
        // contain
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

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    function tick() {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;
      // Progress: 0 wanneer container-top de viewport-top raakt (eerste pin),
      // 1 wanneer container-bottom de viewport-bottom verlaat.
      const total = rect.height - vh;
      const scrolled = -rect.top;
      const raw = total > 0 ? scrolled / total : 0;
      const progress = Math.max(0, Math.min(1, raw));

      const target = Math.round(progress * (frames.length - 1));
      if (target !== lastFrameRef.current) {
        draw(target);
        lastFrameRef.current = target;
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
  }, [frames, scrollContainerRef, fit, loaded]);

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
