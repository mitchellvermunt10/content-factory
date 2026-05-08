"use client";

import { useState } from "react";
import {
  Phone,
  Copy,
  Check,
  Loader2,
  Sparkles,
  ExternalLink,
  Clock,
  Shield,
  ArrowRightCircle,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ReceptionistConfig } from "@/lib/schemas/artifacts/receptionist";
import type { BusinessBrief } from "@/lib/schemas/brief";

type Props = {
  brief: BusinessBrief;
  config: ReceptionistConfig | null;
  onGenerated: (config: ReceptionistConfig) => void;
};

const DAY_LABELS: Record<string, string> = {
  ma: "Maandag",
  di: "Dinsdag",
  wo: "Woensdag",
  do: "Donderdag",
  vr: "Vrijdag",
  za: "Zaterdag",
  zo: "Zondag",
};

export function ReceptionistPreview({ brief, config, onGenerated }: Props) {
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleGenerate() {
    setBusy(true);
    try {
      const res = await fetch("/api/receptionist/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brief),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const j = (await res.json()) as { config: ReceptionistConfig };
      onGenerated(j.config);
      toast.success("Receptionist klaar", {
        description: `${j.config.meta.name} is gegenereerd.`,
      });
    } catch (err) {
      toast.error("Generatie mislukt", {
        description: err instanceof Error ? err.message : "Onbekende fout",
      });
    } finally {
      setBusy(false);
    }
  }

  async function copy(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      toast.success("Gekopieerd");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Kopiëren mislukt");
    }
  }

  if (!config) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-12 text-center">
        <Phone className="mx-auto size-10 text-text-subtle" />
        <h3 className="mt-4 text-2xl font-medium tracking-tight">
          AI-receptionist maken
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-text-muted">
          Genereer een Nederlandstalige AI-telefonist die afspraken inplant en
          vragen beantwoordt voor {brief.name}. Klaar om te plakken in Vapi.ai
          of Retell AI.
        </p>
        <Button
          variant="accent"
          className="mt-6"
          onClick={handleGenerate}
          disabled={busy}
        >
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Genereren…
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Genereer Receptionist
            </>
          )}
        </Button>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
          Upsell · €299/mnd per klant
        </p>
      </div>
    );
  }

  const vapiJson = JSON.stringify(
    {
      name: config.meta.name,
      voice: config.voice,
      model: {
        provider: "anthropic",
        model: "claude-sonnet-4-6",
        systemPrompt: config.systemPrompt,
      },
      firstMessage: config.greeting,
      endCallMessage: "Tot ziens en bedankt voor je tijd.",
      transcriber: { provider: "deepgram", model: "nova-2", language: "nl" },
    },
    null,
    2
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border bg-surface/40 p-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="accent">
              <Phone className="mr-1 size-3" />
              {config.meta.name}
            </Badge>
            <Badge variant="outline">{config.meta.role}</Badge>
            <Badge>{config.voice.style}</Badge>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-muted">
            {config.meta.persona}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={busy}>
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : null}
          Opnieuw
        </Button>
      </div>

      <Section
        icon={<MessageSquare className="size-4" />}
        title="Begroeting"
        right={
          <CopyButton
            id="greeting"
            value={config.greeting}
            copied={copiedId === "greeting"}
            onCopy={copy}
          />
        }
      >
        <p className="text-base italic leading-relaxed text-text">
          "{config.greeting}"
        </p>
      </Section>

      <Section
        icon={<Sparkles className="size-4" />}
        title="System Prompt"
        right={
          <CopyButton
            id="prompt"
            value={config.systemPrompt}
            copied={copiedId === "prompt"}
            onCopy={copy}
          />
        }
      >
        <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-bg/40 p-4 font-mono text-xs leading-relaxed text-text-muted">
          {config.systemPrompt}
        </pre>
      </Section>

      <Section icon={<Clock className="size-4" />} title="Openingstijden">
        <div className="grid gap-2 md:grid-cols-2">
          {config.hours.schedule.map((s) => (
            <div
              key={s.day}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
            >
              <span className="font-medium">{DAY_LABELS[s.day]}</span>
              <span className="text-text-muted">
                {s.open && s.close ? `${s.open} – ${s.close}` : "Gesloten"}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-text-muted">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
            After hours
          </span>{" "}
          — {config.hours.afterHoursMessage}
        </p>
      </Section>

      <Section
        icon={<ArrowRightCircle className="size-4" />}
        title={`Booking flow (${config.bookingFlow.steps.length} stappen)`}
      >
        <div className="space-y-3">
          {config.bookingFlow.steps.map((step, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-elevated/60 p-4"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                  Stap {String(i + 1).padStart(2, "0")}
                </span>
                {step.capture ? (
                  <Badge variant="outline">{step.capture}</Badge>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-relaxed">{step.say}</p>
              <p className="mt-1 text-xs italic text-text-subtle">
                Luistert naar: {step.listenFor}
              </p>
            </div>
          ))}
          <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
              Bevestiging
            </span>
            <p className="mt-2 leading-relaxed">
              {config.bookingFlow.confirmation}
            </p>
          </div>
        </div>
      </Section>

      <Section
        icon={<MessageSquare className="size-4" />}
        title={`FAQs (${config.faqs.length})`}
      >
        <div className="space-y-2">
          {config.faqs.map((faq, i) => (
            <details
              key={i}
              className="group rounded-lg border border-border bg-elevated/40 p-4"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium">
                <span>{faq.question}</span>
                <Badge variant="outline">{faq.category}</Badge>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </Section>

      <Section icon={<Shield className="size-4" />} title="Guardrails">
        <ul className="space-y-2">
          {config.guardrails.map((g, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-lg border border-border bg-elevated/40 p-3 text-sm"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] mt-0.5 text-warning">
                Regel
              </span>
              <span className="leading-relaxed">{g}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        icon={<ExternalLink className="size-4" />}
        title="Deploy in Vapi.ai"
        right={
          <CopyButton
            id="vapi"
            value={vapiJson}
            copied={copiedId === "vapi"}
            onCopy={copy}
          />
        }
      >
        <p className="mb-3 text-sm text-text-muted">
          Plak dit JSON-blok in een nieuwe Vapi assistant. Voeg daarna een
          Twilio-nummer toe en je receptionist staat live.
        </p>
        <pre className="max-h-64 overflow-y-auto rounded-lg border border-border bg-bg/40 p-4 font-mono text-xs leading-relaxed text-text-muted">
          {vapiJson}
        </pre>
        <div className="mt-3 flex gap-2">
          <Button asChild variant="ghost" size="sm">
            <a
              href="https://dashboard.vapi.ai"
              target="_blank"
              rel="noreferrer"
            >
              Open Vapi dashboard
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a
              href="https://app.retellai.com"
              target="_blank"
              rel="noreferrer"
            >
              Open Retell AI
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
        </div>
      </Section>
    </div>
  );
}

function Section({
  icon,
  title,
  right,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-text-subtle">
          {icon}
          <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
            {title}
          </span>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function CopyButton({
  id,
  value,
  copied,
  onCopy,
}: {
  id: string;
  value: string;
  copied: boolean;
  onCopy: (id: string, value: string) => void;
}) {
  return (
    <Button variant="ghost" size="sm" onClick={() => onCopy(id, value)}>
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Gekopieerd" : "Kopieer"}
    </Button>
  );
}
