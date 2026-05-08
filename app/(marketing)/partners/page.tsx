import Link from "next/link";
import { ArrowUpRight, Check, Briefcase, Layers, Banknote, Phone } from "lucide-react";
import { Reveal, RevealStagger, RevealItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GradientMesh } from "@/components/motion/GradientMesh";
import { Noise } from "@/components/motion/Noise";

export const metadata = {
  title: "White-label voor bureaus — Next Level Sites",
  description:
    "Lever AI-gestuurde campagnes onder je eigen merk. Wholesale-tarief, eigen domein, geen lock-in.",
};

const STEPS = [
  {
    n: "01",
    title: "Kennismaking",
    body: "30-min call. We kijken of je portfolio en onze engine bij elkaar passen — geen verkooptraject.",
  },
  {
    n: "02",
    title: "White-label setup",
    body: "Eigen subdomein (bijv. studio.jouwbureau.nl), je logo en kleuren in de klant-weergave.",
  },
  {
    n: "03",
    title: "Eerste klant",
    body: "Wij genereren samen de eerste campagne. Jij levert hem onder eigen merk en kassa.",
  },
  {
    n: "04",
    title: "Schalen",
    body: "Vanaf 5 klanten zakt je tarief. Maandelijkse afrekening, geen jaarcontract.",
  },
];

const PRICING = [
  {
    label: "Eenmalige campagne",
    retail: "€750",
    wholesale: "€297",
    margin: "€453 marge",
    note: "Per losse campagne, levering binnen 1 werkdag.",
  },
  {
    label: "Always-On abonnement",
    retail: "€497/mnd",
    wholesale: "€197/mnd",
    margin: "€300/mnd marge",
    note: "Per klant, jij factureert. Vanaf 5 klanten extra korting.",
  },
  {
    label: "AI Receptionist",
    retail: "€299/mnd",
    wholesale: "€149/mnd",
    margin: "€150/mnd marge",
    note: "Inclusief setup. Voor klanten die al Always-On hebben.",
  },
];

const FOR_WHO = [
  {
    icon: Briefcase,
    title: "Webdesign-bureaus",
    body: "Je levert mooie sites maar klanten vragen om content. Voeg deze laag toe zonder te schalen.",
  },
  {
    icon: Layers,
    title: "Marketing-bureaus",
    body: "Je hebt strategie, niet de productie-capaciteit. Outsource creatieve uitvoer naar onze engine.",
  },
  {
    icon: Banknote,
    title: "Freelance tekstschrijvers",
    body: "Je bent al de strateeg voor je klanten. Met deze engine lever je 8 deliverables in plaats van 1.",
  },
];

