"use client";

import { useState } from "react";
import { Sparkles, Loader2, RefreshCw, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { CampaignImage } from "./useCampaignImages";

type Props = {
  campaignId: string;
  artifactKey: string;
  itemIndex: number;
  prompt: string;
  // Bestaande image voor deze (campaign, artifact, index) — null als nog niets gegenereerd.
  existing: CampaignImage | null;
  onGenerated: (image: CampaignImage) => void;
  // Aspect-ratio van de container — Instagram = vierkant, Reel = portrait.
  aspect?: "square" | "portrait" | "landscape";
};

const ASPECT_CLASS: Record<NonNullable<Props["aspect"]>, string> = {
  square: "aspect-square",
  portrait: "aspect-[9/16]",
  landscape: "aspect-[16/9]",
};

const ASPECT_SIZE: Record<
  NonNullable<Props["aspect"]>,
  "1024x1024" | "1024x1536" | "1536x1024"
> = {
  square: "1024x1024",
  portrait: "1024x1536",
  landscape: "1536x1024",
};

export function PostImageSlot({
  campaignId,
  artifactKey,
  itemIndex,
  prompt,
  existing,
  onGenerated,
  aspect = "square",
}: Props) {
  const [busy, setBusy] = useState(false);

  async function generate() {
    if (!prompt || prompt.trim().length < 10) {
      toast.error("Te weinig prompt-tekst", {
        description: "Het visualDirection-veld moet ≥10 tekens zijn.",
      });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/images/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          artifactKey,
          itemIndex,
          prompt,
          size: ASPECT_SIZE[aspect],
          quality: "medium",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const j = (await res.json()) as { image: CampaignImage };
      onGenerated(j.image);
      toast.success("Image gegenereerd", {
        description: existing ? "Vervangt vorige versie." : "Klaar voor je feed.",
      });
    } catch (err) {
      toast.error("Generatie mislukt", {
        description: err instanceof Error ? err.message : "Onbekende fout",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`relative w-full ${ASPECT_CLASS[aspect]} overflow-hidden rounded-xl border border-border bg-elevated/50`}>
      {existing ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={existing.publicUrl}
          alt={`Post ${itemIndex + 1}`}
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

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/85 to-transparent p-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
          {existing ? "Gegenereerd" : "AI-prompt klaar"}
        </span>
        <Button
          size="sm"
          variant={existing ? "ghost" : "accent"}
          onClick={generate}
          disabled={busy}
          className={existing ? "bg-white/10 text-white hover:bg-white/20" : ""}
        >
          {busy ? (
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
  );
}
