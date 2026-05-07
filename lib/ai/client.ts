import Anthropic from "@anthropic-ai/sdk";

let cached: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (cached) return cached;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      "ANTHROPIC_API_KEY ontbreekt. Voeg deze toe aan .env.local of zet CONTENT_FACTORY_MOCK=true."
    );
  }
  cached = new Anthropic({ apiKey: key });
  return cached;
}

export const DEFAULT_MODEL =
  process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

export const MOCK_MODE = process.env.CONTENT_FACTORY_MOCK === "true";
