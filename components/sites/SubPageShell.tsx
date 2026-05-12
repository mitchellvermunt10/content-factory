"use client";

import { useRef } from "react";
import { SmoothScrollProvider } from "@/components/sites/SmoothScrollProvider";
import { SiteNav } from "@/components/sites/SiteNav";
import { StickyContactBar } from "@/components/sites/StickyContactBar";
import { WhatsAppFAB } from "@/components/sites/WhatsAppFAB";
import type { NextLevelSiteData } from "@/lib/sites/types";

interface Props {
  data: NextLevelSiteData;
  children: React.ReactNode;
  /** Optioneel: hero-image die als sub-hero bovenaan komt */
  heroImage?: string;
  heroEyebrow?: string;
  heroTitle: string;
  heroSubtitle?: string;
}

/**
 * Gemeenschappelijke layout-shell voor alle subpagina's (/menu, /reserveren,
 * /verhaal, /contact). Geeft:
 * - Sticky SiteNav (solid mode)
 * - Cinematic sub-hero met optionele achtergrondfoto + Ken Burns
 * - Content-slot (children)
 * - Sticky bottom-bar + WhatsApp FAB
 * - Footer
 */
export function SubPageShell({
  data,
  children,
  heroImage,
  heroEyebrow,
  heroTitle,
  heroSubtitle,
}: Props) {
  const containerRef = useRef<HTMLElement>(null);

  return (
    <SmoothScrollProvider>
      <main ref={containerRef} className="relative min-h-screen bg-black text-white">
        <SiteNav
          slug={data.slug}
          businessName={data.business.name}
          startTransparent={false}
        />

        {/* Sub-hero — cinematic met achtergrond-image en zachte zoom */}
        <section className="relative flex h-[70vh] min-h-[480px] items-end overflow-hidden">
          {heroImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImage}
                alt=""
                className="absolute inset-0 h-full w-full scale-110 object-cover"
                style={{ willChange: "transform" }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-black to-black" />
          )}

          <div className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-16 sm:pb-20">
            {heroEyebrow ? (
              <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/60">
                {heroEyebrow}
              </p>
            ) : null}
            <h1 className="mt-4 font-serif text-5xl font-light leading-[0.95] tracking-tight md:text-7xl">
              {heroTitle}
            </h1>
            {heroSubtitle ? (
              <p className="mt-6 max-w-2xl text-pretty text-base text-white/70 md:text-lg">
                {heroSubtitle}
              </p>
            ) : null}
          </div>
        </section>

        {/* Content */}
        <div className="relative z-10">{children}</div>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/10 bg-black px-6 py-12 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
            Gemaakt door Next Level Sites
          </p>
        </footer>

        <StickyContactBar
          reservationUrl={data.business.reservationUrl}
          phone={data.business.phone}
          address={data.business.address}
          scrollContainerRef={containerRef}
          appearAfter={0.05}
        />
        <WhatsAppFAB
          whatsapp={data.business.whatsapp}
          defaultMessage={
            data.business.whatsappMessage ??
            `Hoi! Ik bekeek net jullie pagina van ${data.business.name} en heb een vraag.`
          }
        />
      </main>
    </SmoothScrollProvider>
  );
}
