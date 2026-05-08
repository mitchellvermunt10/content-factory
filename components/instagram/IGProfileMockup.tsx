"use client";

import { useState } from "react";
import { ChevronLeft, MoreHorizontal, Lock, Plus, Grid3x3, Bookmark, UserCircle, Film, Image as ImageIcon, Layers, Circle } from "lucide-react";
import type { InstagramContent } from "@/lib/schemas/artifacts/instagram";
import type { CampaignImage } from "@/components/artifacts/useCampaignImages";
import { IGPhoneFrame } from "./IGPhoneFrame";
import { IGPostDetail } from "./IGPostDetail";

type Props = {
  username: string; // @maisonlumiere etc.
  displayName: string;
  city: string;
  data: InstagramContent;
  accentColor?: string; // brand.accent — voor profile-gradient
  /** Lookup function: (artifactKey, itemIndex) → CampaignImage | null */
  findImage?: (artifactKey: string, itemIndex: number) => CampaignImage | null;
  /** Render slot — wordt geinjecteerd voor studio-mode (image-gen knoppen) */
  renderPostOverlay?: (postIndex: number) => React.ReactNode;
};

const TYPE_ICON: Record<string, React.ElementType> = {
  foto: ImageIcon,
  carousel: Layers,
  reel: Film,
  story: Circle,
};

