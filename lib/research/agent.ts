import { getAnthropic } from "@/lib/ai/client";
import {
  ResearchResultSchema,
  type ResearchInput,
  type ResearchResult,
} from "@/lib/schemas/prospect";

const VERTICAL_LABEL: Record<string, string> = {
  salon: "kapsalon",
  restaurant: "restaurant",
  dentist: "tandartsenpraktijk",
  gym: "sportschool",
  tattoo: "tattoo-shop",
  barber: "barbershop",
  hotel: "hotel/B&B",
  coffeeshop: "café/coffeehouse",
  autobedrijf: "autobedrijf/garage",
};

const SERVICE_TIER_GUIDANCE: Record<string, string> = {
  single:
    "Eenmalig €750 — fit-prio gaat naar bedrijven die willen testen voor ze committen, kleinere zaken, of bedrijven met sporadisch content-budget.",
  "always-on":
    "Always-On €497/mnd — fit-prio gaat naar premium bedrijven met groei-mindset, eigen domein, actieve sociale aanwezigheid die nu te weinig output halen.",
  both: "Beide tiers — selecteer breed maar prioriteer bedrijven die op €497/mnd passen want dat is hogere LTV.",
};

const VERTICAL_FIT_CRITERIA: Record<string, string> = {
  salon: `IDEALE SALON-KLANT (in volgorde van belang):
1. Eigen domein (geen Treatwell-only) — 30% gewicht
2. Instagram-volgers 500-5000, postfrequentie <2× per week (te weinig — daar help jij) — 25%
3. Premium-positionering: prijslijst niet zichtbaar of starting-from €60+, focus op service — 20%
4. Eigenaar zichtbaar in profile (foto, Over-ons-pagina, LinkedIn) — 15%
5. Verwijzingen naar professionele producten (Davines, Olaplex, L'Oréal Professionnel, Kérastase) — 10%

RED FLAGS (sluit uit):
- Salonketen >5 vestigingen (centrale marketing)
- Goedkoop-positionering (knip €17,50 of "altijd €19,95")
- Geen eigen website — alleen Treatwell of Facebook-pagina
- Postfrequentie 5+/dag (al super-actief, kan hulp niet gebruiken)`,

  restaurant: `IDEALE RESTAURANT-KLANT:
1. Wisselend menu of seizoensgebonden — eigenaar/chef ziet content-belang — 30%
2. Reviews 4.5+ Google met inhoudelijke comments — 25%
3. Eigen reservatie-systeem (geen TheFork-only) — 20%
4. Wijn op de kaart met verhaal of bijzondere keuken-stijl — 15%
5. Eigenaar staat in keuken/front, herkenbaar — 10%

RED FLAGS:
- Ketens (Vapiano, La Place, McDonald's)
- Lunchroom met simpele kaart, geen verhaal
- TheFork-only zonder eigen domein`,

  autobedrijf: `IDEALE AUTOBEDRIJF-KLANT:
1. Specialisatie (BMW/VW/Audi groep, klassiekers, EV) — 30%
2. Eigen website met blog of nieuws-sectie — 25%
3. Halen-brengen-service of vervangauto vermeldt — 20%
4. Reviews >50 met inhoudelijke comments — 15%
5. Familiebedrijf-positionering — 10%

RED FLAGS:
- Universele garage die op prijs concurreert
- Tweedehands-only zonder werkplaats
- Franchises (Bovag-keten met centrale marketing)`,

  dentist: `IDEALE TANDARTS:
1. Esthetische focus (kroon/facing/whitening) — 30%
2. Eigen domein + moderne UX — 25%
3. Eigenaar/specialist zichtbaar — 20%
4. Patient-stories of voor-na-galerij — 15%
5. Niet alleen verzekerings-flow, ook particulier — 10%

RED FLAGS: keten (Dental Clinics), 100% verzekerings-mutualiteit.`,

  gym: `IDEALE GYM/SPORTSCHOOL:
1. Specialisatie (CrossFit, kleinschalig PT, vrouwen-only) — 30%
2. Lid-verhalen op site — 25%
3. Trainer-personalities zichtbaar — 20%
4. Premium-positionering (€80+/mnd) — 15%
5. Eigenaar/coach actief op socials — 10%

RED FLAGS: budget-keten (Basic Fit), 24/7-toegang-anonieme variant.`,

  barber: `IDEALE BARBERSHOP:
1. Sterke brand-identiteit (interieur, logo, vibes) — 30%
2. Eigen domein + booking-flow — 25%
3. Premium-prijs (€35+ knipbeurt) — 20%
4. Eigenaar/master-barber profile — 15%
5. Aanvullende dienst (baardverzorging, scheermes-shave) — 10%

RED FLAGS: turkse-stijl prijsvechter, geen brand.`,

  tattoo: `IDEALE TATTOO-SHOP:
1. Artist-led — herkenbare stijl van eigenaar — 30%
2. Portfolio op eigen domein — 25%
3. Specialisatie (fineline, neo-traditional, Japans) — 20%
4. Eigenaar communiceert eigen werk op IG — 15%
5. Niet walk-in-only, afspraak-first — 10%

RED FLAGS: walk-in-keten, no-name-flash-tattoos.`,

  hotel: `IDEALE HOTEL/B&B:
1. Boutique (<25 kamers), geen keten — 30%
2. Eigen verhaal/locatie — 25%
3. Premium positionering (€140+/nacht) — 20%
4. Eigen booking-tool (geen Booking.com-only) — 15%
5. Eigenaar/host zichtbaar — 10%

RED FLAGS: ketens, hostel, alleen Booking-listings.`,

  coffeeshop: `IDEALE CAFÉ/COFFEEHOUSE:
1. Specialty coffee (eigen branding, third-wave) — 30%
2. Eigen sourdough/bakery component — 25%
3. Eigen domein + ophaalbestelling — 20%
4. Sterke brand-identity — 15%
5. Owner-barista zichtbaar — 10%

RED FLAGS: keten (Starbucks, Coffee Company), traditioneel "bruin café".`,
};

