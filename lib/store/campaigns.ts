"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Campaign, Artifacts } from "@/lib/schemas/campaign";

interface CampaignState {
  campaigns: Campaign[];
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  addCampaign: (campaign: Campaign) => void;
  updateArtifact: <K extends keyof Artifacts>(
    id: string,
    key: K,
    value: Artifacts[K]
  ) => void;
  removeCampaign: (id: string) => void;
  getById: (id: string) => Campaign | undefined;
}

export const useCampaigns = create<CampaignState>()(
  persist(
    (set, get) => ({
      campaigns: [],
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      addCampaign: (campaign) =>
        set((s) => ({ campaigns: [campaign, ...s.campaigns] })),
      updateArtifact: (id, key, value) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === id
              ? {
                  ...c,
                  updatedAt: new Date().toISOString(),
                  artifacts: { ...c.artifacts, [key]: value },
                }
              : c
          ),
        })),
      removeCampaign: (id) =>
        set((s) => ({ campaigns: s.campaigns.filter((c) => c.id !== id) })),
      getById: (id) => get().campaigns.find((c) => c.id === id),
    }),
    {
      name: "content-factory:campaigns:v1",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : (undefined as unknown as Storage)
      ),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
