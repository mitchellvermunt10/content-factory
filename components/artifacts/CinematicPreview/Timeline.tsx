"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Timecode } from "@/components/cinematic/Timecode";
import type { Scene } from "@/lib/schemas/artifacts/cinematic";

const ease = [0.16, 1, 0.3, 1] as const;

export function Timeline({
  scenes,
  total,
  active,
  onSelect,
}: {
  scenes: Scene[];
  total: number;
  active: string;
  onSelect: (id: string) => void;
}) {
  let cumulative = 0;
  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
          Scene timeline · {total}s
        </span>
        <Timecode duration={total} variant="accent" />
      </div>
      <div className="overflow-x-auto no-scrollbar pb-2">
        <div className="flex min-w-full snap-x snap-mandatory gap-2">
          {scenes.map((s, i) => {
            const start = cumulative;
            cumulative += s.durationSec;
            const widthPct = Math.max(8, (s.durationSec / total) * 100);
            return (
              <motion.button
                key={s.id}
                type="button"
                onClick={() => onSelect(s.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease, delay: i * 0.05 }}
                className={cn(
                  "group relative shrink-0 snap-start overflow-hidden rounded-xl border bg-surface/50 p-4 text-left transition-all duration-300 ease-expo-out",
                  active === s.id
                    ? "border-accent/50 bg-accent/5 shadow-[0_0_0_4px_hsl(var(--accent)/0.08)]"
                    : "border-border hover:border-border-strong hover:bg-surface"
                )}
                style={{ width: `${widthPct}%`, minWidth: 200 }}
                data-testid={`scene-${s.id}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                    {s.id} · {s.intent}
                  </span>
                  <Timecode start={start} duration={s.durationSec} />
                </div>
                <p className="mt-3 truncate text-sm font-medium tracking-tight">
                  {s.title}
                </p>
                <p className="mt-1 truncate text-[11px] text-text-muted">
                  {s.shots.length} shot{s.shots.length === 1 ? "" : "s"} ·{" "}
                  {s.cameraTreatment}
                </p>
                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-elevated">
                  <div
                    className="h-full bg-gradient-to-r from-accent/0 via-accent to-accent/0"
                    style={{ width: active === s.id ? "100%" : "30%" }}
                  />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
