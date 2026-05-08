"use client";

import { useMemo, useState } from "react";
import { Download, Film, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timeline } from "./Timeline";
import { SceneDetail } from "./SceneDetail";
import { VoiceOverPanel } from "./VoiceOverPanel";
import { Timecode } from "@/components/cinematic/Timecode";
import {
  buildEdl,
  downloadEdlJson,
  downloadShotListCsv,
} from "@/lib/export/cinematic";
import type { CinematicCampaign } from "@/lib/schemas/artifacts/cinematic";

export function CinematicPreview({
  data,
  campaignName,
  onChangePrompt,
  campaignId,
}: {
  data: CinematicCampaign;
  campaignName: string;
  onChangePrompt?: (
    sceneId: string,
    shotId: string,
    kind: "imagePrompt" | "videoPrompt",
    value: string
  ) => void;
  campaignId?: string;
}) {
  const [activeScene, setActiveScene] = useState(data.scenes[0]?.id);

  const sceneStartMap = useMemo(() => {
    let cumul = 0;
    const map: Record<string, number> = {};
    for (const s of data.scenes) {
      map[s.id] = cumul;
      cumul += s.durationSec;
    }
    return map;
  }, [data.scenes]);

  // Global shot index per scene — voor image-gen koppeling. Iedere shot in
  // de campagne krijgt een unieke flat index zodat we 'm consistent kunnen
  // matchen met de campaign_images tabel (artifactKey="cinematic").
  const globalShotStartMap = useMemo(() => {
    let cumul = 0;
    const map: Record<string, number> = {};
    for (const s of data.scenes) {
      map[s.id] = cumul;
      cumul += s.shots.length;
    }
    return map;
  }, [data.scenes]);

  const current = data.scenes.find((s) => s.id === activeScene) ?? data.scenes[0];
  const start = sceneStartMap[current.id] ?? 0;

  return (
    <div className="space-y-8" data-testid="cinematic-preview">
      <header className="overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-elevated/80 to-bg/40 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="accent">
                <Film className="size-3" />
                Master cut
              </Badge>
              <Badge variant="outline">
                {data.concept.primaryAspectRatio}
              </Badge>
              <Timecode duration={data.concept.totalDurationSec} variant="accent" />
            </div>
            <h2 className="mt-4 max-w-2xl text-2xl font-medium leading-tight tracking-tight md:text-3xl">
              <span className="text-gradient">{data.concept.logline}</span>
            </h2>
            <p className="mt-3 text-sm text-text-muted">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                Pillar
              </span>{" "}
              {data.concept.brandPillar} ·{" "}
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                Mood
              </span>{" "}
              {data.concept.mood}
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-text-subtle">
              <Music className="size-3" />
              {data.concept.musicDirection}
            </p>
          </div>
          <div className="hidden flex-shrink-0 flex-col gap-2 md:flex">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => downloadEdlJson(buildEdl(data, campaignName), campaignName)}
              data-testid="export-edl"
            >
              <Download className="size-3.5" />
              Timeline JSON
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => downloadShotListCsv(data, campaignName)}
            >
              <Download className="size-3.5" />
              Shot list CSV
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {data.deliverables.cutdowns.map((c, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs"
            >
              <span className="text-text-muted">{c.name}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                {c.durationSec}s · {c.aspectRatio}
              </span>
            </span>
          ))}
        </div>
      </header>

      <Timeline
        scenes={data.scenes}
        total={data.concept.totalDurationSec}
        active={activeScene ?? ""}
        onSelect={setActiveScene}
      />

      <SceneDetail
        scene={current}
        start={start}
        ratio={data.concept.primaryAspectRatio}
        campaignId={campaignId}
        globalShotStart={globalShotStartMap[current.id]}
        onChangePrompt={
          onChangePrompt
            ? (shotId, kind, value) =>
                onChangePrompt(current.id, shotId, kind, value)
            : undefined
        }
      />

      <VoiceOverPanel scenes={data.scenes} />

      <section className="rounded-2xl border border-border bg-surface/50 p-6 md:p-8">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
          End card
        </span>
        <h3 className="mt-3 text-3xl font-medium tracking-tightest md:text-4xl">
          <span className="text-gradient-accent">
            {data.endCard.headline}
          </span>
        </h3>
        <p className="mt-1 text-sm text-text-muted">{data.endCard.subline}</p>
        <p className="mt-4 text-xs text-text-muted">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
            Logo treatment
          </span>{" "}
          {data.endCard.logoTreatment}
        </p>
        <Badge variant="accent" className="mt-4">
          {data.endCard.callToAction}
        </Badge>
      </section>

      <div className="flex flex-wrap gap-2 md:hidden">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => downloadEdlJson(buildEdl(data, campaignName), campaignName)}
        >
          <Download className="size-3.5" />
          Timeline JSON
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => downloadShotListCsv(data, campaignName)}
        >
          <Download className="size-3.5" />
          Shot list CSV
        </Button>
      </div>
    </div>
  );
}
