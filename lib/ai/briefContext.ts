import type { BusinessBrief } from "@/lib/schemas/brief";
import type { ScrapedContent } from "@/lib/schemas/scrapedContent";
import { BUSINESS_TYPES, TONE_PRESETS } from "@/lib/constants";
import {
  getVerticalPack,
  describeVerticalPack,
  describeVisualDirectionPack,
} from "@/lib/verticals";

/**
 * Format de gescrapte website-content als context-block voor Sonnet.
 * Hierdoor schrijft de generator copy die VERWIJST naar specifieke gerechten,
 * behandelingen en bedrijfs-eigenheden ipv generieke marketing-taal.
 */
function describeScrapedContent(scraped: ScrapedContent): string {
  const lines: string[] = [
    `\n--- ECHTE WEBSITE-CONTENT (${scraped.websiteUrl}) ---`,
    `Dit is wat ECHT op hun site staat. Verwijs SPECIFIEK naar deze elementen in copy.`,
    `Verzin geen menu-items / behandelingen / diensten — gebruik DEZE.`,
  ];

  if (scraped.businessSummary) {
    lines.push(`\nBedrijfs-samenvatting: ${scraped.businessSummary}`);
  }

  if (scraped.uspsFromSite.length > 0) {
    lines.push(
      `\nWat ze zelf zeggen op hun site:\n${scraped.uspsFromSite
        .map((u) => `- ${u}`)
        .join("\n")}`
    );
  }

  if (scraped.items.length > 0) {
    const itemLines = scraped.items.slice(0, 15).map((item) => {
      const parts = [item.name];
      if (item.description) parts.push(item.description);
      if (item.price) parts.push(`(${item.price})`);
      if (item.category) parts.push(`[${item.category}]`);
      return `- ${parts.join(" — ")}`;
    });
    lines.push(
      `\nECHT aanbod / menu / behandelingen (gebruik concrete namen in copy):\n${itemLines.join("\n")}`
    );
  }

  if (scraped.toneOfSite) {
    lines.push(`\nHun huidige tone-of-voice: ${scraped.toneOfSite}`);
  }

  if (scraped.address) {
    lines.push(`\nAdres: ${scraped.address}`);
  }
  if (scraped.openingHours) {
    lines.push(`Openingstijden: ${scraped.openingHours}`);
  }
  if (scraped.bookingUrl) {
    lines.push(
      `\nBooking-URL (gebruik in CTA): ${scraped.bookingUrl} (${scraped.bookingProvider ?? "onbekend"})`
    );
  }

  lines.push(`\n--- EINDE WEBSITE-CONTENT ---\n`);
  return lines.join("\n");
}

export function describeBrief(
  brief: BusinessBrief,
  options: {
    includeVisualDirection?: boolean;
    scrapedContent?: ScrapedContent | null;
  } = {}
): string {
  const type = BUSINESS_TYPES.find((t) => t.value === brief.businessType);
  const tone = TONE_PRESETS.find((t) => t.value === brief.tone);
  const pack = getVerticalPack(brief.businessType);

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
    pack ? describeVerticalPack(pack) : null,
    pack && options.includeVisualDirection
      ? describeVisualDirectionPack(pack)
      : null,
    options.scrapedContent
      ? describeScrapedContent(options.scrapedContent)
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}
