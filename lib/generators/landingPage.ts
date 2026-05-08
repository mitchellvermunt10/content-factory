import { runJSON } from "@/lib/ai/runJSON";
import { describeBrief } from "@/lib/ai/briefContext";
import { LandingPageSchema, type LandingPage } from "@/lib/schemas/artifacts/landing";
import type { BusinessBrief } from "@/lib/schemas/brief";
import type { ScrapedContent } from "@/lib/schemas/scrapedContent";
import { suggestDesignStyle } from "@/lib/design/themes";

const SCHEMA_HINT = `{
  "designStyle": "editorial-luxe"|"minimal-bold"|"warm-documentary"|"clinical-precise"|"playful-vibrant",
  "primaryCtaTarget": "booking"|"reservation"|"contact"|"offerte"|"menu"|"shop"|"phone",
  "hero": { "eyebrow": string<=60, "headline": string 8-120, "subheadline": string 10-220, "primaryCta": string<=28, "secondaryCta": string<=28 },
  "marquee": [string<=28] (4-8),
  "features": [ { "title": string<=60, "description": string<=180, "icon": string<=20 } ] (exactly 3),
  "verticalSection": {
    "title": string 4-60,
    "intro": string<=180 (optional),
    "items": [ { "name": string<=60, "description": string<=180 (optional), "priceFrom": string<=20 (optional), "duration": string<=30 (optional), "badge": string<=20 (optional) } ] (3-8),
    "bookingProvider": "treatwell"|"salonized"|"phorest"|"thefork"|"opentable"|"resengo"|"garage-eigen-form"|"eigen"|"geen",
    "bookingProviderHint": string<=120 (optional)
  },
  "experience": { "headline": string<=100, "body": string<=420, "bullets": [string<=80] (3-5) },
  "testimonial": { "quote": string 20-280, "author": string<=60, "role": string<=60 },
  "pricing": [ { "name": string<=40, "price": string<=20, "cadence": string<=20, "description": string<=120, "features": [string<=60] (2-5), "highlighted": boolean } ] (exactly 3),
  "faq": [ { "question": string<=120, "answer": string<=320 } ] (4-6),
  "cta": { "headline": string<=100, "body": string<=220, "button": string<=28 }
}`;

const VERTICAL_GUIDANCE: Record<
  string,
  { sectionTitle: string; itemNoun: string; ctaTarget: string; provider: string }
> = {
  salon: {
    sectionTitle: "Onze behandelingen",
    itemNoun: "behandelingen (balayage, kleurcorrectie, knip- en stylingadvies, etc.) met richtprijs en duur",
    ctaTarget: "booking",
    provider: "treatwell of salonized als provider; 'eigen' als ze hun eigen agenda gebruiken",
  },
  restaurant: {
    sectionTitle: "Van het menu",
    itemNoun: "signature gerechten met korte zintuiglijke beschrijving en prijs",
    ctaTarget: "reservation",
    provider: "thefork of resengo; 'eigen' als ze hun eigen reserveringssysteem hebben",
  },
  dentist: {
    sectionTitle: "Behandelingen",
    itemNoun: "tandheelkundige behandelingen (algemene zorg, esthetisch, implantologie) — geen prijzen verzinnen",
    ctaTarget: "booking",
    provider: "eigen — tandartsen werken meestal met eigen agenda",
  },
  gym: {
    sectionTitle: "Trainingsvormen",
    itemNoun: "trainingsvormen (PT, group, kracht) met prijs per sessie of lidmaatschap",
    ctaTarget: "booking",
    provider: "eigen — gyms hebben meestal eigen lidmaatschap-systeem",
  },
  tattoo: {
    sectionTitle: "Mijn werk",
    itemNoun: "tattoo-stijlen (fineline, neo-traditional, blackwork) met richtprijs of 'op maat'",
    ctaTarget: "contact",
    provider: "eigen — tattoo-shops werken via WhatsApp/email-consult",
  },
  barber: {
    sectionTitle: "Onze diensten",
    itemNoun: "knipbeurt, baardverzorging, scheermes-shave met prijzen en duur",
    ctaTarget: "booking",
    provider: "treatwell of eigen — barbers gebruiken vaak eigen booking",
  },
  hotel: {
    sectionTitle: "Onze kamers",
    itemNoun: "kamertypes met prijs per nacht en korte sfeerbeschrijving",
    ctaTarget: "booking",
    provider: "eigen — hotels hebben eigen booking-engine, geen Booking.com only",
  },
  coffeeshop: {
    sectionTitle: "Wat we serveren",
    itemNoun: "signature drinks/dishes met prijs (specialty koffie, sourdough, lunch)",
    ctaTarget: "menu",
    provider: "geen — geen booking nodig, eerder een ophaal-link",
  },
  autobedrijf: {
    sectionTitle: "Onze diensten",
    itemNoun: "diensten (APK, onderhoud, reparatie, halen-brengen, occasions) — vaste prijs of 'vanaf €X'",
    ctaTarget: "offerte",
    provider: "garage-eigen-form — meestal contact-form voor offerte-aanvraag",
  },
};

