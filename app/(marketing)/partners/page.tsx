import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Calendar,
  Briefcase,
} from "lucide-react";
import { Reveal, RevealStagger, RevealItem } from "@/components/motion/Reveal";

const BASE =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://nextlevelsites.nl";

export const metadata = {
  title:
    "Voor bureaus — Cinematic websites onder jouw merk · Next Level Sites",
  description:
    "Lever cinematic AI-websites aan jouw klanten zonder de motion-skills zelf op te bouwen. Wij maken de video, scènes en scroll-magie — jij behoudt klant en marge. Vanaf €2.500/site.",
  alternates: { canonical: `${BASE}/partners` },
  robots: { index: true, follow: true },
};

const STEPS = [
  {
    n: "01",
    title: "Kennismaking",
    body: "30-min call. We checken of je portfolio en onze stijl matchen — geen verkooptraject, geen verplichting.",
  },
  {
    n: "02",
    title: "Pilot project",
    body: "Eerste site bouwen we samen. Jij leert ons format kennen, we leren jouw klant-aanpak kennen. Veilige eerste stap.",
  },
  {
    n: "03",
    title: "White-label volledig",
    body: "Jouw merk zichtbaar in proposal, intake en levering. Wij blijven onzichtbaar tegenover jouw klant. Code op jouw repo of hosting.",
  },
  {
    n: "04",
    title: "Schalen",
    body: "Vanaf 3 sites/jaar zakt je tarief. Maandelijkse afrekening, geen jaarcontract, opzegbaar zonder boete.",
  },
];

const PRICING = [
  {
    label: "Single project",
    volume: "1 site",
    wholesale: "€2.500",
    note: "Eenmalig. 5 werkdagen turnaround.",
    retail: "Suggest. retail: €4.500–€7.500",
    margin: "Marge: €2.000–€5.000",
  },
  {
    label: "Partner",
    volume: "3+ sites/jaar",
    wholesale: "€2.200",
    note: "Per site. Vooraf overeengekomen volume.",
    retail: "Suggest. retail: €4.500–€7.500",
    margin: "Marge: €2.300–€5.300",
    highlight: true,
  },
  {
    label: "Volume",
    volume: "10+ sites/jaar",
    wholesale: "€1.700",
    note: "Per site. Priority queue, dedicated lead-time.",
    retail: "Suggest. retail: €4.500–€7.500",
    margin: "Marge: €2.800–€5.800",
  },
];

const DELIVERABLES = [
  "Cinematische hero-video op maat (Kling 3.0, 5-10 sec)",
  "3-5 Flux Pro Ultra hero-shots, anamorphic cinema-look",
  "Volledige 5-pagina scrolling site (home/menu/reserveren/verhaal/contact)",
  "Sticky CTA-bar + WhatsApp + Google Maps integratie",
  "Schema.org markup voor lokale SEO",
  "Mobile-first responsive design",
  "Code via jouw GitHub of overdracht naar jouw stack (Next.js)",
  "Eén revisie-ronde per launch inbegrepen",
];

const FAQ = [
  {
    q: "Hoe zit het met merk en IP?",
    a: "Je klant ziet alleen jouw merk. In proposal, intake, levering en e-mailcommunicatie. Wij ondertekenen NDA's standaard. De geleverde code wordt jouw eigendom — geen vendor lock-in.",
  },
  {
    q: "Moet ik een Next.js developer zijn?",
    a: "Niet per se. We leveren de complete site, gehost waar jij wilt (jouw Vercel, jouw klant's, of wij hosten met whitelabel-domein). Voor latere wijzigingen kun jij of jouw dev het zelf doen — het is gewone Next.js + React.",
  },
  {
    q: "Wat als ik geen klant heb om mee te starten?",
    a: "Dan zoeken we samen een eerste pilot. We hebben outreach-templates die voor jou werken in horeca/salons/garages. Geen kosten voor de eerste maand sales-ondersteuning.",
  },
  {
    q: "Hoe snel kan ik leveren aan mijn klant?",
    a: "5 werkdagen na intake voor Single project. Voor Partner-tier zit je in onze priority-queue (3-4 werkdagen). Volume krijgt dedicated lead-time per kwartaal.",
  },
  {
    q: "Wat als ik wil cancelen?",
    a: "Maandelijks opzegbaar. Geen jaarcontract, geen boete. Lopende sites worden afgemaakt onder de afgesproken tier.",
  },
  {
    q: "Hoe ziet exclusiviteit eruit?",
    a: "Standaard: niet exclusief — wij leveren aan meerdere bureaus per regio. Op Volume-tier kun je geografische exclusiviteit per stad bespreken (bv. 'enige Next Level Sites partner in Utrecht').",
  },
  {
    q: "Wat zit er onder de motorkap?",
    a: "Next.js 16 + React Server Components, Tailwind, Framer Motion, Lenis smooth-scroll, GSAP voor pinned-scrolls. Kling 3.0 voor video, Flux Pro 1.1 Ultra voor stills. Vercel-deployment. Productie-stack, geen experimentje.",
  },
];

