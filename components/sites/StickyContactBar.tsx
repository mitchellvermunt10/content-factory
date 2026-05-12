"use client";

import { useEffect, useState } from "react";
import { Calendar, Phone, MapPin } from "lucide-react";

interface Props {
  reservationUrl?: string;
  phone?: string;
  address?: string;
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  /** Globale scroll-progress vanaf waar de bar verschijnt. Default 0.22. */
  appearAfter?: number;
}

/**
 * Sticky bottom-bar met 3 primaire acties: Reserveer / Bel / Route.
 * Komt vloeiend op vanaf scroll > appearAfter, met glass-morphism backdrop.
 * Mobiel: full-width grid. Desktop: gecentreerde pill.
 */
export function StickyContactBar({
  reservationUrl,
  phone,
  address,
  scrollContainerRef,
  appearAfter = 0.22,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function tick() {
      const el = scrollContainerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const scrolled = -rect.top;
      const p = total > 0 ? scrolled / total : 0;
      setVisible(p > appearAfter);
    }
    tick();
    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick);
    return () => {
      window.removeEventListener("scroll", tick);
      window.removeEventListener("resize", tick);
    };
  }, [scrollContainerRef, appearAfter]);

  const mapsUrl = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null;
  const telHref = phone ? `tel:${phone.replace(/\s/g, "")}` : null;

  // Geen acties → niets renderen
  if (!reservationUrl && !telHref && !mapsUrl) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 px-3 pb-3 transition-all duration-700 ease-out sm:px-6 sm:pb-6 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      }`}
      style={{ willChange: "transform, opacity" }}
    >
      <div className="mx-auto flex max-w-2xl items-stretch gap-2 rounded-2xl border border-white/15 bg-black/55 p-2 shadow-2xl backdrop-blur-2xl">
        {reservationUrl ? (
          <a
            href={reservationUrl}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
          >
            <Calendar className="size-4" />
            <span className="hidden sm:inline">Reserveer</span>
            <span className="sm:hidden">Reserveer</span>
          </a>
        ) : null}
        {telHref ? (
          <a
            href={telHref}
            className="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <Phone className="size-4" />
            Bel
          </a>
        ) : null}
        {mapsUrl ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <MapPin className="size-4" />
            Route
          </a>
        ) : null}
      </div>
    </div>
  );
}
