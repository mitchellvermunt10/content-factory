import type { LandingPage } from "@/lib/schemas/artifacts/landing";
import type { SeoCopy } from "@/lib/schemas/artifacts/seo";
import type { MetaAds } from "@/lib/schemas/artifacts/metaAds";
import type { InstagramContent } from "@/lib/schemas/artifacts/instagram";
import type { BusinessBrief } from "@/lib/schemas/brief";
import { BUSINESS_TYPES } from "@/lib/constants";

export function mockLanding(brief: BusinessBrief): LandingPage {
  const type = BUSINESS_TYPES.find((t) => t.value === brief.businessType);
  const label = type?.label ?? "bedrijf";

  return {
    hero: {
      eyebrow: `${label} · ${brief.city}`,
      headline: `${brief.name}. Een ritueel van licht en stilte.`,
      subheadline: `${brief.city}. Op afspraak, voor één persoon tegelijk. Geen lopende band, geen ruis — alleen tijd, vakmanschap en een moment dat blijft hangen.`,
      primaryCta: "Op afspraak",
      secondaryCta: "Lees ons verhaal",
    },
    marquee: [
      "Op afspraak",
      "Eén klant tegelijk",
      "Telefoon op stil",
      `Maison · ${brief.city}`,
      "Sinds 2018",
      "Atelier op afspraak",
    ],
    features: [
      {
        title: "Tijd als grondstof",
        description:
          "We werken met blokken van 60 of 90 minuten — niet 30. Alleen zo ontstaat ruimte voor een gesprek, een kop koffie, en de behandeling zelf.",
        icon: "✦",
      },
      {
        title: "Eén stem, één gezicht",
        description:
          "Geen wisselende handen. Je krijgt vanaf het eerste consult dezelfde specialist — wat je leerde over je huid blijft van toepassing.",
        icon: "◎",
      },
      {
        title: "Producten zonder compromis",
        description:
          "We werken met een select aantal merken die we zelf aandurven. Geen seizoens-trends. Geen affiliates.",
        icon: "△",
      },
    ],
    experience: {
      headline: "Een bezoek dat aanvoelt als een pauzeknop voor de week",
      body: "Je stapt binnen, je telefoon mag op stil. Een kop koffie, een tafel met linnen en messing. Een gesprek dat gaat over wat je echt zoekt, niet over wat we toevallig in voorraad hebben. En dan — eindelijk — werkt iemand een uur lang aan jou alleen. Geen achtergrondmuziek. Geen onderbrekingen. Geen haast.",
      bullets: [
        "Persoonlijk welkomstmoment met cortado en consult",
        "Stille ruimte met natuurlijk licht — geen muziek, geen schermen",
        "Behandelingen van 60 of 90 minuten, nooit korter",
        "Een vast gezicht voor élk bezoek",
        "Nazorg-protocol per e-mail, met persoonlijke notities",
      ],
    },
    testimonial: {
      quote:
        "Ik dacht dat ik kwam voor een behandeling. Ik kwam buiten met de eerste echte rust van het kwartaal.",
      author: "Eva de Wit",
      role: "Strategy director · vaste klant sinds 2022",
    },
    pricing: [
      {
        name: "Essentie",
        price: "€55",
        cadence: "vanaf",
        description: "Een korte, krachtige sessie voor wie even wil resetten.",
        features: ["30 minuten consult", "Standaard service", "Persoonlijk advies"],
        highlighted: false,
      },
      {
        name: "Signature",
        price: "€95",
        cadence: "vanaf",
        description: "Onze meest gekozen aanpak — uitgebreider, persoonlijker.",
        features: [
          "60 minuten",
          "Premium producten",
          "Diepgaand advies",
          "Nazorgplan",
        ],
        highlighted: true,
      },
      {
        name: "Atelier",
        price: "€165",
        cadence: "vanaf",
        description: "Voor wie het maximum eruit wil halen, zonder concessies.",
        features: [
          "90+ minuten",
          "Volledig op maat",
          "Toegang tot exclusieve lijn",
          "Vervolgsessie inbegrepen",
        ],
        highlighted: false,
      },
    ],
    faq: [
      {
        question: "Hoe maak ik een afspraak?",
        answer:
          "Online via deze pagina, telefonisch, of via WhatsApp. We bevestigen binnen een werkdag.",
      },
      {
        question: "Wat is het annuleringsbeleid?",
        answer:
          "Tot 24 uur van tevoren kosteloos verzetten. Bij latere annulering rekenen we 50% van het tarief.",
      },
      {
        question: "Werken jullie ook op afspraak buiten openingstijden?",
        answer:
          "Voor onze Atelier-klanten is dat in overleg mogelijk. Stuur ons gerust een bericht.",
      },
      {
        question: "Bieden jullie cadeaubonnen aan?",
        answer:
          "Ja — fysiek of digitaal, vanaf elk gewenst bedrag. Een mooie manier om iemand een pauze te schenken.",
      },
    ],
    cta: {
      headline: "Een uur voor jezelf, één keer per maand.",
      body: "Reserveer een eerste kennismaking. We bevestigen binnen één werkdag, en sturen een uitnodiging met een persoonlijk consult-formulier.",
      button: "Op afspraak",
    },
  };
}

