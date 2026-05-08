"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, Film, Layers, Circle } from "lucide-react";
import type { InstagramContent } from "@/lib/schemas/artifacts/instagram";
import type { CampaignImage } from "@/components/artifacts/useCampaignImages";

const ICON: Record<string, React.ElementType> = {
  foto: ImageIcon,
  carousel: Layers,
  reel: Film,
  story: Circle,
};

/**
 * Read-only feed grid voor klant-presentatie. Toont gegenereerde images uit
 * Supabase Storage als ze bestaan, anders een placeholder met de hook-tekst.
 * Geen generate-knoppen — dat is studio-only.
 */
export function PublicFeedGrid({
  campaignId,
  posts,
}: {
  campaignId: string;
  posts: InstagramContent["posts"];
}) {
  const [imageMap, setImageMap] = useState<Record<number, CampaignImage>>({});

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/campaigns/${campaignId}/images`)
      .then((res) => (res.ok ? res.json() : null))
      .then((j) => {
        if (cancelled || !j) return;
        const all = (j.images ?? []) as CampaignImage[];
        // Per (artifactKey, itemIndex) de nieuwste — de API sorteert al desc
        const byIdx: Record<number, CampaignImage> = {};
        for (const img of all) {
          if (img.artifactKey !== "instagram" || img.itemIndex === null) continue;
          if (byIdx[img.itemIndex]) continue; // al gevonden = nieuwste
          byIdx[img.itemIndex] = img;
        }
        setImageMap(byIdx);
      })
      .catch(() => {
        // niets — fallback toont placeholders
      });
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  return (
    <div className="mt-3 grid grid-cols-3 gap-1.5">
      {posts.map((p, i) => {
        const Icon = ICON[p.type] ?? ImageIcon;
        const img = imageMap[i];
        return (
          <div
            key={i}
            className="relative aspect-square overflow-hidden rounded-md border border-border bg-gradient-to-br from-surface to-elevated"
          >
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img.publicUrl}
                alt={p.hook}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
            <span className="absolute right-2 top-2 rounded-full bg-bg/60 px-1.5 py-0.5 font-mono text-[9px] uppercase text-text-muted backdrop-blur-sm">
              {p.type}
            </span>
            {!img ? (
              <div className="flex h-full items-end p-3">
                <p className="line-clamp-3 text-[10px] leading-tight text-text-muted">
                  {p.hook}
                </p>
              </div>
            ) : (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="line-clamp-2 text-[10px] leading-tight text-white">
                  {p.hook}
                </p>
              </div>
            )}
            {!ICON[p.type] ? null : (
              <Icon className="absolute left-2 top-2 size-3 text-text-muted opacity-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}
