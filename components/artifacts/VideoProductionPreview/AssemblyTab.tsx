"use client";

import { useMemo } from "react";
import {
  Download,
  Layers,
  Mic,
  CheckCircle2,
  AlertTriangle,
  Package,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/cinematic/ProgressBar";
import { CopyableBlock } from "@/components/cinematic/CopyableBlock";
import { AssetStatusPill } from "@/components/cinematic/AssetStatusPill";
import { Timecode } from "@/components/cinematic/Timecode";
import {
  buildAssemblyScript,
  computeReadiness,
  downloadAllAssemblyScripts,
  downloadAssemblyScript,
} from "@/lib/export/assemblyScripts";
import { ASSET_STATUS_LABEL, type AssetStatus } from "@/lib/constants";
import type { CinematicCampaign } from "@/lib/schemas/artifacts/cinematic";
import type {
  VideoProduction,
  ExportPlan,
} from "@/lib/schemas/artifacts/videoProduction";

const STEPS_DOC = [
  "Upload of plak per scene de clip URL of het bestand.",
  "Synthese de voice-over via de Voice-over tab. Download als MP3.",
  "Bevestig per asset 'gecontroleerd' of 'klaar voor montage'.",
  "Download het export-script voor de gewenste aspect ratio.",
  "Plaats VO en muziek in ./<campagne>/audio/.",
  "Run het script in een terminal met FFmpeg geïnstalleerd.",
  "Output landt in ./<campagne>/exports/.",
];

export function AssemblyTab({
  cinematic,
  data,
  campaignName,
  onChangeExportPlan,
}: {
  cinematic: CinematicCampaign;
  data: VideoProduction;
  campaignName: string;
  onChangeExportPlan: (next: ExportPlan) => void;
}) {
  const ctx = useMemo(
    () => ({
      campaignName,
      cinematic,
      pipeline: data.pipeline,
      voiceOver: data.voiceOver,
    }),
    [campaignName, cinematic, data.pipeline, data.voiceOver]
  );
  const readiness = useMemo(
    () => computeReadiness(ctx, data.exportPlan),
    [ctx, data.exportPlan]
  );

  const previewScript = useMemo(
    () => buildAssemblyScript(data.exportPlan.presets[0], ctx),
    [ctx, data.exportPlan.presets]
  );

  const overallPct =
    readiness.totalClips === 0
      ? 0
      : Math.round((readiness.clipsWithSource / readiness.totalClips) * 100);

  return (
    <div className="space-y-6" data-testid="assembly-tab">
      {/* Readiness header */}
      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0 md:flex-row md:items-start md:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="size-4 text-accent" />
            Export assembly
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              data-testid="assembly-download-all"
              onClick={() => downloadAllAssemblyScripts(ctx, data.exportPlan)}
            >
              <Download className="size-3.5" />
              Download alle 4 scripts
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <ReadinessStat
              icon={<Layers className="size-4 text-accent" />}
              label="Video clips"
              value={`${readiness.clipsWithSource}/${readiness.totalClips}`}
              hint={
                readiness.clipsWithSource < readiness.totalClips
                  ? `${readiness.totalClips - readiness.clipsWithSource} ontbreken`
                  : "Alle clips aangeleverd"
              }
              ready={readiness.clipsWithSource === readiness.totalClips}
            />
            <ReadinessStat
              icon={<Mic className="size-4 text-accent" />}
              label="Voice-over"
              value={readiness.voReady ? "Aanwezig" : "Ontbreekt"}
              hint={
                readiness.voReady
                  ? "VO MP3 of placeholder ingesteld"
                  : "Genereer in Voice-over tab"
              }
              ready={readiness.voReady}
            />
            <ReadinessStat
              icon={<FileText className="size-4 text-accent" />}
              label="Presets klaar"
              value={`${readiness.presetsReady}/${readiness.totalPresets}`}
              hint="Gemarkeerd in Export tab"
              ready={readiness.presetsReady > 0}
            />
          </div>
          <ProgressBar
            value={overallPct}
            shimmer={overallPct < 100}
            variant={overallPct === 100 ? "success" : "accent"}
          />
        </CardContent>
      </Card>

      {/* Per-preset scripts */}
      <Card>
        <CardHeader>
          <CardTitle>Scripts per export-preset</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.exportPlan.presets.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-bg/40 p-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{p.ratio}</Badge>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                      {p.fps}fps · {p.bitrate}
                    </span>
                  </div>
                  <p className="mt-2 truncate text-sm font-medium tracking-tight">
                    {p.label}
                  </p>
                  <p className="truncate font-mono text-[10px] text-text-subtle">
                    {p.filename}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  data-testid={`assembly-download-${p.id}`}
                  onClick={() => downloadAssemblyScript(p, ctx)}
                >
                  <Download className="size-3.5" />
                  .sh
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Asset overview */}
      <Card>
        <CardHeader>
          <CardTitle>Asset overzicht</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.pipeline.scenes.map((ps) => {
            const cinematicScene = cinematic.scenes.find(
              (s) => s.id === ps.sceneId
            );
            return (
              <div
                key={ps.sceneId}
                data-testid={`assembly-scene-${ps.sceneId}`}
                className="overflow-hidden rounded-xl border border-border"
              >
                <div className="flex items-center justify-between gap-3 border-b border-border bg-bg/40 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="accent">{ps.sceneId}</Badge>
                    <span className="text-sm font-medium tracking-tight">
                      {ps.title}
                    </span>
                    <Timecode duration={ps.durationSec} />
                  </div>
                </div>
                <ul className="divide-y divide-border">
                  {(cinematicScene?.shots ?? []).map((shot, i) => {
                    const v = ps.assets.videos[i];
                    const status = (v.assetStatus ?? "missing") as AssetStatus;
                    const hasSource = !!v.url || !!v.localFile;
                    return (
                      <li
                        key={shot.id}
                        className="grid grid-cols-[80px_1fr_auto] items-center gap-3 px-4 py-3 text-sm"
                      >
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                          {shot.id}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-text">
                            {shot.subject}
                          </p>
                          <p className="truncate font-mono text-[10px] text-text-subtle">
                            {v.localFile
                              ? `📄 ${v.localFile.name}`
                              : v.url
                              ? v.url
                              : "Geen URL of upload — wordt gemarkeerd ⚠ in script"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasSource ? (
                            <CheckCircle2 className="size-3.5 text-success" />
                          ) : (
                            <AlertTriangle className="size-3.5 text-warning" />
                          )}
                          <AssetStatusPill status={status} />
                          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                            {ASSET_STATUS_LABEL[status]}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Script preview */}
      <Card>
        <CardHeader>
          <CardTitle>
            Preview script ·{" "}
            <span className="text-text-muted">
              {data.exportPlan.presets[0].label}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CopyableBlock value={previewScript} rows={14} readOnly />
        </CardContent>
      </Card>

      {/* Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Hoe je van assets naar MP4 komt</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {STEPS_DOC.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl border border-border bg-bg/40 p-3 text-sm"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-md border border-border bg-elevated font-mono text-[10px] text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-text-muted">{s}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
            Vereist: FFmpeg ≥ 6.0. Mac: <code className="text-text">brew install ffmpeg</code> · Windows: <code className="text-text">winget install ffmpeg</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
  // (Reference unused export-plan setter to keep API stable for future extension)
  onChangeExportPlan;
}

function ReadinessStat({
  icon,
  label,
  value,
  hint,
  ready,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  ready: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg/40 p-4">
      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
        {icon}
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span
          className={`text-lg font-medium tracking-tight ${
            ready ? "text-success" : "text-text"
          }`}
        >
          {value}
        </span>
      </div>
      <p className="mt-1 text-xs text-text-muted">{hint}</p>
    </div>
  );
}