export function mockSeo(brief: BusinessBrief): SeoCopy {
  const type = BUSINESS_TYPES.find((t) => t.value === brief.businessType);
  const label = type?.label.toLowerCase() ?? "bedrijf";
  const city = brief.city;

  return {
    metaTitle: `${brief.name} — ${label} in ${city} | Op afspraak`,
    metaDescription: `Premium ${label} in ${city}. Persoonlijk advies, doordachte service en zichtbaar resultaat. Plan vandaag nog je afspraak bij ${brief.name}.`,
    ogTitle: `${brief.name} · ${label} in ${city}`,
    ogDescription: `Een nieuwe standaard voor ${label} in ${city}. Boek nu.`,
    primaryKeyword: `${label} ${city.toLowerCase()}`,
    secondaryKeywords: [
      `${label} in de buurt`,
      `${label} centrum ${city.toLowerCase()}`,
      `beste ${label} ${city.toLowerCase()}`,
      `${label} op afspraak ${city.toLowerCase()}`,
      `premium ${label} ${city.toLowerCase()}`,
    ],
    longTailKeywords: [
      `wat kost een afspraak bij een ${label}`,
      `${label} ${city.toLowerCase()} reviews`,
      `boek een ${label} in ${city.toLowerCase()}`,
      `${label} ${city.toLowerCase()} zonder wachttijd`,
    ],
    headings: {
      h1: `${brief.name} — ${label} in ${city}`,
      h2s: [
        "Onze aanpak",
        "Behandelingen en services",
        "Wat klanten zeggen",
        "Tarieven en pakketten",
        "Veelgestelde vragen",
        "Locatie en contact",
      ],
    },
    faqSchema: [
      {
        question: `Waar zit ${brief.name} in ${city}?`,
        answer: `${brief.name} is gevestigd in ${city}. Het exacte adres en de routebeschrijving vind je onderaan de pagina.`,
      },
      {
        question: "Hoe lang van tevoren moet ik boeken?",
        answer:
          "We adviseren 1 à 2 weken vooruit te plannen, vooral voor avond- en zaterdagafspraken.",
      },
      {
        question: "Kan ik een afspraak verzetten?",
        answer:
          "Ja, tot 24 uur van tevoren kosteloos. Daarna rekenen we 50% van het tarief.",
      },
      {
        question: "Bieden jullie cadeaubonnen aan?",
        answer:
          "Zeker — digitaal of fysiek, vanaf elk gewenst bedrag, te besteden aan al onze diensten.",
      },
    ],
    imageAlts: [
      {
        context: "Hero",
        alt: `Interieur van ${brief.name} in ${city}, sfeervol en rustig verlicht.`,
      },
      {
        context: "Behandelruimte",
        alt: `Premium behandelruimte bij ${brief.name} ${city}, met focus op detail.`,
      },
      {
        context: "Team",
        alt: `Het team van ${brief.name} aan het werk in ${city}.`,
      },
      {
        context: "Producten",
        alt: `Productlijn die ${brief.name} gebruikt — premium kwaliteit.`,
      },
    ],
    localSchema: {
      businessType: label,
      description: `${brief.name} is een premium ${label} in ${city}. Persoonlijke aanpak, doordachte service, focus op resultaat.`,
      serviceArea: [city, "omgeving"],
    },
  };
}

