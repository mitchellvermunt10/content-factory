"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Campaign, Artifacts } from "@/lib/schemas/campaign";
import type { ReceptionistConfig } from "@/lib/schemas/artifacts/receptionist";

interface CampaignState {
  campaigns: Campaign[];
  hydrated: boolean;
  fetchingIds: Record<string, boolean>;
  receptionists: Record<string, ReceptionistConfig>;
  setHydrated: (v: boolean) => void;
  addCampaign: (campaign: Campaign) => void;
  upsertCampaign: (campaign: Campaign) => void;
  updateArtifact: <K extends keyof Artifacts>(
    id: string,
    key: K,
    value: Artifacts[K]
  ) => void;
  setReceptionist: (campaignId: string, config: ReceptionistConfig) => void;
  getReceptionist: (campaignId: string) => ReceptionistConfig | undefined;
  removeCampaign: (id: string) => void;
  getById: (id: string) => Campaign | undefined;
  fetchFromServer: (id: string) => Promise<Campaign | null>;
}

export const useCampaigns = create<CampaignState>()(
  persist(
    (set, get) => ({
      campaigns: [],
      hydrated: false,
      fetchingIds: {},
      receptionists: {},
      setHydrated: (v) => set({ hydrated: v }),
      setReceptionist: (campaignId, config) =>
        set((s) => ({
          receptionists: { ...s.receptionists, [campaignId]: config },
        })),
      getReceptionist: (campaignId) => get().receptionists[campaignId],
      addCampaign: (campaign) =>
        set((s) => ({ campaigns: [campaign, ...s.campaigns] })),
      upsertCampaign: (campaign) =>
        set((s) => {
          const idx = s.campaigns.findIndex((c) => c.id === campaign.id);
          if (idx === -1) return { campaigns: [campaign, ...s.campaigns] };
          const next = [...s.campaigns];
          next[idx] = campaign;
          return { campaigns: next };
        }),
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
      fetchFromServer: async (id) => {
        const existing = get().campaigns.find((c) => c.id === id);
        if (existing) return existing;
        if (get().fetchingIds[id]) return null;
        set((s) => ({ fetchingIds: { ...s.fetchingIds, [id]: true } }));
        try {
          const res = await fetch(`/api/campaigns/${id}`);
          if (!res.ok) return null;
          const j = (await res.json()) as { campaign: Campaign | null };
          if (!j.campaign) return null;
          set((s) => ({ campaigns: [j.campaign as Campaign, ...s.campaigns] }));
          return j.campaign;
        } catch {
          return null;
        } finally {
          set((s) => {
            const next = { ...s.fetchingIds };
            delete next[id];
            return { fetchingIds: next };
          });
        }
      },
    }),
    {
      name: "content-factory:campaigns:v1",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : (undefined as unknown as Storage)
      ),
      partialize: (s) => ({
        campaigns: s.campaigns,
        receptionists: s.receptionists,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
