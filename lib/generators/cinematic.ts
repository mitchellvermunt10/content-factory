import { runJSON } from "@/lib/ai/runJSON";
import { describeBrief } from "@/lib/ai/briefContext";
import {
  CinematicCampaignSchema,
  type CinematicCampaign,
} from "@/lib/schemas/artifacts/cinematic";
import type { BusinessBrief } from "@/lib/schemas/brief";

const SCHEMA_HINT = `{
  "concept": {
    "logline": string 20-280,
    "brandPillar": string<=120,
    "mood": string<=140,
    "referenceFilm": string<=80,
    "totalDurationSec": number 15-120,
    "primaryAspectRatio": "16:9"|"9:16"|"1:1"|"21:9"|"4:5",
    "musicDirection": string<=180
  },
  "scenes": [ /* 3 - 6 scenes */
    {
      "id": "s01" (oplopend),
      "title": string<=60,
      "intent": "hook"|"tension"|"build"|"reveal"|"payoff"|"cta",
      "durationSec": number 1-30,
      "voiceOver": { "text": string<=420, "deliveryDirection": string<=140 },
      "onScreenText": string<=80 (optional),
      "cameraTreatment": string<=180,
      "lighting": string<=140,
      "colorPalette": string<=140,
      "soundDesign": string<=180,
      "transitionIn": "cut"|"match-cut"|"whip-pan"|"dissolve"|"fade-to-black"|"morph"|"speed-ramp"|"j-cut"|"l-cut"|"smash-cut",
      "transitionOut": same enum,
      "shots": [ /* 1-4 per scene */
        {
          "id": "s01-a" (a,b,c,d),
          "framing": "extreme-wide"|"wide"|"medium-wide"|"medium"|"medium-close"|"close-up"|"extreme-close-up"|"top-down"|"low-angle"|"high-angle"|"over-shoulder",
          "subject": string 4-120,
          "action": string 4-180,
          "durationSec": number 0.5-20,
          "cameraMovement": "static"|"pan"|"tilt"|"dolly-in"|"dolly-out"|"truck"|"zoom-in"|"zoom-out"|"whip-pan"|"crane"|"handheld"|"tracking"|"orbit",
          "lens": string<=40,
          "lighting": string<=140,
          "colorNote": string<=80,
          "imagePrompt": string 40-700,
          "videoPrompt": string 40-700
        }
      ]
    }
  ],
  "endCard": {
    "headline": string<=60,
    "subline": string<=120,
    "logoTreatment": string<=120,
    "callToAction": string<=40
  },
  "deliverables": {
    "masterCut": { "durationSec": number, "aspectRatio": <ratio enum> },
    "cutdowns": [
      { "name": string<=40, "durationSec": number, "aspectRatio": <ratio enum>, "note": string<=140 }
    ] (1-4)
  }
}`;

export async function generateCinematic(
  brief: BusinessBrief
): Promise<CinematicCampaign> {
  const user = `${describeBrief(brief)}

OPDRACHT
Schrijf een volledig cinematic merk-commercial voor dit bedrijf in het Nederlands. Denk Apple-launch × Sofia Coppola × premium boutique commercial.

EISEN
- Het concept moet ÉÉN scherpe logline hebben + één duidelijke "brandPillar".
- 4 of 5 scenes met duidelijke narratieve curve: hook → tension/build → ritueel/reveal → payoff/cta. Eindscene mag een end-card zijn.
- Elke scene heeft een lighting, colorPalette en soundDesign die expliciet anders zijn dan de andere scenes (er moet visuele en sonische progressie zijn).
- Per scene minstens 2 shots tenzij het een statische eindscene is.
- imagePrompt en videoPrompt zijn écht bruikbaar in Midjourney/Firefly resp. Runway/Kling/Veo. Gebruik concrete cinematografische taal: lensgrootte (24mm/35mm/50mm/85mm/100mm macro), film-grain, anamorphic, 24fps, kleurnotie, lichtsetup. Gebruik ENGELS in de prompts (de modellen werken beter zo) maar de rest van de output blijft Nederlands.
- Voice-over is in het Nederlands. Korte zinnen, lucht ertussen.
- Transitions zijn doordacht: niet alles 'cut', wissel met match-cut, dissolve, speed-ramp, fade-to-black.
- masterCut = 30s. cutdowns = minstens een 9:16 social cut + bumper.
- Geen platitudes. Geen 'ervaar de kracht van' clichés.`;

  return runJSON({
    schema: CinematicCampaignSchema,
    user,
    schemaHint: SCHEMA_HINT,
    maxTokens: 9000,
  });
}
