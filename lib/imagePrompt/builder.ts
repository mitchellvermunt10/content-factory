import type { Campaign } from "@/lib/schemas/campaign";
import { getVerticalPack } from "@/lib/verticals";
import { pickRecipe, getToneStyle } from "./recipes";
import { translateToEnglish } from "./translate";

export type ArtifactKey =
  | "instagram"
  | "metaAds"
  | "metaAdsStory"
  | "cinematic"
  | "landingHero";

export interface PromptInput {
  campaign: Campaign;
  artifactKey: ArtifactKey;
  itemIndex: number | null;
  /**
   * Optional override of the source visual direction. If provided, gebruikt
   * deze ipv het visualDirection-veld uit het artifact.
   */
  hint?: string | null;
}

export interface BuiltPrompts {
  openai: string;
  midjourney: string;
  reasoning: {
    sourceVisual: string;
    sourceTranslated: string;
    cameraRecipe: string;
    toneStyle: string;
    moodFromCinematic: string;
    referenceFromCinematic: string;
    verticalDirection: string;
  };
}

export async function buildImagePrompts(
  input: PromptInput
): Promise<BuiltPrompts> {
  const { campaign, artifactKey, itemIndex, hint } = input;

  const rawSource =
    hint && hint.trim().length > 0
      ? hint.trim()
      : extractSourceVisual(campaign, artifactKey, itemIndex) ?? "";

  // Vertaal NL → EN voor sterkere subject-adherence in MJ + Flux + OpenAI.
  // Sonnet's NL visualDirection wordt door image-AI's lichter gewogen dan
  // Engels, waardoor style-clauses (in EN) het overnemen.
  const sourceTranslated = await translateToEnglish(rawSource);

  const tone = campaign.brief.tone;
  const toneStyle = getToneStyle(tone);
  const recipe = pickRecipe(itemIndex);

  const cinematic = campaign.artifacts.cinematic;
  const mood = cinematic?.concept?.mood ?? "";
  const reference = cinematic?.concept?.referenceFilm ?? "";
  const grading = cinematic?.scenes?.[0]?.colorPalette ?? "";

  const pack = getVerticalPack(campaign.brief.businessType);
  // Pak max 1 photoDirection-regel — meer = clutter dat subject overschaduwt
  const verticalPhoto = pack?.photoDirection?.[0] ?? "";

  const aspectMidjourney = aspectForArtifact(artifactKey);

  // === MIDJOURNEY PROMPT (subject-first met weights) ===
  // MJ leest komma-gescheiden en weegt eerste tokens zwaarder. Plus :: weights
  // forceren dat het onderwerp dominant blijft.
  // Belangrijk: minimum aan style-clauses — MJ's eigen --style raw + --stylize 100
  // doen al het werk. Te veel style-tekst overschaduwt subject.
  const filmStem = recipe.filmstock
    ? `${recipe.filmstock} on ${recipe.camera}, ${recipe.lens}`
    : `${recipe.camera}, ${recipe.lens}`;

  const midjourneyParts = [
    `${sourceTranslated}::3`, // SUBJECT — driedubbele weight
    `${filmStem}, ${recipe.lighting}`, // technical recipe
    toneStyle.midjourney, // ÉÉN tone-line
    "candid documentary, natural skin, asymmetric, slight grain", // anti-AI hint
  ]
    .filter((s) => s && s.trim().length > 0)
    .join(", ");

  const midjourneyPrompt = `${midjourneyParts} --ar ${aspectMidjourney} --style raw --v 6.1 --stylize 100`;

  // === GPT-IMAGE-1 / FLUX PROMPT (subject-first, hard sectie-grenzen) ===
  // gpt-image-1 + Flux nemen de hele tekst in zich op — we kunnen :: weights
  // niet gebruiken. Wel kunnen we structureren: SUBJECT eerst en expliciet
  // gemarkeerd, daarna pas style. Tweede helft kort houden.
  const filmstockClause = recipe.filmstock
    ? `Shot on ${recipe.filmstock}, ${recipe.camera}, ${recipe.lens}, ${recipe.lighting}.`
    : `Shot on ${recipe.camera}, ${recipe.lens}, ${recipe.lighting}.`;

  const openaiPrompt = [
    `SUBJECT (must be the focus): ${sourceTranslated}.`,
    verticalPhoto ? `Setting note: ${verticalPhoto}` : "",
    filmstockClause,
    toneStyle.openai,
    mood ? `Atmosphere: ${mood}.` : "",
    grading ? `Color: ${grading}.` : "",
    // Anti-AI directives compacter
    "Candid documentary feel. Asymmetric composition. Natural skin texture with pores. Slight film grain. NOT stock photography. NOT a fashion portrait — show the actual scene described above.",
    "No text. No logos. No watermarks.",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    openai: openaiPrompt,
    midjourney: midjourneyPrompt,
    reasoning: {
      sourceVisual: rawSource,
      sourceTranslated,
      cameraRecipe: `${recipe.camera} · ${recipe.lens} · ${recipe.lighting}${recipe.filmstock ? ` · ${recipe.filmstock}` : ""}`,
      toneStyle: toneStyle.openai,
      moodFromCinematic: mood,
      referenceFromCinematic: reference,
      verticalDirection: verticalPhoto,
    },
  };
}

function extractSourceVisual(
  campaign: Campaign,
  artifactKey: ArtifactKey,
  itemIndex: number | null
): string | null {
  if (artifactKey === "instagram" && itemIndex !== null) {
    return campaign.artifacts.instagram?.posts?.[itemIndex]?.visualDirection ?? null;
  }
  if (artifactKey === "metaAds" && itemIndex !== null) {
    return campaign.artifacts.metaAds?.variants?.[itemIndex]?.visualDirection ?? null;
  }
  if (artifactKey === "metaAdsStory" && itemIndex !== null) {
    const story = campaign.artifacts.metaAds?.storyAds?.[itemIndex];
    return story ? `${story.hook}. ${story.body}` : null;
  }
  if (artifactKey === "cinematic" && itemIndex !== null) {
    // Voor cinematic shots — itemIndex is de globale shot-index
    const allShots =
      campaign.artifacts.cinematic?.scenes?.flatMap((s) => s.shots) ?? [];
    const shot = allShots[itemIndex];
    if (!shot) return null;
    return `${shot.framing} of ${shot.subject}. ${shot.action}. Lighting: ${shot.lighting}. ${shot.colorNote}`;
  }
  if (artifactKey === "landingHero") {
    // Geen dedicated field — bouw uit hero-headline + cinematic mood
    const headline = campaign.artifacts.landing?.hero?.headline ?? "";
    const mood = campaign.artifacts.cinematic?.concept?.mood ?? "";
    if (!headline && !mood) return null;
    return `Visual hero image for ${campaign.brief.name} — evokes "${headline}". ${mood}`;
  }
  return null;
}

function aspectForArtifact(artifactKey: ArtifactKey): string {
  switch (artifactKey) {
    case "instagram":
      return "1:1";
    case "metaAds":
      return "1:1";
    case "metaAdsStory":
      return "9:16";
    case "cinematic":
      return "16:9";
    case "landingHero":
      return "16:9";
    default:
      return "1:1";
  }
}

export function aspectToOpenAISize(
  artifactKey: ArtifactKey
): "1024x1024" | "1024x1536" | "1536x1024" {
  switch (artifactKey) {
    case "instagram":
    case "metaAds":
      return "1024x1024";
    case "metaAdsStory":
      return "1024x1536";
    case "cinematic":
    case "landingHero":
      return "1536x1024";
    default:
      return "1024x1024";
  }
}
