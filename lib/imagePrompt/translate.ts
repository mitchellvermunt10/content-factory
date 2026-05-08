import { getAnthropic } from "@/lib/ai/client";

/**
 * Translate Dutch visualDirection naar bondig Engels — MJ + Flux + gpt-image-1
 * snappen Engels significant beter, vooral voor specifiek subject-gedrag
 * (handen, gereedschap, beweging). Sonnet schrijft visualDirection vaak in
 * NL, en die letterlijk doorduwen geeft "luxury editorial portrait" ipv
 * "hairdresser cutting hair".
 *
 * Haiku 4.5, max 200 tokens, ~€0,001 per call. Failure = fallback naar
 * originele tekst (geen showstopper).
 */
export async function translateToEnglish(dutch: string): Promise<string> {
  if (!dutch || dutch.trim().length === 0) return dutch;
  // Quick heuristic: skip translation als al overwegend Engels
  if (looksEnglish(dutch)) return dutch;

  try {
    const client = getAnthropic();
    const res = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 250,
      system:
        "Je vertaalt Nederlandse fotografische beschrijvingen naar bondig, krachtig Engels voor image-AI prompts. Behoud zintuiglijke specificiteit en concrete subject-acties. Geen toelichting, alleen de vertaling.",
      messages: [
        {
          role: "user",
          content: `Vertaal naar Engels (één zin, krachtig, behoud subject-actie):\n\n${dutch}`,
        },
      ],
    });
    const block = res.content[0];
    const text = block && block.type === "text" ? block.text : "";
    const cleaned = text.trim().replace(/^["'`]|["'`]$/g, "");
    return cleaned.length > 0 ? cleaned : dutch;
  } catch {
    return dutch; // fallback — niet showstoppend
  }
}

function looksEnglish(text: string): boolean {
  // Hele simpele heuristic — kijk naar de aanwezigheid van NL function-words.
  const dutchMarkers = [
    /\b(de|het|een|en|van|met|voor|naar|als|maar|wat|die|dat)\b/i,
    /\b(uit|over|onder|tussen|door|tegen|zonder|tijdens)\b/i,
    /[ëïü]|aa|ee|oo|uu|ij/,
  ];
  return !dutchMarkers.some((re) => re.test(text));
}