export default function PartnersPage() {
  return (
    <div className="relative bg-black text-white">
      {/* ───────────────────────────────────────────────────────────
          HERO — B2B pitch
          ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sites/italian-restaurant/interior.jpg"
            alt=""
            className="h-full w-full scale-110 object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/65 to-black" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 pb-28 pt-32 sm:pb-36 sm:pt-44">
          <Reveal>
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/55 sm:text-xs">
              Voor webbureaus · Voor freelancers
            </p>
            <h1 className="mt-6 max-w-4xl font-serif text-5xl font-light leading-[0.95] tracking-tight sm:text-7xl md:text-8xl">
              Lever cinematic websites
              <br />
              <span className="text-white/70">
                zonder de motion-skills.
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-pretty text-lg text-white/75 sm:text-xl">
              Wij produceren de AI-video, de cinematic scènes en de scroll-magie.
              Jij behoudt het klantcontact, je merk en je marge.{" "}
              <span className="text-white">€2.500 per site</span>, suggest retail
              €4.500–€7.500.
            </p>
          </Reveal>

          <Reveal delay={0.2} className="mt-12 flex flex-wrap gap-3">
            <Link
              href="/sites/trattoria-sole"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
            >
              Zie wat we maken
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <a
              href="mailto:mitchell@nextlevelsites.nl?subject=Partner kennismaking"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <Calendar className="size-4" />
              Plan kennismaking
            </a>
          </Reveal>

          <Reveal delay={0.35} className="mt-16 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-white/10 pt-8 sm:max-w-3xl sm:grid-cols-4">
            {[
              { label: "Per site", value: "€2.500" },
              { label: "Levertijd", value: "5 dagen" },
              { label: "Volume-tarief", value: "€1.700" },
              { label: "Lock-in", value: "Nul" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
                  {stat.label}
                </p>
                <p className="mt-1 font-serif text-2xl">{stat.value}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          WAARVOOR — diagnostic: voor wie is dit?
          ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/10 px-6 py-24 sm:py-32">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sites/lifestyle/agency-hero-wide-start.jpg"
            alt=""
            className="h-full w-full scale-110 object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/85 to-black" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/45">
              Voor wie is dit?
            </p>
            <h2 className="mt-6 font-serif text-4xl font-light leading-tight tracking-tight md:text-6xl">
              Voor bureaus die premium willen
              <br />
              <span className="text-white/70">
                leveren zonder een motion-team.
              </span>
            </h2>
          </Reveal>

          <RevealStagger className="mt-16 grid gap-4 md:grid-cols-3 md:gap-6" stagger={0.12}>
            {[
              {
                label: "Voor webbureaus",
                title: "Tilt je portfolio naar premium",
                body: "Je doet al kwalitatieve sites maar mist de cinematic-laag waar Awwwards-tier bureaus zich onderscheiden. Wij leveren die module — jij houdt klant en marge.",
              },
              {
                label: "Voor freelancers",
                title: "Vraag premium-tarieven zonder team",
                body: "Solo-developer/designer met goede klanten in horeca, retail, premium-services? Verkoop €4.500-7.500 sites zonder zelf 60 uur per project te draaien.",
              },
              {
                label: "Voor branding agencies",
                title: "Lever website zonder dev-team",
                body: "Sterk in identity en strategie maar dev outsourcen geeft compromissen? Wij leveren de hele frontend onder jouw branding — je hoeft geen developer te zijn.",
              },
            ].map((card) => (
              <RevealItem
                key={card.label}
                className="rounded-3xl border border-white/10 bg-black/60 p-8 backdrop-blur-md transition-all hover:border-white/25 hover:-translate-y-1 sm:p-10"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
                  {card.label}
                </p>
                <h3 className="mt-4 font-serif text-2xl font-light leading-tight md:text-3xl">
                  {card.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-white/70">
                  {card.body}
                </p>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          PRICING — partner-tarieven
          ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/10 px-6 py-24 sm:py-32">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sites/italian-restaurant/post-1-food.jpg"
            alt=""
            className="h-full w-full scale-110 object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/85 to-zinc-950" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <Reveal className="text-center">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/45">
              Partner-tarieven
            </p>
            <h2 className="mt-6 font-serif text-4xl font-light leading-tight tracking-tight md:text-6xl">
              Eerlijke marge, geen lock-in
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
              Jij verkoopt aan je klant voor €4.500-7.500. Wij produceren voor
              €1.700-2.500. De marge ertussen is jouw winst — eerlijk en
              voorspelbaar.
            </p>
          </Reveal>

          <RevealStagger
            className="mt-16 grid gap-4 lg:grid-cols-3 lg:gap-6"
            stagger={0.12}
          >
            {PRICING.map((tier) => (
              <RevealItem
                key={tier.label}
                className={
                  tier.highlight
                    ? "relative rounded-3xl border-2 border-accent/50 bg-accent/[0.06] p-8 transition-all hover:scale-[1.02] hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] sm:p-10 lg:-mt-4 lg:mb-4"
                    : "rounded-3xl border border-white/10 bg-black p-8 transition-all hover:border-white/25 hover:-translate-y-1 sm:p-10"
                }
              >
                {tier.highlight ? (
                  <div className="absolute -top-3 left-8 rounded-full bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-black">
                    Populair
                  </div>
                ) : null}
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/45">
                  {tier.label}
                </p>
                <p className="mt-2 text-sm text-white/55">{tier.volume}</p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="font-serif text-5xl">{tier.wholesale}</span>
                  <span className="text-sm text-white/55">/ site</span>
                </div>
                <p className="mt-3 text-sm text-white/70">{tier.note}</p>
                <div className="mt-8 space-y-2 border-t border-white/10 pt-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
                    {tier.retail}
                  </p>
                  <p className="font-serif text-lg text-white">{tier.margin}</p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>

          <Reveal className="mt-12 text-center">
            <p className="text-sm text-white/55">
              Suggest. retail-prijzen zijn richtlijn. Jij bepaalt wat je klant
              betaalt — wij rekenen alleen ons partner-tarief.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          DELIVERABLES
          ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/10 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/45">
              Wat zit er in een site?
            </p>
            <h2 className="mt-6 font-serif text-4xl font-light leading-tight tracking-tight md:text-6xl">
              Volledig geleverd in 5 werkdagen
            </h2>
          </Reveal>

          <RevealStagger className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-x-6" stagger={0.06}>
            {DELIVERABLES.map((item) => (
              <RevealItem
                key={item}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/40 p-5 backdrop-blur-sm"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                <span className="text-sm leading-relaxed text-white/80">
                  {item}
                </span>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          PROCES
          ─────────────────────────────────────────────────────────── */}
      <section className="relative border-b border-white/10 bg-zinc-950 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <Reveal className="text-center">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/45">
              Hoe het werkt
            </p>
            <h2 className="mt-6 font-serif text-4xl font-light leading-tight tracking-tight md:text-6xl">
              Van pilot naar partner — 4 stappen
            </h2>
          </Reveal>

          <RevealStagger className="mt-16 grid gap-4 md:grid-cols-2 md:gap-6" stagger={0.12}>
            {STEPS.map((step) => (
              <RevealItem
                key={step.n}
                className="rounded-3xl border border-white/10 bg-black p-8 transition-all hover:border-white/25 hover:-translate-y-1 sm:p-10"
              >
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent">
                    {step.n}
                  </p>
                  <Briefcase className="size-5 text-white/30" />
                </div>
                <h3 className="mt-3 font-serif text-2xl">{step.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-white/70">
                  {step.body}
                </p>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          FAQ
          ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/10 px-6 py-24 sm:py-32">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sites/italian-restaurant/doorway.jpg"
            alt=""
            className="h-full w-full scale-110 object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/85 to-black" />
        </div>

        <div className="relative mx-auto max-w-3xl">
          <Reveal className="text-center">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/45">
              Vragen
            </p>
            <h2 className="mt-6 font-serif text-4xl font-light leading-tight tracking-tight md:text-5xl">
              Wat bureaus meestal vragen
            </h2>
          </Reveal>

          <RevealStagger className="mt-16 divide-y divide-white/10" stagger={0.08}>
            {FAQ.map((faq, i) => (
              <RevealItem key={i}>
                <details className="group py-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                    <h3 className="font-serif text-xl text-white sm:text-2xl">
                      {faq.q}
                    </h3>
                    <span className="grid size-8 shrink-0 place-items-center rounded-full border border-white/15 text-white/65 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/65">
                    {faq.a}
                  </p>
                </details>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          FINAL CTA
          ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/10 px-6 py-32">
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/sites/lifestyle/espresso-start.jpg"
            className="h-full w-full scale-110 object-cover opacity-50"
            aria-hidden="true"
          >
            <source src="/sites/lifestyle/espresso-hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/65 to-black" />
        </div>

        <Reveal className="relative mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/55">
            Klaar om te leveren?
          </p>
          <h2 className="mt-6 font-serif text-5xl font-light leading-[0.95] tracking-tight md:text-7xl">
            Plan een kennismaking.
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-white/75">
            30 minuten, vrijblijvend. We kijken samen of het past, je krijgt
            inzicht in tarieven en levertijd. Geen sales-pitch.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <a
              href="mailto:mitchell@nextlevelsites.nl?subject=Partner kennismaking"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
            >
              <Calendar className="size-4" />
              Plan kennismaking
            </a>
            <a
              href="https://wa.me/31681299321?text=Hoi%20Mitchell%2C%20vraag%20over%20de%20partner-deal"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              WhatsApp
            </a>
          </div>

          <p className="mt-8 text-xs text-white/45">
            Voor bureaus · Voor freelancers · Geen verplichting
          </p>
        </Reveal>
      </section>
    </div>
  );
}
