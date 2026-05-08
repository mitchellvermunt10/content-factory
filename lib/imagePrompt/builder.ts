import type { Campaign } from "@/lib/schemas/campaign";
import { getVerticalPack } from "@/lib/verticals";
import { pickRecipe, getToneStyle } from "./recipes";

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
  openai: string; // for gpt-image-1 / Flux
  midjourney: string; // for MJ Discord — includes --ar etc.
  reasoning: {
    sourceVisual: string;
    cameraRecipe: string;
    toneStyle: string;
    moodFromCinematic: string;
    referenceFromCinematic: string;
    verticalDirection: string;
  };
}

export function buildImagePrompts(input: PromptInput): BuiltPrompts {
  const { campaign, artifactKey, itemIndex, hint } = input;

  const sourceVisual =
    hint && hint.trim().length > 0
      ? hint.trim()
      : extractSourceVisual(campaign, artifactKey, itemIndex) ?? "";

  const tone = campaign.brief.tone;
  const toneStyle = getToneStyle(tone);
  const recipe = pickRecipe(itemIndex);

  const cinematic = campaign.artifacts.cinematic;
  const mood = cinematic?.concept?.mood ?? "";
  const reference = cinematic?.concept?.referenceFilm ?? "";
  const grading = cinematic?.scenes?.[0]?.colorPalette ?? "";

  const pack = getVerticalPack(campaign.brief.businessType);
  // Pak twee meest relevante photoDirection-regels (eerste 2). Meer = clutter.
  const verticalPhoto = pack?.photoDirection?.slice(0, 2).join(". ") ?? "";

  const aspectMidjourney = aspectForArtifact(artifactKey);

  // === GPT-IMAGE-1 / FLUX PROMPT ===
  // Bouwwijze: source-visual leidt, daarna camera-spec, tone, brand-mood,
  // photographer-reference, anti-AI directives. Hierin GEEN "professional"
  // of "high-quality" — die woorden triggeren stock-AI look.

  const filmstockClause = recipe.filmstock
    ? `Shot on ${recipe.filmstock} captured with ${recipe.camera}, ${recipe.lens}, ${recipe.lighting}.`
    : `Shot on ${recipe.camera}, ${recipe.lens}, ${recipe.lighting}.`;

  const openaiPrompt = [
    sourceVisual,
    verticalPhoto,
    filmstockClause,
    toneStyle.openai,
    mood ? `Atmosphere: ${mood}.` : "",
    reference
      ? `In the visual tradition of ${reference} — observe the framing, restraint and quiet detail.`
      : "",
    grading ? `Color grade: ${grading}.` : "",
    // Anti-AI directives — forceer imperfectie en documentary-feel
    "Captured candidly. Asymmetric composition. Natural skin texture with pores and fine lines. Real materials and lived-in surfaces. Slight film grain.",
    "Not stock photography. Not advertising. Not commercial product shot. Editorial documentary feel — as if photographed for a quiet magazine.",
    "No text overlays. No logos. No watermarks. No frames. No signage.",
  ]
    .filter(Boolean)
    .join(" ");

  // === MIDJOURNEY PROMPT ===
  // MJ-syntax is anders: korter, komma-gescheiden, met flags. v6.1 + style raw
  // forceert photoreal. stylize 100 minimaliseert MJ's "bombast".

  const midjourneyParts = [
    sourceVisual,
    recipe.filmstock
      ? `${recipe.filmstock} on ${recipe.camera}`
      : `${recipe.camera}`,
    recipe.lens,
    recipe.lighting,
    toneStyle.midjourney,
    mood,
    reference ? `directorial style of ${reference}` : "",
    grading,
    verticalPhoto,
    "candid editorial, asymmetric, natural skin texture, real materials, slight grain",
  ]
    .filter((s) => s && s.trim().length > 0)
    .join(", ");

  const midjourneyPrompt = `${midjourneyParts} --ar ${aspectMidjourney} --style raw --v 6.1 --stylize 100`;

  return {
    openai: openaiPrompt,
    midjourney: midjourneyPrompt,
    reasoning: {
      sourceVisual,
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
