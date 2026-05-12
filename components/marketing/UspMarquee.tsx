"use client";

const USPS = [
  "Live in 1-2 weken",
  "Eigen domein gekoppeld",
  "Cinematic AI-video",
  "SEO klaar voor lokaal Google",
  "Mobile-first design",
  "Geen account-manager-tussenlaag",
  "Persoonlijke begeleiding",
  "Premium maatwerk",
  "Stop wanneer je wilt",
];

/**
 * Eindeloos scrollende USP-strip — pure motion-break tussen content-blokken.
 * Gebruikt CSS-animatie (marquee keyframe) ipv JS voor max performance.
 * Dubbele set zodat de loop seamless is.
 */
export function UspMarquee() {
  const items = [...USPS, ...USPS];

  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-black py-7">
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((usp, i) => (
          <div
            key={i}
            className="mx-8 flex shrink-0 items-center gap-8 font-mono text-xs uppercase tracking-[0.3em] text-white/55"
          >
            <span>{usp}</span>
            <span className="text-accent/60">·</span>
          </div>
        ))}
      </div>
      {/* Fade edges voor cinematic look */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent" />
    </div>
  );
}
