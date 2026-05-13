"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Phone } from "lucide-react";
import { SmoothScrollProvider } from "@/components/sites/SmoothScrollProvider";
import { ImageSequence } from "@/components/sites/ImageSequence";
import { CinematicCanvas } from "@/components/sites/CinematicCanvas";
import { Scene, SceneText, SceneStagger } from "@/components/sites/Scene";
import { StickyContactBar } from "@/components/sites/StickyContactBar";
import { WhatsAppFAB } from "@/components/sites/WhatsAppFAB";
import { ReviewsSection } from "@/components/sites/ReviewsSection";
import { SocialProofInline } from "@/components/sites/SocialProofStrip";
import { CookieBanner } from "@/components/sites/CookieBanner";
import { SiteFooter } from "@/components/sites/SiteFooter";
import { buildRestaurantShots } from "@/lib/sites/shotPresets";
import type { CinematicShot } from "@/components/sites/CinematicCanvas";
import type { NextLevelSiteData } from "@/lib/sites/types";

/**
 * Shots die NA de Kling-dolly volgen — Ken Burns over een food-hero en
 * een atmosfeer-hero, gemapt op de scroll-progress 0.35-1.0 zodat ze in
 * komen wanneer de video uitfade.
 */
const POST_VIDEO_SHOTS: CinematicShot[] = [
  {
    imageUrl: "/sites/italian-restaurant/post-1-food.jpg",
    startProgress: 0.32,
    endProgress: 0.72,
    scale: { from: 1.05, to: 1.35 },
    offsetY: { from: 0.02, to: -0.04 },
    warmth: { from: 0.2, to: 0.35 },
    brightness: { from: 0.95, to: 1.05 },
    vignette: { from: 0.2, to: 0.05 },
  },
  {
    imageUrl: "/sites/italian-restaurant/post-2-ambiance.jpg",
    startProgress: 0.68,
    endProgress: 1.0,
    scale: { from: 1.15, to: 1.0 },
    warmth: { from: 0.25, to: 0.3 },
    brightness: { from: 1.0, to: 0.95 },
    vignette: { from: 0.1, to: 0.25 },
  },
];

/**
 * De cinematic experience composer.
 *
 * Layout-trick: ÉÉN lange scroll-container (de <main>) bevat de pinned
 * image-sequence canvas EN alle scenes erbovenop. Scenes hebben zelf
 * hun sticky inhoud — de canvas zit erachter en pakt zijn progress
 * uit de totale main-container.
 */
export type SiteRenderMode = "video" | "cinematic" | "stub";

