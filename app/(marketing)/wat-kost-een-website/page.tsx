import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, X } from "lucide-react";

const BASE =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://nextlevelsites.nl";

export const metadata: Metadata = {
  title: "Wat kost een website voor een lokale ondernemer? Eerlijk antwoord (2026)",
  description:
    "Een eerlijk antwoord op de vraag wat een goede website kost — €750 voor een campagne, €7.500 voor een premium maatwerk-site. Geen verborgen kosten, geen offerte-shoppen.",
  alternates: { canonical: `${BASE}/wat-kost-een-website` },
  openGraph: {
    title: "Wat kost een website voor een lokale ondernemer? (2026)",
    description:
      "Eerlijk antwoord: van €750 tot €7.500. Wat krijg je per prijspunt? Wij leggen het transparant uit.",
    type: "article",
    locale: "nl_NL",
    url: `${BASE}/wat-kost-een-website`,
  },
  robots: { index: true, follow: true },
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Wat kost een website voor een restaurant?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Een gemiddelde restaurant-website kost €1.500–€3.000 bij een traditioneel bureau. Bij Next Level Sites kost een premium cinematic restaurant-website €7.500 eenmalig. Voor enkel een marketingcampagne (landingspagina + ads + social) is dat €750.",
      },
    },
    {
      "@type": "Question",
      name: "Wat is de prijs van een goede website?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Een 'goede' website hangt af van wat je wilt: een visitekaartje (€500–€1.500), een werkende MKB-site (€1.500–€3.000), of een premium maatwerk-site met video en storytelling (€7.500+). Belangrijker dan prijs: krijg je er klanten bij?",
      },
    },
    {
      "@type": "Question",
      name: "Wat kost een Next Level Site precies?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Twee tiers: Studio (€3.500 eenmalig + €197/mnd onderhoud optioneel) voor modaal MKB met slim hergebruik per branche, live in 1 week. Signature (€7.500 eenmalig + €497/mnd aanbevolen) voor wie volledig op maat wil — eigen video, eigen scènes, eigen verhaal. Beide leveren een complete 5-pagina cinematic website.",
      },
    },
    {
      "@type": "Question",
      name: "Wat zijn de jaarlijkse kosten van een website?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Hosting (€50–€200/jaar), domein (€10–€30/jaar), onderhoud variabel (€50/uur bij meeste bureaus). Bij Next Level Sites is het vanaf €197/maand (Studio) of €497/maand (Signature) all-in: content-updates, hosting, security en support inbegrepen — geen uurtarieven achteraf.",
      },
    },
    {
      "@type": "Question",
      name: "Moet ik kiezen voor goedkope of dure website?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Niet de prijs, maar de ROI bepaalt. Een €1.500-website die geen klanten oplevert is duurder dan een €7.500-website die elke maand 5 nieuwe boekingen genereert. Vraag potentiële bureaus altijd: 'Hoeveel klanten levert deze investering op?'",
      },
    },
  ],
};

