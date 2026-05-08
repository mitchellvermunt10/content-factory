"use client";

import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AspectFrame } from "@/components/cinematic/AspectFrame";
import { CameraIcon } from "@/components/cinematic/CameraIcon";
import { CopyableBlock } from "@/components/cinematic/CopyableBlock";
import { Timecode } from "@/components/cinematic/Timecode";
import type { Shot } from "@/lib/schemas/artifacts/cinematic";
import { PostImageSlot } from "../PostImageSlot";
import { useCampaignImages } from "../useCampaignImages";

export function ShotCard({
  shot,
  startSec,
  ratio,
  onChangePrompt,
  campaignId,
  globalShotIndex,
}: {
  shot: Shot;
  startSec: number;
  ratio: string;
  onChangePrompt?: (kind: "imagePrompt" | "videoPrompt", value: string) => void;
  campaignId?: string;
  globalShotIndex?: number;
}) {
  // Image-gen wordt alleen aangeboden in studio-context (campaignId aanwezig).
  // De ratio van de master cut bepaalt de aspect — meestal 16:9 voor cinematic.
  const aspect = ratio.startsWith("9:")
    ? "portrait"
    : ratio === "1:1"
      ? "square"
      : "landscape";
  return (
    <div
      className="overflow-hidden rounded-2xl border border-border bg-surface/50"
      data-testid={`shot-${shot.id}`}
    >
      {campaignId !== undefined && globalShotIndex !== undefined ? (
        <ShotImageSlot
          campaignId={campaignId}
          globalShotIndex={globalShotIndex}
          aspect={aspect}
          framing={shot.framing}
          cameraMove={shot.cameraMovement}
          shotId={shot.id}
          subject={shot.subject}
        />
      ) : (
        <AspectFrame
          ratio={ratio}
          framing={shot.framing}
          cameraMove={shot.cameraMovement}
        >
          <div className="space-y-1 text-xs text-text">
            <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              {shot.id}
            </span>
            <p className="line-clamp-2 leading-tight">{shot.subject}</p>
          </div>
        </AspectFrame>
      )}

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="accent">{shot.framing}</Badge>
            <Badge variant="outline">
              <CameraIcon movement={shot.cameraMovement} className="size-3" />
              {shot.cameraMovement}
            </Badge>
          </div>
          <Timecode start={startSec} duration={shot.durationSec} />
        </div>

        <div className="space-y-1.5 text-sm">
          <p className="text-text">{shot.action}</p>
          <p className="text-text-muted">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              Lens
            </span>{" "}
            {shot.lens} ·{" "}
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              Licht
            </span>{" "}
            {shot.lighting}
          </p>
          <p className="text-text-muted">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              Kleur
            </span>{" "}
            {shot.colorNote}
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <CopyableBlock
            label="Image prompt"
            value={shot.imagePrompt}
            onChange={
              onChangePrompt
                ? (v) => onChangePrompt("imagePrompt", v)
                : undefined
            }
            rows={4}
            meta={
              <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                <Clock className="size-3" />
                {shot.durationSec}s
              </span>
            }
          />
          <CopyableBlock
            label="Video prompt"
            value={shot.videoPrompt}
            onChange={
              onChangePrompt
                ? (v) => onChangePrompt("videoPrompt", v)
                : undefined
            }
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}

function ShotImageSlot({
  campaignId,
  globalShotIndex,
  aspect,
  framing,
  cameraMove,
  shotId,
  subject,
}: {
  campaignId: string;
  globalShotIndex: number;
  aspect: "square" | "portrait" | "landscape";
  framing: string;
  cameraMove: string;
  shotId: string;
  subject: string;
}) {
  const { findLatest, upsertLocal } = useCampaignImages(campaignId);
  const image = findLatest("cinematic", globalShotIndex);
  return (
    <div className="relative">
      <PostImageSlot
        campaignId={campaignId}
        artifactKey="cinematic"
        itemIndex={globalShotIndex}
        existing={image}
        onGenerated={upsertLocal}
        aspect={aspect}
      />
      {!image ? (
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/70 drop-shadow">
            {shotId}
          </span>
          <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white/90 drop-shadow">
            {framing} · {cameraMove}
          </span>
          <span className="line-clamp-2 max-w-[80%] text-[10px] leading-tight text-white/80 drop-shadow">
            {subject}
          </span>
        </div>
      ) : null}
    </div>
  );
}
