"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Loader2,
  Trophy,
  ClipboardCheck,
  Copy,
  Check,
  ExternalLink,
  Mail,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GradientMesh } from "@/components/motion/GradientMesh";
import { BUSINESS_TYPES } from "@/lib/constants";
import type {
  ResearchInput,
  ResearchResult,
  ProspectEntry,
} from "@/lib/schemas/prospect";

type ApiResponse = {
  id: string;
  result: ResearchResult;
  costCents: number;
  durationMs: number;
};

const TIER_LABEL: Record<string, string> = {
  single: "Eenmalig €750",
  "always-on": "Always-On €497/mnd",
  both: "Beide tiers",
};

export default function ProspectsPage() {
  const [city, setCity] = useState("");
  const [vertical, setVertical] = useState<ResearchInput["vertical"]>("salon");
  const [tier, setTier] =
    useState<ResearchInput["serviceTier"]>("always-on");
  const [extraCriteria, setExtraCriteria] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"input" | "top10" | "briefs">(
    "input"
  );

  async function startResearch() {
    if (!city.trim() || city.length < 2) {
      toast.error("Vul een stad in");
      return;
    }
    setLoading(true);
    setProgress("Onderzoek wordt gestart...");

    let ownerEmail: string | null = null;
    try {
      const cached = localStorage.getItem("content-factory:owner-email");
      if (cached?.includes("@")) ownerEmail = cached;
    } catch {
      // niet beschikbaar — geen probleem
    }

    try {
      const res = await fetch("/api/prospects/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: city.trim(),
          vertical,
          serviceTier: tier,
          extraCriteria: extraCriteria.trim() || null,
          ownerEmail,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error ?? `HTTP ${res.status}`
        );
      }
      const j = (await res.json()) as ApiResponse;
      setResult(j);
      setActiveTab("top10");
      toast.success(`${j.result.prospects.length} kandidaten gevonden`, {
        description: `Run kostte €${(j.costCents / 100).toFixed(2)} in ${Math.round(j.durationMs / 1000)}s`,
      });
    } catch (err) {
      toast.error("Onderzoek mislukt", {
        description:
          err instanceof Error ? err.message : "Onbekende fout — probeer opnieuw",
        duration: Infinity,
      });
    } finally {
      setLoading(false);
      setProgress("");
    }
  }

  return (
    <div className="relative isolate min-h-screen">
      <GradientMesh intensity="soft" />
      <div className="relative px-6 py-10 md:px-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <Button asChild variant="ghost" size="sm">
            <Link href="/studio">
              <ArrowLeft className="size-4" /> Studio
            </Link>
          </Button>

          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
                Prospect Research
              </span>
              <h1 className="mt-3 text-4xl font-medium tracking-tightest md:text-5xl">
                <span className="text-gradient">Vind je top-10 klanten</span>
              </h1>
              <p className="mt-4 max-w-2xl text-text-muted md:text-lg">
                Eén stad, één branche, één klik — Sonnet 4.6 doorzoekt het web,
                analyseert kandidaten en levert je 10 ideale prospects met
                ingevulde brief en email-template.
              </p>
            </div>
            {result ? (
              <div className="flex items-center gap-2 rounded-xl border border-border bg-surface/40 p-3">
                <Sparkles className="size-4 text-accent" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                    Laatste run
                  </p>
                  <p className="text-sm font-medium">
                    €{(result.costCents / 100).toFixed(2)} ·{" "}
                    {Math.round(result.durationMs / 1000)}s ·{" "}
                    {result.result.prospects.length} prospects
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-10">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            >
              <TabsList>
                <TabsTrigger value="input">
                  <Search className="size-4" /> 1. Onderzoek
                </TabsTrigger>
                <TabsTrigger value="top10" disabled={!result}>
                  <Trophy className="size-4" /> 2. Top 10
                </TabsTrigger>
                <TabsTrigger value="briefs" disabled={!result}>
                  <ClipboardCheck className="size-4" /> 3. Brief invullen
                </TabsTrigger>
              </TabsList>

              <TabsContent value="input" className="mt-8">
                <div className="grid gap-6 md:grid-cols-[1fr_320px]">
                  <div className="space-y-5 rounded-2xl border border-border bg-surface/40 p-6">
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                        Stad
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="bijv. Vught, Den Bosch, Tilburg"
                        className="mt-2 w-full rounded-lg border border-border bg-elevated px-4 py-3 text-base text-text"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                        Branche
                      </label>
                      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                        {BUSINESS_TYPES.map((bt) => (
                          <button
                            key={bt.value}
                            type="button"
                            onClick={() => setVertical(bt.value)}
                            disabled={loading}
                            className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                              vertical === bt.value
                                ? "border-accent/60 bg-accent/15 text-accent"
                                : "border-border bg-elevated/50 text-text-muted hover:border-border-strong hover:text-text"
                            }`}
                          >
                            {bt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                        Aanbod-positionering
                      </label>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {(
                          ["single", "always-on", "both"] as const
                        ).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTier(t)}
                            disabled={loading}
                            className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                              tier === t
                                ? "border-accent/60 bg-accent/15 text-accent"
                                : "border-border bg-elevated/50 text-text-muted hover:border-border-strong hover:text-text"
                            }`}
                          >
                            {TIER_LABEL[t]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                        Extra criteria (optioneel)
                      </label>
                      <textarea
                        value={extraCriteria}
                        onChange={(e) => setExtraCriteria(e.target.value)}
                        placeholder="bijv. 'focus op vrouwelijke eigenaren' of 'geen ketens, alleen onafhankelijk'"
                        rows={3}
                        className="mt-2 w-full rounded-lg border border-border bg-elevated px-4 py-3 text-sm text-text"
                        disabled={loading}
                      />
                    </div>

                    <Button
                      variant="accent"
                      size="lg"
                      onClick={startResearch}
                      disabled={loading || !city.trim()}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="size-5 animate-spin" />
                          {progress || "Onderzoek loopt — duurt 1-3 min..."}
                        </>
                      ) : (
                        <>
                          <Search className="size-5" />
                          Start onderzoek
                        </>
                      )}
                    </Button>

                    {loading ? (
                      <p className="text-center text-xs text-text-subtle">
                        Sonnet 4.6 doorzoekt nu het web. Dit kan 90-180 seconden
                        duren. Sluit deze tab niet.
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-border bg-surface/40 p-5">
                      <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                        Wat krijg je
                      </h3>
                      <ul className="mt-3 space-y-2 text-sm text-text-muted">
                        <li>· 10 specifieke bedrijven in jouw stad</li>
                        <li>· Per kandidaat fit-score 0-100</li>
                        <li>· Eigenaar-naam waar vindbaar</li>
                        <li>· Website + Instagram + telefoon</li>
                        <li>· 3-5 redenen waarom ze passen</li>
                        <li>· Kant-en-klare brief voor studio</li>
                        <li>· Persoonlijke email-draft</li>
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-accent/30 bg-accent/5 p-5">
                      <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                        Cost per run
                      </h3>
                      <p className="mt-2 text-2xl font-medium tracking-tight">
                        ~€0,30
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        Sonnet 4.6 + ~10 web searches. Resultaat blijft 30 dagen
                        in Supabase staan.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="top10" className="mt-8">
                {result ? (
                  <ProspectListView
                    prospects={result.result.prospects}
                    summary={result.result.summary}
                  />
                ) : null}
              </TabsContent>

              <TabsContent value="briefs" className="mt-8">
                {result ? (
                  <BriefListView prospects={result.result.prospects} />
                ) : null}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

// ======================== TAB 2: Top 10 ========================

function ProspectListView({
  prospects,
  summary,
}: {
  prospects: ProspectEntry[];
  summary: string;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-accent/30 bg-accent/5 p-5">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
          Markt-samenvatting
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">{summary}</p>
      </div>

      {prospects.map((p) => (
        <ProspectCard key={p.rank} prospect={p} />
      ))}
    </div>
  );
}

function ProspectCard({ prospect }: { prospect: ProspectEntry }) {
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  async function copy(text: string, which: "subject" | "body") {
    await navigator.clipboard.writeText(text);
    if (which === "subject") {
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } else {
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    }
    toast.success("Gekopieerd");
  }

  const fitColor =
    prospect.fitScore >= 80
      ? "text-success"
      : prospect.fitScore >= 60
        ? "text-warning"
        : "text-text-muted";

  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              #{prospect.rank}
            </span>
            <span className={`text-base font-medium tracking-tight ${fitColor}`}>
              Fit-score {prospect.fitScore}
            </span>
          </div>
          <h3 className="mt-1 text-2xl font-medium tracking-tight">
            <span className="text-gradient">{prospect.name}</span>
          </h3>
          <p className="text-sm text-text-muted">
            {prospect.city}
            {prospect.ownerName ? ` · ${prospect.ownerName}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {prospect.websiteUrl ? (
            <Button asChild variant="ghost" size="sm">
              <a
                href={prospect.websiteUrl}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="size-3.5" />
                Website
              </a>
            </Button>
          ) : null}
          {prospect.instagramHandle ? (
            <Button asChild variant="ghost" size="sm">
              <a
                href={`https://instagram.com/${prospect.instagramHandle.replace("@", "")}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="size-3.5" />
                Instagram
              </a>
            </Button>
          ) : null}
          {prospect.ownerEmail ? (
            <Button asChild variant="secondary" size="sm">
              <a href={`mailto:${prospect.ownerEmail}`}>
                <Mail className="size-3.5" />
                Email
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
            Waarom ze passen
          </h4>
          <ul className="mt-3 space-y-2">
            {prospect.whyTheyFit.map((reason, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm leading-relaxed"
              >
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
            Signalen
          </h4>
          <div className="mt-3 space-y-2">
            {prospect.signals.positive.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm leading-relaxed"
              >
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-success" />
                <span>{s}</span>
              </div>
            ))}
            {prospect.signals.redFlags.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm leading-relaxed"
              >
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-warning" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-elevated/40 p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
            Cold-email draft
          </h4>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copy(prospect.emailDraft.subject, "subject")}
            >
              {copiedSubject ? (
                <Check className="size-3" />
              ) : (
                <Copy className="size-3" />
              )}
              Subject
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copy(prospect.emailDraft.body, "body")}
            >
              {copiedBody ? (
                <Check className="size-3" />
              ) : (
                <Copy className="size-3" />
              )}
              Body
            </Button>
          </div>
        </div>
        <p className="mt-3 text-sm font-medium">
          {prospect.emailDraft.subject}
        </p>
        <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-text-muted">
          {prospect.emailDraft.body}
        </pre>
      </div>
    </div>
  );
}

// ======================== TAB 3: Briefs ========================

function BriefListView({ prospects }: { prospects: ProspectEntry[] }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-dashed border-border bg-surface/40 p-5">
        <p className="text-sm text-text-muted">
          Klik <span className="font-mono uppercase tracking-[0.18em]">Open in studio</span>{" "}
          om de brief vooringevuld in /studio/nieuw te openen → klik
          &lsquo;Genereer campagne&rsquo; → 5 min later heb je een spec voor die
          klant. Gemiddelde cost per spec: ~€1,67.
        </p>
      </div>
      {prospects.map((p) => (
        <BriefCard key={p.rank} prospect={p} />
      ))}
    </div>
  );
}

function BriefCard({ prospect }: { prospect: ProspectEntry }) {
  const studioUrl = `/studio/nieuw?prefill=${encodeURIComponent(
    btoa(JSON.stringify(prospect.suggestedBrief))
  )}`;

  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
            #{prospect.rank} · {prospect.suggestedBrief.businessType}
          </span>
          <h3 className="mt-1 text-xl font-medium tracking-tight">
            {prospect.suggestedBrief.name}
          </h3>
        </div>
        <Button asChild variant="accent">
          <Link href={studioUrl}>
            <Sparkles className="size-4" />
            Open in studio
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-5 grid gap-3 text-sm md:grid-cols-2">
        <BriefField label="Naam" value={prospect.suggestedBrief.name} />
        <BriefField label="Stad" value={prospect.suggestedBrief.city} />
        <BriefField label="Tone" value={prospect.suggestedBrief.tone} />
        <BriefField
          label="Brand colors"
          value={
            <div className="mt-1 flex gap-1.5">
              {prospect.suggestedBrief.brandColors.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-elevated px-2 py-0.5 font-mono text-[10px]"
                >
                  <span
                    className="size-3 rounded-sm border border-border"
                    style={{ background: c }}
                  />
                  {c}
                </span>
              ))}
            </div>
          }
        />
      </div>

      <div className="mt-4">
        <BriefField
          label="USPs"
          value={
            <ul className="mt-1 space-y-1">
              {prospect.suggestedBrief.usps.map((u, i) => (
                <li key={i} className="text-text-muted">
                  · {u}
                </li>
              ))}
            </ul>
          }
        />
      </div>

      <div className="mt-4">
        <BriefField
          label="Doelgroep"
          value={
            <p className="mt-1 leading-relaxed text-text-muted">
              {prospect.suggestedBrief.audience}
            </p>
          }
        />
      </div>

      {prospect.suggestedBrief.offer ? (
        <div className="mt-4">
          <BriefField
            label="Aanbieding"
            value={
              <p className="mt-1 leading-relaxed text-text-muted">
                {prospect.suggestedBrief.offer}
              </p>
            }
          />
        </div>
      ) : null}
    </div>
  );
}

function BriefField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
        {label}
      </span>
      {typeof value === "string" ? (
        <p className="mt-1 text-text">{value}</p>
      ) : (
        value
      )}
    </div>
  );
}