export default function WatKostEenWebsitePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      <div className="relative bg-black text-white">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/sites/italian-restaurant/post-2-ambiance.jpg"
              alt=""
              className="h-full w-full scale-110 object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/65 to-black" />
          </div>

          <div className="relative mx-auto max-w-4xl px-6 pb-24 pt-32 sm:pb-32 sm:pt-44">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/55 sm:text-xs">
              Eerlijk antwoord · Geen offerte-shoppen
            </p>
            <h1 className="mt-6 font-serif text-5xl font-light leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
              Wat kost een goede website
              <br />
              <span className="text-white/70">voor jouw zaak?</span>
            </h1>
            <p className="mt-8 max-w-2xl text-pretty text-lg text-white/75 sm:text-xl">
              We krijgen die vraag dagelijks. Hier is het echte, transparante
              antwoord — geen offerte-formulier eerst, geen verborgen kosten.
            </p>
          </div>
        </section>

        {/* PRIJSRANGES IN NL MKB */}
        <section className="border-b border-white/10 px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-4xl">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/45">
              De prijsranges in NL · 2026
            </p>
            <h2 className="mt-4 font-serif text-3xl font-light tracking-tight md:text-5xl">
              Vier categorieën, vier prijspunten
            </h2>

            <div className="mt-12 divide-y divide-white/10">
              {[
                {
                  range: "€500 – €1.500",
                  type: "Visitekaartje-site",
                  desc: "Wix/Squarespace template, 1–3 pagina's, jij vult zelf in. Werkt als 'we zijn er ook online' — niet als acquisitie-instrument. Op zich niets mis mee als je geen klanten via je site verwacht.",
                  cons: "Geen branding, geen onderscheidend vermogen, geen video, geen lokale SEO",
                },
                {
                  range: "€1.500 – €3.000",
                  type: "Standaard MKB-website",
                  desc: "Bij de meeste lokale webbureaus. Templated maar wat gepersonaliseerd, 4–8 pagina's, basis-SEO. Werkt voor 80% van het MKB.",
                  cons: "Generieke 'agency look', maandelijkse facturen voor wijzigingen (€50/u), 4–8 weken levertijd",
                },
                {
                  range: "€3.500 (Studio)",
                  type: "Cinematic format — efficiënte productie",
                  desc: "Onze studio-tier. Cinematic format met branche-specifieke template-systeem (dolly-video + 2 custom hero-shots per klant). Volledige 5-pagina site, premium uitvoering, live in 1 week.",
                  cons: "Hero-video is een branche-template (niet volledig uniek), 2 hero-shots ipv 3-5",
                  highlight: true,
                },
                {
                  range: "€7.500 (Signature)",
                  type: "Volledig op maat — fully custom",
                  desc: "Onze premium tier. Eigen Kling cinematic dolly-video op maat, eigen Flux Pro hero-shots, uniek scene-design, persoonlijke begeleiding. Voor wie de mooiste van zijn stad wil zijn.",
                  cons: "Overkill als je geen unieke video-content wilt — neem dan Studio",
                  highlight: true,
                },
                {
                  range: "€15.000 – €50.000+",
                  type: "Enterprise / agency van naam",
                  desc: "Studio Dumbar, Build in Amsterdam, Dept. Werken voor merken met €5M+ omzet. Werkelijk maatwerk + strategie + branding-traject.",
                  cons: "Out of reach voor 99% van de lokale MKB. Niet onze categorie.",
                },
              ].map((tier) => (
                <div
                  key={tier.range}
                  className={`grid gap-6 py-8 md:grid-cols-[200px_1fr] md:gap-12 ${
                    tier.highlight ? "rounded-2xl bg-accent/[0.04] px-6" : ""
                  }`}
                >
                  <div>
                    <p className="font-serif text-2xl md:text-3xl">
                      {tier.range}
                    </p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
                      {tier.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-base leading-relaxed text-white/80 md:text-lg">
                      {tier.desc}
                    </p>
                    <p className="mt-3 text-sm text-white/50">
                      <span className="text-white/35">Beperking:</span>{" "}
                      {tier.cons}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WAT KRIJG JE BIJ ONS — Signature breakdown */}
        <section className="border-b border-white/10 bg-zinc-950 px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-5xl">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/45">
              Wat zit er bij Signature (€7.500)?
            </p>
            <h2 className="mt-4 font-serif text-3xl font-light tracking-tight md:text-5xl">
              Tot op de regel transparant
            </h2>
            <p className="mt-4 max-w-2xl text-base text-white/65">
              Voor Studio (€3.500) lopen alle posten ~40% korter — slim
              hergebruik per branche, ~30 uur ipv 64 uur ontwikkeltijd.
            </p>

            <div className="mt-12 grid gap-3 md:grid-cols-2 md:gap-4">
              {[
                {
                  category: "Strategie & onderzoek",
                  hours: "8u",
                  items: [
                    "30-min kennismakingscall",
                    "Wij scrapen je IG/website/menu",
                    "Concept-voorstel binnen 3 werkdagen",
                  ],
                },
                {
                  category: "Cinematic productie",
                  hours: "16u",
                  items: [
                    "AI-gegenereerde hero-video op maat (Kling 3.0)",
                    "3 hero-shots per scene (Flux Pro Ultra)",
                    "Anamorphic cinematic kleur-grading",
                  ],
                },
                {
                  category: "Design & development",
                  hours: "32u",
                  items: [
                    "5 cinematische pagina's (home, kaart, reserveren, verhaal, contact)",
                    "Mobile-first responsive design",
                    "Sticky CTAs + WhatsApp-integratie",
                    "Eigen domein gekoppeld via Vercel",
                  ],
                },
                {
                  category: "SEO & launch",
                  hours: "8u",
                  items: [
                    "Schema.org Restaurant/LocalBusiness markup",
                    "Sitemap, robots, OG-images dynamisch",
                    "Google Business Profile-koppeling",
                    "Performance-optimalisatie (Core Web Vitals)",
                  ],
                },
              ].map((block) => (
                <div
                  key={block.category}
                  className="rounded-2xl border border-white/10 bg-black p-6 sm:p-8"
                >
                  <div className="flex items-baseline justify-between">
                    <p className="font-serif text-xl">{block.category}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
                      ~{block.hours}
                    </p>
                  </div>
                  <ul className="mt-6 space-y-2 text-sm text-white/70">
                    {block.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Check className="mt-0.5 size-4 shrink-0 text-white/55" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="mt-8 text-center text-sm text-white/55">
              Signature: ~64 uur ontwikkelwerk = €117/uur. Studio: ~30
              uur = €117/uur. Onder NL-bureau-tarief (€85–€150/u) maar mét
              de AI-power die normaal alleen agencies van €40k+ leveren.
            </p>
          </div>
        </section>

        {/* MAANDELIJKSE KOSTEN UITLEG */}
        <section className="border-b border-white/10 px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-4xl">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/45">
              En de €497 per maand?
            </p>
            <h2 className="mt-4 font-serif text-3xl font-light tracking-tight md:text-5xl">
              Maandelijkse kosten — wat zit er echt in?
            </h2>

            <div className="mt-12 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-zinc-950 p-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/40">
                  Traditioneel bureau
                </p>
                <p className="mt-4 font-serif text-3xl">€50/uur</p>
                <p className="mt-2 text-sm text-white/55">
                  Voor elke wijziging
                </p>
                <ul className="mt-8 space-y-2 text-sm text-white/65">
                  <li className="flex items-start gap-3">
                    <X className="mt-0.5 size-4 shrink-0 text-white/35" />
                    Hosting apart (€50–€200/jaar)
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="mt-0.5 size-4 shrink-0 text-white/35" />
                    Wijzigingen op uurbasis
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="mt-0.5 size-4 shrink-0 text-white/35" />
                    Geen security-monitoring
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="mt-0.5 size-4 shrink-0 text-white/35" />
                    Reactietijd: 3–7 dagen
                  </li>
                </ul>
                <p className="mt-8 text-sm text-white/45">
                  Per jaar typisch: <span className="text-white/75">€1.200–€3.600</span>
                </p>
              </div>

              <div className="rounded-3xl border-2 border-accent/40 bg-accent/[0.05] p-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/65">
                  Next Level Sites · Always-On
                </p>
                <p className="mt-4 font-serif text-3xl">€497/maand</p>
                <p className="mt-2 text-sm text-white/75">
                  Alles inclusief, geen verrassingen
                </p>
                <ul className="mt-8 space-y-2 text-sm text-white">
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    Hosting + premium CDN
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    Maandelijkse content-updates
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    Security + performance monitoring
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    24u-respons op vragen
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    Stop wanneer je wilt
                  </li>
                </ul>
                <p className="mt-8 text-sm text-white/75">
                  Per jaar: <span className="text-white">€5.964</span>
                </p>
              </div>
            </div>

            <p className="mt-10 text-center text-base text-white/65">
              Berekend uit: één klant per maand extra dekt het volledige
              maandbedrag. Bij twee extra klanten verdien je het terug.
            </p>
          </div>
        </section>

        {/* AANBEVELING */}
        <section className="border-b border-white/10 bg-zinc-950 px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/45">
              Niet de prijs maakt het verschil
            </p>
            <h2 className="mt-4 font-serif text-3xl font-light leading-tight tracking-tight md:text-5xl">
              Maar de ROI.
            </h2>
            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-white/75">
              Een €1.500-website die geen klanten oplevert is duurder dan een
              €7.500-website die elke maand 5 nieuwe boekingen genereert.
              Vraag elk bureau dat je belt:
              <em className="not-italic text-white">
                {" "}
                &ldquo;Hoeveel klanten gaat deze investering opleveren?&rdquo;
              </em>
            </p>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/55">
              Wij beloven geen exacte getallen — dat doet niemand eerlijk. Wel
              kunnen we je laten zien hoe het format werkt en samen rekenen
              wat realistisch is voor jouw zaak.
            </p>

            <div className="mt-12 flex flex-wrap justify-center gap-3">
              <Link
                href="/sites/trattoria-sole"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
              >
                Bekijk de Trattoria-case
                <ArrowUpRight className="size-4" />
              </Link>
              <a
                href="mailto:mitchell@nextlevelsites.nl?subject=Proposal + ROI-berekening"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Vraag een proposal aan
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </section>

        {/* FAQ — voor schema.org rich results */}
        <section className="px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/45">
              Veel gestelde vragen
            </p>
            <h2 className="mt-4 font-serif text-3xl font-light tracking-tight md:text-5xl">
              Eerlijke antwoorden
            </h2>

            <div className="mt-12 divide-y divide-white/10">
              {FAQ_SCHEMA.mainEntity.map((faq, i) => (
                <details key={i} className="group py-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                    <h3 className="font-serif text-xl text-white sm:text-2xl">
                      {faq.name}
                    </h3>
                    <span className="grid size-8 shrink-0 place-items-center rounded-full border border-white/15 text-white/65 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-base leading-relaxed text-white/65">
                    {faq.acceptedAnswer.text}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
