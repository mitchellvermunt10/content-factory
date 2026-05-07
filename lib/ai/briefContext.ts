import type { BusinessBrief } from "@/lib/schemas/brief";
import { BUSINESS_TYPES, TONE_PRESETS } from "@/lib/constants";

export function describeBrief(brief: BusinessBrief): string {
  const type = BUSINESS_TYPES.find((t) => t.value === brief.businessType);
  const tone = TONE_PRESETS.find((t) => t.value === brief.tone);

  return [
    `BRIEF — ${brief.name} (${type?.label ?? brief.businessType}) in ${brief.city}.`,
    brief.website ? `Website: ${brief.website}.` : null,
    brief.phone ? `Telefoon: ${brief.phone}.` : null,
    `\nUSP's:\n${brief.usps.map((u) => `- ${u}`).join("\n")}`,
    `\nDoelgroep: ${brief.audience}`,
    brief.offer ? `\nAanbieding/promotie: ${brief.offer}` : null,
    `\nTone of voice: ${tone?.label} — ${tone?.voice}`,
    `\nMerk-kleuren: ${brief.brandColors.join(", ")}`,
    type ? `\nVertical-trefwoorden: ${type.keywords.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
