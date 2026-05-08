// Camera-recipe pool. We rouleren per item-index zodat 6 Instagram-posts
// niet dezelfde 35mm-prime-shallow-DOF look krijgen — variatie is cruciaal
// om "AI generic editorial" te ontwijken.

export type CameraRecipe = {
  camera: string;
  lens: string;
  lighting: string;
  filmstock?: string;
  intent: string; // wat dit recept goed doet
};

export const CAMERA_RECIPES: CameraRecipe[] = [
  {
    camera: "Hasselblad H6D-100c",
    lens: "80mm f/2.8 medium format lens",
    lighting: "soft daylight from a tall north-facing window, no fill",
    intent: "high-end editorial portrait — slight lens compression, painterly skin",
  },
  {
    camera: "Leica M11",
    lens: "35mm Summilux f/1.4 wide aperture",
    lighting: "available afternoon light, deep shadow on opposite cheek",
    intent: "intimate, off-the-cuff documentary feel",
  },
  {
    camera: "Phase One IQ4 150MP",
    lens: "55mm Schneider Kreuznach prime",
    lighting: "overcast daylight, very soft, no direct sun",
    intent: "razor-sharp commercial detail, cool fashion editorial",
  },
  {
    camera: "Mamiya RZ67 medium format film camera",
    lens: "110mm f/2.8 lens",
    lighting: "open shade with a single bounced reflector, warm tones",
    filmstock: "Kodak Portra 400 35mm film, scanned",
    intent: "lived-in film grain, organic skin tones, slight halation",
  },
  {
    camera: "Canon EOS R5 mirrorless",
    lens: "85mm f/1.2 RF portrait lens",
    lighting: "golden hour rim-light from behind subject, warm key on the front",
    intent: "cinematic warmth, separation between subject and background",
  },
  {
    camera: "Pentax 67 medium format",
    lens: "105mm f/2.4 lens",
    lighting: "single hard window light at 45 degrees, dramatic falloff",
    filmstock: "Cinestill 800T tungsten film",
    intent: "moody, slight grain, dramatic chiaroscuro",
  },
];

export function pickRecipe(itemIndex: number | null): CameraRecipe {
  const idx = (itemIndex ?? 0) % CAMERA_RECIPES.length;
  return CAMERA_RECIPES[idx];
}

// Tone-driven visual styles. Vertaalt brief.tone naar concrete visuele cues.
// Geen abstractie — direct bruikbare prompt-fragmenten.

export type ToneStyle = {
  openai: string;
  midjourney: string;
};

export const TONE_STYLES: Record<string, ToneStyle> = {
  luxueus: {
    openai:
      "Style: refined, hushed elegance. Marble surfaces, silk and brushed metal, deep shadows. Muted palette of bone white, cognac, deep charcoal. Slow, deliberate composition.",
    midjourney:
      "luxury editorial, marble surfaces, silk and brushed metal, hushed light, muted bone-and-cognac palette, slow deliberate composition",
  },
  speels: {
    openai:
      "Style: bright daylight, vivid but harmonious colors, slight motion blur on hands or clothing, candid energy, smiles caught mid-laugh.",
    midjourney:
      "vibrant lifestyle editorial, candid motion, bright natural light, harmonious primary colors, smiles mid-laugh",
  },
  klinisch: {
    openai:
      "Style: clean and hygienic. Soft cool daylight, white and cool grey surfaces, precise geometric composition, calm and trustworthy. Skin tones natural, never plastic.",
    midjourney:
      "clean clinical aesthetic, soft cool daylight, white and cool grey surfaces, precise geometric composition, natural skin",
  },
  stoer: {
    openai:
      "Style: hard contrast, raw materials. Black, deep tan, weathered metal. Dramatic single-source shadow, low angle, masculine confidence. Surfaces show wear.",
    midjourney:
      "raw masculine editorial, hard contrast, dramatic single-source shadow, low angle, weathered metal and leather, surfaces show wear",
  },
  warm: {
    openai:
      "Style: honey-tinted afternoon light, wooden surfaces, hands of older generations, intimate close-ups, lived-in textures, soft fabric drapes.",
    midjourney:
      "warm intimate documentary, honey afternoon light, wood and aged textures, family hands, lived-in domestic detail",
  },
  minimal: {
    openai:
      "Style: large negative space, single isolated subject, geometric composition, monochrome palette with one accent color, no clutter.",
    midjourney:
      "minimalist editorial, large negative space, single isolated subject, geometric composition, monochrome with single accent",
  },
};

export function getToneStyle(tone: string): ToneStyle {
  return TONE_STYLES[tone] ?? TONE_STYLES.warm;
}
