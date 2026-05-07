import { runJSON } from "@/lib/ai/runJSON";
import { describeBrief } from "@/lib/ai/briefContext";
import { SeoCopySchema, type SeoCopy } from "@/lib/schemas/artifacts/seo";
import type { BusinessBrief } from "@/lib/schemas/brief";

const SCHEMA_HINT = `{
  "metaTitle": string 20-70,
  "metaDescription": string 80-180,
  "ogTitle": string<=80,
  "ogDescription": string<=200,
  "primaryKeyword": string<=80,
  "secondaryKeywords": [string<=60] (4-10),
  "longTailKeywords": [string<=80] (4-8),
  "headings": { "h1": string 8-80, "h2s": [string<=80] (4-8) },
  "faqSchema": [ { "question": string<=140, "answer": string<=420 } ] (4-8),
  "imageAlts": [ { "context": string<=60, "alt": string<=120 } ] (4-8),
  "localSchema": { "businessType": string<=60, "description": string<=220, "serviceArea": [string<=40] (1-6) }
}`;

export async function generateSeoCopy(
  brief: BusinessBrief
): Promise<SeoCopy> {
  const user = `${describeBrief(brief)}

OPDRACHT
Schrijf de volledige SEO-set voor dit lokale bedrijf in het Nederlands.

EISEN
- De primaire keyword bevat de servicecategorie + de stad (bijv. "tandarts amsterdam zuid").
- secondary en long-tail keywords zijn realistisch wat lokale Nederlanders zouden zoeken — geen verzonnen termen.
- meta title bevat het merk en de stad; meta description heeft 1 duidelijke USP en een actiewerkwoord.
- H1 + H2's vormen samen de hoofdstructuur van de SEO-pagina.
- faqSchema beantwoordt de zoekvragen van de doelgroep, geschikt voor schema.org/FAQPage.
- imageAlts zijn beschrijvend en contextueel, geen keyword-stuffing.
- localSchema beschrijft de Local Business (waarvoor schema.org/LocalBusiness gebruikt wordt).
- Alles in vlekkeloos Nederlands. Geen Engels behalve waar logisch.`;

  return runJSON({
    schema: SeoCopySchema,
    user,
    schemaHint: SCHEMA_HINT,
    maxTokens: 2500,
    model: "claude-haiku-4-5-20251001",
  });
}
