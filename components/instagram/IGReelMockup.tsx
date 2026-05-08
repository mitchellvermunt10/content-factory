"use client";

import {
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  Music,
  Play,
} from "lucide-react";
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
 * Reel-player mockup zoals echt IG: full-screen 9:16 met right-side
 * action stack (heart/comment/send/more), bottom met username +
 * caption + audio, play-icoon overlay in midden.
 *
 * Pakt eerst reel-type posts uit data.posts; valt anders terug op
 * eerste reel-idea uit reelIdeas.
 */
export function IGReelMockup({
  username,
  displayName,
  data,
  accentColor = "#B89968",
  findImage,
}: Props) {
  // Pick reel: eerst echte reel-type posts, anders eerste reelIdea
  const reelPostIdx = data.posts.findIndex((p) => p.type === "reel");
  const reelPost = reelPostIdx >= 0 ? data.posts[reelPostIdx] : null;
  const reelIdea = data.reelIdeas[0];

  const hook = reelPost?.hook ?? reelIdea?.hook ?? data.bio.headline;
  const caption = reelPost?.caption ?? reelIdea?.concept ?? "";
  const cta = reelPost?.cta ?? "Volg voor meer";
  const sound = reelIdea?.soundDirection ?? "Original audio";

  const img = reelPostIdx >= 0 ? findImage?.("instagram", reelPostIdx) : null;

  // Random-feel engagement nrs voor mockup
  const likes = Math.floor(Math.random() * 8000) + 1500;
  const comments = Math.floor(Math.random() * 200) + 30;

  return (
    <div className="flex justify-center">
      <IGPhoneFrame label="Reel">
        <div className="relative h-full w-full bg-zinc-900">
          {/* Achtergrond — image of accent-gradient */}
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img.publicUrl}
              alt="reel"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 50% 30%, ${accentColor}88, #1a1a1a 70%)`,
              }}
            />
          )}

          {/* Donker-gradient onderaan */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

          {/* Top: tabs Reels actief */}
          <div className="absolute inset-x-0 top-12 z-20 flex items-center justify-between px-4">
            <span className="text-base font-semibold text-white">Reels</span>
            <button className="text-white">
              <MoreHorizontal className="size-5" />
            </button>
          </div>

          {/* Centrum play-icon — alsof video gepauzeerd is */}
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-0 hover:opacity-100">
            <div className="rounded-full bg-black/40 p-4 backdrop-blur-sm">
              <Play
                className="size-10 text-white"
                strokeWidth={1.5}
                fill="white"
              />
            </div>
          </div>

          {/* Right action stack */}
          <div className="absolute right-3 bottom-32 z-20 flex flex-col items-center gap-5">
            <button className="flex flex-col items-center gap-1 text-white">
              <Heart className="size-7 drop-shadow" strokeWidth={1.5} />
              <span className="text-[11px] font-semibold drop-shadow">
                {likes >= 1000
                  ? `${(likes / 1000).toFixed(1)}K`
                  : likes}
              </span>
            </button>
            <button className="flex flex-col items-center gap-1 text-white">
              <MessageCircle
                className="size-7 drop-shadow"
                strokeWidth={1.5}
              />
              <span className="text-[11px] font-semibold drop-shadow">
                {comments}
              </span>
            </button>
            <button className="flex flex-col items-center gap-1 text-white">
              <Send className="size-7 drop-shadow" strokeWidth={1.5} />
            </button>
            <button className="flex flex-col items-center gap-1 text-white">
              <MoreHorizontal
                className="size-7 drop-shadow"
                strokeWidth={1.5}
              />
            </button>
            {/* Audio thumbnail */}
            <div className="rounded-md border border-white/40 bg-black/40 p-1 backdrop-blur-sm">
              <Music className="size-4 text-white" />
            </div>
          </div>

          {/* Bottom: username + caption + audio */}
          <div className="absolute inset-x-0 bottom-12 z-20 px-3 pr-16">
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
              <span className="text-sm font-semibold text-white drop-shadow">
                {username}
              </span>
              <button className="rounded border border-white/60 px-2 py-0.5 text-[11px] font-semibold text-white">
                Volg
              </button>
            </div>
            <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {hook}
            </p>
            {caption && caption !== hook ? (
              <p className="mt-1 line-clamp-1 text-xs text-white/80 drop-shadow">
                {caption}
              </p>
            ) : null}
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-white/90 drop-shadow">
              <Music className="size-3" />
              <span className="line-clamp-1">{sound}</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-2">
              <span
                className="rounded-full px-3 py-1 text-[11px] font-semibold text-white"
                style={{ background: accentColor }}
              >
                {cta}
              </span>
            </div>
          </div>
        </div>
      </IGPhoneFrame>
    </div>
  );
}