export function mockMetaAds(brief: BusinessBrief): MetaAds {
  return {
    campaignObjective: "bookings",
    audienceTargeting: {
      description: `Vrouwen 30-50 in ${brief.city}-Zuid en omliggende premium-buurten — design-affiniteit, hoog discretionair budget, voorkeur voor afspraak boven walk-in. Aanvullend: tweede ring (35-55) voor cadeaubon-doelgroep.`,
      locations: [`${brief.city}-Zuid`, brief.city, "Amstelveen", "Aerdenhout"],
      ageRange: "30-55",
      interests: [
        "Aesop",
        "Hermès",
        "Slow living",
        "Editorial design",
        "The Cut Magazine",
        "Architectuur & interieur",
        "Premium wellness",
      ],
    },
    variants: [
      {
        hook: "Tot er één deur opent.",
        primaryText: `${brief.name} in ${brief.city}-Zuid. Op afspraak, voor één persoon tegelijk. Geen lopende band — wel iemand die luistert vóór ze adviseert.`,
        headline: `${brief.name}`,
        description: "Op afspraak. Altijd persoonlijk.",
        cta: "Boek nu",
        visualDirection:
          "Drempel-shot: hand op messing kruk, warm/koud licht-split, anamorphic flare.",
      },
      {
        hook: "Geen lopende band. Wel iemand die luistert.",
        primaryText: `60 of 90 minuten. Eén klant per blok. Een vast gezicht voor élk bezoek. Bij ${brief.name} draait niets om snelheid.`,
        headline: "Eén klant tegelijk.",
        description: "Stille ruimte · natuurlijk licht.",
        cta: "Plan afspraak",
        visualDirection: "Macro: handen leggen brass tools af op donker walnut. Side-light.",
      },
      {
        hook: "Een uur voor jezelf. Eén keer per maand.",
        primaryText: `Niet als luxe — als onderhoud. ${brief.name} is op afspraak; meestal twee weken vooruit volgeboekt. Reserveer het uur dat dít kwartaal redt.`,
        headline: "Onderhoud, geen luxe.",
        description: "60 min · op afspraak.",
        cta: "Plan afspraak",
        visualDirection:
          "Profielportret in halfschaduw, slow dolly-in, zacht raamlicht van rechts.",
      },
      {
        hook: "Stop met 5-sterren reviews lezen. Kom voelen.",
        primaryText: `${brief.name} doet geen voor-en-na. Geen aanbiedingen. Het werk spreekt twee weken later, in de spiegel. Plan een eerste afspraak.`,
        headline: "Voel het verschil.",
        description: "Op afspraak in hartje Zuid.",
        cta: "Boek nu",
        visualDirection:
          "Twilight wide van de gevel met silhouet die naar buiten stapt — Hermès-mood.",
      },
    ],
    storyAds: [
      {
        hook: "Tap voor de stilte.",
        body: `Eén tap opent de agenda van ${brief.name}. Drie open plekken deze week.`,
        sticker: "Poll: 'Volgens je agenda is hét moment: Deze week / Volgende maand'",
      },
      {
        hook: "Swipe up voor een vrij uur.",
        body: "Drie blokken open. Eerst komt eerst maalt.",
        sticker: "Aftellende countdown tot vrijdag.",
      },
      {
        hook: "Dit is hoe een dinsdag eruitziet.",
        body: "Géén voor-en-na. Wel één lange ademteug.",
        sticker: "Music: ambient piano, geen vocals.",
      },
    ],
  };
}

