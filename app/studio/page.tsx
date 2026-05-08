"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Sparkles, Mail, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CampaignListItem } from "@/components/studio/CampaignListItem";
import { useCampaigns } from "@/lib/store/campaigns";
import { GradientMesh } from "@/components/motion/GradientMesh";
import type { Campaign } from "@/lib/schemas/campaign";

const OWNER_KEY = "content-factory:owner-email";

export default function StudioDashboard() {
  const campaigns = useCampaigns((s) => s.campaigns);
  const hydrated = useCampaigns((s) => s.hydrated);
  const upsertCampaign = useCampaigns((s) => s.upsertCampaign);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(OWNER_KEY);
      if (cached) setOwnerEmail(cached);
    } catch {
      // niet beschikbaar — geen probleem
    }
  }, []);

  async function syncFromServer() {
    if (!ownerEmail || !ownerEmail.includes("@")) {
      toast.error("Vul je owner-email in", {
        description: "Bijv. mitchell@nextlevelsites.nl",
      });
      return;
    }
    setSyncing(true);
    try {
      try {
        localStorage.setItem(OWNER_KEY, ownerEmail);
      } catch {
        // niet beschikbaar — geen probleem
      }
      const res = await fetch(
        `/api/campaigns?owner=${encodeURIComponent(ownerEmail)}`
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error ?? `HTTP ${res.status}`
        );
      }
      const j = (await res.json()) as {
        campaigns: Campaign[];
        persisted: boolean;
      };
      if (!j.persisted) {
        toast.warning("Supabase niet geconfigureerd", {
          description: "Server-persistentie staat uit. Zet de env-vars in Vercel.",
        });
        return;
      }
      let added = 0;
      for (const c of j.campaigns) {
        upsertCampaign(c);
        added++;
      }
      toast.success(`${added} campagnes gesynchroniseerd`);
    } catch (err) {
      toast.error("Sync mislukt", {
        description: err instanceof Error ? err.message : "Onbekende fout",
      });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="relative isolate min-h-screen">
      <GradientMesh intensity="soft" />
      <div className="relative px-6 py-10 md:px-10 md:py-14">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
                Studio
              </span>
              <h1 className="mt-3 text-4xl font-medium tracking-tightest text-text md:text-5xl">
                <span className="text-gradient">Campagnes</span>
              </h1>
              <p className="mt-3 max-w-md text-text-muted">
                Een overzicht van alles wat je hebt gegenereerd. Synchroniseer
                via je owner-email om campagnes van andere apparaten te zien.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="lg" variant="ghost">
                <Link href="/studio/outreach">
                  <Mail className="size-4" />
                  Outreach kit
                </Link>
              </Button>
              <Button asChild size="lg" variant="primary">
                <Link href="/studio/nieuw">
                  <Plus className="size-4" />
                  Nieuwe campagne
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-border bg-surface/40 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                  Owner sync
                </span>
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="jouw@email.nl"
                  className="rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text"
                />
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={syncFromServer}
                disabled={syncing}
              >
                {syncing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                Sync van server
              </Button>
            </div>
          </div>

          <div className="mt-10 divider-line" />

          <div className="mt-10">
            {!hydrated ? (
              <SkeletonList />
            ) : campaigns.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {campaigns.map((c) => (
                  <CampaignListItem key={c.id} campaign={c} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      data-testid="campaigns-empty"
      className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface/30 p-16 text-center"
    >
      <div className="mb-6 grid size-12 place-items-center rounded-full border border-border bg-elevated">
        <Sparkles className="size-5 text-accent" />
      </div>
      <h3 className="text-xl font-medium tracking-tight text-text">
        Nog geen campagnes
      </h3>
      <p className="mt-2 max-w-sm text-text-muted">
        Start met een intake. Vier generatoren leveren je campagne in één run af.
      </p>
      <Button asChild className="mt-8" size="lg" variant="primary">
        <Link href="/studio/nieuw">
          <Plus className="size-4" />
          Eerste campagne starten
        </Link>
      </Button>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-[164px] rounded-2xl border border-border bg-surface/30 p-6"
        >
          <div className="h-5 w-24 animate-pulse rounded-full bg-elevated" />
          <div className="mt-6 h-7 w-3/4 animate-pulse rounded bg-elevated" />
          <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-elevated" />
        </div>
      ))}
    </div>
  );
}
