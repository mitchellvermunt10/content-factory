import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Reveal, RevealStagger, RevealItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GradientMesh } from "@/components/motion/GradientMesh";
import { Noise } from "@/components/motion/Noise";
import { activeCases, CASES, type CaseEntry } from "@/lib/demo/cases";
import { getCampaignRow } from "@/lib/supabase/repo";
import type { Campaign } from "@/lib/schemas/campaign";

export const metadata = {
  title: "Cases — Next Level Sites",
  description:
    "Voorbeelden van complete campagnes voor lokale ondernemers — landing, ads, social en cinematic, in minuten gegenereerd.",
};

// Server-side fetch zodat de pagina static-cacheable is en SEO-vriendelijk.
// Geen revalidate — campagnes veranderen pas als je nieuwe ID's pusht.

const VERTICAL_LABEL: Record<CaseEntry["vertical"], string> = {
  salon: "Beautysalon",
  restaurant: "Restaurant",
  autobedrijf: "Autobedrijf",
};

type LoadedCase = {
  entry: CaseEntry;
  campaign: Campaign | null;
};

async function loadCases(): Promise<LoadedCase[]> {
  const entries = activeCases();
  return Promise.all(
    entries.map(async (entry) => {
      try {
        const campaign = await getCampaignRow(entry.id);
        return { entry, campaign };
      } catch {
        return { entry, campaign: null };
      }
    })
  );
}

