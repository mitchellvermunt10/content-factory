"use client";

import { useEffect, useState } from "react";
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
  Image as ImageIcon,
  Globe,
  ChevronDown,
  ChevronUp,
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
import type { ScrapedContent } from "@/lib/schemas/scrapedContent";

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

  // Op mount: probeer eerdere onderzoek-run te hydrateeren zodat tabs 2 + 3
  // klikbaar zijn na refresh. Twee strategieën:
  // 1. owner-email lookup (alleen werkt als email gezet was tijdens originele run)
  // 2. fallback: directe research-id uit localStorage (altijd betrouwbaar)
  useEffect(() => {
    let cancelled = false;
    const hydrateFromResult = (r: {
      id: string;
      result: ResearchResult;
      costCents: number;
      durationMs: number | null;
    }) => {
      if (cancelled) return;
      setResult({
        id: r.id,
        result: r.result,
        costCents: r.costCents,
        durationMs: r.durationMs ?? 0,
      });
      setActiveTab("top10");
    };

    (async () => {
      // Strategy 1: owner-email lookup
      let ownerEmail: string | null = null;
      try {
        const cached = localStorage.getItem("content-factory:owner-email");
        if (cached?.includes("@")) ownerEmail = cached;
      } catch {
        // niet beschikbaar
      }

      if (ownerEmail) {
        try {
          const res = await fetch(
            `/api/prospects?owner=${encodeURIComponent(ownerEmail)}`
          );
          if (res.ok) {
            const j = (await res.json()) as {
              research?: Array<{
                id: string;
                status: string;
                result: ResearchResult | null;
                costCents: number;
                durationMs: number | null;
              }>;
            };
            const latest = (j.research ?? []).find(
              (r) => r.status === "complete" && r.result
            );
            if (latest && latest.result) {
              hydrateFromResult({
                id: latest.id,
                result: latest.result,
                costCents: latest.costCents,
                durationMs: latest.durationMs,
              });
              return;
            }
          }
        } catch {
          // val terug op strategie 2
        }
      }

      // Strategy 2: directe research-id uit localStorage
      let lastId: string | null = null;
      try {
        lastId = localStorage.getItem("content-factory:last-research-id");
      } catch {
        // niet beschikbaar
      }
      if (!lastId) return;

      try {
        const res = await fetch(`/api/prospects/${lastId}`);
        if (!res.ok) return;
        const j = (await res.json()) as {
          research?: {
            id: string;
            status: string;
            result: ResearchResult | null;
            costCents: number;
            durationMs: number | null;
          } | null;
        };
        if (
          j.research &&
          j.research.status === "complete" &&
          j.research.result
        ) {
          hydrateFromResult({
            id: j.research.id,
            result: j.research.result,
            costCents: j.research.costCents,
            durationMs: j.research.durationMs,
          });
        }
      } catch {
        // geen probleem
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
      // Bewaar research-ID lokaal — fallback voor pagina-refresh als
      // owner-email niet was gezet tijdens de run
      try {
        localStorage.setItem("content-factory:last-research-id", j.id);
      } catch {
        // niet beschikbaar
      }
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

                    {!result ? (
                      <LoadByIdInput
                        onLoaded={(r) => {
                          setResult(r);
                          setActiveTab("top10");
                          try {
                            localStorage.setItem(
                              "content-factory:last-research-id",
                              r.id
                            );
                          } catch {
                            /* niet beschikbaar */
                          }
                        }}
                      />
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
  const [scraped, setScraped] = useState<ScrapedContent | null>(null);
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [showScraped, setShowScraped] = useState(false);

  // Bouw enriched brief: scraped data overschrijft Sonnet's gokjes
  const enrichedBrief = scraped
    ? {
        ...prospect.suggestedBrief,
        usps:
          scraped.uspsFromSite.length >= 3
            ? scraped.uspsFromSite.slice(0, 5)
            : prospect.suggestedBrief.usps,
        website: scraped.websiteUrl || prospect.suggestedBrief.website,
        phone: scraped.phone || prospect.suggestedBrief.phone,
      }
    : prospect.suggestedBrief;

  // Pack scraped photos + items + alle context in prefill zodat studio er ook bij kan
  const prefillPayload = {
    ...enrichedBrief,
    // Custom velden die BriefWizard reconstruereert tot ScrapedContent
    _scrapedWebsite: scraped?.websiteUrl ?? null,
    _scrapedSummary: scraped?.businessSummary ?? null,
    _scrapedUsps: scraped?.uspsFromSite ?? null,
    _scrapedItems: scraped?.items ?? null,
    _scrapedPhotos: scraped?.photos ?? null,
    _scrapedBookingUrl: scraped?.bookingUrl ?? null,
    _scrapedProvider: scraped?.bookingProvider ?? null,
    _scrapedAddress: scraped?.address ?? null,
    _scrapedHours: scraped?.openingHours ?? null,
    _scrapedPhone: scraped?.phone ?? null,
  };

  const studioUrl = `/studio/nieuw?prefill=${encodeURIComponent(
    btoa(JSON.stringify(prefillPayload))
  )}`;

  async function scrapeWebsite() {
    if (!prospect.websiteUrl) {
      toast.error("Geen website-URL bekend voor deze prospect");
      return;
    }
    setScrapeLoading(true);
    try {
      const res = await fetch("/api/research/scrape-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteUrl: prospect.websiteUrl,
          vertical: prospect.suggestedBrief.businessType,
          businessName: prospect.suggestedBrief.name,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error ?? `HTTP ${res.status}`
        );
      }
      const j = (await res.json()) as {
        content: ScrapedContent;
        costCents: number;
        durationMs: number;
      };
      setScraped(j.content);
      setShowScraped(true);
      toast.success(
        `${j.content.items.length} items + ${j.content.photos.length} foto's gevonden`,
        {
          description: `€${(j.costCents / 100).toFixed(2)} · ${Math.round(j.durationMs / 1000)}s`,
        }
      );
    } catch (err) {
      toast.error("Scrape mislukt", {
        description: err instanceof Error ? err.message : "Onbekende fout",
      });
    } finally {
      setScrapeLoading(false);
    }
  }

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
          {scraped ? (
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-[11px] font-medium text-success">
              <Check className="size-3" />
              Verrijkt met echte content
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {prospect.websiteUrl ? (
            <Button
              variant="secondary"
              onClick={scrapeWebsite}
              disabled={scrapeLoading}
            >
              {scrapeLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Globe className="size-4" />
              )}
              {scraped ? "Opnieuw scrapen" : "Verrijk met echte content"}
            </Button>
          ) : null}
          <Button asChild variant="accent">
            <Link href={studioUrl}>
              <Sparkles className="size-4" />
              Open in studio
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {scraped ? (
        <ScrapedPreview
          scraped={scraped}
          show={showScraped}
          onToggle={() => setShowScraped((v) => !v)}
        />
      ) : null}

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

// ======================== Load by ID (fallback) ========================

function LoadByIdInput({
  onLoaded,
}: {
  onLoaded: (r: ApiResponse) => void;
}) {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const trimmed = id.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/prospects/${trimmed}`);
      if (!res.ok) {
        toast.error("Niet gevonden", {
          description: "Check de research-ID in Supabase table prospect_research.",
        });
        return;
      }
      const j = (await res.json()) as {
        research?: {
          id: string;
          status: string;
          result: ResearchResult | null;
          costCents: number;
          durationMs: number | null;
        } | null;
      };
      if (
        !j.research ||
        j.research.status !== "complete" ||
        !j.research.result
      ) {
        toast.error("Run niet compleet", {
          description: `Status: ${j.research?.status ?? "onbekend"}`,
        });
        return;
      }
      onLoaded({
        id: j.research.id,
        result: j.research.result,
        costCents: j.research.costCents,
        durationMs: j.research.durationMs ?? 0,
      });
      toast.success("Onderzoek geladen");
    } catch (err) {
      toast.error("Laden mislukt", {
        description: err instanceof Error ? err.message : "Onbekende fout",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <details className="mt-2 rounded-lg border border-dashed border-border bg-bg/40 p-3">
      <summary className="cursor-pointer text-xs text-text-subtle">
        Eerder onderzoek terughalen via ID?
      </summary>
      <p className="mt-3 text-xs text-text-muted">
        Als je een onderzoek hebt gedraaid maar de tabs leeg staan, plak de
        research-ID hieronder. Te vinden in Supabase table{" "}
        <span className="font-mono">prospect_research</span> kolom{" "}
        <span className="font-mono">id</span>.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="bijv. aBcDeFg123"
          className="flex-1 rounded-lg border border-border bg-elevated px-3 py-2 text-sm font-mono text-text"
          disabled={loading}
        />
        <Button
          variant="secondary"
          onClick={load}
          disabled={loading || !id.trim()}
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          Laden
        </Button>
      </div>
    </details>
  );
}

// ======================== Scraped preview ========================

function ScrapedPreview({
  scraped,
  show,
  onToggle,
}: {
  scraped: ScrapedContent;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mt-5 rounded-xl border border-success/30 bg-success/5 p-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <Globe className="size-4 text-success" />
          <span className="text-sm font-medium">
            Echte content uit{" "}
            <span className="font-mono text-xs">{scraped.websiteUrl}</span>
          </span>
        </div>
        {show ? (
          <ChevronUp className="size-4 text-text-subtle" />
        ) : (
          <ChevronDown className="size-4 text-text-subtle" />
        )}
      </button>

      {show ? (
        <div className="mt-4 space-y-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              Wat ze doen (uit hun site)
            </span>
            <p className="mt-1 text-sm leading-relaxed text-text-muted">
              {scraped.businessSummary}
            </p>
          </div>

          {scraped.uspsFromSite.length > 0 ? (
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                Hun eigen USPs ({scraped.uspsFromSite.length})
              </span>
              <ul className="mt-1 space-y-1 text-sm text-text-muted">
                {scraped.uspsFromSite.map((u, i) => (
                  <li key={i}>· {u}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {scraped.items.length > 0 ? (
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                Echt aanbod ({scraped.items.length} items)
              </span>
              <div className="mt-2 max-h-72 space-y-1 overflow-y-auto rounded-lg border border-border bg-bg/40 p-3">
                {scraped.items.slice(0, 30).map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-3 border-b border-border/40 py-2 last:border-b-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      {item.description ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-text-muted">
                          {item.description}
                        </p>
                      ) : null}
                      {item.category ? (
                        <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-text-subtle">
                          {item.category}
                        </p>
                      ) : null}
                    </div>
                    {item.price ? (
                      <span className="shrink-0 font-mono text-xs text-accent">
                        {item.price}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {scraped.photos.length > 0 ? (
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                Foto's gevonden ({scraped.photos.length})
              </span>
              <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-5">
                {scraped.photos.slice(0, 15).map((photo, i) => (
                  <div
                    key={i}
                    className="group relative aspect-square overflow-hidden rounded-md border border-border bg-elevated"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.alt ?? ""}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                    <span className="absolute bottom-1 left-1 rounded bg-bg/70 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted backdrop-blur-sm">
                      {photo.context}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 text-xs sm:grid-cols-2">
            {scraped.bookingUrl ? (
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                  Booking-URL
                </span>
                <a
                  href={scraped.bookingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block truncate text-accent hover:underline"
                >
                  {scraped.bookingUrl}
                </a>
              </div>
            ) : null}
            {scraped.bookingProvider ? (
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                  Provider
                </span>
                <p className="mt-1 capitalize text-text-muted">
                  {scraped.bookingProvider}
                </p>
              </div>
            ) : null}
            {scraped.address ? (
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                  Adres
                </span>
                <p className="mt-1 text-text-muted">{scraped.address}</p>
              </div>
            ) : null}
            {scraped.phone ? (
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                  Telefoon
                </span>
                <p className="mt-1 text-text-muted">{scraped.phone}</p>
              </div>
            ) : null}
            {scraped.openingHours ? (
              <div className="sm:col-span-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                  Openingstijden
                </span>
                <p className="mt-1 text-text-muted">{scraped.openingHours}</p>
              </div>
            ) : null}
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-border bg-bg/40 p-3 text-xs text-text-muted">
            <ImageIcon className="mt-0.5 size-4 shrink-0 text-accent" />
            <p>
              Klik <strong>&quot;Open in studio&quot;</strong> — de spec gebruikt
              nu hun echte USPs, items en foto's als basis. Veel sterker dan
              AI-verzonnen content.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
