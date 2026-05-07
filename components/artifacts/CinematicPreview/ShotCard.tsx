"use client";

import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AspectFrame } from "@/components/cinematic/AspectFrame";
import { CameraIcon } from "@/components/cinematic/CameraIcon";
import { CopyableBlock } from "@/components/cinematic/CopyableBlock";
import { Timecode } from "@/components/cinematic/Timecode";
import type { Shot } from "@/lib/schemas/artifacts/cinematic";

export function ShotCard({
  shot,
  startSec,
  ratio,
  onChangePrompt,
}: {
  shot: Shot;
  startSec: number;
  ratio: string;
  onChangePrompt?: (kind: "imagePrompt" | "videoPrompt", value: string) => void;
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-border bg-surface/50"
      data-testid={`shot-${shot.id}`}
    >
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
