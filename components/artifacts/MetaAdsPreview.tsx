"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MetaAds } from "@/lib/schemas/artifacts/metaAds";

export function MetaAdsPreview({ data }: { data: MetaAds }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Campagne &amp; doelgroep</CardTitle>
          <Badge variant="accent">{data.campaignObjective}</Badge>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-text-muted">{data.audienceTargeting.description}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Locaties" value={data.audienceTargeting.locations.join(", ")} />
            <Stat label="Leeftijd" value={data.audienceTargeting.ageRange} />
            <Stat
              label="Interests"
              value={`${data.audienceTargeting.interests.length}`}
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {data.audienceTargeting.interests.map((i, idx) => (
              <Badge key={idx} variant="outline">
                {i}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
          Feed varianten
        </h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {data.variants.map((v, i) => (
            <FeedAdMockup key={i} variant={v} index={i} />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
          Story varianten
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {data.storyAds.map((s, i) => (
            <StoryAdMockup key={i} ad={s} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-bg/40 p-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
        {label}
      </div>
      <div className="mt-1 text-sm text-text">{value}</div>
    </div>
  );
}

function FeedAdMockup({
  variant,
  index,
}: {
  variant: MetaAds["variants"][number];
  index: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-elevated">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-full bg-gradient-to-br from-accent/80 via-accent/30 to-transparent" />
          <div>
            <div className="text-xs font-medium text-text">Studio Vermunt</div>
            <div className="font-mono text-[10px] text-text-subtle">
              Gesponsord · Variant {index + 1}
            </div>
          </div>
        </div>
        <span className="font-mono text-text-subtle">…</span>
      </div>
      <div className="space-y-3 px-4 py-4">
        <p className="text-sm leading-relaxed text-text">
          <span className="font-medium">{variant.hook}</span>{" "}
          <span className="text-text-muted">{variant.primaryText}</span>
        </p>
      </div>
      <div className="aspect-[1.91/1] border-y border-border bg-surface/40">
        <div className="grid h-full place-items-center px-6 text-center text-text-subtle">
          <span className="font-mono text-xs uppercase tracking-[0.18em]">
            {variant.visualDirection}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
            studio-vermunt.nl
          </div>
          <div className="truncate text-sm font-medium text-text">
            {variant.headline}
          </div>
          <div className="truncate text-xs text-text-muted">
            {variant.description}
          </div>
        </div>
        <button className="shrink-0 rounded-full border border-border bg-elevated px-3 py-1.5 text-xs font-medium tracking-tight text-text">
          {variant.cta}
        </button>
      </div>
    </div>
  );
}

function StoryAdMockup({
  ad,
  index,
}: {
  ad: MetaAds["storyAds"][number];
  index: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-surface/80 to-elevated">
      <div className="aspect-[9/16]">
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-gradient-to-br from-accent/80 via-accent/30 to-transparent" />
            <div className="font-mono text-[10px] text-text-subtle">
              Story · {index + 1}
            </div>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-base font-medium leading-tight tracking-tight text-text">
              {ad.hook}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-text-muted">
              {ad.body}
            </p>
            <Badge variant="accent" className="mt-5">
              {ad.sticker}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
