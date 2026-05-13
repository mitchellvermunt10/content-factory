// Shared site-data loader. Wordt door zowel de hero-page als alle
// subpages gebruikt zodat content centraal vastligt.
// Phase 3+: vervangen door Supabase-lookup op slug.

import { promises as fs } from "node:fs";
import path from "node:path";
import { generateStubFrames } from "./stubFrames";
import { readManifestSafe } from "./frameExtract";
import type { NextLevelSiteData } from "./types";

export type SiteRenderMode = "video" | "cinematic" | "stub";

type DemoSpec = Omit<NextLevelSiteData, "frames"> & {
  frameFolder?: string;
};

const DEMO_SITES: Record<string, DemoSpec> = {
  "trattoria-sole": {
    slug: "trattoria-sole",
    isDemo: true,
    frameFolder: "italian-restaurant",
    business: {
      name: "Trattoria Sole",
      tagline:
        "Een Italiaanse keuken die niet probeert te imponeren. Alleen te smaken.",
      vertical: "Italiaans restaurant",
      schemaType: "Restaurant",
      city: "Utrecht",
      address: {
        street: "Voorstraat 84",
        postalCode: "3512 AS",
        city: "Utrecht",
        region: "Utrecht",
        country: "NL",
        formatted: "Voorstraat 84, 3512 AS Utrecht",
      },
      geo: { lat: 52.0934, lng: 5.1235 },
      cuisine: "Italiaans",
      priceRange: "€€",
      phone: "030 234 56 78",
      reservationUrl: "https://example.com/reserveren",
      whatsapp: "+31681299321",
      whatsappMessage:
        "Hoi! Ik wil graag een tafel reserveren bij Trattoria Sole.",
      sameAs: [
        "https://www.instagram.com/trattoriasole.demo",
        "https://www.facebook.com/trattoriasole.demo",
      ],
      kvk: "98765432",
      btw: "NL001234567B01",
    },
    scenes: [
      { id: "intro", kind: "intro", frameRange: { from: 0, to: 14 }, content: {} },
      {
        id: "arrival",
        kind: "arrival",
        frameRange: { from: 15, to: 29 },
        content: {
          headline:
            "Een trattoria die je voelt zodra je binnenkomt. Houtvuur, stemmen, glaswerk.",
        },
      },
      { id: "menu", kind: "menu", frameRange: { from: 30, to: 44 }, content: {} },
      { id: "ambiance", kind: "ambiance", frameRange: { from: 45, to: 54 }, content: {} },
      { id: "contact", kind: "contact", frameRange: { from: 55, to: 59 }, content: {} },
    ],
    items: [
      {
        name: "Tagliatelle al ragù",
        description: "12 uur gestoofde rundwang, rode wijn, rozemarijn.",
        price: "€19",
      },
      {
        name: "Risotto ai funghi",
        description: "Wilde paddenstoelen, parmigiano, truffel.",
        price: "€21",
      },
      {
        name: "Pollo alla cacciatora",
        description: "Maïskip, tomaat, olijven, kappertjes.",
        price: "€24",
      },
      {
        name: "Branzino al sale",
        description: "Hele zeebaars in zoutkorst, citroen, peterselie.",
        price: "€29",
      },
      {
        name: "Tiramisù della casa",
        description: "Eigen recept, mascarpone, espresso, marsala.",
        price: "€8",
      },
      {
        name: "Affogato",
        description: "Vanille-ijs verdronken in dampende espresso.",
        price: "€7",
      },
    ],
    photos: [
      { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800", alt: "Restaurant interieur" },
      { url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800", alt: "Pasta gerecht" },
      { url: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800", alt: "Wijnglas" },
      { url: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800", alt: "Italiaans gerecht" },
      { url: "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=800", alt: "Restaurant sfeer" },
      { url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800", alt: "Bord met eten" },
    ],
    menuCategories: [
      {
        name: "Antipasti",
        description: "Om te beginnen, voor delen.",
        items: [
          {
            name: "Burrata della casa",
            description: "Romige burrata, gegrilde perziken, basilicumolie, fleur de sel.",
            price: "€14",
            tags: ["vegetarisch"],
          },
          {
            name: "Vitello tonnato",
            description: "Dun gesneden kalfsmuis, tonijn-kappertjessaus, rucola.",
            price: "€16",
          },
          {
            name: "Carpaccio di manzo",
            description: "Tenderloin van Limousin-rund, parmigiano, truffelolie.",
            price: "€17",
          },
          {
            name: "Polipo grigliato",
            description: "Gegrilde octopus, witte bonenpuree, pancetta, salsa verde.",
            price: "€18",
          },
        ],
      },
      {
        name: "Pasta",
        description: "Vers gemaakt, dagelijks.",
        items: [
          {
            name: "Tagliatelle al ragù",
            description: "12 uur gestoofde rundwang, rode wijn, rozemarijn.",
            price: "€19",
          },
          {
            name: "Risotto ai funghi",
            description: "Wilde paddenstoelen, parmigiano, truffel.",
            price: "€21",
            tags: ["vegetarisch"],
          },
          {
            name: "Pappardelle al cinghiale",
            description: "Brede linten, wildzwijn-ragu, jeneverbes, rode wijn.",
            price: "€23",
          },
          {
            name: "Cacio e Pepe",
            description: "Pecorino Romano, zwarte peper. Klassiek.",
            price: "€16",
            tags: ["vegetarisch"],
          },
        ],
      },
      {
        name: "Secondi",
        description: "Hoofdgerechten.",
        items: [
          {
            name: "Pollo alla cacciatora",
            description: "Maïskip, tomaat, olijven, kappertjes.",
            price: "€24",
          },
          {
            name: "Branzino al sale",
            description: "Hele zeebaars in zoutkorst, citroen, peterselie.",
            price: "€29",
          },
          {
            name: "Bistecca alla Fiorentina",
            description: "T-bone van Toscaans rund, rosmarini, citroen. Voor 2.",
            price: "€72",
          },
        ],
      },
      {
        name: "Dolci",
        description: "Voor het laatste sip espresso.",
        items: [
          {
            name: "Tiramisù della casa",
            description: "Eigen recept, mascarpone, espresso, marsala.",
            price: "€8",
            tags: ["specialty"],
          },
          {
            name: "Affogato",
            description: "Vanille-ijs verdronken in dampende espresso.",
            price: "€7",
          },
          {
            name: "Panna cotta",
            description: "Vanille, gemarineerde aardbeien, basilicum.",
            price: "€8",
          },
        ],
      },
    ],
    story: {
      headline: "Een trattoria, geen restaurant.",
      intro:
        "Trattoria Sole is geboren uit een eenvoudig idee: dat het beste eten geen show nodig heeft. Geen tien-gangen-menu, geen schuim, geen pincet. Alleen ingrediënten die ergens vandaan komen, met respect behandeld, en op tafel gezet door iemand die er trots op is.",
      sections: [
        {
          headline: "Waar het begon",
          body: "Onze chef Marco groeide op in Bologna. Zijn moeder en oma deelden één keuken — en één regel: dat eten draait om mensen, niet om techniek. In 2019 opende hij Trattoria Sole aan de Voorstraat met datzelfde principe.",
          image: "/sites/italian-restaurant/post-2-ambiance.jpg",
        },
        {
          headline: "Onze keuken",
          body: "Pasta vers gemaakt, elke ochtend. Vis komt van de visafslag in IJmuiden. Vlees uit Toscane en de Veluwe, alleen van boerderijen die we persoonlijk kennen. Wat wij niet zelf kunnen maken, halen we van mensen die het al generaties lang doen.",
          image: "/sites/italian-restaurant/post-1-food.jpg",
        },
        {
          headline: "De zaal",
          body: "Veertig zitplaatsen, geen meer. We willen je niet kwijtraken in de drukte. Bij ons schenkt de chef zelf bij — soms met een verhaal, soms met een aanbeveling, altijd met aandacht.",
        },
      ],
      chef: {
        name: "Marco Bianchi",
        role: "Chef & eigenaar",
        photo: "/sites/italian-restaurant/interior.jpg",
        quote: "Eten is geen prestatie. Het is een uitnodiging.",
      },
    },
    hours: {
      monday: "Gesloten",
      tuesday: "17:30 – 22:30",
      wednesday: "17:30 – 22:30",
      thursday: "17:30 – 22:30",
      friday: "17:30 – 23:00",
      saturday: "17:00 – 23:00",
      sunday: "16:00 – 22:00",
      note: "Keuken sluit 30 minuten voor sluitingstijd. Last minute reserveren via WhatsApp.",
    },
    sceneLabels: {
      intro: { eyebrow: "Utrecht · Italiaans restaurant" },
      arrival: {
        eyebrow: "Welkom binnen",
        headline:
          "Een trattoria die je voelt zodra je binnenkomt. Houtvuur, stemmen, glaswerk.",
        ctaLabel: "Reserveer een tafel",
      },
      menu: { eyebrow: "De kaart", headline: "Wat we serveren" },
      ambiance: { eyebrow: "Sfeer", headline: "Zoals het écht voelt" },
      contact: {
        eyebrow: "Tot snel",
        headline: "Kom langs",
        ctaLabel: "Reserveer nu",
      },
    },
    email: "ciao@trattoriasole.nl",
    parkingInfo:
      "Gratis straat-parkeren na 18:00 in de wijk. Betaald: P-Springweg op 4 min loopafstand.",
    socialProof: {
      google: {
        rating: 4.8,
        count: 312,
        url: "https://maps.google.com/?cid=trattoria-sole-utrecht",
      },
      awards: [
        { name: "Lekker500", year: 2026, rank: "#84" },
        { name: "Iens beste van Utrecht", year: 2025 },
      ],
      press: [
        {
          name: "Volkskrant Magazine",
          quote: "Een trattoria zoals trattoria's bedoeld waren.",
        },
        {
          name: "Misset Horeca",
          quote: "Eerlijk Italiaans op een plek waar de chef je nog zelf bedient.",
        },
      ],
      testimonials: [
        {
          quote:
            "We kwamen voor pasta, we bleven voor de chef. Drie uur later wilden we eigenlijk niet meer naar huis.",
          author: "Renée",
          source: "Google review",
          date: "maart 2026",
        },
        {
          quote:
            "De tagliatelle al ragù is de beste die ik buiten Bologna heb gegeten. Geen overdrijving.",
          author: "Tomas",
          source: "Iens",
          date: "januari 2026",
        },
        {
          quote:
            "Geen poespas. Gewoon goed eten, een mooie wijn en iemand die er trots op is. Wat je hoopt te vinden.",
          author: "Lisa",
          source: "Google review",
          date: "december 2025",
        },
      ],
    },
  },

  // ──────────────────────────────────────────────────────────────
  // KAPSALON MOOIGEKNIPT — eerste echte klant, intake-fase
  // Placeholder-content. Vervangen zodra klant assets levert.
  // isDemo=true tot launch, dan op false en geo-pages aanzetten.
  // ──────────────────────────────────────────────────────────────
  "kapsalon-mooigeknipt": {
    slug: "kapsalon-mooigeknipt",
    isDemo: true, // TODO: op false zetten bij launch
    business: {
      name: "Kapsalon MooiGeknipt",
      tagline:
        "[PLACEHOLDER tagline — vervangen na intake. Eén zin over wat de salon onderscheidt.]",
      vertical: "Kapsalon",
      schemaType: "BeautySalon",
      city: "[STAD]",
      phone: "[TELEFOON]",
      whatsapp: "[+31...]",
      whatsappMessage: "Hoi! Ik wil graag een afspraak bij MooiGeknipt.",
      reservationUrl: "[TREATWELL OF EIGEN BOEKING-URL]",
    },
    scenes: [
      { id: "intro", kind: "intro", frameRange: { from: 0, to: 14 }, content: {} },
      { id: "arrival", kind: "arrival", frameRange: { from: 15, to: 29 }, content: {} },
      { id: "menu", kind: "menu", frameRange: { from: 30, to: 44 }, content: {} },
      { id: "ambiance", kind: "ambiance", frameRange: { from: 45, to: 54 }, content: {} },
      { id: "contact", kind: "contact", frameRange: { from: 55, to: 59 }, content: {} },
    ],
    sceneLabels: {
      intro: { eyebrow: "[STAD] · Kapsalon" },
      arrival: {
        eyebrow: "Welkom in onze stoel",
        headline:
          "[PLACEHOLDER — bv. 'Een uurtje voor jezelf, in handen die weten wat ze doen.']",
        ctaLabel: "Boek een afspraak",
      },
      menu: { eyebrow: "Onze diensten", headline: "Wat we doen" },
      ambiance: { eyebrow: "Het werk", headline: "Recente knipbeurten" },
      contact: {
        eyebrow: "Kom langs",
        headline: "Plan je afspraak",
        ctaLabel: "Boek nu",
      },
    },
  },

  // ──────────────────────────────────────────────────────────────
  // JJ-3D — tweede echte klant, intake-fase
  // 3D-printing business. Nog geen domein. Placeholder-content.
  // ──────────────────────────────────────────────────────────────
  "jj-3d": {
    slug: "jj-3d",
    isDemo: true, // TODO: op false zetten bij launch
    frameFolder: "jj-3d",
    business: {
      name: "JJ-3D",
      tagline:
        "Hebbedingen die je nergens anders vindt. Geprint op bestelling, in een week op je bureau.",
      vertical: "3D-printservice",
      schemaType: "LocalBusiness",
      city: "[STAD]",
      phone: "[TELEFOON]",
      whatsapp: "[+31...]",
      whatsappMessage: "Hoi! Ik heb een vraag over een 3D-print-opdracht.",
      // Geen reservationUrl — wel een 'offerte aanvragen'-formulier later
    },
    shop: {
      mode: "test", // Voor launch op 'live' zetten
      shippingEur: 4.95,
      deliveryNote: "Geprint op bestelling — 3-7 werkdagen levertijd.",
      products: [
        {
          id: "2391957",
          title: "The North Face Down Jacket — Pen Holder",
          description:
            "Geïnspireerd op de iconische puffer-jas. Houdt 3-5 pennen netjes op je bureau.",
          priceEur: 12.5,
          image: "/sites/jj-3d/products/2391957/primary.png",
          printTimeMinutes: 120,
          tags: ["bureau", "hebbedingetje"],
          sourceUrl:
            "https://makerworld.com/nl/models/2391957-the-north-face-down-jacket-pen-holder",
        },
        {
          id: "2387676",
          title: "North Face Beanie — Desk Organiser",
          description:
            "Beanie-vorm voor je bureau-prullaria. Past potloden, paperclips, post-its.",
          priceEur: 14.0,
          image: "/sites/jj-3d/products/2387676/primary.jpg",
          printTimeMinutes: 360,
          tags: ["bureau", "hebbedingetje", "organiseren"],
          sourceUrl:
            "https://makerworld.com/nl/models/2387676-north-face-beanie-desk-organiser",
        },
        {
          id: "1641939",
          title: "VinoGrace Voronoi Wine Holder",
          description:
            "Sculpturele wijnflessen-houder. Voronoi-patroon, ziet eruit als kunst, draagt je fles.",
          priceEur: 18.0,
          image: "/sites/jj-3d/products/1641939/primary.png",
          printTimeMinutes: 420,
          tags: ["wijn", "decoratief"],
          sourceUrl:
            "https://makerworld.com/nl/models/1641939-vinograce-voronoi-wine-holder",
        },
      ],
    },
    scenes: [
      { id: "intro", kind: "intro", frameRange: { from: 0, to: 14 }, content: {} },
      { id: "arrival", kind: "arrival", frameRange: { from: 15, to: 29 }, content: {} },
      { id: "menu", kind: "menu", frameRange: { from: 30, to: 44 }, content: {} },
      { id: "ambiance", kind: "ambiance", frameRange: { from: 45, to: 54 }, content: {} },
      { id: "contact", kind: "contact", frameRange: { from: 55, to: 59 }, content: {} },
    ],
    sceneLabels: {
      intro: { eyebrow: "Geprint in Nederland · op bestelling" },
      arrival: {
        eyebrow: "De werkplaats",
        headline:
          "Een Bambu Lab P2S die nooit echt stilstaat. Elke print één voor één gemaakt, in de kleur die jij kiest.",
        ctaLabel: "Bekijk de collectie",
      },
      menu: {
        eyebrow: "De collectie",
        headline: "Hebbedingen voor je bureau, je glas, je dag",
      },
      ambiance: { eyebrow: "Aan het werk", headline: "Laag voor laag" },
      contact: {
        eyebrow: "Vraag of opdracht?",
        headline: "Stuur ons je idee",
        ctaLabel: "App ons",
      },
    },
    process: {
      headline: "Van bestand naar bureau",
      intro:
        "Elke print loopt langs deze vier stappen. Geen wachtrij van 3 weken, geen verrassingen achteraf.",
      steps: [
        {
          title: "1. Stuur je idee",
          body: "Een MakerWorld-link, een STL-bestand of een korte beschrijving. We kijken of het op de Bambu Lab P2S past en welk materiaal past bij wat je ermee gaat doen.",
          icon: "upload",
        },
        {
          title: "2. Slicen + materiaal kiezen",
          body: "We zetten de print om naar instructies voor de printer en kiezen samen de kleur en het materiaal. PLA voor display-prints, PETG voor functioneel, ABS voor warmte-bestendig.",
          icon: "settings-2",
        },
        {
          title: "3. Printen",
          body: "De P2S print laag voor laag. Een klein hebbedingetje is in 2 uur klaar, een complexe sculptuur kan een hele dag duren. We houden je op de hoogte.",
          icon: "boxes",
        },
        {
          title: "4. Bij jou op de mat",
          body: "Verzonden via PostNL met track & trace. 3-7 werkdagen levertijd vanaf moment van bestellen. Verpakt met zorg zodat 'ie heel aankomt.",
          icon: "truck",
        },
      ],
    },
    faq: [
      {
        question: "Hoe lang duurt een print?",
        answer:
          "Een klein hebbedingetje (zoals een penhouder) is in 2 uur klaar. Een complexer object zoals de Voronoi wijnhouder duurt 6-8 uur. Bij maatwerk geven we vooraf altijd een schatting.",
      },
      {
        question: "Welke materialen gebruiken jullie?",
        answer:
          "Standaard PLA — de meest gangbare keuze, mooie afwerking, niet warmte-bestendig. Op aanvraag PETG (sterker, beetje flexibel), ABS (warmte-bestendig) of TPU (rubber-achtig). De Bambu Lab AMS Combo schakelt automatisch tussen 4 spools voor multi-color prints.",
      },
      {
        question: "Kunnen jullie ook iets printen dat ik zelf ontworpen heb?",
        answer:
          "Ja. Stuur ons je STL of STEP-bestand via /maatwerk en we geven je binnen een dag een prijsopgave + levertijd. Geen ontwerp? Beschrijf je idee en we kijken of we iets passends kunnen vinden op MakerWorld of Thingiverse.",
      },
      {
        question: "Wat als ik een specifieke kleur wil?",
        answer:
          "We hebben standaard zwart, wit, en een handvol kleuren op voorraad. Voor iets specifieks (bv. een merkkleur) bestellen we een spool bij — dat duurt 2-3 dagen extra.",
      },
      {
        question: "Wat zijn de verzendkosten?",
        answer:
          "€4,95 voor heel Nederland. We verzenden 5 dagen per week via PostNL. Voor België geldt een toeslag van €5,- afhankelijk van het gewicht.",
      },
      {
        question: "Wat gebeurt er als de print kapot aankomt?",
        answer:
          "Maak een foto en stuur 'm naar ons via WhatsApp. We printen 'm dan opnieuw en sturen 'm gratis op. Komt zelden voor — we pakken alles in met luchtkussen.",
      },
      {
        question: "Doen jullie ook spoed-opdrachten?",
        answer:
          "Soms wel. Print-tijd zit vast aan de fysica, maar als we ruimte hebben in de queue kunnen we soms binnen 48 uur leveren. Een spoed-toeslag van €15 geldt dan.",
      },
    ],
    customRequest: {
      // email: "info@jj3d.nl",  // TODO: invullen zodra klant email heeft
      headline: "Iets specifieks in gedachten?",
      intro:
        "Stuur je idee, een MakerWorld-link of je eigen STL-bestand. Binnen een werkdag krijg je een prijsopgave en levertijd.",
    },
    subpageHeroes: {
      contact: "/sites/jj-3d/intro/frames/frame_0150.jpg",
      proces: "/sites/jj-3d/intro/frames/frame_0080.jpg",
      collectie: "/sites/jj-3d/intro/frames/frame_0200.jpg",
      maatwerk: "/sites/jj-3d/intro/frames/frame_0120.jpg",
      faq: "/sites/jj-3d/intro/frames/frame_0250.jpg",
    },
  },
};

export function listSlugs(): string[] {
  return Object.keys(DEMO_SITES);
}

async function tryLoadHeroFrames(folder: string): Promise<string[] | null> {
  const dir = path.join(process.cwd(), "public", "sites", folder);
  const required = ["exterior.jpg", "doorway.jpg", "interior.jpg"];
  try {
    for (const f of required) {
      await fs.access(path.join(dir, f));
    }
    return required.map((f) => `/sites/${folder}/${f}`);
  } catch {
    return null;
  }
}

async function tryLoadVideoFrames(
  folder: string,
  scene: string
): Promise<string[] | null> {
  const manifestPath = path.join(
    process.cwd(),
    "public",
    "sites",
    folder,
    scene,
    "manifest.json"
  );
  const manifest = await readManifestSafe(manifestPath);
  if (!manifest || manifest.frameCount < 5) return null;
  const frames: string[] = [];
  for (let i = 1; i <= manifest.frameCount; i++) {
    const padded = String(i).padStart(4, "0");
    frames.push(`${manifest.publicPrefix}/frame_${padded}.jpg`);
  }
  return frames;
}

export async function loadSiteData(slug: string): Promise<{
  data: NextLevelSiteData;
  mode: SiteRenderMode;
} | null> {
  const spec = DEMO_SITES[slug];
  if (!spec) return null;
  const { frameFolder, ...base } = spec;

  let frames: string[] = generateStubFrames();
  let mode: SiteRenderMode = "stub";

  if (frameFolder) {
    const videoFrames = await tryLoadVideoFrames(frameFolder, "intro");
    if (videoFrames && videoFrames.length >= 5) {
      frames = videoFrames;
      mode = "video";
    } else {
      const heroFrames = await tryLoadHeroFrames(frameFolder);
      if (heroFrames && heroFrames.length === 3) {
        frames = heroFrames;
        mode = "cinematic";
      }
    }
  }

  return {
    data: {
      ...(base as Omit<NextLevelSiteData, "frames">),
      frames,
    },
    mode,
  };
}
