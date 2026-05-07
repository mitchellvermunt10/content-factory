"use client";

import { cn } from "@/lib/utils";

const RATIO_MAP: Record<string, string> = {
  "16:9": "aspect-[16/9]",
  "9:16": "aspect-[9/16]",
  "1:1": "aspect-square",
  "21:9": "aspect-[21/9]",
  "4:5": "aspect-[4/5]",
  "3:2": "aspect-[3/2]",
};

export function AspectFrame({
  ratio = "16:9",
  className,
  children,
  framing,
  cameraMove,
}: {
  ratio?: string;
  className?: string;
  children?: React.ReactNode;
  framing?: string;
  cameraMove?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-border bg-bg/60",
        RATIO_MAP[ratio] ?? "aspect-video",
        className
      )}
    >
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
      {/* center crosshair */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30"
      >
        <span className="absolute left-1/2 top-1/2 h-px w-6 -translate-x-1/2 -translate-y-1/2 bg-text-subtle" />
        <span className="absolute left-1/2 top-1/2 h-6 w-px -translate-x-1/2 -translate-y-1/2 bg-text-subtle" />
      </div>
      {/* corners */}
      <Corners />
      {/* meta */}
      <div className="pointer-events-none absolute inset-x-2 top-2 flex items-start justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-text-subtle">
        <span className="rounded bg-bg/60 px-1.5 py-0.5 backdrop-blur-sm">{ratio}</span>
        {framing ? (
          <span className="rounded bg-bg/60 px-1.5 py-0.5 backdrop-blur-sm">
            {framing}
          </span>
        ) : null}
      </div>
      {cameraMove ? (
        <div className="pointer-events-none absolute inset-x-2 bottom-2 flex justify-end font-mono text-[9px] uppercase tracking-[0.18em] text-text-subtle">
          <span className="rounded bg-bg/60 px-1.5 py-0.5 backdrop-blur-sm">
            {cameraMove}
          </span>
        </div>
      ) : null}
      {/* content */}
      {children ? (
        <div className="absolute inset-0 flex items-end justify-start p-4">
          {children}
        </div>
      ) : null}
    </div>
  );
}

function Corners() {
  return (
    <>
      <span className="pointer-events-none absolute left-1.5 top-1.5 h-3 w-3 border-l border-t border-text-subtle/60" />
      <span className="pointer-events-none absolute right-1.5 top-1.5 h-3 w-3 border-r border-t border-text-subtle/60" />
      <span className="pointer-events-none absolute bottom-1.5 left-1.5 h-3 w-3 border-b border-l border-text-subtle/60" />
      <span className="pointer-events-none absolute bottom-1.5 right-1.5 h-3 w-3 border-b border-r border-text-subtle/60" />
    </>
  );
}
