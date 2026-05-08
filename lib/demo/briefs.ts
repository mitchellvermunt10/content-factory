import type { BusinessBrief } from "@/lib/schemas/brief";

export type DemoBrief = {
  id: string;
  label: string;
  vertical: string;
  blurb: string;
  brief: BusinessBrief;
};

// Drie zorgvuldig geschreven demo-briefs voor sales-showcases.
// Doel: laat in 3 minuten zien wat het systeem doet voor uiteenlopende branches.
// Elke brief is realistisch, in de stijl van échte ondernemers — geen template-taal.

export const DEMO_BRIEFS: DemoBrief[] = [
  {
    id: "demo-salon",
    label: "Maison Lumière",
    vertical: "Beauty salon",
    blurb: "Premium kapsalon in Amsterdam — luxueuze, rustige vibe.",
    brief: {
      businessType: "salon",
      name: "Maison Lumière",
      city: "Amsterdam",
      website: "https://maisonlumiere.example",
      phone: "+31 20 555 0182",
      usps: [
        "Specialist in balayage & kleurcorrectie — geschoold bij L'Oréal Parijs",
        "Maximaal 6 klanten per dag, geen lopende band",
        "Gratis intake-gesprek met espresso vóór elke nieuwe behandeling",
      ],
      tone: "luxueus",
      audience:
        "Vrouwen tussen 30 en 55 met een eigen praktijk, mkb-eigenaar of senior professional. Geven om eigen presentatie en hebben weinig tijd. Ze willen één plek waar ze niets hoeven uit te leggen — alleen ontspannen, en weggaan met haar dat klopt bij wie ze zijn.",
      offer:
        "Eerste afspraak: balayage + behandeling + foto-shoot voor €295 (normaal €395). Geldig in mei en juni — alleen voor nieuwe klanten.",
      brandColors: ["#1B1A18", "#E8E4DD", "#B89968"],
    },
  },
  {
    id: "demo-restaurant",
    label: "Bistro Vlinder",
    vertical: "Restaurant",
    blurb: "Buurtbistro in Utrecht — warm, seizoensgebonden, eerlijk.",
    brief: {
      businessType: "restaurant",
      name: "Bistro Vlinder",
      city: "Utrecht",
      website: "https://bistrovlinder.example",
      phone: "+31 30 555 0244",
      usps: [
        "Wekelijks wisselend menu op basis van wat de boer die week binnenbracht",
        "Open keuken — je ziet je gerecht ontstaan vanuit elke tafel",
        "Eigen sourdough en huisgemaakte pasta — geen leveranciers",
      ],
      tone: "warm",
      audience:
        "Stellen tussen 28 en 50 die uit eten gaan voor het verhaal achter een gerecht, niet voor de status. Veelal werkende ouders, foodies in stilte. Ze boeken graag zonder te bellen, lezen reviews voor ze gaan, en delen mooie avonden op Instagram zonder gepoch.",
      offer:
        "Maandagavond: 4-gangen seizoensmenu voor €42, inclusief glas natuurwijn. Reserveren via de site.",
      brandColors: ["#2C1F12", "#F4ECE0", "#C77D3E"],
    },
  },
  {
    id: "demo-autobedrijf",
    label: "GarageVerlinden",
    vertical: "Autobedrijf",
    blurb: "Familie-garage in Eindhoven — stoer, vakkundig, no-nonsense.",
    brief: {
      businessType: "autobedrijf",
      name: "GarageVerlinden",
      city: "Eindhoven",
      website: "https://garageverlinden.example",
      phone: "+31 40 555 0166",
      usps: [
        "Vaste prijsafspraak vooraf — geen verrassingen op de factuur",
        "Eigen merklozen werkplaats voor Audi, BMW en VW — diagnose binnen 24u",
        "Halen-en-brengen-service binnen Eindhoven, gratis vervangauto",
      ],
      tone: "stoer",
      audience:
        "Mannen en vrouwen tussen 35 en 60 die rijden voor hun werk of zaak en geen tijd kunnen verliezen aan onduidelijke facturen of dagen wachten. Ze willen iemand die hen aankijkt, eerlijk vertelt wat er moet gebeuren en de auto teruggeeft wanneer beloofd.",
      offer:
        "Grote beurt incl. APK + remmen-check voor €295 vaste prijs. Inclusief halen-brengen binnen Eindhoven en vervangauto.",
      brandColors: ["#0E0E0E", "#E5E2DC", "#C0392B"],
    },
  },
];
