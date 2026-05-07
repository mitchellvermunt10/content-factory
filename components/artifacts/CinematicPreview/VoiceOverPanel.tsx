"use client";

import { Mic, Volume2 } from "lucide-react";
import { Timecode } from "@/components/cinematic/Timecode";
import type { Scene } from "@/lib/schemas/artifacts/cinematic";

export function VoiceOverPanel({
  scenes,
}: {
  scenes: Scene[];
}) {
  let cumulative = 0;
  return (
    <div
      data-testid="vo-script"
      className="overflow-hidden rounded-2xl border border-border bg-surface/50"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="flex items-center gap-2 text-sm font-medium tracking-tight">
          <Mic className="size-4 text-accent" />
          Voice-over script
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
          {scenes.filter((s) => s.voiceOver.text.trim()).length} regels
        </span>
      </div>
      <ol className="divide-y divide-border">
        {scenes.map((s) => {
          const start = cumulative;
          cumulative += s.durationSec;
          return (
            <li key={s.id} className="grid gap-3 p-5 md:grid-cols-[160px_1fr]">
              <div className="flex flex-col gap-1.5">
                <Timecode start={start} duration={s.durationSec} variant="accent" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                  {s.id} · {s.intent}
                </span>
                <span className="text-xs text-text-muted">
                  <Volume2 className="mr-1 inline size-3" />
                  {s.soundDesign}
                </span>
              </div>
              <div className="space-y-2">
                {s.voiceOver.text ? (
                  <p className="text-base leading-relaxed text-text">
                    “{s.voiceOver.text}”
                  </p>
                ) : (
                  <p className="text-sm italic text-text-subtle">
                    Geen voice-over in deze scene.
                  </p>
                )}
                <p className="text-xs text-text-muted">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                    Delivery
                  </span>{" "}
                  {s.voiceOver.deliveryDirection}
                </p>
                {s.onScreenText ? (
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
                    On-screen: {s.onScreenText}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
