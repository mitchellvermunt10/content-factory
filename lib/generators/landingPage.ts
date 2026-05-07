import { runJSON } from "@/lib/ai/runJSON";
import { describeBrief } from "@/lib/ai/briefContext";
import { LandingPageSchema, type LandingPage } from "@/lib/schemas/artifacts/landing";
import type { BusinessBrief } from "@/lib/schemas/brief";

const SCHEMA_HINT = `{
  "hero": { "eyebrow": string<=60, "headline": string 8-120, "subheadline": string 10-220, "primaryCta": string<=28, "secondaryCta": string<=28 },
  "marquee": [string<=28] (4-8),
  "features": [ { "title": string<=60, "description": string<=180, "icon": string<=20 } ] (exactly 3),
  "experience": { "headline": string<=100, "body": string<=420, "bullets": [string<=80] (3-5) },
  "testimonial": { "quote": string 20-280, "author": string<=60, "role": string<=60 },
  "pricing": [ { "name": string<=40, "price": string<=20, "cadence": string<=20, "description": string<=120, "features": [string<=60] (2-5), "highlighted": boolean } ] (exactly 3),
  "faq": [ { "question": string<=120, "answer": string<=320 } ] (4-6),
  "cta": { "headline": string<=100, "body": string<=220, "button": string<=28 }
}`;

export async function generateLandingPage(
  brief: BusinessBrief
): Promise<LandingPage> {
  const user = `${describeBrief(brief)}

OPDRACHT
Schrijf de volledige tekst voor een premium landingspagina voor dit lokale bedrijf.

EISEN
- De toon moet exact passen bij de gekozen tone of voice.
- De hero moet onmiddellijk duidelijk maken wat het bedrijf doet, voor wie, en waarom het anders is.
- "marquee" zijn losse trefwoorden of korte taglines die onder de hero in een doorlopende strip getoond worden (denk: "afspraak op maat", "ervaring sinds 2014").
- "features" zijn drie scherpe redenen om voor dit bedrijf te kiezen, niet generiek.
- "experience" beschrijft het bezoek of de service alsof je het beleeft. Zintuiglijk, concreet.
- "testimonial" is geloofwaardig — gebruik een realistische naam en context, geen sterren of cijfers.
- "pricing" is drie pakketten of opties (de middelste highlighted: true). Als pakketten niet logisch zijn voor dit type bedrijf, gebruik dan drie behandelingen/services met richtprijzen in EUR.
- "faq" beantwoordt de vier tot zes meest urgente vragen van de doelgroep.
- "cta" is de afsluitende roep tot actie — uitnodigend en concreet.

Geef het hele schema, ingevuld in vlekkeloos Nederlands.`;

  return runJSON({
    schema: LandingPageSchema,
    user,
    schemaHint: SCHEMA_HINT,
    maxTokens: 2500,
  });
}
