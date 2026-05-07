import { runJSON } from "@/lib/ai/runJSON";
import { describeBrief } from "@/lib/ai/briefContext";
import {
  SocialShortsSchema,
  type SocialShorts,
} from "@/lib/schemas/artifacts/socialShorts";
import type { BusinessBrief } from "@/lib/schemas/brief";

const SCHEMA_HINT = `{
  "formats": {
    "reel":         { "durationSec": 7-90, "hook": string 8-120, "beats": [ { "timecode": "MM:SS or SS:FF", "shot": <=120, "vo": <=180, "onScreenText": <=60 } ] (3-8), "cta": <=60, "soundDirection": <=180, "captionsStyle": <=140, "loopOpportunity": <=140 },
    "tiktok":       same shape,
    "youtubeShort": same shape
  },
  "hookBank": {
    "curiosity":  [ { "text": 6-120, "type": "text-overlay"|"voice-over"|"performative", "note": <=120 (optional) } ] (3-5),
    "benefit":    same (3-5),
    "contrarian": same (3-5),
    "story":      same (3-5),
    "urgency":    same (3-5)
  },
  "ctaBank": [string<=40] (4-8),
  "trendingFormats": [ { "name": <=60, "why": <=140, "adaptation": <=180 } ] (2-4)
}`;

export async function generateSocialShorts(
  brief: BusinessBrief
): Promise<SocialShorts> {
  const user = `${describeBrief(brief)}

OPDRACHT
Schrijf het volledige short-form video pakket voor dit bedrijf in het Nederlands.

EISEN
- Drie formats: Reel (15s), TikTok (21s) en YouTube Short (45-60s). Elk heeft een EIGEN hook, eigen beats, eigen sounddirection. Niet alleen knip-en-plak.
- Beats hebben echte timecodes (MM:SS), shot-omschrijving + VO + optionele on-screen tekst per beat.
- Hookbank: minstens 3 hooks per categorie, elk met type. Curiosity, benefit, contrarian, story, urgency.
- TrendingFormats: 2-4 actuele short-form formats (POV, Day in the Life, Silent Process, Tutorial-cut, etc.) en hoe je ze adapteert voor dit specifieke bedrijf.
- ctaBank: korte, scherpe CTA's, geen 'klik hier'.
- VO en on-screen tekst altijd in het Nederlands. Toon afgestemd op de tone of voice.
- Geen clichés. Niet "ervaar het verschil". Wel concreet en zintuiglijk.`;

  return runJSON({
    schema: SocialShortsSchema,
    user,
    schemaHint: SCHEMA_HINT,
    maxTokens: 4500,
    model: "claude-haiku-4-5-20251001",
  });
}
