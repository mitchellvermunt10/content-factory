"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TONE_PRESETS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { WizardData } from "./index";

export function StepBrand({
  data,
  onChange,
}: {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
}) {
  const colors = data.brandColors ?? ["#0A0A0B", "#F5F4F2", "#8B7CFF"];

  function updateColor(idx: number, value: string) {
    const next = [...colors];
    next[idx] = value;
    onChange({ brandColors: next });
  }

  return (
    <div className="space-y-9">
      <div className="space-y-3">
        <Label>Tone of voice</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {TONE_PRESETS.map((t) => {
            const active = data.tone === t.value;
            return (
              <button
                key={t.value}
                type="button"
                data-testid={`tone-${t.value}`}
                onClick={() => onChange({ tone: t.value })}
                className={cn(
                  "group relative rounded-xl border p-4 text-left transition-all duration-300 ease-expo-out",
                  active
                    ? "border-accent/60 bg-accent/5 shadow-[0_0_0_4px_hsl(var(--accent)/0.08)]"
                    : "border-border bg-surface/40 hover:border-border-strong hover:bg-surface"
                )}
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium tracking-tight text-text">
                    {t.label}
                  </span>
                  {active && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                      gekozen
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-text-muted">
                  {t.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Brand kleuren (1 t/m 3)</Label>
        <p className="text-xs text-text-subtle">
          Eerste = primair, tweede = secundair, derde = accent. Hex zoals #1A1A1A.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {colors.map((c, idx) => (
            <ColorSwatch
              key={idx}
              value={c}
              onChange={(v) => updateColor(idx, v)}
              label={["Primair", "Secundair", "Accent"][idx]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ColorSwatch({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-3">
      <div className="flex items-center gap-3">
        <label
          className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border"
          style={{ background: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
        </label>
        <div className="min-w-0 flex-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
            {label}
          </span>
          <Input
            className="mt-1 h-9 font-mono text-xs"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#"
          />
        </div>
      </div>
    </div>
  );
}
