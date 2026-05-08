// Design themes — bundels van typografie, layout-patronen en decoratie-elementen.
// Elke gegenereerde landing-page kiest één thema (gestuurd door tone + vertical).
// Doel: identieke schema-structuur kan VISUEEL totaal anders ogen per klant.

export type DesignStyle =
  | "editorial-luxe"
  | "minimal-bold"
  | "warm-documentary"
  | "clinical-precise"
  | "playful-vibrant";

export interface DesignTokens {
  id: DesignStyle;
  label: string;
  description: string;

  // Typografie
  fontHeading: string; // CSS font-family stack
  fontBody: string;
  headingWeight: 300 | 400 | 500 | 600 | 700;
  letterSpacing: "tight" | "normal" | "loose";
  letterSpacingValue: string; // CSS letter-spacing

  // Layout
  heroLayout: "centered" | "split-image" | "asymmetric" | "stacked-tall";
  containerMaxWidth: string; // bijv. "1200px" of "920px"
  sectionSpacing: "tight" | "comfortable" | "spacious";
  sectionSpacingValue: string; // CSS rem

  // Vorm-taal
  cornerRadius: "sharp" | "subtle" | "rounded" | "pillowed";
  cornerRadiusValue: string; // CSS rem

  // Decoratie
  decorPattern: "none" | "gradient-mesh" | "grid-lines" | "noise" | "ornamental";
  accentPlacement: "subtle" | "moderate" | "dominant"; // hoe sterk brand-color de page domineert

  // Imagery treatment
  imageStyle: "full-bleed" | "framed" | "masked-shape" | "polaroid" | "split";

  // Hint voor heroPreview tekst-stijlen
  heroHeadlineSize: "compact" | "normal" | "oversized";
  heroToneClass: string; // CSS class-name voor toon
}

export const DESIGN_THEMES: Record<DesignStyle, DesignTokens> = {
  "editorial-luxe": {
    id: "editorial-luxe",
    label: "Editorial Luxe",
    description: "Tijdschrift-stijl, fluweelzacht, marmer-kleuren. Voor luxueuze merken.",
    fontHeading: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
    fontBody: "'Inter', -apple-system, sans-serif",
    headingWeight: 400,
    letterSpacing: "normal",
    letterSpacingValue: "-0.01em",
    heroLayout: "asymmetric",
    containerMaxWidth: "1200px",
    sectionSpacing: "spacious",
    sectionSpacingValue: "8rem",
    cornerRadius: "subtle",
    cornerRadiusValue: "4px",
    decorPattern: "ornamental",
    accentPlacement: "subtle",
    imageStyle: "full-bleed",
    heroHeadlineSize: "oversized",
    heroToneClass: "italic",
  },
  "minimal-bold": {
    id: "minimal-bold",
    label: "Minimal Bold",
    description: "Strakke geometrie, monochroom + één accent, oversized typografie. Voor moderne merken.",
    fontHeading: "'Geist', 'Inter', system-ui, sans-serif",
    fontBody: "'Geist', -apple-system, sans-serif",
    headingWeight: 600,
    letterSpacing: "tight",
    letterSpacingValue: "-0.04em",
    heroLayout: "stacked-tall",
    containerMaxWidth: "1100px",
    sectionSpacing: "comfortable",
    sectionSpacingValue: "6rem",
    cornerRadius: "sharp",
    cornerRadiusValue: "0",
    decorPattern: "grid-lines",
    accentPlacement: "moderate",
    imageStyle: "framed",
    heroHeadlineSize: "oversized",
    heroToneClass: "uppercase",
  },
  "warm-documentary": {
    id: "warm-documentary",
    label: "Warm Documentary",
    description: "Honingtonen, hand-getekende elementen, intieme close-ups. Voor familiebedrijven en horeca.",
    fontHeading: "'Crimson Pro', Georgia, serif",
    fontBody: "'Inter', sans-serif",
    headingWeight: 500,
    letterSpacing: "normal",
    letterSpacingValue: "-0.005em",
    heroLayout: "split-image",
    containerMaxWidth: "1100px",
    sectionSpacing: "comfortable",
    sectionSpacingValue: "5rem",
    cornerRadius: "rounded",
    cornerRadiusValue: "12px",
    decorPattern: "noise",
    accentPlacement: "moderate",
    imageStyle: "polaroid",
    heroHeadlineSize: "normal",
    heroToneClass: "",
  },
  "clinical-precise": {
    id: "clinical-precise",
    label: "Clinical Precise",
    description: "Helder, hygienisch, koel licht. Voor zorg en zakelijke services.",
    fontHeading: "'Inter', system-ui, sans-serif",
    fontBody: "'Inter', sans-serif",
    headingWeight: 500,
    letterSpacing: "tight",
    letterSpacingValue: "-0.02em",
    heroLayout: "split-image",
    containerMaxWidth: "1080px",
    sectionSpacing: "comfortable",
    sectionSpacingValue: "5rem",
    cornerRadius: "subtle",
    cornerRadiusValue: "8px",
    decorPattern: "none",
    accentPlacement: "subtle",
    imageStyle: "framed",
    heroHeadlineSize: "compact",
    heroToneClass: "",
  },
  "playful-vibrant": {
    id: "playful-vibrant",
    label: "Playful Vibrant",
    description: "Bold colors, ronde vormen, speelse details. Voor lifestyle en hospitality.",
    fontHeading: "'Geist', system-ui, sans-serif",
    fontBody: "'Geist', sans-serif",
    headingWeight: 700,
    letterSpacing: "tight",
    letterSpacingValue: "-0.03em",
    heroLayout: "centered",
    containerMaxWidth: "1100px",
    sectionSpacing: "comfortable",
    sectionSpacingValue: "5rem",
    cornerRadius: "pillowed",
    cornerRadiusValue: "24px",
    decorPattern: "gradient-mesh",
    accentPlacement: "dominant",
    imageStyle: "masked-shape",
    heroHeadlineSize: "normal",
    heroToneClass: "",
  },
};

// Smart-default mapping: tone + vertical → designStyle suggestion
export function suggestDesignStyle(
  tone: string,
  vertical: string
): DesignStyle {
  // Vertical-overrides eerst (tandarts wint altijd clinical-precise)
  if (vertical === "dentist") return "clinical-precise";
  if (vertical === "tattoo") return "minimal-bold";
  if (vertical === "barber") return "minimal-bold";
  if (vertical === "gym") return "minimal-bold";

  // Daarna tone-mapping
  const byTone: Record<string, DesignStyle> = {
    luxueus: "editorial-luxe",
    minimal: "minimal-bold",
    warm: "warm-documentary",
    klinisch: "clinical-precise",
    speels: "playful-vibrant",
    stoer: "minimal-bold",
  };
  return byTone[tone] ?? "warm-documentary";
}

export function getTheme(style: DesignStyle): DesignTokens {
  return DESIGN_THEMES[style] ?? DESIGN_THEMES["warm-documentary"];
}
