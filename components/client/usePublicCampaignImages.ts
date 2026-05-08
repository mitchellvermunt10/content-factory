"use client";

import { useEffect, useState } from "react";
import type { CampaignImage } from "@/components/artifacts/useCampaignImages";

/**
 * Read-only fetch van alle gegenereerde images voor een campagne.
 * Gebruikt door /c/[id] sub-secties die latest-image-per-(artifactKey,itemIndex)
 * willen tonen zonder de generate-buttons.
 */
export function usePublicCampaignImages(campaignId: string) {
  const [images, setImages] = useState<CampaignImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/campaigns/${campaignId}/images`)
      .then((res) => (res.ok ? res.json() : null))
      .then((j) => {
        if (cancelled || !j) return;
        setImages((j.images ?? []) as CampaignImage[]);
      })
      .catch(() => {
        // niets — fallback toont placeholders
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  // Latest per (artifactKey, itemIndex). API geeft al desc-sorted dus eerste match wint.
  function find(artifactKey: string, itemIndex: number): CampaignImage | null {
    for (const img of images) {
      if (img.artifactKey === artifactKey && img.itemIndex === itemIndex) {
        return img;
      }
    }
    return null;
  }

  return { images, loading, find };
}
