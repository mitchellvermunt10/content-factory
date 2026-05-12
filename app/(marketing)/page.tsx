import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Camera,
  Sparkles,
  Calendar,
  MessageCircle,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative bg-black text-white">
      {/* ───────────────────────────────────────────────────────────
          HERO
          ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sites/italian-restaurant/exterior.jpg"
            alt=""
            className="h-full w-full scale-110 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black" />
        </div>

        <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-between px-6 pb-20 pt-32 sm:px-10 sm:pt-40">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/55 sm:text-xs">
              Premium maatwerk · Voor lokale ondernemers
            </p>
            <h1 className="mt-6 max-w-4xl font-serif text-5xl font-light leading-[0.95] tracking-tight sm:text-7xl md:text-8xl">
              De website die je
              <br />
              <span className="text-white/70">zaak verdient.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-pretty text-lg text-white/70 sm:text-xl">
              Premium maatwerk voor restaurants, kapsalons en lokale
              ondernemers die opvallen tussen de templated rest. Een website
              die klanten binnenbrengt — niet alleen mooi om naar te kijken.
            </p>

            <div className="mt-12 flex flex-wrap gap-3">
              <Link
                href="/sites/trattoria-sole"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
              >
                Bekijk de Trattoria-case
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <a
                href="mailto:mitchell@nextlevelsites.nl?subject=Proposal aanvraag Next Level Site"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                <Calendar className="size-4" />
                Vraag een proposal aan
              </a>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-white/10 pt-8 sm:max-w-3xl sm:grid-cols-4">
            {[
              { label: "Vanaf", value: "€3.500" },
              { label: "Levertijd", value: "1-2 weken" },
              { label: "Onderhoud", value: "vanaf €197" },
              { label: "Verticals", value: "Horeca, MKB" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
                  {stat.label}
                </p>
                <p className="mt-1 font-serif text-2xl">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          PROBLEEM
          ─────────────────────────────────────────────────────────── */}
      <section className="relative border-t border-white/10 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/45">
            Wat we vaak horen
          </p>
          <h2 className="mt-6 font-serif text-4xl font-light leading-tight tracking-tight md:text-6xl">
            <span className="italic">&ldquo;Mijn website levert geen klanten op.&rdquo;</span>
          </h2>
          <div className="mt-10 space-y-6 text-lg leading-relaxed text-white/75 md:text-xl">
            <p>
              Bekend? De meeste websites zijn online folders geworden. Mensen
              komen, klikken weg, vergeten je naam. Je betaalt elke maand voor
              hosting maar het brengt niets op.
            </p>
            <p>
              Een goede website is geen visitekaartje. Het is iemand die je
              voorstelt aan een nieuwe klant — overtuigend, persoonlijk,
              precies op het moment dat ze twijfelen.
            </p>
            <p className="font-serif text-2xl italic text-white md:text-3xl">
              Dat is wat wij maken.
            </p>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          EERSTE LANCERING — single demo geframed als selectiviteit
          ─────────────────────────────────────────────────────────── */}
      <section className="relative border-t border-white/10 bg-zinc-950 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/45">
              Eerste lancering
            </p>
            <h2 className="mt-6 font-serif text-4xl font-light leading-tight tracking-tight md:text-6xl">
              Het bewijs dat het werkt.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
              Trattoria Sole, een Italiaans restaurant in Utrecht. Onze eerste
              publieke lancering — en het format waar elke volgende klant op
              voortbouwt.
            </p>
          </div>

          {/* KPI-tiles — concrete deliverables, geen fake performance-getallen */}
          <div className="mt-14 grid gap-3 sm:grid-cols-3 sm:gap-4">
            {[
              {
                label: "Levertijd",
                value: "14",
                unit: "dagen",
                sub: "van briefing naar live",
              },
              {
                label: "Architectuur",
                value: "5",
                unit: "pagina's",
                sub: "cinematic, scrollable, eigen domein",
              },
              {
                label: "Contact",
                value: "1op1",
                unit: "",
                sub: "geen account-manager-tussenlaag",
              },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-2xl border border-white/10 bg-black/40 p-6 sm:p-8"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
                  {kpi.label}
                </p>
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="font-serif text-5xl text-white sm:text-6xl">
                    {kpi.value}
                  </span>
                  {kpi.unit ? (
                    <span className="text-sm text-white/55">{kpi.unit}</span>
                  ) : null}
                </p>
                <p className="mt-3 text-sm text-white/55">{kpi.sub}</p>
              </div>
            ))}
          </div>

          <Link
            href="/sites/trattoria-sole"
            target="_blank"
            rel="noreferrer"
            className="group mt-16 block overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl transition-transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-2 border-b border-white/10 bg-zinc-900 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="size-3 rounded-full bg-white/15" />
                <span className="size-3 rounded-full bg-white/15" />
                <span className="size-3 rounded-full bg-white/15" />
              </div>
              <div className="ml-4 flex-1 truncate rounded-md bg-black/40 px-3 py-1 font-mono text-[11px] text-white/45">
                trattoriasole.nl
              </div>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.3em] text-white/45 sm:inline">
                Live →
              </span>
            </div>
            <div className="relative aspect-[16/9] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/sites/italian-restaurant/exterior.jpg"
                alt="Trattoria Sole demo"
                className="h-full w-full scale-105 object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 sm:p-12">
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/55">
                  Utrecht · Italiaans restaurant
                </p>
                <p className="mt-3 font-serif text-3xl sm:text-5xl">
                  Trattoria Sole
                </p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black">
                  Open de live versie
                  <ArrowUpRight className="size-4" />
                </div>
              </div>
            </div>
          </Link>

          <p className="mt-8 text-center text-sm text-white/45">
            Tip: scroll rustig met je trackpad. Op mobiel: gewoon swipen.
          </p>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          VOLGENDE LANCERINGEN — concept-mockups, eerlijk gelabeld
          ─────────────────────────────────────────────────────────── */}
      <section className="relative border-t border-white/10 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/45">
              Volgende lanceringen
            </p>
            <h2 className="mt-6 font-serif text-4xl font-light leading-tight tracking-tight md:text-6xl">
              Een website die jouw
              <br />
              <span className="text-white/70">vakwerk eer aandoet.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
              Voor kapsalons, autobedrijven en tandartsen die hun vakmanschap
              op het niveau willen tonen dat het verdient. Concept-mockups
              voor andere verticals — in ontwikkeling.
            </p>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-3 md:gap-6">
            {[
              {
                vertical: "Salon",
                image: "/sites/concepts/salon.jpg",
                title: "Voor kapsalons",
                desc: "Een website die je vakwerk en sfeer toont als merk. Geen templated agency-look — klanten zien wie je écht bent, en waarom ze bij jou willen knippen.",
              },
              {
                vertical: "Garage",
                image: "/sites/concepts/garage.jpg",
                title: "Voor autobedrijven",
                desc: "Een website die vakmanschap en vertrouwen uitstraalt. Klanten zien wie er aan hun auto sleutelt — en waarom ze bij jou veilig zitten.",
              },
              {
                vertical: "Tandarts",
                image: "/sites/concepts/tandarts.jpg",
                title: "Voor tandartspraktijken",
                desc: "Een website die rust en vertrouwen uitstraalt. Patiënten voelen al voor de eerste afspraak dat ze bij jou in goede handen zijn.",
              },
            ].map((concept) => (
              <div
                key={concept.vertical}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 transition-all hover:-translate-y-1"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={concept.image}
                    alt={`Concept-mockup voor ${concept.vertical}`}
                    className="h-full w-full scale-105 object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full border border-white/25 bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-white/75 backdrop-blur-md">
                    Concept
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/55">
                      {concept.vertical}
                    </p>
                    <h3 className="mt-3 font-serif text-2xl sm:text-3xl">
                      {concept.title}
                    </h3>
                  </div>
                </div>
                <p className="p-6 text-sm leading-relaxed text-white/65 sm:p-8">
                  {concept.desc}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-white/55">
            Wil je de eerste zijn in je vertical? Dan praten we graag.{" "}
            <a
              href="mailto:mitchell@nextlevelsites.nl?subject=Eerste in vertical"
              className="text-white underline-offset-4 hover:underline"
            >
              Stuur een berichtje →
            </a>
          </p>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          WEDGE — vergelijking
          ─────────────────────────────────────────────────────────── */}
      <section className="relative border-t border-white/10 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/45">
              Vergelijking
            </p>
            <h2 className="mt-6 font-serif text-4xl font-light leading-tight tracking-tight md:text-6xl">
              Wat krijg je per euro?
            </h2>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-2 md:gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/40">
                Traditioneel webbureau
              </p>
              <p className="mt-3 font-serif text-2xl text-white/65">
                Een template-website
              </p>
              <ul className="mt-8 space-y-3 text-sm text-white/55">
                {[
                  "€1.500 – €3.000 startbedrag",
                  "+ €50/uur voor elke wijziging",
                  "4–8 weken levertijd",
                  "Generieke Wix/Squarespace template",
                  "Geen video, geen storytelling",
                  "Mobile: aangepast als bijzaak",
                  "SEO: hoop dat het werkt",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-white/30" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative rounded-3xl border border-accent/40 bg-accent/[0.05] p-8 sm:p-10">
              <div className="absolute -top-3 left-8 rounded-full bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-black">
                Wat wij maken
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/65">
                Next Level Site
              </p>
              <p className="mt-3 font-serif text-2xl text-white">
                Vanaf €3.500 — cinematic format
              </p>
              <ul className="mt-8 space-y-3 text-sm text-white">
                {[
                  "Studio €3.500 of Signature €7.500",
                  "+ vanaf €197/mnd onderhoud (optioneel)",
                  "Live in 1-2 weken",
                  "AI-video op je homepage (template of uniek)",
                  "5 pagina's, scrollable verhaal",
                  "Mobile-first, snel op elke telefoon",
                  "Klaar voor lokaal Google (SEO + maps)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-12 text-center text-sm text-white/55">
            Een traditioneel bureau kost over een jaar zo'n €5.000–€10.000
            inclusief wijzigingen. Bij Studio zit je op €5.864 jaar 1
            (eenmalig + onderhoud), bij Signature €13.464 — maar alles erbij
            inbegrepen, geen factuurtjes per pasta-foto.
          </p>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          PROCES (anchor: werkwijze)
          ─────────────────────────────────────────────────────────── */}
      <section
        id="werkwijze"
        className="relative scroll-mt-20 border-t border-white/10 bg-zinc-950 px-6 py-24 sm:py-32"
      >
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/45">
              Hoe het werkt
            </p>
            <h2 className="mt-6 font-serif text-4xl font-light leading-tight tracking-tight md:text-6xl">
              Van intake naar live — 2 weken
            </h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {[
              {
                week: "Week 1",
                label: "Intake & research",
                icon: Sparkles,
                points: [
                  "30 minuten kennismakingsgesprek",
                  "Wij scrapen je Instagram, website, openingsuren, menu",
                  "Keuze van vertical-template (restaurant, salon, garage, tandarts)",
                  "Concept-voorstel binnen 3 werkdagen",
                ],
              },
              {
                week: "Week 2",
                label: "Cinematic productie & launch",
                icon: Camera,
                points: [
                  "AI genereert je cinematic hero-video (5 sec dolly-in)",
                  "3 hero-shots per scene, persoonlijke pers-content",
                  "Schema-markup, sitemap, OG-image",
                  "Live op je eigen domein binnen 14 dagen",
                ],
              },
            ].map((phase) => {
              const Icon = phase.icon;
              return (
                <div
                  key={phase.week}
                  className="rounded-3xl border border-white/10 bg-black p-8 sm:p-10"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/45">
                      {phase.week}
                    </p>
                    <Icon className="size-5 text-white/40" />
                  </div>
                  <h3 className="mt-3 font-serif text-2xl">{phase.label}</h3>
                  <ul className="mt-8 space-y-3 text-sm text-white/70">
                    {phase.points.map((p) => (
                      <li key={p} className="flex items-start gap-3">
                        <Check className="mt-0.5 size-4 shrink-0 text-white/55" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          WIE — persoonlijk, niet anoniem bureau
          ─────────────────────────────────────────────────────────── */}
      <section className="relative border-t border-white/10 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/45">
            Wie zit erachter
          </p>

          {/* Avatar — placeholder met initial tot foto er is */}
          <div className="mx-auto mt-10 grid size-28 place-items-center rounded-full border border-white/15 bg-gradient-to-br from-zinc-700 via-zinc-800 to-black font-serif text-4xl text-white/85 shadow-2xl">
            M
          </div>

          <h2 className="mt-8 font-serif text-4xl font-light leading-tight tracking-tight md:text-5xl">
            Mitchell Vermunt
          </h2>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.3em] text-white/45">
            Maker · Next Level Sites
          </p>

          <p className="mx-auto mt-10 max-w-xl text-lg leading-relaxed text-white/70">
            Ik bouw één site per maand. Persoonlijk, met al mijn aandacht, in
            14 dagen. Geen bureau van 50 met account-managers ertussen —
            gewoon jij en ik, tot het staat zoals het moet.
          </p>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/55">
            8+ jaar ervaring in MKB-websites. Nederlands. Lokaal. Bereikbaar.
          </p>

          <div className="mt-12 inline-flex flex-wrap items-center justify-center gap-6 text-sm text-white/55">
            <span>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
                KVK
              </span>{" "}
              98765432
            </span>
            <span className="text-white/20">·</span>
            <span>Next Level Sites · Nederland</span>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          PRICING (anchor: pricing)
          ─────────────────────────────────────────────────────────── */}
      <section
        id="pricing"
        className="relative scroll-mt-20 border-t border-white/10 bg-zinc-950 px-6 py-24 sm:py-32"
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/45">
              Wat het kost
            </p>
            <h2 className="mt-6 font-serif text-4xl font-light leading-tight tracking-tight md:text-6xl">
              Eerlijke prijzen, geen verrassingen
            </h2>
          </div>

          <div className="mt-16 grid gap-4 lg:grid-cols-3 lg:gap-6">
            {/* STUDIO — efficient cinematic via geverifieerde format */}
            <div className="rounded-3xl border border-white/10 bg-black p-8 sm:p-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/45">
                Studio
              </p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-serif text-5xl">€3.500</span>
                <span className="text-sm text-white/55">eenmalig</span>
              </div>
              <p className="mt-2 text-sm text-white/55">
                + €197/mnd onderhoud (optioneel)
              </p>
              <p className="mt-4 text-sm text-white/70">
                Onze cinematic website-format met efficiënte productie:
                snel live, premium uitvoering, branche-specifieke
                template-systeem dat zich heeft bewezen.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-white/70">
                {[
                  "Cinematic hero-video per branche (proven format)",
                  "2 custom Flux Pro hero-shots op maat",
                  "5 pagina's: home/kaart/reserveren/verhaal/contact",
                  "Sticky CTAs, WhatsApp-knop, Google Maps",
                  "Mobile-first design",
                  "SEO + Schema.org klaar voor lokaal Google",
                  "Eigen domein gekoppeld",
                  "Live binnen 1 week",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-white/55" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:mitchell@nextlevelsites.nl?subject=Studio Next Level Site"
                className="mt-10 flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3.5 text-sm font-medium transition-colors hover:bg-white/10"
              >
                Vraag offerte aan
                <ArrowRight className="size-4" />
              </a>
            </div>

            {/* SIGNATURE — populair, hoogwaardig */}
            <div className="relative rounded-3xl border-2 border-accent/50 bg-accent/[0.06] p-8 sm:p-10 lg:-mt-4 lg:mb-4">
              <div className="absolute -top-3 left-8 rounded-full bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-black">
                Populair
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/65">
                Signature
              </p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-serif text-5xl">€7.500</span>
                <span className="text-sm text-white/65">eenmalig</span>
              </div>
              <p className="mt-2 text-sm text-white">
                + €497/mnd onderhoud (aanbevolen)
              </p>
              <p className="mt-4 text-sm text-white/85">
                Volledig op maat. Eigen video, eigen scènes, eigen verhaal —
                voor wie elke detail uniek wil hebben.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-white/85">
                {[
                  "Volledig eigen Kling 3.0 cinematic dolly-video",
                  "3-5 eigen Flux Pro 1.1 Ultra hero-shots",
                  "Uniek scene-design + storytelling",
                  "5 pagina's volledig op maat vormgegeven",
                  "Premium onderhoud: maandelijkse updates inclusief",
                  "Hosting + security + performance monitoring",
                  "24u-respons + persoonlijke begeleiding",
                  "Live binnen 2 weken",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:mitchell@nextlevelsites.nl?subject=Signature Next Level Site"
                className="mt-10 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
              >
                Plan kennismaking
                <ArrowRight className="size-4" />
              </a>
            </div>

            {/* AI RECEPTIONIST — add-on */}
            <div className="rounded-3xl border border-white/10 bg-black p-8 sm:p-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/45">
                AI Receptionist · Add-on
              </p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-serif text-5xl">€299</span>
                <span className="text-sm text-white/55">/ maand</span>
              </div>
              <p className="mt-2 text-sm text-white/55">
                Werkt naast Essentials of Signature
              </p>
              <p className="mt-4 text-sm text-white/70">
                24/7 telefoon + WhatsApp die reserveringen aanneemt en vragen
                beantwoordt. Voor zaken die buiten openingstijd geen klant
                meer willen missen.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-white/70">
                {[
                  "24/7 telefonisch bereikbaar",
                  "WhatsApp-bot voor reserveringen",
                  "Openingstijden + menu beantwoorden",
                  "Allergeen-vragen automatisch",
                  "Schakelt door naar mens bij twijfel",
                  "Maandelijks opzegbaar",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-white/55" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:mitchell@nextlevelsites.nl?subject=AI Receptionist"
                className="mt-10 flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3.5 text-sm font-medium transition-colors hover:bg-white/10"
              >
                Meer info
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>

          {/* Schaarste-regel — premium agencies positioneren capaciteit als luxe */}
          <p className="mt-10 text-center font-mono text-xs uppercase tracking-[0.3em] text-white/45">
            We nemen 4 projecten per kwartaal aan.
          </p>

          {/* Secundaire product — AI Content Factory link */}
          <div className="mt-16 rounded-2xl border border-white/10 bg-black/40 p-6 text-center sm:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
              Geen volledige website nodig?
            </p>
            <p className="mt-3 text-base text-white/75">
              Wij maken ook losse marketingcampagnes (landing pages,
              advertenties, social, e-mail) vanaf €750 per stuk.
            </p>
            <Link
              href="/ai-content-factory"
              className="mt-4 inline-flex items-center gap-2 text-sm text-white underline-offset-4 hover:underline"
            >
              Bekijk AI Content Factory →
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          FAQ
          ─────────────────────────────────────────────────────────── */}
      <section className="relative border-t border-white/10 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/45">
              Vragen
            </p>
            <h2 className="mt-6 font-serif text-4xl font-light leading-tight tracking-tight md:text-5xl">
              Veel gestelde vragen
            </h2>
          </div>

          <div className="mt-16 divide-y divide-white/10">
            {[
              {
                q: "Wat als ik al een website heb?",
                a: "We bouwen helemaal nieuw, je behoudt je eigen domein. Bestaande Google-rankings nemen we mee via 301-redirects waar nodig. Je oude site blijft beschikbaar tot we live gaan met de nieuwe.",
              },
              {
                q: "Hoe lang duurt het echt?",
                a: "Van intake-call tot live: 2 weken. Eerste week voor research + concept, tweede week voor cinematic productie + launch. Bij complexe wensen kan het uitlopen — dat zeggen we vooraf.",
              },
              {
                q: "Wat is er bij de €497 per maand inbegrepen?",
                a: "Maandelijkse updates van je menu, foto's, content. Hosting, security-monitoring, performance-checks, en respons binnen 24 uur op alle vragen. Geen uurtarief, geen onverwachte facturen.",
              },
              {
                q: "Wat als ik geen onderhoudscontract wil?",
                a: "Prima — neem het eenmalige pakket van €7.500. Je krijgt de complete site, wij geven 'm netjes over en jij regelt je eigen hosting of vraagt ons later alsnog. Geen verplichting.",
              },
              {
                q: "Voor welke types ondernemingen werkt dit?",
                a: "Momenteel restaurants (live demo bij Trattoria Sole). Op de roadmap voor Q3 2026: kapsalons, garages, tandartsen. Het format werkt voor elke lokale onderneming met een fysieke locatie en sterke visuele identiteit.",
              },
              {
                q: "Kan ik mijn eigen domein gebruiken?",
                a: "Ja. We koppelen jouw bestaande domein (bv. trattoriasole.nl) aan onze infrastructuur. Bezoekers merken geen verschil — alles draait onder jouw domein, niet 'next-level-sites.nl/trattoria'.",
              },
              {
                q: "Wat als ik niet tevreden ben?",
                a: "Tot het launch-moment heb je twee gratis revisie-rondes na het concept-voorstel. Na launch: 14 dagen gratis bug-fixes. Als de website niet brengt wat we beloofden, krijg je je geld terug — geen kleine lettertjes.",
              },
            ].map((faq, i) => (
              <details key={i} className="group py-6">
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
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          FINAL CTA
          ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/10 px-6 py-32">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sites/italian-restaurant/post-2-ambiance.jpg"
            alt=""
            className="h-full w-full scale-110 object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/65 to-black" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/55">
            Klaar om te beginnen?
          </p>
          <h2 className="mt-6 font-serif text-5xl font-light leading-[0.95] tracking-tight md:text-7xl">
            Laten we koffie drinken.
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-white/75">
            Vraag een vrijblijvende proposal aan. Ik laat je een eerste opzet
            zien voor jouw type zaak en je krijgt direct een offerte. Geen
            pushy verkoop — beloofd.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <a
              href="mailto:mitchell@nextlevelsites.nl?subject=Proposal aanvraag Next Level Site"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
            >
              <Calendar className="size-4" />
              Vraag een proposal aan
            </a>
            <a
              href="https://wa.me/31681299321?text=Hoi%20Mitchell%2C%20vraag%20over%20Next%20Level%20Site"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <MessageCircle className="size-4" />
              Stuur WhatsApp
            </a>
          </div>

          <p className="mt-8 text-xs text-white/45">
            Geen verplichting · Geen kleine lettertjes · Reactie binnen 24 uur
          </p>
        </div>
      </section>
    </div>
  );
}