export interface ResearchAgentResult {
  result: ResearchResult;
  costCents: number;
  durationMs: number;
  searchedQueries: string[];
}

/**
 * Sonnet voegt soms beschrijvingen toe waar enum-waarden verwacht zijn
 * ("Premium men-only barbershop" ipv "barber"). Plus optionele velden komen
 * terug als null. Deze functie coerceert beide naar wat Zod accepteert.
 */
const VERTICAL_KEYWORDS: Array<{
  keywords: RegExp;
  enum: string;
}> = [
  { keywords: /barbershop|barber|herenkapper/i, enum: "barber" },
  { keywords: /tandarts|dentist|tand/i, enum: "dentist" },
  { keywords: /restaurant|bistro|brasserie|eetcafé/i, enum: "restaurant" },
  { keywords: /gym|sportschool|fitness|crossfit/i, enum: "gym" },
  { keywords: /tattoo|tatoe/i, enum: "tattoo" },
  { keywords: /hotel|b&b|pension|bed.{1,3}breakfast/i, enum: "hotel" },
  { keywords: /coffee|café|koffie|caf[ée]/i, enum: "coffeeshop" },
  { keywords: /auto|garage|monteur|werkplaats/i, enum: "autobedrijf" },
  { keywords: /salon|kapsalon|hair|kapper|beauty/i, enum: "salon" },
];

const VALID_VERTICALS = new Set([
  "salon",
  "restaurant",
  "dentist",
  "gym",
  "tattoo",
  "barber",
  "hotel",
  "coffeeshop",
  "autobedrijf",
]);

const VALID_TONES = new Set([
  "luxueus",
  "speels",
  "klinisch",
  "stoer",
  "warm",
  "minimal",
]);

function coerceVertical(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  if (VALID_VERTICALS.has(value)) return value;
  // Sonnet typt vaak een omschrijving — match keywords
  for (const { keywords, enum: e } of VERTICAL_KEYWORDS) {
    if (keywords.test(value)) return e;
  }
  return fallback;
}

function coerceTone(value: unknown): string {
  if (typeof value !== "string") return "warm";
  if (VALID_TONES.has(value)) return value;
  // Map veelvoorkomende vertalingen
  const map: Record<string, string> = {
    luxurious: "luxueus",
    luxury: "luxueus",
    playful: "speels",
    clinical: "klinisch",
    bold: "stoer",
    rugged: "stoer",
    warm: "warm",
    cozy: "warm",
    minimalist: "minimal",
    minimal: "minimal",
  };
  return map[value.toLowerCase()] ?? "warm";
}

function coerceOptionalString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value !== "string") return "";
  return value;
}