export function SiteExperience({
  data,
  mode = "stub",
}: {
  data: NextLevelSiteData;
  mode?: SiteRenderMode;
}) {
  const containerRef = useRef<HTMLElement>(null);
  const cinematicShots =
    mode === "cinematic"
      ? buildRestaurantShots({
          frames: [data.frames[0], data.frames[1], data.frames[2]] as [
            string,
            string,
            string
          ],
        })
      : null;

  return (
    <SmoothScrollProvider>
      <main ref={containerRef} className="relative bg-black text-white">
        {/* Pinned cinematic achtergrond — sticky top:0 binnen container */}
        <div
          className="pointer-events-none sticky top-0 z-0 h-screen w-full"
          aria-hidden="true"
        >
          {mode === "video" ? (
            // Twee-laagse cinematic: video bovenop (0-35%, fade-out 32-45%),
            // food/atmosphere Ken Burns erachter (komt op vanaf 32%).
            <>
              <CinematicCanvas
                shots={POST_VIDEO_SHOTS}
                scrollContainerRef={containerRef}
                fadeOverlap={0.08}
                className="absolute inset-0 h-full w-full"
              />
              <ImageSequence
                frames={data.frames}
                scrollContainerRef={containerRef}
                fit="cover"
                progressRange={{ from: 0, to: 0.32 }}
                fadeOutAfter={{ from: 0.3, to: 0.42 }}
                className="absolute inset-0 h-full w-full"
              />
            </>
          ) : cinematicShots ? (
            // Flux hero-frames + parametric dolly-in
            <CinematicCanvas
              shots={cinematicShots}
              scrollContainerRef={containerRef}
              fadeOverlap={0.08}
              className="relative h-full w-full"
            />
          ) : (
            // SVG-stub fallback
            <ImageSequence
              frames={data.frames}
              scrollContainerRef={containerRef}
              fit="cover"
              className="relative h-full w-full"
            />
          )}
          {/* Vignette voor leesbaarheid van tekst over alle frames */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60" />
        </div>

        {/* Scenes — zitten boven de pinned canvas dankzij z-10 */}
        <div className="relative z-10 -mt-[100vh]">
          {/* Scene 1 — Intro: gevel + bedrijfsnaam */}
          <Scene vhMultiplier={1.8}>
            <SceneText
              enterStart={0.0}
              enterEnd={0.18}
              exitStart={0.92}
              exitEnd={1.0}
              travel={48}
              className="px-6 text-center"
            >
              <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/60">
                {data.sceneLabels?.intro?.eyebrow ??
                  `${data.business.city} · ${data.business.vertical}`}
              </p>
              <h1 className="mt-6 font-serif text-6xl font-light leading-[0.95] tracking-tight md:text-8xl">
                {data.business.name}
              </h1>
              <p className="mt-8 max-w-xl text-balance text-base text-white/70 md:text-lg">
                {data.business.tagline}
              </p>
              {data.socialProof ? (
                <div className="mt-8">
                  <SocialProofInline socialProof={data.socialProof} />
                </div>
              ) : null}
            </SceneText>
          </Scene>

          {/* Scene 2 — Aankomst: je bent binnen */}
          <Scene vhMultiplier={1.8}>
            <SceneText
              enterStart={0.0}
              enterEnd={0.2}
              exitStart={0.92}
              exitEnd={1.0}
              travel={56}
              className="px-6 text-center"
            >
              <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/50">
                {data.sceneLabels?.arrival?.eyebrow ?? "Welkom binnen"}
              </p>
              <h2 className="mt-6 max-w-3xl font-serif text-4xl font-light leading-tight md:text-6xl">
                {data.sceneLabels?.arrival?.headline ??
                  (data.scenes[1]?.content?.headline as string) ??
                  "Een plek die je voelt zodra je binnenkomt."}
              </h2>
              {data.business.reservationUrl ? (
                <Link
                  href={data.business.reservationUrl}
                  className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
                >
                  {data.sceneLabels?.arrival?.ctaLabel ?? "Reserveer een tafel"}
                  <ArrowRight className="size-4" />
                </Link>
              ) : null}
            </SceneText>
          </Scene>

          {/* Scene 3 — Menu / diensten */}
          <Scene vhMultiplier={2.6}>
            <div className="w-full px-6">
              <div className="mx-auto max-w-4xl">
                <SceneText
                  enterStart={0.0}
                  enterEnd={0.12}
                  exitStart={0.95}
                  exitEnd={1.0}
                  travel={40}
                >
                  <p className="text-center font-mono text-xs uppercase tracking-[0.4em] text-white/50">
                    {data.sceneLabels?.menu?.eyebrow ?? "De kaart"}
                  </p>
                  <h2 className="mt-4 text-center font-serif text-4xl font-light md:text-5xl">
                    {data.sceneLabels?.menu?.headline ?? "Wat we serveren"}
                  </h2>
                </SceneText>

                <SceneStagger
                  windowStart={0.08}
                  windowEnd={0.4}
                  perItemDuration={0.16}
                  exitStart={0.95}
                  exitEnd={1.0}
                  travel={28}
                  className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-white/10 md:grid-cols-2"
                >
                  {(data.items ?? []).slice(0, 6).map((item) => (
                    <div
                      key={item.name}
                      className="h-full bg-black/60 p-6 backdrop-blur-sm"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="font-serif text-lg font-medium">
                          {item.name}
                        </h3>
                        {item.price ? (
                          <span className="font-mono text-sm text-white/60">
                            {item.price}
                          </span>
                        ) : null}
                      </div>
                      {item.description ? (
                        <p className="mt-2 text-sm leading-relaxed text-white/60">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </SceneStagger>
              </div>
            </div>
          </Scene>

          {/* Reviews — sociaal bewijs tussen menu en sfeer */}
          {data.socialProof?.testimonials && data.socialProof.testimonials.length > 0 ? (
            <ReviewsSection socialProof={data.socialProof} />
          ) : null}

          {/* Scene 4 — Sfeerbeelden grid */}
          <Scene vhMultiplier={2.2}>
            <div className="w-full px-6">
              <div className="mx-auto max-w-5xl">
                <SceneText
                  enterStart={0.0}
                  enterEnd={0.12}
                  exitStart={0.95}
                  exitEnd={1.0}
                  travel={40}
                >
                  <p className="text-center font-mono text-xs uppercase tracking-[0.4em] text-white/50">
                    {data.sceneLabels?.ambiance?.eyebrow ?? "Sfeer"}
                  </p>
                  <h2 className="mt-4 text-center font-serif text-4xl font-light md:text-5xl">
                    {data.sceneLabels?.ambiance?.headline ?? "Zoals het écht voelt"}
                  </h2>
                </SceneText>

                <SceneStagger
                  windowStart={0.08}
                  windowEnd={0.42}
                  perItemDuration={0.18}
                  exitStart={0.92}
                  exitEnd={1.0}
                  travel={24}
                  className="mt-12 grid grid-cols-3 gap-2 md:gap-3"
                >
                  {(data.photos ?? []).slice(0, 6).map((p, i) => (
                    <div
                      key={i}
                      className="aspect-square overflow-hidden rounded-lg bg-white/5"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.url}
                        alt={p.alt ?? ""}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </SceneStagger>

                {/* Subtiele 'over ons' uitnodiging — verschijnt nadat de
                    foto's zijn opgekomen, leidt naar /verhaal */}
                <SceneText
                  enterStart={0.45}
                  enterEnd={0.6}
                  exitStart={0.95}
                  exitEnd={1.0}
                  travel={16}
                  className="mt-12 text-center"
                >
                  <Link
                    href={`/sites/${data.slug}/verhaal`}
                    className="inline-flex items-center gap-2 border-b border-white/20 pb-1.5 font-mono text-xs uppercase tracking-[0.3em] text-white/55 transition-colors hover:border-white hover:text-white"
                  >
                    Lees het verhaal achter deze plek
                    <ArrowRight className="size-3.5" />
                  </Link>
                </SceneText>
              </div>
            </div>
          </Scene>

          {/* Scene 5 — Contact / reservering */}
          <Scene vhMultiplier={1.8}>
            <SceneText
              enterStart={0.0}
              enterEnd={0.18}
              exitStart={0.95}
              exitEnd={1.0}
              travel={48}
              className="w-full px-6 text-center"
            >
              <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/50">
                {data.sceneLabels?.contact?.eyebrow ?? "Tot snel"}
              </p>
              <h2 className="mt-4 font-serif text-5xl font-light md:text-7xl">
                {data.sceneLabels?.contact?.headline ?? "Kom langs"}
              </h2>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/70">
                {data.business.address ? (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="size-4" />
                    {data.business.address.formatted}
                  </span>
                ) : null}
                {data.business.phone ? (
                  <a
                    href={`tel:${data.business.phone.replace(/\s/g, "")}`}
                    className="inline-flex items-center gap-2 hover:text-white"
                  >
                    <Phone className="size-4" />
                    {data.business.phone}
                  </a>
                ) : null}
              </div>
              {data.business.reservationUrl ? (
                <Link
                  href={data.business.reservationUrl}
                  className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
                >
                  {data.sceneLabels?.contact?.ctaLabel ?? "Reserveer nu"}
                  <ArrowRight className="size-4" />
                </Link>
              ) : null}
            </SceneText>
          </Scene>
        </div>

        {/* Footer — buiten de pinned-canvas zone */}
        <SiteFooter data={data} />

        {/* Sticky CTAs — alleen na de hero zichtbaar */}
        <StickyContactBar
          reservationUrl={data.business.reservationUrl}
          phone={data.business.phone}
          address={data.business.address?.formatted}
          scrollContainerRef={containerRef}
          appearAfter={0.22}
        />
        <WhatsAppFAB
          whatsapp={data.business.whatsapp}
          defaultMessage={
            data.business.whatsappMessage ??
            `Hoi! Ik bekeek net jullie pagina van ${data.business.name} en heb een vraag.`
          }
        />
        <CookieBanner />
      </main>
    </SmoothScrollProvider>
  );
}