export function IGProfileMockup({
  username,
  displayName,
  city,
  data,
  accentColor = "#B89968",
  findImage,
  renderPostOverlay,
}: Props) {
  const [activeTab, setActiveTab] = useState<"posts" | "reels" | "tagged">(
    "posts"
  );
  const [selectedPost, setSelectedPost] = useState<number | null>(null);

  // Map content-pijlers naar story-highlights (max 5)
  const highlights = data.pillars.slice(0, 5);

  // Posts uitgesplitst per tab
  const reelPosts = data.posts
    .map((p, i) => ({ post: p, index: i }))
    .filter(({ post }) => post.type === "reel");

  return (
    <div className="flex justify-center">
      <IGPhoneFrame>
        <div className="relative h-full w-full overflow-y-auto bg-white text-zinc-900">
          {/* Top header met username + lock + menu */}
          <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 pt-12 pb-3">
            <button className="text-zinc-900">
              <ChevronLeft className="size-6" />
            </button>
            <div className="flex items-center gap-1">
              <Lock className="size-3" />
              <span className="text-sm font-semibold">{username}</span>
            </div>
            <div className="flex items-center gap-3">
              <Plus className="size-6" />
              <MoreHorizontal className="size-6" />
            </div>
          </div>

          {/* Profile header */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-6">
              {/* Profile pic */}
              <div
                className="size-[88px] shrink-0 rounded-full p-[3px]"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)`,
                }}
              >
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white p-[3px]">
                  <div
                    className="flex h-full w-full items-center justify-center rounded-full text-2xl font-bold text-white"
                    style={{ background: accentColor }}
                  >
                    {displayName.charAt(0)}
                  </div>
                </div>
              </div>
              {/* Stats */}
              <div className="flex flex-1 justify-around text-center">
                <div>
                  <p className="text-base font-semibold">{data.posts.length}</p>
                  <p className="text-xs text-zinc-700">posts</p>
                </div>
                <div>
                  <p className="text-base font-semibold">2.4K</p>
                  <p className="text-xs text-zinc-700">volgers</p>
                </div>
                <div>
                  <p className="text-base font-semibold">487</p>
                  <p className="text-xs text-zinc-700">volgend</p>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-3">
              <p className="text-sm font-semibold">{displayName}</p>
              <p className="text-xs text-zinc-700">{data.bio.headline}</p>
              <p className="mt-1 whitespace-pre-line text-xs leading-snug text-zinc-900">
                {data.bio.body}
              </p>
              <p className="mt-1 text-xs font-medium text-blue-600">
                {city.toLowerCase().replace(" ", "")}.{username.replace("@", "")}.nl
              </p>
            </div>

            {/* Action buttons */}
            <div className="mt-3 flex gap-1.5">
              <button
                className="flex-1 rounded-lg py-1.5 text-sm font-semibold text-white"
                style={{ background: accentColor }}
              >
                Volgen
              </button>
              <button className="flex-1 rounded-lg bg-zinc-200 py-1.5 text-sm font-semibold">
                Bericht
              </button>
              <button className="rounded-lg bg-zinc-200 px-2.5 py-1.5">
                <UserCircle className="size-4" />
              </button>
            </div>

            {/* Story highlights */}
            {highlights.length > 0 ? (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {highlights.map((h, i) => (
                  <div
                    key={i}
                    className="flex shrink-0 flex-col items-center gap-1"
                  >
                    <div className="size-16 rounded-full border-2 border-zinc-300 p-0.5">
                      <div
                        className="flex h-full w-full items-center justify-center rounded-full text-[10px] font-medium text-white"
                        style={{
                          background: `linear-gradient(135deg, ${accentColor}, #555)`,
                        }}
                      >
                        {h.name.charAt(0)}
                      </div>
                    </div>
                    <span className="max-w-[68px] truncate text-[10px] text-zinc-900">
                      {h.name}
                    </span>
                  </div>
                ))}
                <div className="flex shrink-0 flex-col items-center gap-1">
                  <div className="flex size-16 items-center justify-center rounded-full border-2 border-zinc-300">
                    <Plus className="size-6 text-zinc-700" />
                  </div>
                  <span className="text-[10px] text-zinc-900">Nieuw</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Tab switcher */}
          <div className="sticky top-[60px] z-10 flex border-t border-zinc-200 bg-white">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex flex-1 items-center justify-center py-2.5 ${
                activeTab === "posts" ? "border-t-2 border-zinc-900" : ""
              }`}
            >
              <Grid3x3
                className={`size-5 ${
                  activeTab === "posts" ? "text-zinc-900" : "text-zinc-400"
                }`}
              />
            </button>
            <button
              onClick={() => setActiveTab("reels")}
              className={`flex flex-1 items-center justify-center py-2.5 ${
                activeTab === "reels" ? "border-t-2 border-zinc-900" : ""
              }`}
            >
              <Film
                className={`size-5 ${
                  activeTab === "reels" ? "text-zinc-900" : "text-zinc-400"
                }`}
              />
            </button>
            <button
              onClick={() => setActiveTab("tagged")}
              className={`flex flex-1 items-center justify-center py-2.5 ${
                activeTab === "tagged" ? "border-t-2 border-zinc-900" : ""
              }`}
            >
              <Bookmark
                className={`size-5 ${
                  activeTab === "tagged" ? "text-zinc-900" : "text-zinc-400"
                }`}
              />
            </button>
          </div>

          {/* Tab content */}
          {activeTab === "posts" ? (
            <div className="grid grid-cols-3 gap-[2px] pb-12">
              {data.posts.map((post, i) => {
                const Icon = TYPE_ICON[post.type] ?? ImageIcon;
                const img = findImage?.("instagram", i);
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedPost(i)}
                    className="relative aspect-square overflow-hidden bg-zinc-100"
                  >
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img.publicUrl}
                        alt={post.hook}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-end bg-gradient-to-br from-zinc-100 to-zinc-200 p-2">
                        <p className="line-clamp-3 text-[9px] leading-tight text-zinc-700">
                          {post.hook}
                        </p>
                      </div>
                    )}
                    {/* Type indicator linksboven */}
                    {post.type !== "foto" ? (
                      <div className="absolute right-1.5 top-1.5 text-white drop-shadow">
                        <Icon className="size-3.5" />
                      </div>
                    ) : null}
                    {renderPostOverlay ? renderPostOverlay(i) : null}
                  </button>
                );
              })}
            </div>
          ) : null}

          {activeTab === "reels" ? (
            <div className="grid grid-cols-3 gap-[2px] pb-12">
              {reelPosts.length === 0 ? (
                <div className="col-span-3 px-6 py-12 text-center text-xs text-zinc-500">
                  Geen reels gemarkeerd in deze content-set.
                  <br />
                  Reel-ideeën staan bij &lsquo;Reel concepten&rsquo;.
                </div>
              ) : (
                reelPosts.map(({ post, index }) => {
                  const img = findImage?.("instagram", index);
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedPost(index)}
                      className="relative aspect-[9/16] overflow-hidden bg-zinc-100"
                    >
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img.publicUrl}
                          alt={post.hook}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-end bg-gradient-to-br from-zinc-100 to-zinc-200 p-2">
                          <p className="line-clamp-3 text-[9px] leading-tight text-zinc-700">
                            {post.hook}
                          </p>
                        </div>
                      )}
                      <div className="absolute right-1.5 top-1.5 text-white drop-shadow">
                        <Film className="size-3.5" />
                      </div>
                      <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-[9px] text-white drop-shadow">
                        <Film className="size-2.5" />
                        <span>{Math.floor(Math.random() * 5) + 1}.{Math.floor(Math.random() * 9)}K</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          ) : null}

          {activeTab === "tagged" ? (
            <div className="px-6 py-16 text-center">
              <Bookmark className="mx-auto size-12 text-zinc-300" />
              <p className="mt-3 text-sm font-medium text-zinc-900">
                Gemarkeerd
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Posts waarin {displayName} getagd is verschijnen hier.
              </p>
            </div>
          ) : null}

          {/* Post detail overlay */}
          {selectedPost !== null ? (
            <IGPostDetail
              username={username}
              displayName={displayName}
              post={data.posts[selectedPost]}
              image={findImage?.("instagram", selectedPost) ?? null}
              accentColor={accentColor}
              onClose={() => setSelectedPost(null)}
            />
          ) : null}
        </div>
      </IGPhoneFrame>
    </div>
  );
}
