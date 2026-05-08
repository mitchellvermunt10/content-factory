import { runJSON } from "@/lib/ai/runJSON";
import { describeBrief } from "@/lib/ai/briefContext";
import {
  PromptPacksSchema,
  type PromptPacks,
} from "@/lib/schemas/artifacts/promptPacks";
import type { BusinessBrief } from "@/lib/schemas/brief";

const SCHEMA_HINT = `{
  "globalStyle": {
    "moodboard": string<=220,
    "colorScript": string<=180,
    "grading": string<=140,
    "lensing": string<=120
  },
  "imagePack": {
    "style": string<=180,
    "prompts": [
      {
        "id": string (img-01..),
        "context": string<=80,
        "midjourney": string 40-700,
        "firefly": string 40-700,
        "negative": string<=280 (optional),
        "aspectRatio": "16:9"|"9:16"|"1:1"|"21:9"|"4:5"|"3:2",
        "styleNote": string<=140
      }
    ] (5-8)
  },
  "videoPack": {
    "style": string<=180,
    "prompts": [
      {
        "id": string (vid-01..),
        "context": string<=80,
        "runway": string 40-700,
        "kling":  string 40-700,
        "veo":    string 40-700,
        "durationSec": number 2-12,
        "cameraMove": string<=80,
        "aspectRatio": "16:9"|"9:16"|"1:1"|"21:9"|"4:5"
      }
    ] (4-8)
  },
  "bRollPack": {
    "style": string<=180,
    "items": [
      {
        "id": string (broll-01..),
        "topic": string<=80,
        "framing": string<=60,
        "durationSec": number 1-8,
        "prompt": string 40-500,
        "useCase": string<=140
      }
    ] (4-8)
  }
}`;

export async function generatePromptPacks(
  brief: BusinessBrief
): Promise<PromptPacks> {
  const user = `${describeBrief(brief, { includeVisualDirection: true })}

OPDRACHT
Schrijf complete AI prompt-pakketten voor dit bedrijf — beeld én bewegend beeld.

EISEN
- globalStyle bepaalt de visuele lijn (moodboard, color script over tijd, grading/film-emulation, lens-keuzes).
- imagePack: 5-8 prompts. Elk MET een Midjourney-versie EN een Firefly-versie. Beide volledig bruikbaar (Engels, met --ar / aspect ratio en --style raw indien Midjourney). Optionele negative prompt. Verschillende aspect ratios.
- videoPack: 4-6 prompts. Elk MET aparte Runway, Kling en Veo versies (Engels). Elk model krijgt een prompt die in zijn eigen stijl is geschreven (Runway = compact + descriptief, Kling = beat per beat, Veo = naturalistisch + cinematic taal). Vermeld duration en camera move.
- bRollPack: 4-6 detail clips, korte naturalistische inserts (handen, materiaal, licht, voetstappen).
- Houd het PASSEND bij dit bedrijf — geen generieke 'commercial'-cliché. Verwijs naar de stad, het type interieur, het werk dat hier gebeurt.
- Prompts in het ENGELS. Nederlands voor 'context', 'styleNote', 'useCase' enz.
- Vermijd merken en bestaande gezichten in prompts.`;

  return runJSON({
    schema: PromptPacksSchema,
    user,
    schemaHint: SCHEMA_HINT,
    maxTokens: 12000,
  });
}
