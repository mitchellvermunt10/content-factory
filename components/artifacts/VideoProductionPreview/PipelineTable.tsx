"use client";

import { motion } from "framer-motion";
import {
  ScrollText,
  Wand2,
  Image as ImageIcon,
  Mic,
  Scissors,
  FileVideo,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/cinematic/StatusDot";
import { Timecode } from "@/components/cinematic/Timecode";
import { ProgressBar } from "@/components/cinematic/ProgressBar";
import { PIPELINE_PHASES, PHASE_STATUSES } from "@/lib/constants";
import type {
  PipelineScene,
  VideoProduction,
} from "@/lib/schemas/artifacts/videoProduction";
import type { PhaseStatus, PipelinePhaseId } from "@/lib/constants";

const PHASE_ICONS: Record<PipelinePhaseId, React.ElementType> = {
  script: ScrollText,
  prompts: Wand2,
  assets: ImageIcon,
  voiceover: Mic,
  edit: Scissors,
  export: FileVideo,
};

const STATUS_LABEL: Record<PhaseStatus, string> = {
  pending: "Open",
  "in-progress": "Bezig",
  review: "Review",
  done: "Klaar",
  blocked: "Geblokkeerd",
};

function nextStatus(s: PhaseStatus): PhaseStatus {
  const idx = PHASE_STATUSES.indexOf(s);
  return PHASE_STATUSES[(idx + 1) % PHASE_STATUSES.length];
}

function sceneStarts(scenes: PipelineScene[]): number[] {
  let cumul = 0;
  const out: number[] = [];
  for (const s of scenes) {
    out.push(cumul);
    cumul += s.durationSec;
  }
  return out;
}

function progressPct(status: PipelineScene["status"]): number {
  const order: PhaseStatus[] = ["pending", "in-progress", "review", "done"];
  const phases: PipelinePhaseId[] = [
    "script",
    "prompts",
    "assets",
    "voiceover",
    "edit",
    "export",
  ];
  const total = phases.length * (order.length - 1);
  let acc = 0;
  for (const ph of phases) {
    const idx = Math.max(0, order.indexOf(status[ph]));
    acc += Math.min(idx, order.length - 1);
  }
  return Math.round((acc / total) * 100);
}

export function PipelineTable({
  pipeline,
  onCyclePhase,
  onSelectScene,
  activeSceneId,
}: {
  pipeline: VideoProduction["pipeline"];
  onCyclePhase: (sceneId: string, phase: PipelinePhaseId, value: PhaseStatus) => void;
  onSelectScene: (sceneId: string) => void;
  activeSceneId: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface/50">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="text-sm font-medium tracking-tight">
          Render pipeline · {pipeline.scenes.length} scenes
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
          Klik op een fase om door statussen te cyclen
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-border bg-bg/40 text-left">
              <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                Scene
              </th>
              {PIPELINE_PHASES.map((p) => {
                const Icon = PHASE_ICONS[p.id];
                return (
                  <th
                    key={p.id}
                    className="px-3 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle"
                  >
                    <span className="flex items-center gap-1.5">
                      <Icon className="size-3" />
                      {p.label}
                    </span>
                  </th>
                );
              })}
              <th className="w-[180px] px-5 py-3 text-right font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                Voortgang
              </th>
            </tr>
          </thead>
          <tbody>
            {sceneStarts(pipeline.scenes).map((sceneStart, i) => {
              const scene = pipeline.scenes[i];
              const pct = progressPct(scene.status);
              const isActive = scene.sceneId === activeSceneId;
              return (
                <motion.tr
                  key={scene.sceneId}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  data-testid={`pipeline-row-${scene.sceneId}`}
                  className={`group border-b border-border last:border-b-0 transition-colors ${
                    isActive ? "bg-accent/5" : "hover:bg-surface"
                  }`}
                >
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => onSelectScene(scene.sceneId)}
                      className="text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                          {scene.sceneId}
                        </span>
                        <Timecode start={sceneStart} duration={scene.durationSec} />
                      </div>
                      <p className="mt-1 truncate text-sm font-medium tracking-tight">
                        {scene.title}
                      </p>
                      <p className="text-xs text-text-muted">
                        ~{scene.estimatedRenderMin} min render
                      </p>
                    </button>
                  </td>
                  {PIPELINE_PHASES.map((p) => {
                    const status = scene.status[p.id];
                    const next = nextStatus(status);
                    return (
                      <td key={p.id} className="px-3 py-4">
                        <button
                          type="button"
                          onClick={() => onCyclePhase(scene.sceneId, p.id, next)}
                          data-testid={`phase-${scene.sceneId}-${p.id}`}
                          aria-label={`${p.label}: ${STATUS_LABEL[status]}. Klik voor ${STATUS_LABEL[next]}.`}
                          title={`${p.label} · ${STATUS_LABEL[status]} → klik voor ${STATUS_LABEL[next]}`}
                          className="flex items-center gap-2 rounded-lg border border-transparent px-2 py-1 text-xs transition-all duration-200 hover:border-border-strong hover:bg-elevated"
                        >
                          <StatusDot status={status} />
                          <span className="text-text-muted">
                            {STATUS_LABEL[status]}
                          </span>
                        </button>
                      </td>
                    );
                  })}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <ProgressBar
                        value={pct}
                        className="w-24"
                        shimmer={pct < 100}
                        variant={pct === 100 ? "success" : "accent"}
                      />
                      <span className="w-9 text-right font-mono text-[10px] tabular-nums text-text-muted">
                        {pct}%
                      </span>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-border bg-bg/40 px-5 py-3 text-xs text-text-muted">
        <Badge variant="outline" className="font-mono text-[10px]">
          {PIPELINE_PHASES.length} fases
        </Badge>
        <Legend />
      </div>
    </div>
  );
}

function Legend() {
  const items: { status: PhaseStatus; label: string }[] = [
    { status: "pending", label: "Open" },
    { status: "in-progress", label: "Bezig" },
    { status: "review", label: "Review" },
    { status: "done", label: "Klaar" },
    { status: "blocked", label: "Geblokkeerd" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((it) => (
        <span key={it.status} className="flex items-center gap-1.5">
          <StatusDot status={it.status} size="sm" />
          {it.label}
        </span>
      ))}
    </div>
  );
}