export default async function CasesPage() {
  const cases = await loadCases();
  const visible = cases.filter((c) => c.campaign !== null);
  const hasAny = visible.length > 0;

  return (
    <>
      <section className="relative isolate overflow-hidden pt-40 pb-16 md:pt-52 md:pb-20">
        <GradientMesh intensity="medium" />
        <Noise opacity={0.04} />
        <div className="container relative">
          <Reveal>
            <Badge variant="accent" className="mb-6">
              Cases
            </Badge>
            <h1 className="balance max-w-4xl text-[44px] font-medium leading-[1.05] tracking-tightest sm:text-6xl md:text-[88px]">
              <span className="text-gradient">
                Wat we maken,
              </span>
              <br />
              <span className="text-gradient-accent">in 7 minuten.</span>
            </h1>
            <p className="balance mt-8 max-w-2xl text-base leading-relaxed text-text-muted md:text-lg">
              Drie volledige campagnes voor uiteenlopende lokale bedrijven.
              Elke case is door onze engine gegenereerd uit één korte intake —
              landing, ads, social, cinematic concept en meer.
            </p>
          </Reveal>
        </div>
      </section>

      {hasAny ? (
        <section className="pb-24 md:pb-32">
          <div className="container">
            <RevealStagger className="grid gap-4 md:grid-cols-2" stagger={0.08}>
              {visible.map(({ entry, campaign }) =>
                campaign ? (
                  <RevealItem key={entry.id}>
                    <CaseCard entry={entry} campaign={campaign} />
                  </RevealItem>
                ) : null
              )}
            </RevealStagger>
          </div>
        </section>
      ) : (
        <section className="pb-24 md:pb-32">
          <div className="container">
            <Reveal>
              <div className="rounded-2xl border border-dashed border-border bg-surface/40 p-12 text-center">
                <Sparkles className="mx-auto size-8 text-text-subtle" />
                <h2 className="mt-4 text-2xl font-medium tracking-tight">
                  Cases verschijnen binnenkort
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm text-text-muted">
                  We zetten de eerste 3 voorbeelden klaar — beauty, horeca en
                  automotive. Tot die tijd: neem contact op of probeer 'm zelf.
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button asChild variant="accent">
                    <Link href="/studio/nieuw">
                      Probeer een demo
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <a href="mailto:mitchell@nextlevelsites.nl">
                      Plan kennismaking
                    </a>
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Pre-rendered placeholders zodat ook leeg-state pages discoverable
          zijn — laat zien welke verticals onderweg zijn. */}
      {!hasAny ? (
        <section className="pb-24">
          <div className="container">
            <Reveal>
              <div className="mb-8">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
                  Onderweg
                </span>
                <h3 className="mt-3 text-2xl font-medium tracking-tight">
                  <span className="text-gradient">Eerste drie cases.</span>
                </h3>
              </div>
            </Reveal>
            <RevealStagger className="grid gap-3 md:grid-cols-3" stagger={0.06}>
              {CASES.map((entry) => (
                <RevealItem key={entry.label}>
                  <div className="rounded-2xl border border-border bg-surface/30 p-6">
                    <Badge variant="outline">
                      {VERTICAL_LABEL[entry.vertical]}
                    </Badge>
                    <h4 className="mt-4 text-lg font-medium tracking-tight">
                      {entry.label}
                    </h4>
                    <p className="mt-2 text-sm text-text-muted">
                      {entry.blurb}
                    </p>
                  </div>
                </RevealItem>
              ))}
            </RevealStagger>
          </div>
        </section>
      ) : null}

      <section className="py-24 md:py-32">
        <Reveal className="container">
          <div className="relative overflow-hidden rounded-[28px] border border-border bg-gradient-to-b from-elevated to-bg px-8 py-20 text-center md:px-16 md:py-28">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-40 left-1/2 -z-0 h-[480px] w-[720px] -translate-x-1/2 rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, hsl(var(--accent) / 0.35), transparent 70%)",
              }}
            />
            <div className="relative">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
                Volgende stap
              </span>
              <h2 className="balance mx-auto mt-4 max-w-3xl text-4xl font-medium leading-tight tracking-tightest md:text-6xl">
                <span className="text-gradient-accent">
                  Wil je dit voor jouw zaak?
                </span>
              </h2>
              <p className="balance mx-auto mt-6 max-w-xl text-text-muted md:text-lg">
                Eén intake. 7 minuten later zie je hoe het er voor jou uitziet.
                Geen verplichting.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" variant="accent">
                  <Link href="/studio/nieuw">
                    Probeer een demo
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <Link href="/#pricing">Bekijk prijzen</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function CaseCard({
  entry,
  campaign,
}: {
  entry: CaseEntry;
  campaign: Campaign;
}) {
  const cinematic = campaign.artifacts.cinematic;
  const accent = campaign.brand.accent;

  return (
    <Link
      href={`/c/${campaign.id}`}
      className="group relative block h-full overflow-hidden rounded-2xl border border-border bg-surface/50 transition-all duration-500 hover:border-border-strong hover:bg-surface/90 hover:-translate-y-0.5"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 opacity-60"
        style={{ background: accent }}
      />
      <div className="p-7 md:p-9">
        <div className="flex items-center gap-2">
          <Badge variant="accent">{VERTICAL_LABEL[entry.vertical]}</Badge>
          <Badge variant="outline">{campaign.brief.city}</Badge>
          <Badge>{campaign.brief.tone}</Badge>
        </div>

        <h2 className="mt-6 text-3xl font-medium tracking-tight md:text-4xl">
          <span className="text-gradient">{campaign.brief.name}</span>
        </h2>

        <p className="mt-4 text-sm font-medium leading-relaxed text-accent md:text-base">
          {entry.highlight}
        </p>

        <p className="mt-4 max-w-md text-sm leading-relaxed text-text-muted md:text-base">
          {cinematic?.concept?.logline ?? entry.blurb}
        </p>

        <div className="mt-8 grid grid-cols-3 gap-2">
          <Stat
            label="Deliverables"
            value="8"
          />
          <Stat
            label="Doorlooptijd"
            value="~7 min"
          />
          <Stat
            label="Master cut"
            value={
              cinematic?.concept
                ? `${cinematic.concept.totalDurationSec}s`
                : "—"
            }
          />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
            Bekijk volledige case
          </span>
          <ArrowUpRight className="size-4 text-text-subtle transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-elevated/50 p-3 text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
        {label}
      </span>
      <p className="mt-1 text-base font-medium tracking-tight">{value}</p>
    </div>
  );
}