function coerceHexColors(value: unknown): string[] {
  if (!Array.isArray(value)) return ["#1a1a1a", "#f5f5f5", "#888888"];
  const cleaned = value
    .map((c) => (typeof c === "string" ? c.trim() : ""))
    .filter((c) => /^#[0-9a-fA-F]{6}$/.test(c));
  if (cleaned.length === 0) return ["#1a1a1a", "#f5f5f5", "#888888"];
  return cleaned.slice(0, 3);
}

function normalizeAgentOutput(
  raw: Record<string, unknown>,
  inputVertical: string
): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prospects = Array.isArray((raw as any).prospects)
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (raw as any).prospects.map((p: any) => {
        const brief = p?.suggestedBrief ?? {};
        return {
          ...p,
          ownerName: coerceOptionalString(p?.ownerName) || null,
          ownerEmail: coerceOptionalString(p?.ownerEmail) || null,
          websiteUrl: coerceOptionalString(p?.websiteUrl) || null,
          instagramHandle: coerceOptionalString(p?.instagramHandle) || null,
          phoneNumber: coerceOptionalString(p?.phoneNumber) || null,
          suggestedBrief: {
            ...brief,
            businessType: coerceVertical(brief.businessType, inputVertical),
            tone: coerceTone(brief.tone),
            website: coerceOptionalString(brief.website),
            phone: coerceOptionalString(brief.phone),
            offer: coerceOptionalString(brief.offer),
            brandColors: coerceHexColors(brief.brandColors),
            // Zorg dat usps array is en filter lege strings
            usps: Array.isArray(brief.usps)
              ? brief.usps
                  .filter((u: unknown) => typeof u === "string" && u.trim().length >= 3)
                  .slice(0, 6)
              : [],
            // Audience moet min 20 chars zijn — pad met algemene tekst als korter
            audience:
              typeof brief.audience === "string" && brief.audience.length >= 20
                ? brief.audience
                : `Doelgroep: lokale klanten in ${brief.city ?? "de regio"} die kwaliteit en persoonlijke service waarderen.`,
          },
        };
      })
    : [];

  // Truncate summary als 'ie te lang is — Sonnet schrijft soms 1000+ chars
  const rawSummary = typeof raw.summary === "string" ? raw.summary : "";
  const summary =
    rawSummary.length > 800
      ? rawSummary.slice(0, 795).trimEnd() + "..."
      : rawSummary;

  return {
    ...raw,
    prospects,
    summary,
  };
}

/**
 * Sonnet 4.6 agent met web_search tool. Loopt 5-10 zoekopdrachten + tool-calls
 * door totdat 'ie de submit_prospects tool aanroept met top-10. Geen externe
 * API-keys nodig — Anthropic web_search is built-in.
 */
