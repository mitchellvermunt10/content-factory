// Public cases — gegenereerd via /studio/nieuw, daarna campaign-id hier
// invullen en pushen. /cases pagina rendert deze entries server-side.
// Een rij blijft verborgen zolang de id leeg is.

export type CaseEntry = {
  id: string; // campaign id van /c/[id], leeg = nog niet zichtbaar
  vertical: "salon" | "restaurant" | "autobedrijf";
  label: string;
  blurb: string;
  highlight: string; // korte tagline boven de case
};

export const CASES: CaseEntry[] = [
  {
    id: "", // ← vul in zodra Maison Lumière is gegenereerd
    vertical: "salon",
    label: "Maison Lumière",
    blurb: "Premium kapsalon in Amsterdam, luxueuze en rustige vibe.",
    highlight: "Van losse posts naar consistente brand-content in 7 minuten.",
  },
  {
    id: "", // ← Bistro Vlinder
    vertical: "restaurant",
    label: "Bistro Vlinder",
    blurb: "Buurtbistro in Utrecht — warm, seizoensgebonden, eerlijk.",
    highlight: "Wisselend menu — elke week verse content zonder schrijfwerk.",
  },
  {
    id: "", // ← GarageVerlinden
    vertical: "autobedrijf",
    label: "GarageVerlinden",
    blurb: "Familie-garage in Eindhoven — stoer, vakkundig, no-nonsense.",
    highlight: "Eerlijke positionering — geen prijs-race, wel autoriteit.",
  },
];

export function activeCases(): CaseEntry[] {
  return CASES.filter((c) => c.id.trim().length > 0);
}
