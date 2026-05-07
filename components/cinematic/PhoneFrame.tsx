"use client";

import { cn } from "@/lib/utils";

export function PhoneFrame({
  children,
  className,
  label,
}: {
  children?: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative">
        <div className="relative w-[260px] rounded-[36px] border border-border-strong bg-elevated p-2 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
          <div className="relative aspect-[9/19.5] overflow-hidden rounded-[28px] bg-bg">
            {/* status bar */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-text-subtle">
              <span>09:41</span>
              <span>4G</span>
            </div>
            {/* notch */}
            <div className="pointer-events-none absolute left-1/2 top-1.5 z-30 h-4 w-20 -translate-x-1/2 rounded-full bg-bg" />
            {children}
          </div>
        </div>
        {/* side accents */}
        <span className="absolute -right-0.5 top-24 h-12 w-0.5 rounded-r-md bg-border-strong" />
        <span className="absolute -left-0.5 top-20 h-7 w-0.5 rounded-l-md bg-border-strong" />
        <span className="absolute -left-0.5 top-32 h-12 w-0.5 rounded-l-md bg-border-strong" />
      </div>
      {label ? (
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
          {label}
        </span>
      ) : null}
    </div>
  );
}
