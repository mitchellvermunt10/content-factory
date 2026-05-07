"use client";

import { useMemo } from "react";
import { Download, FileVideo, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyableBlock } from "@/components/cinematic/CopyableBlock";
import { StatusDot } from "@/components/cinematic/StatusDot";
import { cn } from "@/lib/utils";
import {
  buildFfmpegPlan,
  downloadFfmpegScript,
  ffmpegScriptString,
} from "@/lib/export/ffmpeg";
import type { CinematicCampaign } from "@/lib/schemas/artifacts/cinematic";
import type { ExportPlan } from "@/lib/schemas/artifacts/videoProduction";
import type { ExportPresetId } from "@/lib/constants";

const RATIO_PREVIEW: Record<string, string> = {
  "9:16": "h-12 w-7",
  "1:1": "h-10 w-10",
  "16:9": "h-7 w-12",
  "4:5": "h-12 w-10",
};

export function ExportPanel({
  cinematic,
  exportPlan,
  campaignName,
  onChange,
}: {
  cinematic: CinematicCampaign;
  exportPlan: ExportPlan;
  campaignName: string;
  onChange: (next: ExportPlan) => void;
}) {
  const steps = useMemo(
    () => buildFfmpegPlan(cinematic, exportPlan, campaignName),
    [cinematic, exportPlan, campaignName]
  );
  const fullScript = useMemo(() => ffmpegScriptString(steps), [steps]);

  const active = exportPlan.presets.find((p) => p.id === exportPlan.activePresetId)!;

  function setActive(id: ExportPresetId) {
    onChange({ ...exportPlan, activePresetId: id });
  }

  function setPresetStatus(id: ExportPresetId, patch: Partial<ExportPlan["presets"][number]>) {
    onChange({
      ...exportPlan,
      presets: exportPlan.presets.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileVideo className="size-4 text-accent" />
            Export presets
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {exportPlan.presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(p.id)}
              data-testid={`preset-${p.id}`}
              className={cn(
                "group relative flex flex-col items-start gap-3 rounded-2xl border bg-bg/40 p-4 text-left transition-all duration-300 ease-expo-out",
                p.id === exportPlan.activePresetId
                  ? "border-accent/50 bg-accent/5 shadow-[0_0_0_4px_hsl(var(--accent)/0.08)]"
                  : "border-border hover:border-border-strong hover:bg-surface"
              )}
            >
              <div className="flex w-full items-start justify-between gap-3">
                <span
                  className={cn(
                    "rounded-md border border-border-strong",
                    RATIO_PREVIEW[p.ratio] ?? "h-10 w-10"
                  )}
                />
                <Badge variant="outline">{p.ratio}</Badge>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium tracking-tight">
                  {p.label}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                  {p.width}×{p.height} · {p.fps}fps · {p.bitrate}
                </p>
              </div>
              <div className="flex w-full items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-text-muted">
                  <StatusDot
                    status={
                      p.status === "ready"
                        ? "ready"
                        : p.status === "encoding"
                        ? "rendering"
                        : "queued"
                    }
                  />
                  {p.status === "ready"
                    ? "Klaar"
                    : p.status === "encoding"
                    ? "Encoderen"
                    : "Open"}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                  {p.codec}
                </span>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <Terminal className="size-4 text-accent" />
            FFmpeg plan · {active.label}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                setPresetStatus(active.id, {
                  status: active.status === "ready" ? "pending" : "ready",
                  outputUrl:
                    active.status === "ready"
                      ? null
                      : `https://placeholder.cdn.nextlevelsites.nl/exports/${active.filename}`,
                })
              }
              data-testid="export-toggle-status"
            >
              {active.status === "ready" ? "Markeer open" : "Markeer klaar"}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => downloadFfmpegScript(steps, campaignName)}
              data-testid="export-download-script"
            >
              <Download className="size-3.5" />
              Download script.sh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-3">
            {steps.map((s) => (
              <li
                key={s.step}
                className="overflow-hidden rounded-xl border border-border bg-bg/40"
              >
                <div className="flex items-start justify-between gap-3 px-4 py-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                      Stap {String(s.step).padStart(2, "0")}
                    </span>
                    <p className="mt-1 text-sm font-medium tracking-tight">
                      {s.title}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {s.description}
                    </p>
                  </div>
                </div>
                <CopyableBlock
                  value={s.command}
                  rows={Math.min(8, s.command.split("\n").length + 1)}
                  readOnly
                  className="rounded-none border-0 border-t border-border"
                />
              </li>
            ))}
          </ol>

          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              Volledig export-script (bash)
            </p>
            <CopyableBlock value={fullScript} rows={10} readOnly />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
