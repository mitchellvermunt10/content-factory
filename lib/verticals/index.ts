import type { BusinessTypeValue } from "@/lib/constants";
import type { VerticalPack } from "./types";
import { SALON_PACK } from "./salon";

const PACKS: Partial<Record<BusinessTypeValue, VerticalPack>> = {
  salon: SALON_PACK,
};

export function getVerticalPack(
  vertical: BusinessTypeValue
): VerticalPack | null {
  return PACKS[vertical] ?? null;
}

// Format de pack als prompt-snippet die in elke generator wordt geïnjecteerd.
// Houd compact — Claude verliest focus bij 5000+ token context-injecties.
export function describeVerticalPack(pack: VerticalPack): string {
  return [
    `\n--- VERTICAL CONTEXT (${pack.label}) ---`,
    `\nWat klanten zeggen (gebruik deze framing in copy):\n${pack.customerLanguage.map((l) => `  · ${l}`).join("\n")}`,
    `\nBranche-termen (gebruik specifiek waar mogelijk):\n${pack.treatments.map((l) => `  · ${l}`).join("\n")}`,
    `\nRelevante merken/producten (vermeld waar passend):\n${pack.brandReferences.map((l) => `  · ${l}`).join("\n")}`,
    `\nVERMIJD deze clichés:\n${pack.avoidPhrases.map((l) => `  · "${l}"`).join("\n")}`,
    `\nGEBRUIK in plaats daarvan dit soort framing:\n${pack.preferredPhrases.map((l) => `  · "${l}"`).join("\n")}`,
    pack.regulatory.length
      ? `\nRegelgeving om te respecteren:\n${pack.regulatory.map((l) => `  · ${l}`).join("\n")}`
      : null,
    pack.painPoints.length
      ? `\nPijnpunten van klanten (verwerk subtiel als framing):\n${pack.painPoints.map((l) => `  · ${l}`).join("\n")}`
      : null,
    pack.currentTrends.length
      ? `\nActuele trends (waar relevant — niet forceren):\n${pack.currentTrends.map((l) => `  · ${l}`).join("\n")}`
      : null,
    pack.toneModifiers.length
      ? `\nTone-aanvullingen voor deze branche:\n${pack.toneModifiers.map((l) => `  · ${l}`).join("\n")}`
      : null,
    `\n--- EINDE VERTICAL CONTEXT ---\n`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function describeVisualDirectionPack(
  pack: VerticalPack
): string {
  // Voor cinematic + image-prompt generators willen we de fotografie-direction
  // separaat kunnen injecteren (relevanter daar).
  return [
    `\n--- VISUAL DIRECTION (${pack.label}) ---`,
    pack.photoDirection.map((l) => `  · ${l}`).join("\n"),
    `\n--- EINDE VISUAL DIRECTION ---\n`,
  ].join("\n");
}