export default function PartnersPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden pt-40 pb-20 md:pt-52 md:pb-28">
        <GradientMesh intensity="medium" />
        <Noise opacity={0.04} />
        <div className="container relative">
          <Reveal>
            <Badge variant="accent" className="mb-6">
              Voor bureaus
            </Badge>
            <h1 className="balance max-w-4xl text-[44px] font-medium leading-[1.05] tracking-tightest sm:text-6xl md:text-[88px]">
              <span className="text-gradient">
                Lever AI-campagnes onder
              </span>
              <br />
              <span className="text-gradient-accent">je eigen merk.</span>
            </h1>
            <p className="balance mt-8 max-w-2xl text-base leading-relaxed text-text-muted md:text-lg">
              Onze engine, jouw klanten. Wholesale-tarief, eigen domein, geen
              lock-in. Vanaf je eerste klant verdien je marge — vanaf je vijfde
              klant nog meer.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="accent">
                <a href="mailto:mitchell@nextlevelsites.nl?subject=White-label%20interesse">
                  Plan kennismaking
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="#hoe-werkt">Hoe het werkt</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <Reveal className="container">
          <div className="mb-12 max-w-3xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
              01 · voor wie
            </span>
            <h2 className="balance mt-3 text-3xl font-medium tracking-tight md:text-5xl">
              <span className="text-gradient">
                Bouw een tweede inkomststroom op je bestaande klantenkring.
              </span>
            </h2>
          </div>
        </Reveal>
        <div className="container">
          <RevealStagger className="grid gap-3 md:grid-cols-3" stagger={0.06}>
            {FOR_WHO.map((f) => (
              <RevealItem key={f.title}>
                <div className="h-full rounded-2xl border border-border bg-surface/50 p-7">
                  <f.icon className="size-5 text-accent" />
                  <h3 className="mt-6 text-xl font-medium tracking-tight">
                    {f.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-muted">
                    {f.body}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      <section id="hoe-werkt" className="py-20 md:py-28">
        <Reveal className="container">
          <div className="mb-14 max-w-3xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
              02 · hoe het werkt
            </span>
            <h2 className="balance mt-3 text-3xl font-medium tracking-tight md:text-5xl">
              <span className="text-gradient">Vier stappen, geen contract.</span>
            </h2>
          </div>
        </Reveal>
        <div className="container">
          <RevealStagger className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4" stagger={0.06}>
            {STEPS.map((s) => (
              <RevealItem key={s.n} className="bg-surface p-7">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                  {s.n}
                </span>
                <h3 className="mt-6 text-xl font-medium tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  {s.body}
                </p>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <Reveal className="container">
          <div className="mb-12 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
                03 · wholesale-tarieven
              </span>
              <h2 className="balance mt-3 max-w-2xl text-3xl font-medium tracking-tight md:text-5xl">
                <span className="text-gradient">
                  Wat verdien je per klant.
                </span>
              </h2>
            </div>
            <p className="max-w-md text-text-muted md:text-lg">
              Cijfers zijn ex. btw. Vanaf 5 actieve always-on klanten zakt het
              wholesale-tarief met 15%.
            </p>
          </div>
        </Reveal>
        <div className="container">
          <RevealStagger className="grid gap-3 md:grid-cols-3" stagger={0.06}>
            {PRICING.map((p) => (
              <RevealItem key={p.label}>
                <div className="rounded-2xl border border-border bg-surface/50 p-6">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                    {p.label}
                  </span>
                  <div className="mt-5 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-text-muted">Klantprijs</span>
                      <span className="text-lg font-medium tracking-tight">
                        {p.retail}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-text-muted">Wholesale</span>
                      <span className="text-lg font-medium tracking-tight">
                        {p.wholesale}
                      </span>
                    </div>
                    <div className="mt-3 rounded-lg bg-accent/10 p-3 text-center">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                        {p.margin}
                      </span>
                    </div>
                  </div>
                  <p className="mt-4 text-xs leading-relaxed text-text-subtle">
                    {p.note}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <Reveal className="container">
          <div className="mb-12 max-w-3xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
              04 · wat je krijgt
            </span>
            <h2 className="balance mt-3 text-3xl font-medium tracking-tight md:text-5xl">
              <span className="text-gradient">
                Inbegrepen in elke partner-account.
              </span>
            </h2>
          </div>
        </Reveal>
        <div className="container max-w-3xl">
          <Reveal>
            <ul className="space-y-3">
              {[
                "Eigen subdomein voor klant-weergave (bijv. studio.jouwbureau.nl)",
                "Logo + kleuren ge-rebranded op /c/[id] klant-pagina's",
                "Onboarding-sessie met Mitchell — hoe verkoop je dit aan jouw klantenkring",
                "Co-marketing: case studies samen, jij krijgt eigenaarschap",
                "Slack-channel voor support — geen ticket-systeem",
                "Volledige API-toegang vanaf 10 klanten (eigen integraties)",
                "Maandelijks afrekenen, geen jaarcontract, geen exit-fees",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-border bg-surface/50 p-4"
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <Check className="size-3" strokeWidth={2.5} />
                  </span>
                  <span className="text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

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
                  Een korte call. Zonder pitch.
                </span>
              </h2>
              <p className="balance mx-auto mt-6 max-w-xl text-text-muted md:text-lg">
                30 minuten. We laten zien hoe het werkt, jij vertelt waar je
                klanten zitten. Daarna besluiten we samen of het past.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" variant="accent">
                  <a href="mailto:mitchell@nextlevelsites.nl?subject=White-label%20interesse">
                    <Phone className="size-4" />
                    Plan kennismaking
                  </a>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <Link href="/">Terug naar overzicht</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
