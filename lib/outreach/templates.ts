export type OutreachTemplate = {
  id: string;
  channel: "email" | "linkedin" | "whatsapp";
  vertical: "salon" | "restaurant" | "autobedrijf" | "any";
  step: 1 | 2 | 3 | 4;
  delayDays: number;
  subject?: string;
  body: string;
  rationale: string;
};

// Outreach-sequence per vertical. Stap 1 = openening, 2 = soft-followup,
// 3 = case-driven follow-up, 4 = breakup.
// Tone is kort, persoonlijk, geen "ik wil graag een 30 min meeting" cliché.

export const OUTREACH_SEQUENCES: OutreachTemplate[] = [
  // ───── SALON: stap 1
  {
    id: "salon-email-1",
    channel: "email",
    vertical: "salon",
    step: 1,
    delayDays: 0,
    subject: "Maandagvraag voor {{name}}",
    body: `Hi {{firstName}},

Ik kwam jullie Instagram tegen — die balayage-shoot van vorige week is mooi werk. Vraag waar ik even mee speel: hebben jullie een vaste flow voor de tussenliggende posts? Of doe je dat zelf op de gok wanneer er tijd is?

Reden dat ik vraag: ik bouw voor mkb-salons in NL een systeem dat in 7 minuten alle content voor de maand klaarmaakt — Insta, ads, een paar reels. Klaar om te plaatsen, in jullie eigen toon.

Als je 'm wil zien voor {{businessName}}: stuur ik je gerust een mock zonder gedoe.

Mitchell`,
    rationale: "Specifiek compliment + open vraag zonder pitch. Werkt op nieuwsgierigheid.",
  },

  // ───── SALON: stap 2 (soft follow-up na 4 dagen)
  {
    id: "salon-email-2",
    channel: "email",
    vertical: "salon",
    step: 2,
    delayDays: 4,
    subject: "Re: Maandagvraag voor {{name}}",
    body: `Voor de duidelijkheid — ik wil je geen abonnement opzwemmen voor je het hebt gezien. Dit is wat ik bedoel:

→ {{exampleUrl}}

Dit is een fictieve salon (Maison Lumière, Amsterdam) waar ik in 7 minuten dit volledige pakket op heb gebouwd. Voor jou zou het het kunnen vervangen wat je nu in losse uurtjes per week aan content stopt.

Tot zo'n 30 sec laten zien als je nieuwsgierig bent?

Mitchell`,
    rationale: "Geef ze een voorbeeld om te zien voor je iets vraagt. Verlaagt drempel.",
  },

  // ───── SALON: stap 3 (case-driven na 7 dagen)
  {
    id: "salon-email-3",
    channel: "email",
    vertical: "salon",
    step: 3,
    delayDays: 11,
    subject: "Eén klant, één maand later",
    body: `Hi {{firstName}},

Ik weet dat dit het tweede berichtje is. Snap als je geen interesse hebt — laat het me weten en ik stop.

Eén voorbeeld waarom ik 'm aanbiedt: een kapsalon waar ik vorige maand mee startte zegt nu hun Instagram-engagement is 3.2x. Geen wonder — ze posten nu 4 keer per week in plaats van 1× per 2 weken.

Het verschil: ze hoeven niets te schrijven. Ze pakken alleen de telefoon en plaatsen het.

Wil je dezelfde maand-output zien voor {{businessName}}?

Mitchell`,
    rationale: "Concreet getal + sociale bewijskracht. Vermijd generieke 'engagement up' klein letters.",
  },

  // ───── SALON: stap 4 (breakup na 14 dagen)
  {
    id: "salon-email-4",
    channel: "email",
    vertical: "salon",
    step: 4,
    delayDays: 14,
    subject: "Laatste — sluit ik 'm",
    body: `Hi {{firstName}},

Geen reactie betekent meestal "geen tijd", niet "geen interesse". Dat snap ik.

Ik archiveer 'm. Mocht je over een tijdje denken aan content-uitbesteding: ik ben er en het systeem is hetzelfde — alleen de wachtlijst niet.

Mitchell`,
    rationale: "Breakup-mail haalt vaak nog 8-12% reply-rate op. Eerlijk en zonder druk.",
  },

  // ───── LINKEDIN salon
  {
    id: "salon-linkedin-1",
    channel: "linkedin",
    vertical: "salon",
    step: 1,
    delayDays: 0,
    body: `Hi {{firstName}}, jullie balayage-werk komt door op mijn feed — vooral het werk met dimensional brunette. Vraag: wie schrijft jullie social-content? Iemand intern of pak je het zelf op?

(Achtergrond: ik bouw voor NL-salons een tool die in een paar minuten een maand aan posts + ads klaarmaakt. Vroeg me af of je daar al iets voor hebt.)`,
    rationale: "Vakspecifieke trefwoord ('dimensional brunette') laat zien dat je oplet. Geen verkooptaal.",
  },

  // ───── RESTAURANT stap 1
  {
    id: "restaurant-email-1",
    channel: "email",
    vertical: "restaurant",
    step: 1,
    delayDays: 0,
    subject: "Vrijdag-vraag",
    body: `Hi {{firstName}},

Las jullie menu van de week — die geroosterde witlof met vergeten-knol-aardappel maakte me nieuwsgierig. Wie schrijft jullie menu-omschrijvingen?

Reden dat ik vraag: ik help restaurants als {{businessName}} de schrijf-uren rond menukaart, social en mailings te halveren. Niet AI-automatisch — meer als een vaste creatieve hand op afroep.

Geen pitch nodig. Heb je 5 min volgende week voor een korte call?

Mitchell`,
    rationale: "Toon dat je het menu echt hebt gelezen. Restaurants gunnen werk aan wie ze ZIET.",
  },

  // ───── AUTOBEDRIJF stap 1
  {
    id: "autobedrijf-email-1",
    channel: "email",
    vertical: "autobedrijf",
    step: 1,
    delayDays: 0,
    subject: "Korte vraag over jullie occasions-pagina",
    body: `Hi {{firstName}},

Snel iets opgevallen op jullie occasions-pagina: jullie schrijven niets over hoe je controleert vóór doorverkoop. Jullie doen vast meer dan klanten zien — krijg je daar genoeg krediet voor?

Reden van vraag: ik schrijf voor een paar autobedrijven hun website en advertenties. Concreet: vaste prijsafspraak vooraf, halen-brengen-service — díe dingen aan de voorkant zetten zodat je niet altijd op prijs hoeft te concurreren.

Heb je 10 min volgende week?

Mitchell`,
    rationale: "Identificeer een specifiek gat in hun communicatie. Auto-bedrijven worden bijna nooit op deze manier benaderd.",
  },

  // ───── ANY: WhatsApp follow-up na meeting (warm)
  {
    id: "any-whatsapp-followup",
    channel: "whatsapp",
    vertical: "any",
    step: 2,
    delayDays: 1,
    body: `Hi {{firstName}}, gisteren goede call. Zoals beloofd hier de demo-link voor {{businessName}}:

{{demoUrl}}

Bekijk hem op je gemak — ik bel je donderdag rond 15:00 om te horen wat je ervan vond. Schikt dat?`,
    rationale: "WhatsApp is hoge-respons-kanaal voor warme leads. Concreet bel-moment voorstellen werkt.",
  },
];