export async function generateLandingPage(
  brief: BusinessBrief,
  scraped?: ScrapedContent | null
): Promise<LandingPage> {
  const guidance = VERTICAL_GUIDANCE[brief.businessType] ?? VERTICAL_GUIDANCE.salon;
  const suggestedStyle = suggestDesignStyle(brief.tone, brief.businessType);

  const user = `${describeBrief(brief, { scrapedContent: scraped })}

OPDRACHT
Schrijf de volledige tekst + structuur voor een premium landingspagina voor dit lokale bedrijf.
DIT MOET VOELEN ALS EEN UNIEKE WEBSITE VOOR DIT SPECIFIEKE BEDRIJF — niet als een template.

DESIGN-STIJL
designStyle: SUGGESTIE = "${suggestedStyle}". Dit bepaalt typografie, layout en decoratie-elementen.
- editorial-luxe: tijdschrift-stijl voor luxueuze merken (serif fonts, marmer-look)
- minimal-bold: strak, oversized typografie voor moderne merken (sans-serif, monochroom)
- warm-documentary: honingtonen, intieme close-ups voor familiebedrijven en horeca (mixed serif/sans)
- clinical-precise: helder en hygienisch voor zorg en zakelijk (sans-serif, koel)
- playful-vibrant: bold colors, ronde vormen voor lifestyle (sans-serif, vibrant)

Pas designStyle aan als een ander thema beter past dan de suggestie. Als je twijfelt: hou de suggestie aan.

CTA-TARGETING (kritisch belangrijk)
primaryCtaTarget: voor ${brief.businessType} = "${guidance.ctaTarget}"
- "booking" voor afspraak (salons, kappers, tandartsen, gyms, hotels)
- "reservation" voor restaurant-tafel
- "offerte" voor garage/dienstverlener-offerte-flow
- "contact" voor maatwerk-leads (tattoo, consultancy)
- "menu" voor cafe/coffeehouse
- "shop" voor e-commerce
- "phone" voor direct-call situaties

De primaryCta-tekst moet bij dit doel passen ('Plan afspraak' bij booking, 'Reserveer tafel' bij reservation, 'Vraag offerte aan' bij offerte).

VERTICAL SECTION (KRITISCH — dit maakt de pagina branche-specifiek)
verticalSection.title: "${guidance.sectionTitle}" (of pas aan voor dit specifieke bedrijf)
verticalSection.items: 4-8 ${guidance.itemNoun}
verticalSection.bookingProvider: ${guidance.provider}

REGELS VOOR ITEMS:
- name: specifiek (bijv. "Balayage long" niet "haar kleuren")
- description: 1 zintuiglijke zin, geen marketingtaal
- priceFrom: REALISTISCHE NL-prijzen voor deze branche, gebruik richtprijzen niet verzinnen-uit-de-lucht
  · Salon balayage: €120-€220
  · Salon knipbeurt vrouw: €45-€85
  · Restaurant hoofdgerecht: €18-€32
  · Dentist: GEEN prijs (verzekering)
  · Garage APK: €55-€75 / Grote beurt: €295-€450
- duration: alleen voor tijd-gebonden services (salon, gym, dentist)
- badge: gebruik spaarzaam, alleen 1-2 items "Populair" of "Nieuw"

EISEN VOOR DE REST
- De toon moet exact passen bij de gekozen tone of voice.
- De hero moet onmiddellijk duidelijk maken wat het bedrijf doet, voor wie, en waarom het anders is.
- "marquee": losse trefwoorden of korte taglines voor doorlopende strip onder hero.
- "features": drie scherpe redenen om voor dit bedrijf te kiezen, NIET generiek.
- "experience": beschrijft het bezoek/de service zintuiglijk en concreet.
- "testimonial": geloofwaardig met realistische naam en context.
- "pricing": drie pakketten/opties (middelste highlighted: true) — als logisch voor dit bedrijf, anders 3 service-tiers.
- "faq": vier-zes meest urgente vragen van de doelgroep.
- "cta": uitnodigend en concreet.

Geef het hele schema, ingevuld in vlekkeloos Nederlands.`;

  return runJSON({
    schema: LandingPageSchema,
    user,
    schemaHint: SCHEMA_HINT,
    maxTokens: 5000,
    model: "claude-haiku-4-5-20251001",
  });
}
