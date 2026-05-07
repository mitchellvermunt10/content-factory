import type { ZodSchema } from "zod";
import { getAnthropic, DEFAULT_MODEL } from "./client";

const SYSTEM_PROMPT = `Je bent een senior creative director en copywriter bij een Nederlands premium digitaal bureau (Studio Vermunt). Je schrijft in vlekkeloos, sprankelend Nederlands. Je werk is cinematic, doordacht en commercieel scherp.

Belangrijke regels:
- Schrijf altijd in het Nederlands (nl-NL), tenzij anders gevraagd.
- Vermijd cliché's en marketingjargon. Wees specifiek, zintuiglijk en concreet.
- Als de tone of voice "luxueus" of "klinisch" is, gebruik je 'u'. Bij "speels", "stoer", "warm" en "minimal" gebruik je 'je'.
- Lever ALTIJD valide JSON die exact aan het opgegeven schema voldoet. Geen toelichting buiten de JSON. Geen markdown code fences.
- Houd je strikt aan veldlimieten qua aantal items en lengte van strings.
- Verzin geen prijzen of feiten die niet in de brief staan; werk met richtprijzen of plaatshouders waar nodig.`;

function extractJSON(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

export async function runJSON<T>({
  schema,
  user,
  schemaHint,
  maxTokens = 4096,
  model = DEFAULT_MODEL,
}: {
  schema: ZodSchema<T>;
  user: string;
  schemaHint: string;
  maxTokens?: number;
  model?: string;
}): Promise<T> {
  const anthropic = getAnthropic();

  const fullPrompt = `${user}

SCHEMA waaraan je output exact moet voldoen:
${schemaHint}

Antwoord uitsluitend met valide JSON. Geen toelichting. Geen \`\`\` blokken.`;

  let lastError: unknown = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: fullPrompt }],
      });

      const block = response.content[0];
      const text = block && block.type === "text" ? block.text : "";
      const jsonStr = extractJSON(text);
      const parsed = JSON.parse(jsonStr);
      return schema.parse(parsed);
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(
    `runJSON faalde na 2 pogingen: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`
  );
}
