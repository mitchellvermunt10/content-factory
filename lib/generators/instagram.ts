import { runJSON } from "@/lib/ai/runJSON";
import { describeBrief } from "@/lib/ai/briefContext";
import {
  InstagramContentSchema,
  type InstagramContent,
} from "@/lib/schemas/artifacts/instagram";
import type { BusinessBrief } from "@/lib/schemas/brief";

const SCHEMA_HINT = `{
  "bio": { "headline": string<=50, "body": string<=140, "cta": string<=40 },
  "pillars": [ { "name": string<=40, "description": string<=140 } ] (3-4),
  "posts": [
    {
      "type": "foto" | "carousel" | "reel" | "story",
      "hook": string<=80,
      "caption": string 40-500,
      "hashtags": [string<=40] (6-12),
      "visualDirection": string<=220,
      "cta": string<=60
    }
  ] (exactly 8),
  "reelIdeas": [
    { "concept": string<=80, "hook": string<=80, "beats": [string<=140] (3-5), "soundDirection": string<=120 }
  ] (3-5),
  "weeklyPlan": [
    { "day": "maandag"|"dinsdag"|"woensdag"|"donderdag"|"vrijdag"|"zaterdag"|"zondag", "type": "foto"|"carousel"|"reel"|"story", "topic": string<=80 }
  ] (exactly 7, één per dag, in volgorde)
}`;

export async function generateInstagramContent(
  brief: BusinessBrief
): Promise<InstagramContent> {
  const user = `${describeBrief(brief)}

OPDRACHT
Schrijf de Instagram content kit voor dit bedrijf, in het Nederlands.

EISEN
- bio: bondig, met haakje en duidelijke CTA (bijv. "Boek je afspraak ↓").
- pillars: 3 of 4 contentpijlers die de hele kalender voeden (bijv. behind-the-scenes, klantverhalen, expertise, lifestyle).
- 8 posts: variatie in types. Captions zijn niet generiek — ze openen met een hook, hebben ritme, en eindigen met een CTA. Hashtags zijn een mix van breed/medium/niche en lokaal (bijv. #amsterdam).
- reelIdeas: 3-5 sterke concepten met hook + 3-5 beats (de shots/zinnen achter elkaar) + suggestie van geluid/trend.
- weeklyPlan: één post per dag, in vaste volgorde maandag→zondag, met diversiteit in formats.
- Stem de toon af op de gekozen tone of voice.`;

  return runJSON({
    schema: InstagramContentSchema,
    user,
    schemaHint: SCHEMA_HINT,
    maxTokens: 6000,
    model: "claude-haiku-4-5-20251001",
  });
}
