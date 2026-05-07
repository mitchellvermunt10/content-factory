"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Timecode, formatTimecode } from "@/components/cinematic/Timecode";
import { cn } from "@/lib/utils";
import type { RenderStatus } from "@/lib/constants";

const RATIO: Record<string, string> = {
  "16:9": "aspect-[16/9]",
  "9:16": "aspect-[9/16]",
  "1:1": "aspect-square",
  "4:5": "aspect-[4/5]",
  "21:9": "aspect-[21/9]",
};

export function VideoPreviewMock({
  durationSec,
  ratio = "16:9",
  status,
  provider,
  shotId,
  framing,
  cameraMovement,
  className,
}: {
  durationSec: number;
  ratio?: string;
  status: RenderStatus;
  provider: string;
  shotId: string;
  framing?: string;
  cameraMovement?: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    const start = performance.now() - t * 1000;
    const tick = (now: number) => {
      const next = (now - start) / 1000;
      if (next >= durationSec) {
        setT(0);
        setPlaying(false);
        return;
      }
      setT(next);
      ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [playing, durationSec, t]);

  const ready = status === "ready";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-bg",
        RATIO[ratio] ?? "aspect-video",
        className
      )}
    >
      {/* simulated frame: animated gradient background */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        animate={
          ready && playing
            ? {
                background: [
                  "radial-gradient(ellipse at 30% 30%, hsl(252 95% 60% / 0.35), transparent 60%)",
                  "radial-gradient(ellipse at 70% 50%, hsl(290 80% 60% / 0.35), transparent 60%)",
                  "radial-gradient(ellipse at 40% 70%, hsl(210 90% 60% / 0.35), transparent 60%)",
                  "radial-gradient(ellipse at 30% 30%, hsl(252 95% 60% / 0.35), transparent 60%)",
                ],
              }
            : {
                background:
                  "radial-gradient(ellipse at 50% 40%, hsl(var(--accent)/0.18), transparent 70%)",
              }
        }
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* film grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: "200px",
        }}
      />

      {/* corner ticks */}
      <span className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l border-t border-text-subtle/60" />
      <span className="pointer-events-none absolute right-2 top-2 h-3 w-3 border-r border-t border-text-subtle/60" />
      <span className="pointer-events-none absolute bottom-7 left-2 h-3 w-3 border-b border-l border-text-subtle/60" />
      <span className="pointer-events-none absolute bottom-7 right-2 h-3 w-3 border-b border-r border-text-subtle/60" />

      {/* meta top */}
      <div className="absolute inset-x-2 top-2 flex items-start justify-between gap-2">
        <Badge variant="outline" className="bg-bg/60 backdrop-blur-sm">
          {provider}
        </Badge>
        <div className="flex flex-wrap justify-end gap-1">
          {framing ? (
            <span className="rounded bg-bg/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-text-subtle backdrop-blur-sm">
              {framing}
            </span>
          ) : null}
          {cameraMovement ? (
            <span className="rounded bg-bg/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-text-subtle backdrop-blur-sm">
              {cameraMovement}
            </span>
          ) : null}
        </div>
      </div>

      {/* center play / status */}
      <div className="absolute inset-0 flex items-center justify-center">
        {status === "rendering" ? (
          <div className="flex flex-col items-center gap-2 rounded-full bg-bg/70 px-4 py-3 backdrop-blur-sm">
            <Loader2 className="size-5 animate-spin text-warning" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              Rendering · {provider}
            </span>
          </div>
        ) : status === "ready" ? (
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pauzeer" : "Speel preview"}
            className="grid size-14 place-items-center rounded-full bg-bg/70 text-text backdrop-blur-sm transition-transform hover:scale-105"
          >
            {playing ? <Pause className="size-5" /> : <Play className="ml-0.5 size-5" />}
          </button>
        ) : status === "queued" ? (
          <span className="rounded-full bg-bg/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle backdrop-blur-sm">
            In wachtrij
          </span>
        ) : (
          <span className="rounded-full bg-bg/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-danger backdrop-blur-sm">
            Render mislukt
          </span>
        )}
      </div>

      {/* shot id bottom-left */}
      <span className="absolute bottom-7 left-2 rounded bg-bg/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-text-subtle backdrop-blur-sm">
        {shotId}
      </span>

      {/* play bar */}
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 border-t border-border bg-bg/70 px-2 py-1.5 backdrop-blur-sm">
        <Timecode start={t} variant="accent" />
        <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-elevated">
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent/0 via-accent to-accent"
            style={{ width: `${(t / Math.max(0.01, durationSec)) * 100}%` }}
          />
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-subtle">
          {formatTimecode(durationSec)}
        </span>
      </div>
    </div>
  );
}
