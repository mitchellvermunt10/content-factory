"use client";

import { cn } from "@/lib/utils";

/**
 * Grotere iPhone-frame specifiek voor Instagram-mockup. 380px breed zodat
 * het feed-grid + posts goed leesbaar zijn. Status-bar, dynamic island,
 * en home-indicator onderaan zoals de echte iOS-UI.
 */
export function IGPhoneFrame({
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
        <div className="relative w-[380px] rounded-[44px] border-[3px] border-zinc-800 bg-zinc-950 p-1.5 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.8)]">
          <div className="relative aspect-[9/19.5] overflow-hidden rounded-[36px] bg-white">
            {/* iOS status bar */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-7 pt-3 text-[12px] font-semibold text-zinc-900">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <SignalIcon />
                <WifiIcon />
                <BatteryIcon />
              </div>
            </div>
            {/* Dynamic island */}
            <div className="pointer-events-none absolute left-1/2 top-2 z-40 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />
            {/* iOS home indicator */}
            <div className="pointer-events-none absolute inset-x-0 bottom-2 z-40 flex justify-center">
              <span className="h-1 w-32 rounded-full bg-zinc-900" />
            </div>
            {children}
          </div>
        </div>
        {/* Side buttons */}
        <span className="absolute -right-[3px] top-32 h-16 w-1 rounded-r-md bg-zinc-700" />
        <span className="absolute -left-[3px] top-24 h-9 w-1 rounded-l-md bg-zinc-700" />
        <span className="absolute -left-[3px] top-40 h-16 w-1 rounded-l-md bg-zinc-700" />
        <span className="absolute -left-[3px] top-60 h-16 w-1 rounded-l-md bg-zinc-700" />
      </div>
      {label ? (
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
          {label}
        </span>
      ) : null}
    </div>
  );
}

function SignalIcon() {
  return (
    <svg width="18" height="11" viewBox="0 0 18 11" fill="currentColor">
      <rect x="0" y="7" width="3" height="4" rx="0.5" />
      <rect x="5" y="5" width="3" height="6" rx="0.5" />
      <rect x="10" y="2" width="3" height="9" rx="0.5" />
      <rect x="15" y="0" width="3" height="11" rx="0.5" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
      <path d="M8 11l-2-2a2.83 2.83 0 014 0l-2 2zm5-5a8.49 8.49 0 00-10 0l1.5 1.5a6.36 6.36 0 017 0L13 6zm3-3a13 13 0 00-16 0l1.5 1.5a10.86 10.86 0 0113 0L16 3z" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
      <rect
        x="0.5"
        y="0.5"
        width="22"
        height="11"
        rx="2.5"
        stroke="currentColor"
        opacity="0.4"
      />
      <rect x="2" y="2" width="19" height="8" rx="1.5" fill="currentColor" />
      <rect
        x="23.5"
        y="4"
        width="1.5"
        height="4"
        rx="0.5"
        fill="currentColor"
        opacity="0.4"
      />
    </svg>
  );
}
