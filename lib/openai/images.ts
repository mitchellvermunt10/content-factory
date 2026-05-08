// OpenAI gpt-image-1 wrapper. Geen SDK-dependency — directe REST call,
// scheelt build-grootte en geeft expliciete controle over headers/error-body.

const ENDPOINT = "https://api.openai.com/v1/images/generations";

export type ImageQuality = "low" | "medium" | "high";
export type ImageSize = "1024x1024" | "1024x1536" | "1536x1024";

export interface GenerateImageInput {
  prompt: string;
  size?: ImageSize;
  quality?: ImageQuality;
}

export interface GenerateImageResult {
  base64: string; // b64-encoded PNG
  width: number;
  height: number;
}

export function isOpenAIEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function generateImage(
  input: GenerateImageInput
): Promise<GenerateImageResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY ontbreekt — zet 'm in Vercel env vars.");
  }

  const size = input.size ?? "1024x1024";
  const quality = input.quality ?? "medium";

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: input.prompt,
      n: 1,
      size,
      quality,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `OpenAI image generatie faalde (HTTP ${res.status}): ${text.slice(0, 400)}`
    );
  }

  const json = (await res.json()) as {
    data?: Array<{ b64_json?: string }>;
  };

  const b64 = json.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("OpenAI gaf geen b64_json terug — onverwacht response shape.");
  }

  const [w, h] = size.split("x").map((n) => parseInt(n, 10));
  return { base64: b64, width: w, height: h };
}
