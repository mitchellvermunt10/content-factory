import type { VerticalPack } from "./types";

// Salon vertical pack — diepe branche-context die in elke generator-prompt
// wordt geïnjecteerd voor businessType="salon". Doel: schrijfsel dat klinkt
// alsof het van iemand uit het vak komt, niet van generieke AI.

export const SALON_PACK: VerticalPack = {
  id: "salon",
  label: "Beautysalon / Kapsalon",

  // Wat klanten zeggen — hun bewoordingen, twijfels, wensen.
  customerLanguage: [
    "Ik wil iets anders maar geen totale make-over",
    "Het mag wel iets warmer / koeler",
    "Mijn uitgroei begint te storen",
    "Ik zie te weinig contrast",
    "Ik ben bang dat het te blond wordt",
    "Mijn haar is droog door blonderen",
    "Ik wil low-maintenance — niet elke 6 weken terug",
    "Ik krijg het thuis nooit zo gestyled",
    "Mag het natuurlijk eruit zien, geen 'salon-look'",
    "Ik ben mijn rode tonen zat",
    "Ik wil een kleur waar ik over een half jaar nog blij mee ben",
  ],

  // Behandelingen + de bijbehorende NL-termen die je uitsluitend in dit vak hoort.
  treatments: [
    "balayage", "ombré", "babylights", "foliage", "money piece", "face framing",
    "kleurcorrectie", "tinten / toner", "gloss", "lowlights", "ash blonde",
    "expensive brunette", "butter blonde", "dimensional brunette",
    "Olaplex N°3 verzorging", "Kerasilk smoothing", "haarstructuur-analyse",
    "knip- en stylingadvies", "rebonding", "keratine-behandeling",
    "scalp treatment", "intake-gesprek", "patch test (verplicht bij eerste kleurbehandeling)",
  ],

  // Vakwerk en producten waar het salon uitleent — vermeld waar relevant.
  brandReferences: [
    "L'Oréal Professionnel",
    "Kérastase",
    "Davines (duurzaam, Italiaans)",
    "Wella Koleston Perfect",
    "Schwarzkopf Igora",
    "Olaplex (bond builder)",
    "Redken Acidic Bonding",
    "Oribe (premium care)",
    "ghd platen",
    "Dyson Airwrap / Supersonic",
    "Mason Pearson borstel",
  ],

  // Wat NIET te zeggen — uitgesleten clichés die elke salon gebruikt.
  avoidPhrases: [
    "transformatie", "stralend resultaat", "schitterend nieuw",
    "haar dat danst", "je verdient het", "verwen jezelf",
    "your hair, your story", "natural beauty", "wij zijn er voor jou",
    "het beste van het beste", "premium ervaring",
    "we werken met de beste producten", // klinkt zwak — noem het merk in plaats daarvan
    "professionaliteit is onze passie",
  ],

  // Specifieke, zintuiglijke alternatieven — wat WEL te zeggen.
  preferredPhrases: [
    "Een tint dieper, geen drama, wel verschil",
    "We knippen tot je hoofd zich lichter voelt",
    "Geen trends, wel timing",
    "Eén afspraak per dag minder — dus alle aandacht voor één hoofd",
    "Je gaat weg met haar dat je zelf opnieuw kunt stylen",
    "Geen verrassing op de factuur — bedrag bepalen we voor we beginnen",
    "Je kleur groeit netjes uit, geen lijn na 6 weken",
  ],

  // Regelgeving / verplichtingen — verwerk waar relevant.
  regulatory: [
    "Patch test verplicht 48u voor eerste kleurbehandeling (EU cosmetica)",
    "Allergenen-info bij intake noteren — hennapatch test bij PPD-allergie",
    "Bij minderjarigen: schriftelijke toestemming ouder/voogd voor kleurbehandeling",
    "Hygiëne-protocol zichtbaar communiceren is positioneringskans, niet alleen verplichting",
  ],

  // Fotografie & video direction die er voor salons toe doet.
  photoDirection: [
    "Front + back + side — full reveal, geen alleen 'mooie hoek'",
    "Daglicht uit grote ramen, kleurtemperatuur 5000K — geen warm wit fluorescent",
    "Witbalans handmatig — anders trekken neutrale kleuren naar geel",
    "Voor balayage: laat ALWAYS de uitgroei zien, niet wegcompositie",
    "Hands-shot van handen die haar styleren — geen face shots zonder context",
    "Macro van de structuur (50mm + crop) toont conditie beter dan een wide shot",
    "Voorkom witte muren als achtergrond — gebruik steen, hout, gordijn",
  ],

  // Boekings- en service-cultuur in NL.
  bookingCulture: [
    "WhatsApp boeken gewonnen — telefonisch oudere klanten en first-timers",
    "Treatwell als kanaal werkt voor first-fill, eigen agenda voor retentie",
    "Reminder 24u tevoren via SMS verlaagt no-shows tot 6%",
    "Bij first-time client: intake telefoongesprek 5 min voor afspraak",
    "Annuleringsbeleid: 24u — maak het mens-vriendelijk geschreven, niet juridisch",
  ],

  // Veelgemaakte fouten van klanten + jouw oplossing — pijnpunten.
  painPoints: [
    "3 weken wachten op een afspraak — bij ons binnen 7 dagen",
    "Salon leest brief niet — intake-protocol vermijdt teleurstelling",
    "80 euro meer dan afgesproken — vaste prijsafspraak vooraf",
    "Stylist wisselt elke keer — bij ons vaste handen per klant",
    "Producten thuis werken niet zo goed als in het salon — uitleg na elke knipbeurt",
    "Geen idee wat de kleur in de zon doet — lokken-test bij twijfel",
  ],

  // Trends die op dit moment relevant zijn (refresh elke ~6 maanden).
  currentTrends: [
    "Expensive brunette (subtiele dimensie zonder full balayage)",
    "Mocha mousse als signature kleur 2026",
    "Bardot bangs / curtain bangs blijven door",
    "Glassy hair (zware gloss-finish)",
    "Octopus cut — gelaagd maar lengte-behoudend",
    "Lived-in colour — minder onderhoud",
    "Scalp health als onderdeel van behandeling",
  ],

  // Tone-modifiers specifiek voor salon — voeg toe aan algemene tone.
  toneModifiers: [
    "Vermijd 'damesachtige' marketing — klanten zijn 35-55, professioneel, slim",
    "Gebruik tijd-respect-taal: 'we beginnen op de afgesproken tijd'",
    "Geen kortingen-taal — werk met meerwaarde (gloss inbegrepen, espresso bij intake)",
    "Beschrijf gevoel + resultaat, niet alleen techniek",
  ],
};
