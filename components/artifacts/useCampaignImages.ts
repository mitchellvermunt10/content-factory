"use client";

import { useCallback, useEffect, useState } from "react";

export type CampaignImage = {
  id: string;
  campaignId: string;
  artifactKey: string;
  itemIndex: number | null;
  prompt: string;
  publicUrl: string;
  storagePath: string;
  width: number;
  height: number;
  createdAt: string;
};

/**
 * Hook die alle gegenereerde images voor een campaign laadt en een upsert-helper
 * teruggeeft. Per (artifactKey, itemIndex) houden we alleen de NIEUWSTE image —
 * regenereren overschrijft visueel, oudere records blijven in DB voor history.
 */
export function useCampaignImages(campaignId: string) {
  const [images, setImages] = useState<CampaignImage[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/images`);
      if (!res.ok) {
        setImages([]);
        return;
      }
      const j = (await res.json()) as { images: CampaignImage[] };
      setImages(j.images ?? []);
    } catch {
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Latest per (artifactKey, itemIndex) — we tonen de meest recente generatie.
  function findLatest(
    artifactKey: string,
    itemIndex: number
  ): CampaignImage | null {
    const matches = images.filter(
      (img) =>
        img.artifactKey === artifactKey && img.itemIndex === itemIndex
    );
    if (matches.length === 0) return null;
    // images is gesorteerd op created_at desc door de API
    return matches[0];
  }

  function upsertLocal(image: CampaignImage) {
    setImages((prev) => [image, ...prev]);
  }

  return { images, loading, refresh, findLatest, upsertLocal };
}
