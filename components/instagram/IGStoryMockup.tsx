"use client";

import { ChevronLeft, MoreHorizontal, Heart, Send } from "lucide-react";
import type { InstagramContent } from "@/lib/schemas/artifacts/instagram";
import type { CampaignImage } from "@/components/artifacts/useCampaignImages";
import { IGPhoneFrame } from "./IGPhoneFrame";

type Props = {
  username: string;
  displayName: string;
  data: InstagramContent;
  accentColor?: string;
  findImage?: (artifactKey: string, itemIndex: number) => CampaignImage | null;
};

/**
 * Story-mockup zoals echt IG: full-screen 9:16 met progress-bars boven,
 * profile-pill linksboven, swipe-up of action-icons onder.
 *
 * Gebruikt content-pijlers als "story-set" (alsof het een serie is).
 * Klant ziet meerdere story-frames — feel van een echte branded story.
 */
export function IGStoryMockup({
  username,
  displayName,
  data,
  accentColor = "#B89968",
  findImage,
}: Props) {
  // Pak max 5 story-frames: prioriteit story-type posts, dan eerste pillars
  const storyPosts = data.posts.filter((p) => p.type === "story").slice(0, 5);
  const fillFromPillars = data.pillars
    .slice(0, Math.max(0, 4 - storyPosts.length))
    .map((p) => ({
      type: "story" as const,
      hook: p.name,
      caption: p.description,
      hashtags: [],
      visualDirection: p.description,
      cta: "Meer →",
    }));
  const frames = [...storyPosts, ...fillFromPillars];
  const total = Math.max(frames.length, 1);

  return (
    <div className="flex justify-center">
      <IGPhoneFrame label={`Story · ${total} frames`}>
        <div className="relative h-full w-full bg-zinc-900">
          {/* Image / background */}
          {(() => {
            const firstStoryIdx = data.posts.findIndex(
              (p) => p.type === "story"
            );
            const img =
              firstStoryIdx >= 0
                ? findImage?.("instagram", firstStoryIdx)
                : null;
            if (img) {
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img.publicUrl}
                  alt="story"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              );
            }
            return (
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at 30% 20%, ${accentColor}99, ${accentColor}33 40%, #1a1a1a 80%)`,
                }}
              />
            );
          })()}

          {/* Donker-gradient bovenaan voor leesbaarheid */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />

          {/* Progress bars */}
          <div className="absolute inset-x-0 top-12 z-30 flex gap-1 px-3">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30"
              >
                <div
                  className="h-full bg-white"
                  style={{
                    width: i === 0 ? "65%" : i === 0 ? "100%" : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Top header met profile-pill */}
          <div className="absolute inset-x-0 top-16 z-30 flex items-center justify-between px-3">
            <div className="flex items-center gap-2">
              <div
                className="size-7 rounded-full p-[1px]"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, #fff)`,
                }}
              >
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white p-[1px]">
                  <div
                    className="flex h-full w-full items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{ background: accentColor }}
                  >
                    {displayName.charAt(0)}
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-white">
                {username}
              </span>
              <span className="text-xs text-white/70">15m</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <button>
                <ChevronLeft className="size-5" />
              </button>
              <button>
                <MoreHorizontal className="size-5" />
              </button>
            </div>
          </div>

          {/* Story content (centraal) */}
          <div className="absolute inset-x-6 bottom-32 z-20">
            <div className="rounded-xl bg-black/40 p-5 backdrop-blur-md">
              <p className="text-2xl font-semibold leading-tight tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                {frames[0]?.hook ?? data.bio.headline}
              </p>
              {frames[0]?.caption ? (
                <p className="mt-3 line-clamp-3 text-sm leading-snug text-white/90">
                  {frames[0].caption}
                </p>
              ) : null}
              <div
                className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white"
                style={{ background: accentColor }}
              >
                {frames[0]?.cta ?? data.bio.cta} →
              </div>
            </div>
          </div>

          {/* Bottom action-bar */}
          <div className="absolute inset-x-0 bottom-7 z-30 flex items-center gap-2 px-3">
            <input
              disabled
              placeholder="Reageer op verhaal..."
              className="flex-1 rounded-full border border-white/40 bg-transparent px-4 py-2 text-xs text-white placeholder-white/70"
            />
            <button className="text-white">
              <Heart className="size-6" strokeWidth={1.5} />
            </button>
            <button className="text-white">
              <Send className="size-6" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </IGPhoneFrame>
    </div>
  );
}
