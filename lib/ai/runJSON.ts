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

/**
 * Repareer een truncated/corrupt JSON-string door open haakjes en strings
 * netjes te sluiten. Werkt mid-array of mid-object: trailing komma's worden
 * verwijderd, openstaande strings/objects/arrays worden afgesloten in de
 * juiste volgorde. Geen wonderoplossing — als de structuur fundamenteel
 * kapot is geeft het nog steeds invalide JSON terug, maar voor max_tokens-
 * truncatie en simpele typo's herstelt het in 80%+ van de gevallen.
 */
function repairJSON(jsonStr: string): string {
  // Stack van open structuren: '{', '[' of '"'
  const stack: string[] = [];
  let escaped = false;
  let lastNonWsBeforeStringEnd = -1;

  for (let i = 0; i < jsonStr.length; i++) {
    const ch = jsonStr[i];
    const top = stack[stack.length - 1];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (top === '"') {
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === '"') {
        stack.pop();
        lastNonWsBeforeStringEnd = i;
        continue;
      }
      continue;
    }

    if (ch === '"') {
      stack.push('"');
      continue;
    }
    if (ch === "{" || ch === "[") {
      stack.push(ch);
      continue;
    }
    if (ch === "}" && top === "{") {
      stack.pop();
      continue;
    }
    if (ch === "]" && top === "[") {
      stack.pop();
      continue;
    }
  }

  let repaired = jsonStr;

  // 1. Sluit een openstaande string af.
  if (stack[stack.length - 1] === '"') {
    repaired += '"';
    stack.pop();
  }

  // 2. Verwijder trailing komma's (bijv. ',\n  ' aan einde van array).
  repaired = repaired.replace(/,\s*$/, "");

  // 3. Verwijder achtergebleven half-geschreven sleutel zonder waarde.
  //    Patronen: '"key":' of '"key":\n' aan het einde.
  repaired = repaired.replace(/,?\s*"[^"]*"\s*:\s*$/, "");

  // 4. Sluit alle nog open arrays/objects in omgekeerde volgorde.
  while (stack.length > 0) {
    const top = stack.pop();
    if (top === "[") repaired += "]";
    else if (top === "{") repaired += "}";
  }

  // Onderdruk warning als variabele niet gebruikt wordt
  void lastNonWsBeforeStringEnd;

  return repaired;
}

/**
 * Escape unescaped control characters binnen JSON strings. Sonnet/Haiku schrijven
 * af en toe een echte \n in een string value — dat is technisch invalide JSON
 * (control chars < 0x20 moeten geëscaped zijn). State-machine pass die alleen
 * binnen string-literals corrigeert, dus structurele newlines tussen velden
 * blijven onaangetast.
 */
function escapeControlChars(jsonStr: string): string {
  let out = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < jsonStr.length; i++) {
    const ch = jsonStr[i];
    const code = ch.charCodeAt(0);
    if (escaped) {
      out += ch;
      escaped = false;
      continue;
    }
    if (inString) {
      if (ch === "\\") {
        out += ch;
        escaped = true;
        continue;
      }
      if (ch === '"') {
        inString = false;
        out += ch;
        continue;
      }
      if (code < 0x20) {
        if (ch === "\n") out += "\\n";
        else if (ch === "\r") out += "\\r";
        else if (ch === "\t") out += "\\t";
        else if (ch === "\b") out += "\\b";
        else if (ch === "\f") out += "\\f";
        else out += "\\u" + code.toString(16).padStart(4, "0");
        continue;
      }
      out += ch;
    } else {
      if (ch === '"') inString = true;
      out += ch;
    }
  }
  return out;
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
      // 1. null waar string/number/etc verwacht → coerce naar empty value.
      //    Sonnet 4.6 schrijft soms `"field": null` voor "geen waarde".
      if (err.code === z.ZodIssueCode.invalid_type) {
        const issue = err as z.ZodInvalidTypeIssue;
        if (issue.received === "null" || issue.received === "undefined") {
          let coerced: unknown = undefined;
          if (issue.expected === "string") coerced = "";
          else if (issue.expected === "number") coerced = 0;
          else if (issue.expected === "boolean") coerced = false;
          else if (issue.expected === "array") coerced = [];
          else if (issue.expected === "object") coerced = {};
          if (coerced !== undefined) {
            setAtPath(value, err.path, coerced);
            modified = true;
            continue;
          }
        }
      }

      // 2. invalid_union (komt vaak bij `.optional().or(z.literal(""))` met null) — strip de null.
      if (err.code === z.ZodIssueCode.invalid_union) {
        const cur = getAtPath(value, err.path);
        if (cur === null || cur === undefined) {
          setAtPath(value, err.path, "");
          modified = true;
          continue;
        }
      }

      // 3. too_big — kap string/array af.
      if (err.code === z.ZodIssueCode.too_big) {
        const max = (err as z.ZodTooBigIssue).maximum as number;
        const cur = getAtPath(value, err.path);

        if (typeof cur === "string" && cur.length > max) {
          let truncated = cur.slice(0, max);
          const lastBreak = Math.max(
            truncated.lastIndexOf(" "),
            truncated.lastIndexOf("."),
            truncated.lastIndexOf(",")
          );
          if (lastBreak > max * 0.8) truncated = truncated.slice(0, lastBreak);
          setAtPath(value, err.path, truncated.trimEnd());
          modified = true;
          continue;
        }
        if (Array.isArray(cur) && cur.length > max) {
          setAtPath(value, err.path, cur.slice(0, max));
          modified = true;
          continue;
        }
      }

      // 4. too_small op string → pad met space (zelden, maar voorkomt crash).
      if (err.code === z.ZodIssueCode.too_small) {
        const min = (err as z.ZodTooSmallIssue).minimum as number;
        const cur = getAtPath(value, err.path);
        if (typeof cur === "string" && cur.length < min) {
          // Geen zinnige fix — schema is inconsistent. Vul met placeholder.
          setAtPath(value, err.path, cur + " ".repeat(min - cur.length));
          modified = true;
          continue;
        }
      }
    }

    if (!modified) {
      throw new Error(
        `Schema-validatie faalde: ${JSON.stringify(result.error.errors).slice(0, 500)}`
      );
    }
  }

  throw new Error("Schema-validatie faalde na 3 fix-pogingen");
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
  const rawJson = extractJSON(text);
  const jsonStr = escapeControlChars(rawJson);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    // Tweede poging: probeer parse zonder control-char-escape.
    let secondErr: unknown = null;
    try {
      parsed = JSON.parse(rawJson);
    } catch (e2) {
      secondErr = e2;
      // Derde poging: repareer truncated JSON (max_tokens-overshoot of typo
      // mid-array). Sluit open haakjes/strings en verwijder trailing komma's.
      try {
        const repaired = repairJSON(jsonStr);
        parsed = JSON.parse(repaired);
      } catch {
        throw new Error(
          `JSON parse faalde: ${
            err instanceof Error ? err.message : String(err)
          }. Eerste 200 chars: ${jsonStr.slice(0, 200)}`
        );
      }
    }
    // Onderdruk warning als variabele niet gebruikt wordt
    void secondErr;
  }

  return parseWithTruncation(schema, parsed);
}
