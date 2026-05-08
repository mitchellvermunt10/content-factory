import { runJSON } from "@/lib/ai/runJSON";
import { describeBrief } from "@/lib/ai/briefContext";
import { MetaAdsSchema, type MetaAds } from "@/lib/schemas/artifacts/metaAds";
import type { BusinessBrief } from "@/lib/schemas/brief";

const SCHEMA_HINT = `{
  "campaignObjective": "awareness" | "traffic" | "engagement" | "leads" | "sales" | "bookings",
  "audienceTargeting": {
    "description": string<=220,
    "locations": [string<=40] (1-5),
    "ageRange": string<=20,
    "interests": [string<=60] (3-8)
  },
  "variants": [
    {
      "hook": string<=60,
      "primaryText": string 40-280,
      "headline": string<=40,
      "description": string<=120,
      "cta": string 2-40 (korte 1-3 woord CTA, bijv. "Boek nu", "Reserveer", "Plan afspraak"),
      "visualDirection": string<=180
    }
  ] (3-4),
  "storyAds": [
    { "hook": string<=60, "body": string<=160, "sticker": string<=40 }
  ] (2-3)
}`;

  export async function generateMetaAds(
  brief: BusinessBrief
): Promise<MetaAds> {
  const user = `${describeBrief(brief)}

OPDRACHT
Schrijf een Meta Ads pakket (Facebook + Instagram) voor dit bedrijf, in het Nederlands.

EISEN
- Kies één campaignObjective dat past bij dit type bedrijf (bookings voor salons/kappers/tandartsen, leads voor diensten, sales voor cafés/restaurants, etc.).
- audienceTargeting: helder en realistisch voor dit type business + de stad/regio. interests zijn Meta-achtige interesses die werken voor lokale targeting.
- variants: 3 of 4 advertentievarianten voor A/B. Verschillende hooks (urgentie, sociale bewijs, ervaring, transformatie). primaryText voelt als IG/FB ad-copy: hapklaar, ritmisch, scrollstoppend.
- visualDirection: beschrijf 1 zin lang welk beeld erbij hoort (geen prompt, gewoon richting).
- storyAds: 9:16 verticaal — kort, punchy, met een idee voor een sticker/poll/swipe.
- Geen overdreven beloftes of medische claims (zeker niet bij tandarts).`;

  return runJSON({
    schema: MetaAdsSchema,
    user,
    schemaHint: SCHEMA_HINT,
    maxTokens: 3500,
    model: "claude-haiku-4-5-20251001",
  });
}
