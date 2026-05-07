import type { ZodSchema } from "zod";
import { z } from "zod";
import { getAnthropic, DEFAULT_MODEL } from "./client";

const SYSTEM_PROMPT = `Je bent een senior creative director en copywriter bij een Nederlands premium digitaal bureau (Next Level Sites). Je schrijft in vlekkeloos, sprankelend Nederlands. Je werk is cinematic, doordacht en commercieel scherp.

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

function getAtPath(obj: unknown, path: (string | number)[]): unknown {
  let cur: unknown = obj;
  for (const key of path) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string | number, unknown>)[key];
  }
  return cur;
}

function setAtPath(
  obj: unknown,
  path: (string | number)[],
  value: unknown
): void {
  if (path.length === 0) return;
  const last = path[path.length - 1];
  let cur: unknown = obj;
  for (let i = 0; i < path.length - 1; i++) {
    if (cur === null || typeof cur !== "object") return;
    cur = (cur as Record<string | number, unknown>)[path[i]];
  }
  if (cur && typeof cur === "object") {
    (cur as Record<string | number, unknown>)[last] = value;
  }
}

/**
 * Probeert het parsed object door het schema te halen. Bij `too_big` errors
 * (string te lang of array te lang) wordt het offending veld lokaal afgekapt
 * en opnieuw geprobeerd. Voorkomt dure retry-Anthropic-calls voor
 * length-overshoots — wat een terugkerend Claude-gedrag is.
 */
function parseWithTruncation<T>(
  schema: ZodSchema<T>,
  raw: unknown,
  maxFixIterations = 3
): T {
  // Deep clone zodat we niet het oorspronkelijke object muteren.
  let value: unknown = JSON.parse(JSON.stringify(raw));

  for (let iter = 0; iter < maxFixIterations; iter++) {
    const result = schema.safeParse(value);
    if (result.success) return result.data;

    let modified = false;
    for (const err of result.error.errors) {
      if (err.code !== z.ZodIssueCode.too_big) continue;
      const max = (err as z.ZodTooBigIssue).maximum as number;
      const path = err.path;
      const cur = getAtPath(value, path);

      if (typeof cur === "string" && cur.length > max) {
        // Kap af en eindig op zinvolle grens (laatste spatie/leesteken)
        let truncated = cur.slice(0, max);
        const lastBreak = Math.max(
          truncated.lastIndexOf(" "),
          truncated.lastIndexOf("."),
          truncated.lastIndexOf(",")
        );
        if (lastBreak > max * 0.8) truncated = truncated.slice(0, lastBreak);
        setAtPath(value, path, truncated.trimEnd());
        modified = true;
      } else if (Array.isArray(cur) && cur.length > max) {
        setAtPath(value, path, cur.slice(0, max));
        modified = true;
      }
    }
    if (!modified) {
      // Geen truncate-fixable errors meer — non-too_big issues blijven over.
      throw new Error(
        `Schema-validatie faalde: ${JSON.stringify(result.error.errors).slice(0, 500)}`
      );
    }
  }

  throw new Error("Schema-validatie faalde na 3 truncatie-pogingen");
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

  // Eén Anthropic call. Bij parse failure NIET retryen — auto-truncate via
  // parseWithTruncation lost length-overshoots lokaal op zonder een tweede
  // dure Anthropic call die alsnog de Vercel timeout zou triggeren.
  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: fullPrompt }],
  });

  const block = response.content[0];
  const text = block && block.type === "text" ? block.text : "";
  const jsonStr = extractJSON(text);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    throw new Error(
      `JSON parse faalde: ${
        err instanceof Error ? err.message : String(err)
      }. Eerste 200 chars: ${jsonStr.slice(0, 200)}`
    );
  }

  return parseWithTruncation(schema, parsed);
}
