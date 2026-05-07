"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Palette, ArrowLeftRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ShotCard } from "./ShotCard";
import { Timecode } from "@/components/cinematic/Timecode";
import type { Scene } from "@/lib/schemas/artifacts/cinematic";

const ease = [0.16, 1, 0.3, 1] as const;

export function SceneDetail({
  scene,
  start,
  ratio,
  onChangePrompt,
}: {
  scene: Scene;
  start: number;
  ratio: string;
  onChangePrompt?: (
    shotId: string,
    kind: "imagePrompt" | "videoPrompt",
    value: string
  ) => void;
}) {
  let cumul = start;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={scene.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.5, ease }}
        className="space-y-6"
      >
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-border bg-surface/50 p-6">
            <div className="flex items-center gap-2">
              <Badge variant="accent">{scene.intent}</Badge>
              <Badge variant="outline">{scene.id}</Badge>
              <Timecode start={start} duration={scene.durationSec} />
            </div>
            <h3 className="mt-4 text-2xl font-medium tracking-tight">
              {scene.title}
            </h3>
            <p className="mt-2 text-sm text-text-muted">
              {scene.cameraTreatment}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface/50 p-6">
            <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
              Scene metadata
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-accent" />
                <span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                    Licht
                  </span>{" "}
                  <span className="text-text-muted">{scene.lighting}</span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Palette className="mt-0.5 size-3.5 shrink-0 text-accent" />
                <span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                    Palet
                  </span>{" "}
                  <span className="text-text-muted">{scene.colorPalette}</span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowLeftRight className="mt-0.5 size-3.5 shrink-0 text-accent" />
                <span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                    Transition
                  </span>{" "}
                  <span className="text-text-muted">
                    {scene.transitionIn} → {scene.transitionOut}
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          {scene.shots.map((shot) => {
            const cardStart = cumul;
            cumul += shot.durationSec;
            return (
              <ShotCard
                key={shot.id}
                shot={shot}
                startSec={cardStart}
                ratio={ratio}
                onChangePrompt={
                  onChangePrompt
                    ? (kind, value) => onChangePrompt(shot.id, kind, value)
                    : undefined
                }
              />
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
