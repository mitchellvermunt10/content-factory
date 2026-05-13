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
        "Print op bestelling. In jouw kleur, op je bureau binnen een week.",
      logo: "/sites/jj-3d/logo-wordmark.png",
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
      deliveryNote: "Geprint op bestelling. 1 tot 3 werkdagen tot verzending.",
      materials: [
        {
          id: "pla",
          name: "PLA",
          tagline: "Display & decoratie",
          description:
            "Standaard materiaal — mooie afwerking, breed kleurenpalet, niet hittebestendig. Geschikt voor bureau-decoraties, kado's, prototypes.",
          priceModifierEur: 0,
          isDefault: true,
        },
        {
          id: "petg",
          name: "PETG",
          tagline: "Functioneel & sterk",
          description:
            "Sterker dan PLA, beetje flexibel, beter bestand tegen hitte (tot 70°C). Geschikt voor onderdelen die belast worden, plantenpotten, drinkbekers.",
          priceModifierEur: 2,
        },
        {
          id: "abs",
          name: "ABS",
          tagline: "Hittebestendig",
          description:
            "Auto-interieur grade — bestand tegen direct zonlicht en hoge temperaturen tot 95°C. Geschikt voor dashboard-accessoires, beschermkappen, gereedschap.",
          priceModifierEur: 3,
        },
        {
          id: "tpu",
          name: "TPU",
          tagline: "Rubber-flexibel",
          description:
            "Flexibel en stootabsorberend, voelt aan als rubber. Geschikt voor hoesjes, dempers, antislip-pads, grippy onderdelen.",
          priceModifierEur: 4,
        },
      ],
      colors: [
        // Bambu Lab PLA Basic palette — 30 kleuren als referentie.
        // Hex zonder #-prefix.
        { id: "jade-white", name: "Jade White", hex: "FFFFFC" },
        { id: "cold-white", name: "Cold White", hex: "F5F5F5" },
        { id: "beige", name: "Beige", hex: "F7E6DE" },
        { id: "silver", name: "Silver", hex: "B0B0B0" },
        { id: "gray", name: "Gray", hex: "8E9089" },
        { id: "dark-gray", name: "Dark Gray", hex: "545E5E" },
        { id: "black", name: "Black", hex: "000000" },
        { id: "brown", name: "Brown", hex: "9D432C" },
        { id: "dark-brown", name: "Dark Brown", hex: "5C3B17" },
        { id: "caramel", name: "Caramel", hex: "C98C5D" },
        { id: "bronze", name: "Bronze", hex: "847D48" },
        { id: "gold", name: "Gold", hex: "E5B13A" },
        { id: "yellow", name: "Yellow", hex: "F4EE2A" },
        { id: "pumpkin-orange", name: "Pumpkin Orange", hex: "FF9A00" },
        { id: "orange", name: "Orange", hex: "FF6A13" },
        { id: "red", name: "Red", hex: "C12E1F" },
        { id: "maroon-red", name: "Maroon Red", hex: "9D2235" },
        { id: "dark-red", name: "Dark Red", hex: "5B0F0F" },
        { id: "magenta", name: "Magenta", hex: "EC008C" },
        { id: "hot-pink", name: "Hot Pink", hex: "F55A74" },
        { id: "pink", name: "Pink", hex: "F5547C" },
        { id: "light-lilac", name: "Light Lilac", hex: "C8A1FF" },
        { id: "purple", name: "Purple", hex: "6B3FA0" },
        { id: "indigo-purple", name: "Indigo Purple", hex: "5024F1" },
        { id: "blue", name: "Blue", hex: "0A2989" },
        { id: "cobalt-blue", name: "Cobalt Blue", hex: "0D3DA8" },
        { id: "cyan", name: "Cyan", hex: "0086D6" },
        { id: "sky-blue", name: "Sky Blue", hex: "74D4FF" },
        { id: "bambu-green", name: "Bambu Green", hex: "00A04B" },
        { id: "mint-lime", name: "Mint Lime", hex: "B3FF42" },
      ],
      products: [
        {
          id: "2391957",
          title: "Puffer Jacket Pen Holder",
          description:
            "De puffer-jas in 3D. Past 3 tot 5 pennen, of een handvol potloden. Kies de kleur, wij printen 'm.",
          priceEur: 15.0,
          priceAmsEur: 19.0,
          amsDescription: "Twee kleuren: jas + zichtbare binnenvoering",
          image: "/sites/jj-3d/products/2391957/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/2391957/gallery/gallery-01.png",
            "/sites/jj-3d/products/2391957/gallery/gallery-02.png",
            "/sites/jj-3d/products/2391957/gallery/gallery-03.png",
            "/sites/jj-3d/products/2391957/gallery/gallery-04.png",
            "/sites/jj-3d/products/2391957/gallery/gallery-05.png",
            "/sites/jj-3d/products/2391957/gallery/gallery-06.png",
            "/sites/jj-3d/products/2391957/gallery/gallery-07.png",
            "/sites/jj-3d/products/2391957/gallery/gallery-08.png",
          ],
          printTimeMinutes: 120,
          tags: ["bureau", "hebbedingetje"],
          sourceUrl:
            "https://makerworld.com/nl/models/2391957-the-north-face-down-jacket-pen-holder",
        },
        {
          id: "2387676",
          title: "Beanie Desk Organiser",
          description:
            "De bekende beanie, maar dan als bakje. Past potloden, paperclips, of de losse post-its van vorige week.",
          priceEur: 15.0,
          priceAmsEur: 17.0,
          amsDescription: "Beanie en pompon in twee verschillende kleuren",
          image: "/sites/jj-3d/products/2387676/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/2387676/gallery/gallery-01.jpg",
            "/sites/jj-3d/products/2387676/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/2387676/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/2387676/gallery/gallery-04.jpg",
            "/sites/jj-3d/products/2387676/gallery/gallery-05.jpg",
            "/sites/jj-3d/products/2387676/gallery/gallery-06.jpg",
            "/sites/jj-3d/products/2387676/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/2387676/gallery/gallery-08.png",
          ],
          printTimeMinutes: 360,
          tags: ["bureau", "hebbedingetje", "organiseren"],
          sourceUrl:
            "https://makerworld.com/nl/models/2387676-north-face-beanie-desk-organiser",
        },
        {
          id: "1641939",
          title: "Voronoi Wine Holder",
          description:
            "Wijn-fles-houder met Voronoi-patroon. Ziet eruit als sculptuur, doet het werk van een schap.",
          priceEur: 22.0,
          priceAmsEur: 27.0,
          amsDescription: "Gradient-print: van wit naar diepe kleur",
          image: "/sites/jj-3d/products/1641939/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/1641939/gallery/gallery-01.png",
            "/sites/jj-3d/products/1641939/gallery/gallery-02.png",
            "/sites/jj-3d/products/1641939/gallery/gallery-03.png",
            "/sites/jj-3d/products/1641939/gallery/gallery-04.png",
            "/sites/jj-3d/products/1641939/gallery/gallery-05.jpg",
            "/sites/jj-3d/products/1641939/gallery/gallery-06.jpg",
            "/sites/jj-3d/products/1641939/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/1641939/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 420,
          tags: ["wijn", "decoratief"],
          sourceUrl:
            "https://makerworld.com/nl/models/1641939-vinograce-voronoi-wine-holder",
        },
        {
          id: "654785",
          title: "Planetary Gears Fidget Spinner",
          description:
            "Print-in-place planetary gears. Vijf tandwielen, één pinion, draait soepel zonder assemblage.",
          priceEur: 16.0,
          priceAmsEur: 19.0,
          amsDescription: "Vijf tandwielen in vijf verschillende kleuren",
          image: "/sites/jj-3d/products/654785/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/654785/gallery/gallery-01.jpg",
            "/sites/jj-3d/products/654785/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/654785/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/654785/gallery/gallery-04.jpg",
            "/sites/jj-3d/products/654785/gallery/gallery-05.jpg",
            "/sites/jj-3d/products/654785/gallery/gallery-06.jpg",
            "/sites/jj-3d/products/654785/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/654785/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 480,
          tags: ["fidget", "kids", "ams-multicolor"],
          sourceUrl:
            "https://makerworld.com/nl/models/654785-planetary-gears-finger-fidget-spinners",
        },
        {
          id: "652236",
          title: "Tesla Keychain",
          description:
            "Sleutelhanger met Tesla-T uitgesneden. Past op alle sleutelringen.",
          priceEur: 9.0,
          priceAmsEur: 12.0,
          amsDescription: "Twee kleuren: logo-rood op zwarte body",
          image: "/sites/jj-3d/products/652236/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/652236/gallery/gallery-01.jpg",
            "/sites/jj-3d/products/652236/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/652236/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/652236/gallery/gallery-04.png",
            "/sites/jj-3d/products/652236/gallery/gallery-05.jpg",
            "/sites/jj-3d/products/652236/gallery/gallery-06.jpg",
            "/sites/jj-3d/products/652236/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/652236/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 22,
          tags: ["auto", "sleutelhanger", "ams-multicolor"],
          sourceUrl:
            "https://makerworld.com/nl/models/652236-tesla-keychain",
        },
        {
          id: "2158555",
          title: "Auto Munten-organizer",
          description:
            "Past in de bekerhouder van je auto. Gestapelde vakken voor parkeermunten, statiegeld of kleingeld. Vraag ernaar — we kunnen 'm op maat schalen.",
          priceEur: 11.0,
          image: "/sites/jj-3d/products/2158555/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/2158555/gallery/gallery-01.jpg",
            "/sites/jj-3d/products/2158555/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/2158555/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/2158555/gallery/gallery-04.jpg",
            "/sites/jj-3d/products/2158555/gallery/gallery-05.jpg",
            "/sites/jj-3d/products/2158555/gallery/gallery-06.jpg",
            "/sites/jj-3d/products/2158555/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/2158555/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 420,
          tags: ["auto", "organiseren"],
          sourceUrl:
            "https://makerworld.com/nl/models/2158555-cup-holder-coins-organizer-cad",
        },
        {
          id: "824309",
          title: "Wendbare Mood Octopus",
          description:
            "Stemmingsoctopus die je binnenstebuiten draait. Vrolijk aan de ene kant, chagrijnig aan de andere. Dual-color is essentieel: zonder twee verschillende kleuren ziet de wending er flets uit.",
          priceEur: 15.0,
          priceAmsEur: 18.0,
          amsDescription: "Twee duidelijke contrast-kleuren voor scherpe wending",
          image: "/sites/jj-3d/products/824309/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/824309/gallery/gallery-01.jpg",
            "/sites/jj-3d/products/824309/gallery/gallery-02.png",
            "/sites/jj-3d/products/824309/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/824309/gallery/gallery-04.jpg",
            "/sites/jj-3d/products/824309/gallery/gallery-05.jpg",
            "/sites/jj-3d/products/824309/gallery/gallery-06.jpg",
            "/sites/jj-3d/products/824309/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/824309/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 150,
          tags: ["kids", "fidget", "ams-multicolor"],
          sourceUrl:
            "https://makerworld.com/nl/models/824309-truely-reversible-mood-octopus-turns-inside-out",
        },
        {
          id: "1606276",
          title: "Parkeerkaart-houder voor je dashboard",
          description:
            "Houdt je parkeerkaart of blauwe schijf op zijn plek tegen de voorruit. Hechtende strip op de achterkant. Geprint in de kleur van je interieur.",
          priceEur: 9.0,
          image: "/sites/jj-3d/products/1606276/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/1606276/gallery/gallery-01.jpg",
            "/sites/jj-3d/products/1606276/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/1606276/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/1606276/gallery/gallery-04.jpg",
            "/sites/jj-3d/products/1606276/gallery/gallery-05.jpg",
            "/sites/jj-3d/products/1606276/gallery/gallery-06.jpg",
            "/sites/jj-3d/products/1606276/gallery/gallery-07.png",
            "/sites/jj-3d/products/1606276/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 30,
          tags: ["auto", "praktisch"],
          sourceUrl:
            "https://makerworld.com/nl/models/1606276-easypark-windshield-parking-ticket-holder",
        },
        {
          id: "1703614",
          title: "Vertical Laptop Stand / Riser",
          description:
            "Houdt je laptop verticaal op je bureau. Bespaart ruimte, ziet er strak uit. Voor MacBook Pro / Air / 16-inch laptops.",
          priceEur: 18,
          priceAmsEur: 22,
          amsDescription: "Body in jouw kleur, accent-strip in tweede kleur",
          image: "/sites/jj-3d/products/1703614/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/1703614/gallery/gallery-01.jpg",
            "/sites/jj-3d/products/1703614/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/1703614/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/1703614/gallery/gallery-04.jpg",
            "/sites/jj-3d/products/1703614/gallery/gallery-05.jpg",
            "/sites/jj-3d/products/1703614/gallery/gallery-06.jpg",
            "/sites/jj-3d/products/1703614/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/1703614/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 300,
          tags: ["bureau", "laptop-stand"],
          sourceUrl: "https://makerworld.com/nl/models/1703614-vertical-laptop-stand-riser",
        },
        {
          id: "2750699",
          title: "Any Size HexGrid Pen Holder - SIMPLE CUSTOMIZATION",
          description:
            "Hexagonaal pen-houder, parametrisch aanpasbaar in maat. Geef je gewenste afmetingen door bij bestelling.",
          priceEur: 14,
          priceAmsEur: 17,
          amsDescription: "Elke hex in een andere kleur — geometrisch statement",
          image: "/sites/jj-3d/products/2750699/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/2750699/gallery/gallery-01.jpg",
            "/sites/jj-3d/products/2750699/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/2750699/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/2750699/gallery/gallery-04.jpg",
            "/sites/jj-3d/products/2750699/gallery/gallery-05.jpg",
            "/sites/jj-3d/products/2750699/gallery/gallery-06.jpg",
            "/sites/jj-3d/products/2750699/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/2750699/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 60,
          tags: ["bureau", "pen-holder"],
          sourceUrl: "https://makerworld.com/nl/models/2750699-any-size-hexgrid-pen-holder-simple-customization",
        },
        {
          id: "1762081",
          title: "Multi-Device Charging Station (w/ cable storage)",
          description:
            "Laadstation voor 3 apparaten tegelijk — iPhone, AirPods, Apple Watch. Tegen elkaar gestapeld, geen losse kabels op je bureau.",
          priceEur: 22,
          priceAmsEur: 26,
          amsDescription: "Multi-color body + accent rim",
          image: "/sites/jj-3d/products/1762081/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/1762081/gallery/gallery-01.jpg",
            "/sites/jj-3d/products/1762081/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/1762081/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/1762081/gallery/gallery-04.jpg",
            "/sites/jj-3d/products/1762081/gallery/gallery-05.jpg",
            "/sites/jj-3d/products/1762081/gallery/gallery-06.jpg",
            "/sites/jj-3d/products/1762081/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/1762081/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 600,
          tags: ["bureau", "charging-dock"],
          sourceUrl: "https://makerworld.com/nl/models/1762081-modern-multi-device-charging-dock",
        },
        {
          id: "1007157",
          title: "Slim AirPods Max Stand with Sleep Mode V2",
          description:
            "Stand voor je AirPods Max met sleep-mode trigger ingebouwd. Hoofdtelefoon op en uit slaapstand met één hand.",
          priceEur: 12,
          priceAmsEur: 14,
          amsDescription: "Stand in jouw kleur, basis in contrast",
          image: "/sites/jj-3d/products/1007157/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/1007157/gallery/gallery-01.jpg",
            "/sites/jj-3d/products/1007157/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/1007157/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/1007157/gallery/gallery-04.png",
            "/sites/jj-3d/products/1007157/gallery/gallery-05.png",
            "/sites/jj-3d/products/1007157/gallery/gallery-06.png",
            "/sites/jj-3d/products/1007157/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/1007157/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 480,
          tags: ["bureau", "airpods-max"],
          sourceUrl: "https://makerworld.com/nl/models/1007157-slim-airpods-max-stand-with-sleep-mode-v2",
        },
        {
          id: "386085",
          title: "Tesla Model 3 Y Vent Clip Phone Holder",
          description:
            "Telefoon-houder die klemt op de Tesla Model 3 of Model Y ventilatie-rooster. Past op standaard iPhone-formaten.",
          priceEur: 13,
          priceAmsEur: 15,
          amsDescription: "Klem-clip in jouw kleur, Tesla-T accent in rood",
          image: "/sites/jj-3d/products/386085/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/386085/gallery/gallery-01.jpg",
            "/sites/jj-3d/products/386085/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/386085/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/386085/gallery/gallery-04.jpg",
            "/sites/jj-3d/products/386085/gallery/gallery-05.jpg",
            "/sites/jj-3d/products/386085/gallery/gallery-06.jpg",
            "/sites/jj-3d/products/386085/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/386085/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 480,
          tags: ["auto", "tesla"],
          sourceUrl: "https://makerworld.com/nl/models/386085-tesla-model-3-y-vent-clip-phone-holder",
        },
        {
          id: "1018445",
          title: "Cloud Phone Holder",
          description:
            "Wolk-vormige telefoon-houder met spring-mechanisme. Schattig en functioneel — past op elk dashboard.",
          priceEur: 13,
          priceAmsEur: 16,
          amsDescription: "Wolk in wit, arm in jouw kleur",
          image: "/sites/jj-3d/products/1018445/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/1018445/gallery/gallery-01.jpg",
            "/sites/jj-3d/products/1018445/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/1018445/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/1018445/gallery/gallery-04.jpg",
            "/sites/jj-3d/products/1018445/gallery/gallery-05.png",
            "/sites/jj-3d/products/1018445/gallery/gallery-06.jpg",
            "/sites/jj-3d/products/1018445/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/1018445/gallery/gallery-08.png",
          ],
          printTimeMinutes: 120,
          tags: ["auto", "phone-holder"],
          sourceUrl: "https://makerworld.com/nl/models/1018445-cloud-phone-holder",
        },
        {
          id: "126374",
          title: "Magsafe car cup phone holder",
          description:
            "MagSafe-houder die in je cup-holder past. iPhone 12+ klikt magnetisch vast. Geen plakband, geen schroeven.",
          priceEur: 13,
          priceAmsEur: 15,
          amsDescription: "Body + MagSafe-ring in twee kleuren",
          image: "/sites/jj-3d/products/126374/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/126374/gallery/gallery-01.png",
            "/sites/jj-3d/products/126374/gallery/gallery-02.png",
            "/sites/jj-3d/products/126374/gallery/gallery-03.png",
            "/sites/jj-3d/products/126374/gallery/gallery-04.png",
            "/sites/jj-3d/products/126374/gallery/gallery-05.png",
            "/sites/jj-3d/products/126374/gallery/gallery-06.png",
            "/sites/jj-3d/products/126374/gallery/gallery-07.png",
            "/sites/jj-3d/products/126374/gallery/gallery-08.png",
          ],
          printTimeMinutes: 120,
          tags: ["auto", "magsafe"],
          sourceUrl: "https://makerworld.com/nl/models/126374-magsafe-car-cup-phone-holder",
        },
        {
          id: "165001",
          title: "Universal Modular Car Headrest Phone Mount",
          description:
            "Modulaire houder die klemt op de hoofdsteun-stangen van je achterbank. Voor iPad of telefoon — kids op de achterbank houden zich rustig.",
          priceEur: 17,
          priceAmsEur: 20,
          amsDescription: "Hoofdsteun-mount + clip in twee kleuren",
          image: "/sites/jj-3d/products/165001/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/165001/gallery/gallery-01.jpg",
            "/sites/jj-3d/products/165001/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/165001/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/165001/gallery/gallery-04.jpg",
            "/sites/jj-3d/products/165001/gallery/gallery-05.png",
            "/sites/jj-3d/products/165001/gallery/gallery-06.png",
            "/sites/jj-3d/products/165001/gallery/gallery-07.png",
            "/sites/jj-3d/products/165001/gallery/gallery-08.png",
          ],
          printTimeMinutes: 120,
          tags: ["auto", "headrest"],
          sourceUrl: "https://makerworld.com/nl/models/165001-universal-modular-car-headrest-phone-mount",
        },
        {
          id: "486470",
          title: "PS5 Controller and Headphones Wall Mount",
          description:
            "Wand-mount voor PS5 controller en koptelefoon naast elkaar. Houdt je gaming-setup ordelijk.",
          priceEur: 18,
          priceAmsEur: 22,
          amsDescription: "Body in zwart + PlayStation-blauw logo-accent",
          image: "/sites/jj-3d/products/486470/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/486470/gallery/gallery-01.jpg",
            "/sites/jj-3d/products/486470/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/486470/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/486470/gallery/gallery-04.jpg",
            "/sites/jj-3d/products/486470/gallery/gallery-05.jpg",
            "/sites/jj-3d/products/486470/gallery/gallery-06.jpg",
            "/sites/jj-3d/products/486470/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/486470/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 120,
          tags: ["gaming", "ps5"],
          sourceUrl: "https://makerworld.com/nl/models/486470-ps5-controller-and-headphones-wall-mount",
        },
        {
          id: "114244",
          title: "Steam Deck Stand V2",
          description:
            "Stand voor je Steam Deck. Past in elke hoek van het bureau.",
          priceEur: 15,
          priceAmsEur: 18,
          amsDescription: "Stand + grip-pads in contrastkleur",
          image: "/sites/jj-3d/products/114244/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/114244/gallery/gallery-01.jpg",
            "/sites/jj-3d/products/114244/gallery/gallery-02.jpeg",
            "/sites/jj-3d/products/114244/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/114244/gallery/gallery-04.jpg",
            "/sites/jj-3d/products/114244/gallery/gallery-05.jpeg",
            "/sites/jj-3d/products/114244/gallery/gallery-06.jpg",
            "/sites/jj-3d/products/114244/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/114244/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 420,
          tags: ["gaming", "steam-deck"],
          sourceUrl: "https://makerworld.com/nl/models/114244-steam-deck-stand-v2",
        },
        {
          id: "882272",
          title: "Smash! The Auto-Reload Dice Tower",
          description:
            "Auto-reload dice tower voor je D&D-sessies. Werpt en verzamelt 8 dobbelstenen in één gooi.",
          priceEur: 35,
          priceAmsEur: 42,
          amsDescription: "Toren-body + dice-tray in matching of contrast",
          image: "/sites/jj-3d/products/882272/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/882272/gallery/gallery-01.jpg",
            "/sites/jj-3d/products/882272/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/882272/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/882272/gallery/gallery-04.jpg",
            "/sites/jj-3d/products/882272/gallery/gallery-05.jpg",
            "/sites/jj-3d/products/882272/gallery/gallery-06.jpg",
            "/sites/jj-3d/products/882272/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/882272/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 360,
          tags: ["gaming", "dnd"],
          sourceUrl: "https://makerworld.com/nl/models/882272-smash-the-auto-reload-dice-tower",
        },
        {
          id: "553276",
          title: "Headphone and controller stand",
          description:
            "Universal stand voor koptelefoon én controller naast elkaar. Geen wandmontage nodig — past op elk bureau.",
          priceEur: 19,
          priceAmsEur: 23,
          amsDescription: "Body in jouw kleur, accents in tweede",
          image: "/sites/jj-3d/products/553276/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/553276/gallery/gallery-01.jpg",
            "/sites/jj-3d/products/553276/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/553276/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/553276/gallery/gallery-04.jpeg",
            "/sites/jj-3d/products/553276/gallery/gallery-05.jpg",
            "/sites/jj-3d/products/553276/gallery/gallery-06.jpg",
            "/sites/jj-3d/products/553276/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/553276/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 420,
          tags: ["gaming", "stand"],
          sourceUrl: "https://makerworld.com/nl/models/553276-headphone-and-controller-stand",
        },
        {
          id: "13859",
          title: "Cute Mini Octopus",
          description:
            "Set van 5 mini-octopussen in verschillende kleuren. Snel printbaar — perfect als kado-bundle.",
          priceEur: 12,
          priceAmsEur: 15,
          amsDescription: "Set van 5 in regenboog-kleuren via AMS",
          image: "/sites/jj-3d/products/13859/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/13859/gallery/gallery-01.jpg",
            "/sites/jj-3d/products/13859/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/13859/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/13859/gallery/gallery-04.jpg",
            "/sites/jj-3d/products/13859/gallery/gallery-05.jpg",
            "/sites/jj-3d/products/13859/gallery/gallery-06.jpg",
            "/sites/jj-3d/products/13859/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/13859/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 180,
          tags: ["kids", "octopus"],
          sourceUrl: "https://makerworld.com/nl/models/13859-cute-mini-octopus",
        },
        {
          id: "1634871",
          title: "Flexi Skeleton T-Rex Dinosaur",
          description:
            "Articulated T-Rex skelet print-in-place. Beweegbaar zonder assembly. Voor dinosaurus-fans van 5 tot 50.",
          priceEur: 15,
          priceAmsEur: 18,
          amsDescription: "Skelet in licht, botten-detail in donker contrast",
          image: "/sites/jj-3d/products/1634871/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/1634871/gallery/gallery-01.png",
            "/sites/jj-3d/products/1634871/gallery/gallery-02.png",
            "/sites/jj-3d/products/1634871/gallery/gallery-03.png",
            "/sites/jj-3d/products/1634871/gallery/gallery-04.png",
            "/sites/jj-3d/products/1634871/gallery/gallery-05.png",
            "/sites/jj-3d/products/1634871/gallery/gallery-06.png",
            "/sites/jj-3d/products/1634871/gallery/gallery-07.png",
            "/sites/jj-3d/products/1634871/gallery/gallery-08.png",
          ],
          printTimeMinutes: 360,
          tags: ["kids", "t-rex"],
          sourceUrl: "https://makerworld.com/nl/models/1634871-flexi-skeleton-t-rex-dinosaur",
        },
        {
          id: "1020984",
          title: "Puzzle Maker For Kids (Names, Letters, Shapes...)",
          description:
            "Personaliseerbare letter-puzzel met de naam van je kind. AMS-multi-color geeft elke letter een eigen kleur.",
          priceEur: 25,
          priceAmsEur: 32,
          amsDescription: "Elke letter een andere kleur — naam in regenboog",
          image: "/sites/jj-3d/products/1020984/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/1020984/gallery/gallery-01.jpg",
            "/sites/jj-3d/products/1020984/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/1020984/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/1020984/gallery/gallery-04.png",
            "/sites/jj-3d/products/1020984/gallery/gallery-05.png",
            "/sites/jj-3d/products/1020984/gallery/gallery-06.png",
            "/sites/jj-3d/products/1020984/gallery/gallery-07.png",
            "/sites/jj-3d/products/1020984/gallery/gallery-08.png",
          ],
          printTimeMinutes: 240,
          tags: ["kids", "puzzel"],
          sourceUrl: "https://makerworld.com/nl/models/1020984-puzzle-maker-for-kids-names-letters-shapes",
        },
        {
          id: "2253690",
          title: "Cute Flexi Cat - Articulated Print-in-Place Fidget",
          description:
            "Print-in-place flexi kat. Beweegbare gewrichten zonder assembly, een fidget die ook leuk staat op je bureau.",
          priceEur: 14,
          priceAmsEur: 17,
          amsDescription: "Kat-body + accent ogen/oren in tweede kleur",
          image: "/sites/jj-3d/products/2253690/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/2253690/gallery/gallery-01.png",
            "/sites/jj-3d/products/2253690/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/2253690/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/2253690/gallery/gallery-04.png",
            "/sites/jj-3d/products/2253690/gallery/gallery-05.png",
            "/sites/jj-3d/products/2253690/gallery/gallery-06.jpg",
            "/sites/jj-3d/products/2253690/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/2253690/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 120,
          tags: ["kids", "flexi"],
          sourceUrl: "https://makerworld.com/nl/models/2253690-cute-flexi-cat-articulated-print-in-place-fidget",
        },
        {
          id: "2416792",
          title: "Baby Shark Flexi Toy – Print-in-Place",
          description:
            "Flexi baby-shark print-in-place. Schattige chibi-stijl, kids zijn er gek op.",
          priceEur: 13,
          priceAmsEur: 16,
          amsDescription: "Haai-body + tanden accent in wit",
          image: "/sites/jj-3d/products/2416792/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/2416792/gallery/gallery-01.png",
            "/sites/jj-3d/products/2416792/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/2416792/gallery/gallery-03.png",
            "/sites/jj-3d/products/2416792/gallery/gallery-04.png",
            "/sites/jj-3d/products/2416792/gallery/gallery-05.jpg",
            "/sites/jj-3d/products/2416792/gallery/gallery-06.jpg",
            "/sites/jj-3d/products/2416792/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/2416792/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 420,
          tags: ["kids", "flexi"],
          sourceUrl: "https://makerworld.com/nl/models/2416792-flexi-baby-shark-print-in-place-articulated-toy",
        },
        {
          id: "1614897",
          title: "Slide-on Chip Bag Clips",
          description:
            "Set van 6 zipper-clips voor zakken chips, koffie, of pasta. Schuiven op de bovenrand voor luchtdichte afsluiting.",
          priceEur: 9,
          image: "/sites/jj-3d/products/1614897/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/1614897/gallery/gallery-01.png",
            "/sites/jj-3d/products/1614897/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/1614897/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/1614897/gallery/gallery-04.jpg",
            "/sites/jj-3d/products/1614897/gallery/gallery-05.jpg",
            "/sites/jj-3d/products/1614897/gallery/gallery-06.webp",
            "/sites/jj-3d/products/1614897/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/1614897/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 180,
          tags: ["huishouden", "keuken"],
          sourceUrl: "https://makerworld.com/nl/models/1614897-slide-on-chip-bag-clips",
        },
        {
          id: "1065923",
          title: "Herb Stripper",
          description:
            "Kruiden van de stengel halen in één beweging — voor peterselie, koriander, tijm, rozemarijn. Vaatwasser-bestendig in PETG.",
          priceEur: 8,
          image: "/sites/jj-3d/products/1065923/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/1065923/gallery/gallery-01.jpeg",
            "/sites/jj-3d/products/1065923/gallery/gallery-02.jpeg",
            "/sites/jj-3d/products/1065923/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/1065923/gallery/gallery-04.png",
            "/sites/jj-3d/products/1065923/gallery/gallery-05.png",
            "/sites/jj-3d/products/1065923/gallery/gallery-06.png",
            "/sites/jj-3d/products/1065923/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/1065923/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 56,
          tags: ["huishouden", "keuken"],
          sourceUrl: "https://makerworld.com/nl/models/1065923-herb-stripper",
        },
        {
          id: "1890589",
          title: "Modern Flow Planter – Self-Watering Pot Collection",
          description:
            "Self-watering plantenpot in modern flow-design. Geprint in PETG voor waterbestendigheid.",
          priceEur: 24,
          priceAmsEur: 28,
          amsDescription: "Plant-pot in PETG, accent-rim in contrastkleur",
          image: "/sites/jj-3d/products/1890589/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/1890589/gallery/gallery-01.jpg",
            "/sites/jj-3d/products/1890589/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/1890589/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/1890589/gallery/gallery-04.jpg",
            "/sites/jj-3d/products/1890589/gallery/gallery-05.jpg",
            "/sites/jj-3d/products/1890589/gallery/gallery-06.jpg",
            "/sites/jj-3d/products/1890589/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/1890589/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 420,
          tags: ["huishouden", "planter"],
          sourceUrl: "https://makerworld.com/nl/models/1890589-modern-flow-planter-self-watering-pot-collection",
        },
        {
          id: "797538",
          title: "Cyberpunk Dice Tower - High Detail Illuminated Model",
          description:
            "Dobbelstenen-toren met LED-channels en cyberpunk-detail. Voor de premium D&D-tafel.",
          priceEur: 45,
          priceAmsEur: 52,
          amsDescription: "Toren-body + LED-channels in contrast",
          image: "/sites/jj-3d/products/797538/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/797538/gallery/gallery-01.png",
            "/sites/jj-3d/products/797538/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/797538/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/797538/gallery/gallery-04.jpg",
            "/sites/jj-3d/products/797538/gallery/gallery-05.jpg",
            "/sites/jj-3d/products/797538/gallery/gallery-06.jpg",
            "/sites/jj-3d/products/797538/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/797538/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 420,
          tags: ["gaming", "dnd"],
          sourceUrl: "https://makerworld.com/nl/models/797538-cyberpunk-dice-tower-high-detail-illuminated-model",
        },
        {
          id: "153612",
          title: "hYPER Fidget II - 20 gear fidget spinner",
          description:
            "Fidget-spinner met 20 tandwielen in één print. Tactiel meesterwerk — draait minutenlang.",
          priceEur: 18,
          priceAmsEur: 22,
          amsDescription: "20 gears in vijf verschillende kleuren",
          image: "/sites/jj-3d/products/153612/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/153612/gallery/gallery-01.jpg",
            "/sites/jj-3d/products/153612/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/153612/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/153612/gallery/gallery-04.jpg",
            "/sites/jj-3d/products/153612/gallery/gallery-05.jpg",
            "/sites/jj-3d/products/153612/gallery/gallery-06.jpg",
            "/sites/jj-3d/products/153612/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/153612/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 420,
          tags: ["kids", "fidget"],
          sourceUrl: "https://makerworld.com/nl/models/153612-hyper-fidget-ii-20-gear-fidget-spinner",
        },
        {
          id: "1508954",
          title: "Cute Articulated Flexi Leroy (Lilo & Stitch Movie)",
          description:
            "Articulated flexi Leroy (Lilo & Stitch). Beweegbare gewrichten, schattig karakter-design.",
          priceEur: 13,
          priceAmsEur: 16,
          amsDescription: "Karakter-body + accent-details in contrast",
          image: "/sites/jj-3d/products/1508954/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/1508954/gallery/gallery-01.png",
            "/sites/jj-3d/products/1508954/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/1508954/gallery/gallery-03.jpg",
            "/sites/jj-3d/products/1508954/gallery/gallery-04.png",
            "/sites/jj-3d/products/1508954/gallery/gallery-05.jpg",
            "/sites/jj-3d/products/1508954/gallery/gallery-06.jpg",
            "/sites/jj-3d/products/1508954/gallery/gallery-07.jpg",
            "/sites/jj-3d/products/1508954/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 240,
          tags: ["kids", "flexi"],
          sourceUrl: "https://makerworld.com/nl/models/1508954-cute-articulated-flexi-leroy-lilo-stitch-movie",
        },
        {
          id: "2788119",
          title: "Steam (2026) Controller Stand",
          description:
            "Stand voor de nieuwe Steam Controller 2026. Drie versies: simpel, charging-puck, premium.",
          priceEur: 19,
          priceAmsEur: 23,
          amsDescription: "Stand + grip-cushions in contrast",
          image: "/sites/jj-3d/products/2788119/hero.jpg",
          gallery: [
            "/sites/jj-3d/products/2788119/gallery/gallery-01.png",
            "/sites/jj-3d/products/2788119/gallery/gallery-02.jpg",
            "/sites/jj-3d/products/2788119/gallery/gallery-03.png",
            "/sites/jj-3d/products/2788119/gallery/gallery-04.jpg",
            "/sites/jj-3d/products/2788119/gallery/gallery-05.png",
            "/sites/jj-3d/products/2788119/gallery/gallery-06.jpg",
            "/sites/jj-3d/products/2788119/gallery/gallery-07.png",
            "/sites/jj-3d/products/2788119/gallery/gallery-08.jpg",
          ],
          printTimeMinutes: 540,
          tags: ["gaming", "steam"],
          sourceUrl: "https://makerworld.com/nl/models/2788119-steam-2026-controller-stand",
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
      intro: { eyebrow: "Nederland · op bestelling geprint" },
      arrival: {
        eyebrow: "De werkplaats",
        headline:
          "Een Bambu Lab P2S die zelden stilstaat. Vier kleuren tegelijk, elke print één voor één gemaakt.",
        ctaLabel: "Bekijk de collectie",
      },
      menu: {
        eyebrow: "De collectie",
        headline: "Klein, sculpturaal, of allebei",
      },
      ambiance: { eyebrow: "Aan het werk", headline: "Laag voor laag opgebouwd" },
      contact: {
        eyebrow: "Iets specifieks?",
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
    postVideoImages: [
      "/sites/jj-3d/post-1-spools.jpg",
      "/sites/jj-3d/post-2-detail.jpg",
    ],
    landingPages: [
      {
        topic: "skadis-accessoires",
        keyword: "ikea skadis 3d print",
        eyebrow: "Ikea Skadis · op bestelling",
        title: "Skadis-accessoires geprint in jouw kleur",
        subtitle:
          "Haakjes, bakjes en houders die passen op Ikea's Skadis-pegboard. Geprint op de Bambu Lab P2S, in de kleur die jouw werkplek vraagt.",
        heroImage: "/sites/jj-3d/intro/frames/frame_0080.jpg",
        intro:
          "Skadis is Ikea's pegboard-systeem dat sinds 2017 in honderdduizenden NL-werkplekken hangt. De standaard-haakjes werken, maar elk specifiek voorwerp vraagt om een andere houder. Wij printen ze voor je.",
        sections: [
          {
            headline: "Wat past op een Skadis",
            body: "Het Skadis-systeem heeft een vast raster van 4cm. Elk accessoire dat wij printen klikt rechtstreeks vast in dit raster zonder schroeven. Houders voor schroevendraaiers, kabels, telefoons, opladers, tape-dispensers, kruidenpotten, koptelefoons of wat jij ook maar boven je bureau wil.",
          },
          {
            headline: "Materiaal en kleur",
            body: "Standaard in PLA voor binnen, in 30+ kleuren. Witte Skadis houdt wit minimalistisch, zwarte houdt zwart strak. Of kies een accentkleur voor één specifiek item om visueel te scheiden.",
          },
          {
            headline: "Op maat",
            body: "Heb je een item dat geen standaard-houder heeft? Stuur ons de maten of een foto en wij ontwerpen 'm voor je. Binnen een werkdag een prijsopgave.",
          },
        ],
        productIds: [],
        ctaLabel: "Vraag een Skadis-houder op maat",
        ctaHref: "/maatwerk",
      },
      {
        topic: "dyson-accu-adapter",
        keyword: "dyson adapter 3d print",
        eyebrow: "Dyson-accu cross-brand · op bestelling",
        title: "Dyson op Makita, Ryobi of Parkside-accu",
        subtitle:
          "Geprinte adapter zodat je Dyson V6/V7/V8/V10/V11/V15 op je bestaande accu-pack draait. Bespaart een nieuwe Dyson-accu van €80+.",
        heroImage: "/sites/jj-3d/intro/frames/frame_0120.jpg",
        intro:
          "Dyson's originele V-serie accu's gaan na 2-3 jaar achteruit en kosten €80-€120 om te vervangen. Als jij al een Makita, Ryobi of Parkside accu-systeem hebt liggen, kun je die via een geprinte adapter direct op je Dyson aansluiten. Eén investering, alle apparaten op één accu-platform.",
        sections: [
          {
            headline: "Welke Dyson-modellen",
            body: "V6, V7, V8, V10, V11, V15 — alle handhelds met de standaard Dyson-accu-aansluiting. Stuur het exacte model bij je bestelling zodat we de juiste adapter printen.",
          },
          {
            headline: "Welke accu-platformen",
            body: "Makita 18V LXT, Ryobi 18V One+, Parkside X20V Team. De adapter zit aan één kant op de Dyson-aansluiting, aan de andere kant op de accu-rail van jouw gereedschapsmerk.",
          },
          {
            headline: "Materiaal",
            body: "PETG vanwege de mechanische belasting en lichte warmte-ontwikkeling tijdens gebruik. Niet in PLA — die wordt te zacht. Standaard zwart, op verzoek in jouw kleur.",
          },
          {
            headline: "Disclaimer",
            body: "Wij maken een fysieke adapter; geen elektronische beveiliging of voltage-conversie. Werkt alleen voor accu's met dezelfde voltage (18V naar 18V). Gebruik op eigen risico bij gewijzigde voltages.",
          },
        ],
        productIds: [],
        ctaLabel: "Vraag jouw Dyson-adapter aan",
        ctaHref: "/maatwerk",
      },
      {
        topic: "tesla-accessoires",
        keyword: "tesla 3d print",
        eyebrow: "Tesla Model 3 · Model Y · op bestelling",
        title: "Tesla-accessoires geprint in Nederland",
        subtitle:
          "Sleutelhangers, vent-clips, dashboard-houders en cup-holder-organizers voor je Model 3 of Model Y. Geprint in NL, binnen 1-3 werkdagen verzonden.",
        heroImage: "/sites/jj-3d/intro/frames/frame_0200.jpg",
        intro:
          "Tesla's interieur is sober opgezet. Geen ouderwetse vakjes voor je muntgeld, geen vent-clip voor je telefoon. De Tesla-community vult dat in met 3D-prints. Wij maken ze hier in NL, geen 4 weken wachten op AliExpress.",
        sections: [
          {
            headline: "Wat er nu in de collectie zit",
            body: "Sleutelhanger met Tesla-T (€9), Auto Munten-organizer voor in de cup-holder (€11). Beide in jouw kleur uit de Bambu Lab AMS Combo. Meer modellen op aanvraag.",
          },
          {
            headline: "Model 3 specifieke items",
            body: "Vent-clip phone holder, sunglasses-houder voor de zonneklep, dashboard-organizer voor laadkabel en kleingeld. Stuur je Model 3 facelift-jaar mee voor de correcte pasvorm.",
          },
          {
            headline: "Model Y specifieke items",
            body: "Achterbank tablet-mount voor kinderen, kofferbak-divider, frunk-organizer. Voor de Model Y zijn andere maten dan Model 3 — geef je modeljaar mee.",
          },
        ],
        productIds: ["652236", "2158555"],
        ctaLabel: "Bekijk de Tesla-collectie",
        ctaHref: "/collectie",
      },
      {
        topic: "sinterklaas-surprise-op-maat",
        keyword: "3d print sinterklaas surprise",
        eyebrow: "Q4 · op naam · pre-order vanaf augustus",
        title: "Sinterklaas-surprise op naam, 3D-geprint",
        subtitle:
          "Een surprise die de ontvanger nooit eerder heeft gezien — geprint in jouw kleur, met zijn of haar naam erin. Pre-order vanaf augustus, geleverd voor 5 december.",
        heroImage: "/sites/jj-3d/intro/frames/frame_0250.jpg",
        intro:
          "Surprise maken is leuk; surprise maken met een 3D-printer is leuker. We hebben templates voor naam-puzzels, naam-houders, hobby-themed objecten (motor, voetbal, gitaar, etc.) — allemaal personaliseerbaar met de naam van de ontvanger en in zijn favoriete kleur.",
        sections: [
          {
            headline: "Hoe het werkt",
            body: "Pre-order tussen 1 augustus en 15 november. Wij maken in oktober/november een eerste batch, in december-rush extra capacity. Alles geleverd vóór 4 december zodat jij rustig kunt verpakken.",
          },
          {
            headline: "Wat er mogelijk is",
            body: "Naam-puzzel met letter-per-kleur (AMS multi-color). Hobby-houder gepersonaliseerd (voetbal-schoenhouder voor de voetballer, gitaar-stand voor de muzikant). Of een one-of-a-kind ontwerp dat je zelf doorgeeft — wij printen.",
          },
          {
            headline: "Levertijd-garantie",
            body: "Bestel je vóór 15 november, leveren we vóór 1 december. Bestel je later: WhatsApp eerst even of we het redden. Het wordt elk jaar drukker.",
          },
        ],
        productIds: [],
        ctaLabel: "Pre-order je surprise",
        ctaHref: "/maatwerk",
      },
      {
        topic: "gridfinity-set-nederland",
        keyword: "gridfinity nederland",
        eyebrow: "Gridfinity · gestandaardiseerd opbergsysteem",
        title: "Gridfinity-set, geprint in Nederland",
        subtitle:
          "Het modulaire opbergsysteem dat de hele maker-community gebruikt. Geprint in NL met 1-3 werkdagen verzending — geen Aliexpress, geen 4 weken wachten.",
        heroImage: "/sites/jj-3d/intro/frames/frame_0150.jpg",
        intro:
          "Gridfinity is het modulaire opbergsysteem dat door maker Zack Freedman is ontworpen en sinds 2022 viraal ging. Elke bin is een veelvoud van 42×42mm, klikt vast op een base-plate, en past in elke kast, lade of werkbank. Bouw zo groot of klein als je wil — uitbreiden kan altijd later.",
        sections: [
          {
            headline: "Starter-set",
            body: "Onze starter is een 4×6 base-plate (168×252mm, past in IKEA Skadis-laden en standaard kasten) plus 6 bins in verschillende hoogtes: 2x klein voor schroefjes/onderdelen, 2x middel voor tools, 2x groot voor combi-items. Vanaf €45.",
          },
          {
            headline: "Uitbreiding op maat",
            body: "Heb je later een specifieke maat nodig? Wij printen elke standaard-Gridfinity-grootte (1×1 t/m 6×6, alle hoogtes) plus magnetische bin-bases voor extra grip. Bestel los per stuk vanaf €3,50.",
          },
          {
            headline: "Materiaal",
            body: "PLA voor binnen-gebruik. PETG op aanvraag voor garage of werkplaats waar warmte een rol speelt. Standaardkleur grijs (matched het maker-aesthetic), op verzoek alle 30+ kleuren uit onze AMS-spool-collectie.",
          },
        ],
        productIds: [],
        ctaLabel: "Stel je Gridfinity-set samen",
        ctaHref: "/maatwerk",
      },
    ],
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
