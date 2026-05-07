"use client";

import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampaignListItem } from "@/components/studio/CampaignListItem";
import { useCampaigns } from "@/lib/store/campaigns";
import { GradientMesh } from "@/components/motion/GradientMesh";

export default function StudioDashboard() {
  const campaigns = useCampaigns((s) => s.campaigns);
  const hydrated = useCampaigns((s) => s.hydrated);

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
                Een overzicht van alles wat je hebt gegenereerd. Lokaal opgeslagen
                in deze browser.
              </p>
            </div>
            <Button asChild size="lg" variant="primary">
              <Link href="/studio/nieuw">
                <Plus className="size-4" />
                Nieuwe campagne
              </Link>
            </Button>
          </div>

          <div className="mt-12 divider-line" />

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
