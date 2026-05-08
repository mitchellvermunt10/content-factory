"use client";

import { useState } from "react";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { CampaignImage } from "./useCampaignImages";

type Engine = "openai" | "flux" | "midjourney-prompt";

type Props = {
  campaignId: string;
  artifactKey: "instagram" | "metaAds" | "metaAdsStory" | "cinematic" | "landingHero";
  itemIndex: number;
  /** Optional override van source visualDirection. Default = server pakt 'm uit de campagne. */
  hint?: string;
  existing: CampaignImage | null;
  onGenerated: (image: CampaignImage) => void;
  aspect?: "square" | "portrait" | "landscape";
};

const ASPECT_CLASS: Record<NonNullable<Props["aspect"]>, string> = {
  square: "aspect-square",
  portrait: "aspect-[9/16]",
  landscape: "aspect-[16/9]",
};

export function PostImageSlot({
  campaignId,
  artifactKey,
  itemIndex,
  hint,
  existing,
  onGenerated,
  aspect = "square",
}: Props) {
  const [busy, setBusy] = useState<Engine | null>(null);
  const [copiedMJ, setCopiedMJ] = useState(false);
  const [showEngines, setShowEngines] = useState(false);

  async function generate(engine: Engine) {
    setBusy(engine);
    try {
      const res = await fetch("/api/images/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          artifactKey,
          itemIndex,
          hint,
          engine,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error ?? `HTTP ${res.status}`
        );
      }
      const j = (await res.json()) as {
        image: CampaignImage | null;
        prompts: { openai: string; midjourney: string };
        engine: Engine;
      };

      if (engine === "midjourney-prompt") {
        await navigator.clipboard.writeText(j.prompts.midjourney);
        setCopiedMJ(true);
        toast.success("Midjourney-prompt gekopieerd", {
          description: "Plak in MJ Discord, render, en upload terug.",
        });
        setTimeout(() => setCopiedMJ(false), 3000);
      } else if (j.image) {
        onGenerated(j.image);
        toast.success(
          engine === "flux"
            ? "Flux Pro 1.1 — image klaar"
            : "Image gegenereerd",
          {
            description: existing
              ? "Vervangt vorige versie."
              : "Klaar voor je feed.",
          }
        );
      }
    } catch (err) {
      toast.error("Generatie mislukt", {
        description: err instanceof Error ? err.message : "Onbekende fout",
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div
      className={`relative w-full ${ASPECT_CLASS[aspect]} overflow-hidden rounded-xl border border-border bg-elevated/50`}
    >
      {existing ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={existing.publicUrl}
          alt={`Item ${itemIndex + 1}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
          <ImageIcon className="size-6 text-text-subtle" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
            Geen image
          </span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-black/90 to-transparent p-3">
        {showEngines ? (
          <div className="grid grid-cols-3 gap-1">
            <EngineButton
              label="OpenAI"
              sub="€0,04"
              busy={busy === "openai"}
              onClick={() => generate("openai")}
              disabled={busy !== null}
            />
            <EngineButton
              label="Flux Pro"
              sub="€0,06"
              busy={busy === "flux"}
              onClick={() => generate("flux")}
              accent
              disabled={busy !== null}
            />
            <EngineButton
              label="MJ prompt"
              sub={copiedMJ ? "✓" : "kopie"}
              busy={busy === "midjourney-prompt"}
              onClick={() => generate("midjourney-prompt")}
              disabled={busy !== null}
              icon={copiedMJ ? <Check className="size-3" /> : <Copy className="size-3" />}
            />
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
            {existing ? "Gegenereerd" : "Klaar voor render"}
          </span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowEngines((v) => !v)}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              {showEngines ? "Sluit" : "Engine"}
            </Button>
            <Button
              size="sm"
              variant={existing ? "ghost" : "accent"}
              onClick={() => generate("openai")}
              disabled={busy !== null}
              className={existing ? "bg-white/10 text-white hover:bg-white/20" : ""}
            >
              {busy === "openai" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : existing ? (
                <RefreshCw className="size-3.5" />
              ) : (
                <Sparkles className="size-3.5" />
              )}
              {existing ? "Opnieuw" : "Genereer"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EngineButton({
  label,
  sub,
  busy,
  onClick,
  disabled,
  accent,
  icon,
}: {
  label: string;
  sub: string;
  busy: boolean;
  onClick: () => void;
  disabled: boolean;
  accent?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative flex flex-col items-center justify-center rounded-md border px-2 py-1.5 text-[10px] transition-all ${
        accent
          ? "border-accent/60 bg-accent/15 text-accent hover:bg-accent/25"
          : "border-white/20 bg-white/10 text-white hover:bg-white/20"
      } disabled:opacity-50 disabled:pointer-events-none`}
    >
      <span className="flex items-center gap-1 font-medium tracking-tight">
        {busy ? <Loader2 className="size-3 animate-spin" /> : icon}
        {label}
      </span>
      <span className="font-mono text-[9px] uppercase tracking-[0.15em] opacity-70">
        {sub}
      </span>
    </button>
  );
}