// ICP — wie target je per vertical.
export type ICP = {
  vertical: "salon" | "restaurant" | "autobedrijf";
  label: string;
  size: string;
  signals: string[];
  redflags: string[];
  channels: string[];
};

export const ICP_PROFILES: ICP[] = [
  {
    vertical: "salon",
    label: "Premium salon, eigenaar-stylist",
    size: "1-3 stylisten, 1 locatie, €150K-€400K omzet",
    signals: [
      "Eigen domein (geen Treatwell-only)",
      "Instagram >1K volgers, posten <2× per week",
      "Prijslijst niet zichtbaar — service-georiënteerd",
      "Eigenaar zelf actief op LinkedIn (zeldzaam, kans)",
      "Verwijzen naar specifieke producten (Davines, Olaplex)",
    ],
    redflags: [
      "Salonketen met meer dan 5 vestigingen (centraal marketing)",
      "Goedkoop-positionering (knip €17,50)",
      "Geen eigen website — alleen Treatwell of Facebook",
    ],
    channels: ["LinkedIn DM (eigenaar)", "Email (info@)", "Walk-in een keer"],
  },
  {
    vertical: "restaurant",
    label: "Buurtrestaurant, owner-chef",
    size: "30-80 plaatsen, 2-3 servers, €400K-€900K omzet",
    signals: [
      "Wisselend menu of seizoensgebonden",
      "Reviews 4.5+ op Google met zin-rijke comments (niet alleen sterren)",
      "Eigen reservatie-systeem (geen TheFork-only)",
      "Wijn op de kaart met verhaal",
      "Eigenaar staat in keuken of front",
    ],
    redflags: [
      "Ketens (Vapiano, La Place)",
      "Lunchroom met simpele kaart en geen verhaal",
      "TheFork-only zonder eigen domein",
    ],
    channels: ["Email", "Persoonlijke binnenkomst (lunch)", "LinkedIn moeilijk hier"],
  },
  {
    vertical: "autobedrijf",
    label: "Specialist garage, merkgericht",
    size: "5-15 medewerkers, 1 locatie, €1M-€3M omzet",
    signals: [
      "Specialisatie (BMW/VW/Audi groep)",
      "Eigen website met blog of nieuws-sectie",
      "Halen-brengen-service of vervangauto vermeldt",
      "Reviews >50 met inhoudelijke comments",
    ],
    redflags: [
      "Universeel — concurreert op prijs",
      "Tweedehands-only zonder werkplaats",
      "Franchises (Bovag-keten)",
    ],
    channels: ["Email", "LinkedIn DM eigenaar", "Direct mail (ouderwets, werkt)"],
  },
];

export const TOOLS = [
  {
    name: "Instantly.ai",
    role: "Email-automation",
    monthly: "$37/mnd",
    why: "Inbox-rotation, warmup, scheduled sequences. Geschikt vanaf 1 inbox.",
    url: "https://instantly.ai",
  },
  {
    name: "Lemlist",
    role: "Multi-channel sequence (email + LinkedIn)",
    monthly: "$59/mnd",
    why: "Zwaarder maar combineert email + LinkedIn in één flow.",
    url: "https://lemlist.com",
  },
  {
    name: "Apollo.io",
    role: "Lead-data + email finder",
    monthly: "$49/mnd",
    why: "NL bedrijven beperkt — werkt voor email-finden, niet voor brede prospecting.",
    url: "https://apollo.io",
  },
  {
    name: "Hunter.io",
    role: "Email finder",
    monthly: "$34/mnd",
    why: "Gratis tier voor 25 emails/mnd — genoeg om te starten.",
    url: "https://hunter.io",
  },
  {
    name: "KvK Open Data",
    role: "NL bedrijven-database (gratis)",
    monthly: "gratis",
    why: "Eigenaar-namen + KvK-nummers voor direct vinden — open data, geen tool.",
    url: "https://www.kvk.nl/over-de-kvk/handelsregister/open-data/",
  },
];