export function mockInstagram(brief: BusinessBrief): InstagramContent {
  const days = [
    "maandag",
    "dinsdag",
    "woensdag",
    "donderdag",
    "vrijdag",
    "zaterdag",
    "zondag",
  ] as const;

  return {
    bio: {
      headline: `${brief.name} · ${brief.city}`,
      body: "Persoonlijk. Doordacht. Op afspraak.",
      cta: "Boek je afspraak ↓",
    },
    pillars: [
      {
        name: "Achter de schermen",
        description:
          "Klein peeptje achter de schermen — handgreep, ritueel, het werk dat niet op de eindfoto staat.",
      },
      {
        name: "Klantverhalen",
        description:
          "Korte portretten van vaste klanten en wat ze waarderen aan onze aanpak.",
      },
      {
        name: "Expertise",
        description:
          "Tips, weetjes en verschilmakers — laagdrempelig, geen jargon.",
      },
      {
        name: "Sfeer",
        description: "Stilleven van de plek — licht, materiaal, ritme.",
      },
    ],
    posts: [
      {
        type: "carousel",
        hook: "Drie dingen die we anders doen.",
        caption:
          "Niet groter, niet sneller, wel beter. Een rustig welkom, een echt gesprek, en ruim de tijd voor het werk zelf. Swipe →",
        hashtags: [
          `#${brief.city.toLowerCase()}`,
          "#premium",
          "#onafspraak",
          "#localfavorite",
          "#vakmanschap",
          "#detail",
          "#lifestyle",
          "#nl",
        ],
        visualDirection:
          "Drie minimalistische slides met grote typografie en zachte achtergrondtinten.",
        cta: "Boek via link in bio",
      },
      {
        type: "reel",
        hook: "Het rustigste minuut van je dag.",
        caption: "Waarom haastig hoeft niet beter te zijn.",
        hashtags: [
          "#reels",
          "#asmr",
          `#${brief.city.toLowerCase()}`,
          "#wellness",
          "#premium",
          "#localbusiness",
        ],
        visualDirection: "Slow-mo close-up van handen, materiaal, en licht.",
        cta: "Bekijk meer in de stories",
      },
      {
        type: "foto",
        hook: "Stilleven, om 09:14.",
        caption: "Elke morgen begint zo. Ruimte. Licht. Klaar voor de eerste afspraak.",
        hashtags: [
          "#stilleven",
          "#interieur",
          `#${brief.city.toLowerCase()}`,
          "#detail",
          "#sfeer",
          "#onafspraak",
        ],
        visualDirection:
          "Eén still life: stoel, raamlicht, één detail van het werk in de hoek.",
        cta: "Meer in de feed",
      },
      {
        type: "carousel",
        hook: "Waarom 'op afspraak' beter werkt.",
        caption:
          "Geen wachtrij, geen ruis. Een uitleg in vijf slides waarom rustig plannen het verschil maakt.",
        hashtags: [
          "#tip",
          "#onafspraak",
          "#detail",
          `#${brief.city.toLowerCase()}`,
          "#premium",
          "#lokaal",
        ],
        visualDirection: "Clean carrousel, zwart-wit foto's afgewisseld met tekstslides.",
        cta: "Boek je tijdslot",
      },
      {
        type: "story",
        hook: "Vrije plek deze week?",
        caption: "Drie momenten open. Eerst komt eerst maalt.",
        hashtags: ["#stories", `#${brief.city.toLowerCase()}`, "#booknow", "#locals", "#openagenda", "#premium"],
        visualDirection: "Korte verticale clip met agenda overlay en swipe-up.",
        cta: "Tap om te boeken",
      },
      {
        type: "reel",
        hook: "Voor/na, zonder filter.",
        caption:
          "We laten het werk voor zich spreken. Onbewerkt licht, dezelfde camera, één take.",
        hashtags: [
          "#voorna",
          "#reels",
          "#vakmanschap",
          `#${brief.city.toLowerCase()}`,
          "#premium",
          "#real",
        ],
        visualDirection: "Twee shots, identieke compositie, één wipe-cut tussen ervoor en erna.",
        cta: "Boek via link in bio",
      },
      {
        type: "foto",
        hook: "Het team in 1 frame.",
        caption: "De mensen achter het werk. Eén foto, zeven jaar ervaring.",
        hashtags: [
          "#team",
          "#mensen",
          `#${brief.city.toLowerCase()}`,
          "#localbusiness",
          "#proud",
          "#vakmanschap",
        ],
        visualDirection: "Klassiek groepsportret in zwart-wit, vierkant.",
        cta: "Maak kennis",
      },
      {
        type: "carousel",
        hook: "Vijf vragen die we krijgen.",
        caption:
          "Van prijzen tot annuleringen — vijf antwoorden die we vaak geven, in één post.",
        hashtags: [
          "#faq",
          "#tip",
          `#${brief.city.toLowerCase()}`,
          "#onafspraak",
          "#premium",
          "#lokaal",
        ],
        visualDirection: "Tekstslides met grote typografie, één detailfoto tussendoor.",
        cta: "Meer info in de hoogtepunten",
      },
    ],
    reelIdeas: [
      {
        concept: "Een dag in 60 seconden.",
        hook: "Dit is hoe een dag bij ons eruitziet.",
        beats: [
          "07:30 — eerste licht in de zaak.",
          "09:14 — eerste klant arriveert, koffie.",
          "11:00 — handwerk in detail (slow-mo).",
          "13:30 — pauze, samen lunchen.",
          "17:45 — de zaak op slot, lampen uit.",
        ],
        soundDirection: "Ambient muziek, geen voice-over, alleen tekst-overlays.",
      },
      {
        concept: "ASMR-mini.",
        hook: "Het geluid van vakwerk.",
        beats: [
          "Close-up van handen.",
          "Geluid van een tool, schoongemaakt.",
          "Het materiaal raakt het oppervlak.",
          "Eindshot: voltooid resultaat in 1 frame.",
        ],
        soundDirection: "Geen muziek. Alleen veld-geluid. Boost low-frequencies.",
      },
      {
        concept: "Drie tips, drie shots.",
        hook: "Drie dingen die je thuis kunt doen.",
        beats: [
          "Tip 1 — uitgesproken in 5 woorden.",
          "Tip 2 — beeld eerst, tekst tweede.",
          "Tip 3 — sluit af met een knipoog naar de zaak.",
        ],
        soundDirection: "Trending muziek, lichte beat-cuts op woordeinde.",
      },
    ],
    weeklyPlan: [
      { day: days[0], type: "carousel", topic: "Welkom-week: drie dingen die we anders doen." },
      { day: days[1], type: "reel", topic: "Het rustigste minuut van je dag (ASMR)." },
      { day: days[2], type: "foto", topic: "Stilleven van het interieur." },
      { day: days[3], type: "story", topic: "Open plekken deze week." },
      { day: days[4], type: "reel", topic: "Voor/na, zonder filter." },
      { day: days[5], type: "foto", topic: "Team in zwart-wit." },
      { day: days[6], type: "carousel", topic: "5 veelgestelde vragen." },
    ],
  };
}