export async function runProspectResearch(
  input: ResearchInput
): Promise<ResearchAgentResult> {
  const start = Date.now();
  const client = getAnthropic();

  const verticalLabel = VERTICAL_LABEL[input.vertical] ?? input.vertical;
  const tierGuidance = SERVICE_TIER_GUIDANCE[input.serviceTier];
  const fitCriteria =
    VERTICAL_FIT_CRITERIA[input.vertical] ??
    `Standaard MKB fit-criteria: eigen domein, actieve sociale aanwezigheid, premium-positionering, owner zichtbaar.`;

  const systemPrompt = `Je bent een sales-intelligence agent voor een Nederlands creatief bureau (Next Level Sites, gevestigd in Vught). Je vindt voor opdrachtgever Mitchell de 10 BESTE klanten in een gegeven stad voor zijn AI-content-platform.

HET AANBOD VAN HET BUREAU:
- Eenmalige campagne €750: complete brand-uitwerking (landingspagina, ads, Instagram-content, cinematic concept) in 7 minuten
- Always-On abonnement €497/mnd: 4 campagne-refreshes per maand, prioriteit-support, pause-anytime
- Optionele upsell: AI-receptionist €299/mnd

POSITIONERING DEZE RUN:
${tierGuidance}

JE OPDRACHT:
1. Zoek het web naar échte bestaande ${verticalLabel}-bedrijven in de opgegeven stad (en omliggende 10 km)
2. Verzamel per kandidaat: bedrijfsnaam, website-URL, eigenaar (uit Over-ons / LinkedIn / IG), Instagram-handle, services, prijspositionering
3. Scoor ELKE kandidaat tegen onderstaande fit-criteria:

${fitCriteria}

4. Selecteer de TOP-10 met hoogste fit-scores (5-10 als minder dan 10 sterke kandidaten beschikbaar)
5. Voor elke top-10:
   - 3-5 redenen WAAROM ze passen (specifiek, niet generiek)
   - Positieve signalen + red flags
   - Pre-gevulde BusinessBrief: businessType, name, city, usps (3-5 USPs uit hun website), audience (3-5 zinnen), tone (luxueus/speels/klinisch/stoer/warm/minimal — kies passend), offer (pak een lokale aanbieding voor hen), brandColors (3 hex-codes uit hun branding op website)
   - Cold-outreach email-draft (NL, persoonlijk, max 150 woorden)

EISEN AAN BRIEF (STRIKT):
- businessType = EXACT één van: "salon" | "restaurant" | "dentist" | "gym" | "tattoo" | "barber" | "hotel" | "coffeeshop" | "autobedrijf". GEEN omschrijving zoals "Premium barbershop" — alleen het kort enum-woord.
- name = exacte bedrijfsnaam (zonder "Premium" prefix oid)
- city = stadsnaam alleen
- tone = EXACT één van: "luxueus" | "speels" | "klinisch" | "stoer" | "warm" | "minimal". Geen Engelse equivalenten, geen omschrijvingen.
- usps = 3-5 specifiek aan dit bedrijf, NIET generiek
- audience = wie zijn hun klanten — schrijf 3-5 zinnen, MIN 20 karakters
- offer = realistische lokaal-passende aanbieding (mag leeg zijn als geen logisch aanbod)
- brandColors = ARRAY van 3 hex-codes ALLEEN in format #XXXXXX (bijv. ["#1B1A18", "#E8E4DD", "#B89968"])

EISEN AAN EMAIL — DIT IS HET BELANGRIJKSTE STUK, LEES ZORGVULDIG:

Mitchell stuurt deze email zelf. Hij wil NIET dat het AI-gegenereerd klinkt.
Hij wil dat het klinkt alsof iemand met passie voor zijn vak een specifiek bericht stuurt.

WAT NEXT LEVEL SITES DOET (hou dit kort en helder in elke email):
- Bouwt complete brand-campagnes voor lokale ondernemers
- 1-2 dagen ipv weken (door slim AI-gebruik)
- Levert: landingspagina, advertenties, Instagram-content, mini-commercial-script, voice-over
- €750 eenmalig of €497/mnd voor doorlopend (Always-On: elke maand verse content)
- Gevestigd in Vught — werkt NL-breed

EMAIL-STRUCTUUR (max 130 woorden body):
Zin 1: SPECIFIEKE observatie uit hun website, menu, of Instagram. Iets concreets — een gerecht,
       een styling, een uitspraak van eigenaar. NIET "leuke website" of "ik kwam jullie tegen".
Zin 2: Waarom je mailt. Niet "ik help bedrijven" maar "ik bouw campagnes voor lokale [vertical]
       en bij jullie ontbreekt nog [specifiek iets concreet]"
Zin 3: Wat je doet, kort. "Complete brand-campagne in 1-2 dagen — landingspagina, ads, social,
       mini-commercial — €750 eenmalig of €497/mnd voor doorlopend"
Zin 4: Concrete next step. "Heb je 5 min volgende week? Ik heb voor [naam] alvast iets gemaakt,
       stuur ik je dan." OF "Mag ik 1 specifiek voorbeeld laten zien?"
Slot: "Mitchell" of "Mitchell - Next Level Sites"

VERBODEN ZINNEN/WOORDEN — nooit gebruiken:
- "Hopelijk gaat het goed met je/u"
- "Wij geloven dat..."
- "Wij zijn gepassioneerd over..."
- "Wij passen perfect bij..."
- "Onze unieke aanpak..."
- "Graag zou ik..."
- "Aarzel niet om..."
- "Met vriendelijke groet"
- "Sales", "leads", "conversie", "ROI" als woorden in de email
- "Boost", "schaal", "next level" (te marketing-y)
- Lange begroeting zoals "Beste mevrouw/heer"
- Vragen om een 30-min meeting (te formeel)

VERPLICHTE STIJL-ELEMENTEN:
- Voornaam in aanhef: "Hi [Voornaam]" of "Hey [Voornaam]"
- Korte zinnen, geen volzinnen vol bijzinnen
- Contractions toegestaan ("'t", "ie")
- Mag een mening hebben ("vond ik scherp", "kreeg ik direct trek")
- Tone moet matchen bij prospect — luxueus = ingetogen, stoer = direct, warm = persoonlijk

SUBJECT-LIJN:
Niet "Vraag voor X" of "Samenwerking". Wel iets dat triggert maar niet spammy:
- "[hun specifieke iets] + idee"
- "Iets gemaakt voor [bedrijfsnaam]"
- "[Voornaam], nieuwsgierige vraag"
Maximaal 8 woorden.

WERKWIJZE:
1. Zoek minimaal 3-5 keer met variërende termen ("kapsalons {stad}", "premium beautysalon {stad}", "{stad} balayage specialist")
2. Voor de meest beloftevolle kandidaten: zoek aanvullend hun website + Instagram
3. Verifieer dat ze BESTAAN — geen fictieve bedrijven verzinnen
4. Wanneer je top-10 hebt: roep de tool 'submit_prospects' aan met gestructureerde JSON

Gebruik MAX 10 web-searches. Wees efficiënt.`;

  const userPrompt = `STAD: ${input.city}
BRANCHE: ${verticalLabel}
TIER FOCUS: ${input.serviceTier}
${input.extraCriteria ? `EXTRA CRITERIA: ${input.extraCriteria}` : ""}

Begin met onderzoek. Roep submit_prospects aan zodra je top-10 (of top-5+ als minder beschikbaar) compleet is.`;

  const submitProspectsTool = {
    name: "submit_prospects",
    description:
      "Roep deze tool aan ZODRA je top-10 prospects volledig hebt onderzocht. Output is gestructureerd JSON.",
    input_schema: {
      type: "object" as const,
      properties: {
        prospects: {
          type: "array",
          minItems: 3,
          maxItems: 10,
          items: {
            type: "object",
            properties: {
              rank: { type: "number" },
              fitScore: {
                type: "number",
                description: "0-100 score gebaseerd op fit-criteria",
              },
              name: { type: "string" },
              city: { type: "string" },
              ownerName: { type: ["string", "null"] },
              ownerEmail: { type: ["string", "null"] },
              websiteUrl: { type: ["string", "null"] },
              instagramHandle: { type: ["string", "null"] },
              phoneNumber: { type: ["string", "null"] },
              whyTheyFit: {
                type: "array",
                items: { type: "string" },
                minItems: 2,
                maxItems: 6,
              },
              signals: {
                type: "object",
                properties: {
                  positive: { type: "array", items: { type: "string" } },
                  redFlags: { type: "array", items: { type: "string" } },
                },
                required: ["positive", "redFlags"],
              },
              suggestedBrief: {
                type: "object",
                properties: {
                  businessType: {
                    type: "string",
                    enum: [
                      "salon",
                      "restaurant",
                      "dentist",
                      "gym",
                      "tattoo",
                      "barber",
                      "hotel",
                      "coffeeshop",
                      "autobedrijf",
                    ],
                    description:
                      "EXACT één enum-waarde, GEEN beschrijving",
                  },
                  name: { type: "string" },
                  city: { type: "string" },
                  website: { type: "string" },
                  phone: { type: "string" },
                  usps: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 1,
                    maxItems: 6,
                  },
                  tone: {
                    type: "string",
                    enum: [
                      "luxueus",
                      "speels",
                      "klinisch",
                      "stoer",
                      "warm",
                      "minimal",
                    ],
                  },
                  audience: { type: "string" },
                  offer: { type: "string" },
                  brandColors: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 1,
                    maxItems: 3,
                  },
                },
                required: [
                  "businessType",
                  "name",
                  "city",
                  "usps",
                  "tone",
                  "audience",
                  "brandColors",
                ],
              },
              emailDraft: {
                type: "object",
                properties: {
                  subject: { type: "string" },
                  body: { type: "string" },
                },
                required: ["subject", "body"],
              },
            },
            required: [
              "rank",
              "fitScore",
              "name",
              "city",
              "whyTheyFit",
              "signals",
              "suggestedBrief",
              "emailDraft",
            ],
          },
        },
        summary: {
          type: "string",
          description:
            "Korte managementsamenvatting (40-200 woorden) van de markt en aanbevelingen",
        },
      },
      required: ["prospects", "summary"],
    },
  };

  const webSearchTool = {
    type: "web_search_20250305" as const,
    name: "web_search",
    max_uses: 10,
    user_location: {
      type: "approximate" as const,
      country: "NL",
      city: input.city,
      timezone: "Europe/Amsterdam",
    },
  };

  const messages: Array<{
    role: "user" | "assistant";
    content: unknown;
  }> = [
    {
      role: "user",
      content: userPrompt,
    },
  ];

  const searchedQueries: string[] = [];
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let finalSubmitInput: unknown = null;

  // Tool-loop — Sonnet wisselt tussen web_search calls en eindigt met submit_prospects
  let lastStopReason: string | undefined;

  for (let turn = 0; turn < 12; turn++) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 16000, // Verhoogd: 10 prospects × volledige brief + email = veel JSON
      system: systemPrompt,
      tools: [
        webSearchTool,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        submitProspectsTool as any,
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: messages as any,
    });

    totalInputTokens += response.usage.input_tokens;
    totalOutputTokens += response.usage.output_tokens;
    lastStopReason = response.stop_reason ?? undefined;

    // Check of submit_prospects aangeroepen is — dan zijn we klaar
    const submitBlock = response.content.find(
      (b) =>
        b.type === "tool_use" &&
        "name" in b &&
        b.name === "submit_prospects"
    );
    if (submitBlock && "input" in submitBlock) {
      // Sanity check: input moet prospects bevatten. Als leeg → max_tokens
      // truncatie. Probeer 1 keer expliciet te retryen met kleinere top-10.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const input = submitBlock.input as any;
      if (
        input &&
        typeof input === "object" &&
        Array.isArray(input.prospects) &&
        input.prospects.length > 0
      ) {
        finalSubmitInput = input;
        break;
      }
      // Empty/incomplete tool input — meestal max_tokens-truncatie
      if (lastStopReason === "max_tokens") {
        messages.push({ role: "assistant", content: response.content });
        messages.push({
          role: "user",
          content:
            "De vorige tool-call werd afgekapt. Roep submit_prospects opnieuw aan, maar maak nu max 5 prospects ipv 10. Houd de email-body korter (max 100 woorden). Geen redundante velden.",
        });
        continue;
      }
    }

    // Geen submit — Anthropic heeft web_search server-side al gedaan en
    // returnt server_tool_use blokken. Voeg de hele assistant response toe
    // aan messages en vraag Sonnet om door te gaan.
    messages.push({ role: "assistant", content: response.content });

    // Track searches that were performed (server_tool_use is gegooid in deze
    // SDK-versie als unknown block-type — we casten naar any om bij te houden)
    for (const block of response.content) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const b = block as any;
      if (
        b?.type === "server_tool_use" &&
        b?.name === "web_search" &&
        b?.input?.query
      ) {
        searchedQueries.push(b.input.query as string);
      }
    }

    // Als response geen tool-call had en geen submit, vraag explicieter
    if (response.stop_reason !== "tool_use") {
      messages.push({
        role: "user",
        content:
          "Je bent klaar met onderzoek. Roep nu de submit_prospects tool aan met je top-10 prospects (of minder als je niet genoeg sterke kandidaten vindt — minimum 3).",
      });
    }
  }

  if (!finalSubmitInput) {
    throw new Error(
      `Onderzoek-agent eindigde zonder submit_prospects tool aan te roepen (laatste stop_reason: ${lastStopReason ?? "unknown"}). Mogelijk te weinig kandidaten gevonden — probeer een grotere stad of bredere criteria.`
    );
  }

  // Normaliseer Sonnet's output voor Zod-validatie
  const normalized = normalizeAgentOutput(
    finalSubmitInput as Record<string, unknown>,
    input.vertical
  );

  // Valideer + parse
  const parsed = ResearchResultSchema.safeParse({
    ...normalized,
    searchedQueries,
  });
  if (!parsed.success) {
    const errors = parsed.error.errors.slice(0, 5);
    const summary = errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    throw new Error(
      `Resultaat valideren mislukt (stop_reason: ${lastStopReason ?? "unknown"}): ${summary}. Probeer opnieuw met een grotere stad of andere criteria.`
    );
  }

  // Sonnet 4.6 pricing: $3/MTok in, $15/MTok out (in eurocent → $0.30 per 100k input, $1.50 per 100k output)
  // Plus web_search: $10/1k = $0.01/search
  const inputCostCents = Math.ceil((totalInputTokens / 1_000_000) * 300);
  const outputCostCents = Math.ceil((totalOutputTokens / 1_000_000) * 1500);
  const searchCostCents = Math.ceil(searchedQueries.length * 1);
  const costCents = inputCostCents + outputCostCents + searchCostCents;

  return {
    result: parsed.data,
    costCents,
    durationMs: Date.now() - start,
    searchedQueries,
  };
}
