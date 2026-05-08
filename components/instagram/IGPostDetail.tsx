"use client";

import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  X,
} from "lucide-react";
import type { InstagramContent } from "@/lib/schemas/artifacts/instagram";
import type { CampaignImage } from "@/components/artifacts/useCampaignImages";

type Props = {
  username: string;
  displayName: string;
  post: InstagramContent["posts"][number];
  image: CampaignImage | null;
  accentColor?: string;
  onClose: () => void;
};

export function IGPostDetail({
  username,
  displayName,
  post,
  image,
  accentColor = "#B89968",
  onClose,
}: Props) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-3 pb-2 pt-12">
        <button onClick={onClose} className="text-zinc-900">
          <X className="size-6" />
        </button>
        <span className="text-sm font-semibold">Post</span>
        <span className="size-6" />
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {/* Post header */}
        <div className="flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div
              className="size-8 rounded-full p-[1.5px]"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, #f09433, #dc2743, #bc1888)`,
              }}
            >
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white p-[1.5px]">
                <div
                  className="flex h-full w-full items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: accentColor }}
                >
                  {displayName.charAt(0)}
                </div>
              </div>
            </div>
            <span className="text-sm font-semibold">{username}</span>
          </div>
          <MoreHorizontal className="size-5" />
        </div>

        {/* Image */}
        <div className="aspect-square w-full overflow-hidden bg-zinc-100">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.publicUrl}
              alt={post.hook}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-700">
                  Beeld nog te genereren
                </p>
                <p className="mt-2 text-xs italic text-zinc-500">
                  {post.visualDirection}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex gap-3.5">
            <Heart className="size-7 text-zinc-900" strokeWidth={1.5} />
            <MessageCircle className="size-7 text-zinc-900" strokeWidth={1.5} />
            <Send className="size-7 text-zinc-900" strokeWidth={1.5} />
          </div>
          <Bookmark className="size-7 text-zinc-900" strokeWidth={1.5} />
        </div>

        {/* Likes */}
        <div className="px-3">
          <p className="text-sm font-semibold">
            {Math.floor(Math.random() * 800) + 200} vind-ik-leuks
          </p>
        </div>

        {/* Caption */}
        <div className="px-3 py-1 text-sm leading-snug">
          <span className="font-semibold">{username}</span>{" "}
          <span className="font-semibold">{post.hook}</span>
          <p className="mt-1 whitespace-pre-line">{post.caption}</p>
          <p className="mt-2 text-blue-900">
            {post.hashtags
              .map((h) => (h.startsWith("#") ? h : `#${h}`))
              .join(" ")}
          </p>
        </div>

        {/* CTA-like element */}
        <div className="mx-3 mt-3 rounded-lg border border-zinc-200 p-3">
          <p className="text-xs text-zinc-500">Call-to-action</p>
          <p className="mt-1 text-sm font-medium">{post.cta}</p>
        </div>

        {/* Timestamp */}
        <p className="mt-3 px-3 text-[11px] uppercase text-zinc-500">
          15 minuten geleden
        </p>

        {/* Comment input mockup */}
        <div className="mt-3 flex items-center gap-2 border-t border-zinc-200 px-3 py-2">
          <div
            className="size-7 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, #999)`,
            }}
          />
          <input
            disabled
            placeholder="Voeg een reactie toe..."
            className="flex-1 bg-transparent text-xs text-zinc-700 placeholder-zinc-400"
          />
        </div>
      </div>
    </div>
  );
}
