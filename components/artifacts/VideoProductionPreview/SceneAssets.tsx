"use client";

import { Check, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { CameraIcon } from "@/components/cinematic/CameraIcon";
import { Timecode } from "@/components/cinematic/Timecode";
import { AssetUploader } from "@/components/cinematic/AssetUploader";
import { AssetStatusPill } from "@/components/cinematic/AssetStatusPill";
import { cn } from "@/lib/utils";
import type {
  PipelineScene,
} from "@/lib/schemas/artifacts/videoProduction";
import type { Scene } from "@/lib/schemas/artifacts/cinematic";
import type { CameraMovement, AssetStatus, RenderStatus } from "@/lib/constants";

type LocalFile = NonNullable<
  PipelineScene["assets"]["videos"][number]["localFile"]
>;

const ASSET_READY: AssetStatus[] = ["verified", "ready"];

export function SceneAssets({
  pipelineScene,
  scene,
  ratio,
  onChangeImageUrl,
  onChangeImageFile,
  onChangeImageStatus,
  onChangeVideoUrl,
  onChangeVideoFile,
  onChangeVideoStatus,
  onChangeVideoAssetStatus,
}: {
  pipelineScene: PipelineScene;
  scene: Scene;
  ratio: string;
  onChangeImageUrl: (idx: number, url: string | null) => void;
  onChangeImageFile: (idx: number, file: LocalFile | null) => void;
  onChangeImageStatus: (idx: number, status: AssetStatus) => void;
  onChangeVideoUrl: (idx: number, url: string | null) => void;
  onChangeVideoFile: (idx: number, file: LocalFile | null) => void;
  onChangeVideoStatus: (idx: number, status: RenderStatus) => void;
  onChangeVideoAssetStatus: (idx: number, status: AssetStatus) => void;
}) {
  const checks = [
    {
      label: "Stills geüpload",
      done: pipelineScene.assets.images.every(
        (i) => !!i.url || !!i.localFile
      ),
    },
    {
      label: "Video clips geüpload",
      done: pipelineScene.assets.videos.every(
        (v) => !!v.url || !!v.localFile
      ),
    },
    {
      label: "Klaar voor montage",
      done: pipelineScene.assets.videos.every((v) =>
        ASSET_READY.includes((v.assetStatus ?? "missing") as AssetStatus)
      ),
    },
    { label: "Voice-over alignment", done: pipelineScene.status.voiceover === "done" },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 space-y-0 md:flex-row md:items-center md:justify-between">
        <CardTitle className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">{pipelineScene.sceneId}</Badge>
          {pipelineScene.title}
          <Timecode duration={pipelineScene.durationSec} />
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          {checks.map((c, i) => (
            <span
              key={i}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px]",
                c.done
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-border text-text-muted"
              )}
            >
              <Check className={cn("size-3", c.done ? "opacity-100" : "opacity-30")} />
              {c.label}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-text-muted">{pipelineScene.notes}</p>

        <div className="space-y-4">
          <h4 className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
            Shots & assets
          </h4>
          <ul className="grid gap-4 lg:grid-cols-2">
            {scene.shots.map((shot, idx) => {
              const img = pipelineScene.assets.images[idx];
              const vid = pipelineScene.assets.videos[idx];
              const imgStatus = (img.assetStatus ?? "missing") as AssetStatus;
              const vidStatus = (vid.assetStatus ?? "missing") as AssetStatus;
              return (
                <li
                  key={shot.id}
                  data-testid={`scene-asset-${shot.id}`}
                  className="space-y-4 rounded-2xl border border-border bg-bg/40 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{shot.framing}</Badge>
                    <Badge variant="outline">
                      <CameraIcon
                        movement={shot.cameraMovement as CameraMovement}
                        className="size-3"
                      />
                      {shot.cameraMovement}
                    </Badge>
                    <Badge>{shot.lens}</Badge>
                    <Badge variant="outline">{shot.durationSec}s</Badge>
                  </div>

                  {/* IMAGE asset */}
                  <div className="space-y-2 border-t border-border pt-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Label className="flex items-center gap-1.5">
                        <ImageIcon className="size-3 text-accent" />
                        Still ({img.provider})
                      </Label>
                      <AssetStatusPill
                        status={imgStatus}
                        onCycle={(next) => onChangeImageStatus(idx, next)}
                        testId={`asset-status-img-${shot.id}`}
                      />
                    </div>
                    <AssetUploader
                      kind="image"
                      url={img.url}
                      localFile={img.localFile ?? null}
                      onUrlChange={(url) => onChangeImageUrl(idx, url)}
                      onLocalFileChange={(file) => onChangeImageFile(idx, file)}
                      onClear={() => {
                        onChangeImageFile(idx, null);
                        onChangeImageUrl(idx, null);
                        onChangeImageStatus(idx, "missing");
                      }}
                      testIdPrefix={`asset-img-${shot.id}`}
                    />
                  </div>

                  {/* VIDEO asset */}
                  <div className="space-y-2 border-t border-border pt-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Label className="flex items-center gap-1.5">
                        <span className="rounded bg-bg/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-text-subtle">
                          {vid.provider}
                        </span>
                        Video clip
                      </Label>
                      <AssetStatusPill
                        status={vidStatus}
                        onCycle={(next) => onChangeVideoAssetStatus(idx, next)}
                        testId={`asset-status-vid-${shot.id}`}
                      />
                    </div>
                    <AssetUploader
                      kind="video"
                      url={vid.url}
                      localFile={vid.localFile ?? null}
                      onUrlChange={(url) => onChangeVideoUrl(idx, url)}
                      onLocalFileChange={(file) => onChangeVideoFile(idx, file)}
                      onClear={() => {
                        onChangeVideoFile(idx, null);
                        onChangeVideoUrl(idx, null);
                        onChangeVideoAssetStatus(idx, "missing");
                      }}
                      testIdPrefix={`asset-vid-${shot.id}`}
                    />
                    <div className="flex flex-wrap gap-2">
                      {(["queued", "rendering", "ready", "failed"] as RenderStatus[]).map(
                        (s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => onChangeVideoStatus(idx, s)}
                            className={cn(
                              "rounded-full border px-2.5 py-0.5 text-[11px] transition-colors",
                              vid.status === s
                                ? "border-accent/50 bg-accent/10 text-accent"
                                : "border-border text-text-muted hover:border-border-strong"
                            )}
                          >
                            render: {s}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
