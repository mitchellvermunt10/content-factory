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
      system: `Je vertaalt Nederlandse fotografische beschrijvingen naar bondig Engels voor image-AI prompts (Midjourney, gpt-image-1, Flux).

Regels:
1. Gebruik CONCRETE objectnamen die image-AI's herkennen:
   - "fijne schaar" → "open hairdressing shears mid-snip, visible blades cutting hair"
   - "kam" → "wide-tooth styling comb"
   - "föhn" → "professional hand-held hair dryer"
   - "knipmoment" → "hair being cut, open scissors blades visible"
2. Beschrijf de ACTIE expliciet — niet alleen het object. "Hands holding scissors mid-cut" beats "fine scissors".
3. Voor restaurant: "espressomachine" → "stainless espresso machine pulling shot", "menukaart" → "leather-bound menu card on table".
4. Voor garage: "monteur" → "mechanic in dark blue overalls", "lift" → "two-post car lift in workshop".
5. Eén krachtige zin, max 30 woorden. Geen toelichting, alleen de vertaalde prompt.`,
      messages: [
        {
          role: "user",
          content: `Vertaal naar Engels met concrete tool/objectnamen:\n\n${dutch}`,
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
