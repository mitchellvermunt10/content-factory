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
