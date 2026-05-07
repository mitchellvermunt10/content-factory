"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StepBusiness } from "./StepBusiness";
import { StepBrand } from "./StepBrand";
import { StepAudienceOffer } from "./StepAudienceOffer";
import { StepReview } from "./StepReview";
import { useCampaigns } from "@/lib/store/campaigns";
import {
  BusinessBriefSchema,
  type BusinessBrief,
} from "@/lib/schemas/brief";
import type { Campaign } from "@/lib/schemas/campaign";

const ease = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  { id: "business", label: "Bedrijf", desc: "Type, naam, locatie." },
  { id: "brand", label: "Merk", desc: "Tone of voice & kleuren." },
  { id: "audience", label: "Doelgroep", desc: "Wie bereik je en met welk aanbod?" },
  { id: "review", label: "Controle", desc: "Even nakijken en starten." },
] as const;

export type WizardData = Partial<BusinessBrief>;

const INITIAL: WizardData = {
  businessType: undefined,
  name: "",
  city: "",
  website: "",
  phone: "",
  usps: ["", "", ""],
  tone: undefined,
  audience: "",
  offer: "",
  brandColors: ["#0A0A0B", "#F5F4F2", "#8B7CFF"],
};

export function BriefWizard() {
  const router = useRouter();
  const [data, setData] = useState<WizardData>(INITIAL);
  const [stepIdx, setStepIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [, startTransition] = useTransition();
  const addCampaign = useCampaigns((s) => s.addCampaign);

  const update = (patch: Partial<WizardData>) =>
    setData((prev) => ({ ...prev, ...patch }));

  const canAdvance = (() => {
    switch (stepIdx) {
      case 0:
        return Boolean(data.businessType && data.name && data.name.length >= 2 && data.city && data.city.length >= 2);
      case 1:
        return Boolean(data.tone && data.brandColors && data.brandColors.length >= 1);
      case 2:
        return Boolean(
          data.audience &&
            data.audience.length >= 20 &&
            data.usps &&
            data.usps.filter((u) => u && u.trim().length >= 3).length >= 1
        );
      case 3:
        return true;
      default:
        return false;
    }
  })();

  async function handleSubmit() {
    const cleaned = {
      ...data,
      usps: (data.usps ?? []).map((u) => (u ?? "").trim()).filter((u) => u.length >= 3),
    };
    const parsed = BusinessBriefSchema.safeParse(cleaned);
    if (!parsed.success) {
      toast.error("Brief is niet compleet", {
        description: parsed.error.errors[0]?.message ?? "Controleer alle velden.",
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Generatie mislukt");
      }
      const campaign = (await res.json()) as Campaign;
      addCampaign(campaign);
      const artifactCount = Object.keys(campaign.artifacts).length;
      toast.success("Campagne klaar", {
        description: `${campaign.brief.name} — ${artifactCount} deliverables gegenereerd.`,
      });
      startTransition(() => router.push(`/studio/campaigns/${campaign.id}`));
    } catch (err) {
      toast.error("Er ging iets mis", {
        description: err instanceof Error ? err.message : "Onbekende fout",
      });
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
          Stap {String(stepIdx + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
        </span>
        <Badge variant="outline">{STEPS[stepIdx].label}</Badge>
      </div>

      <h1 className="mt-3 text-4xl font-medium tracking-tightest md:text-5xl">
        <span className="text-gradient">{STEPS[stepIdx].label}</span>
      </h1>
      <p className="mt-3 max-w-md text-text-muted">{STEPS[stepIdx].desc}</p>

      <Progress current={stepIdx} total={STEPS.length} />

      <div className="mt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIdx}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease }}
          >
            {stepIdx === 0 && <StepBusiness data={data} onChange={update} />}
            {stepIdx === 1 && <StepBrand data={data} onChange={update} />}
            {stepIdx === 2 && <StepAudienceOffer data={data} onChange={update} />}
            {stepIdx === 3 && <StepReview data={data} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Spacer onder content op mobiel zodat fixed footer geen content afsnijdt */}
      <div className="h-24 md:hidden" aria-hidden />

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-border bg-bg/85 px-5 py-3 backdrop-blur-md md:static md:mt-12 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
        <Button
          variant="ghost"
          size="md"
          onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
          disabled={stepIdx === 0 || submitting}
        >
          <ArrowLeft className="size-4" /> Terug
        </Button>
        {stepIdx < STEPS.length - 1 ? (
          <Button
            variant="primary"
            size="md"
            onClick={() => setStepIdx((i) => Math.min(STEPS.length - 1, i + 1))}
            disabled={!canAdvance}
            data-testid="wizard-next"
          >
            Volgende <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button
            variant="accent"
            size="md"
            onClick={handleSubmit}
            disabled={submitting}
            data-testid="wizard-submit"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Genereren…
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Genereer campagne
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function Progress({ current, total }: { current: number; total: number }) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div className="mt-8 h-px w-full overflow-hidden bg-border">
      <motion.div
        className="h-full bg-gradient-to-r from-accent/0 via-accent to-accent/0"
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
