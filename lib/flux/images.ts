// Flux Pro 1.1 Ultra via fal.ai. Sterker fotorealisme dan gpt-image-1, ~$0.06/img.
// Sync mode: één HTTP call die wacht tot de image klaar is en de URL teruggeeft.

const ENDPOINT =
  "https://fal.run/fal-ai/flux-pro/v1.1-ultra";

export type FluxAspect =
  | "21:9"
  | "16:9"
  | "4:3"
  | "3:2"
  | "1:1"
  | "2:3"
  | "3:4"
  | "9:16"
  | "9:21";

export interface FluxInput {
  prompt: string;
  aspectRatio?: FluxAspect;
  rawMode?: boolean; // true = minder gestileerd, photoreal
}

export interface FluxResult {
  imageUrl: string; // tijdelijke fal.ai URL — moeten we direct downloaden
  width: number;
  height: number;
}

export function isFluxEnabled(): boolean {
  return Boolean(process.env.FAL_KEY);
}

export async function generateFluxImage(input: FluxInput): Promise<FluxResult> {
  const key = (process.env.FAL_KEY ?? "").replace(/\s+/g, "");
  if (!key) {
    throw new Error("FAL_KEY ontbreekt — zet 'm in Vercel env vars.");
  }

  const aspect = input.aspectRatio ?? "1:1";

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${key}`,
    },
    body: JSON.stringify({
      prompt: input.prompt,
      aspect_ratio: aspect,
      raw: input.rawMode ?? true, // raw=true geeft minder MJ-achtige bombast
      num_images: 1,
      output_format: "png",
      enable_safety_checker: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Flux Pro 1.1 Ultra faalde (HTTP ${res.status}): ${text.slice(0, 400)}`
    );
  }

  const json = (await res.json()) as {
    images?: Array<{ url: string; width: number; height: number }>;
  };

  const img = json.images?.[0];
  if (!img?.url) {
    throw new Error("Flux gaf geen image URL terug — onverwacht response shape.");
  }

  return { imageUrl: img.url, width: img.width, height: img.height };
}

/**
 * Download a fal.ai image URL and return as base64 — onze upload-helper
 * (uploadImageBase64) verwacht b64. Fal URLs verlopen na ~24u dus we
 * persisteren altijd direct naar Supabase Storage.
 */
export async function downloadAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Image download faalde (HTTP ${res.status})`);
  }
  const buf = await res.arrayBuffer();
  return Buffer.from(buf).toString("base64");
}
