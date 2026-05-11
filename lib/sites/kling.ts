// Kling 3.0 image-to-video via fal.ai.
// Async API: submit request → poll status → download MP4 when finished.
// ~$0.42 per 5-sec clip @ 1080p. Generatie-tijd 30-90 sec typisch.

const FAL_BASE = "https://queue.fal.run";
const MODEL = "fal-ai/kling-video/v3/standard/image-to-video";

export interface KlingInput {
  /** Publiek bereikbare URL naar het start-frame (Flux Pro hero) */
  imageUrl: string;
  /** Cinematic prompt — beschrijf camera-beweging expliciet */
  prompt: string;
  /** 5 of 10 seconden. Default 5 om kosten te beperken. */
  duration?: 5 | 10;
  /** Aspect ratio (default 16:9 voor desktop hero) */
  aspectRatio?: "16:9" | "9:16" | "1:1";
  /** Negatieve prompt — wat NIET in beeld mag komen */
  negativePrompt?: string;
  /** CFG schaal: hogere waarde = strikter aan prompt (0.5-1.0 normaal) */
  cfgScale?: number;
}

export interface KlingResult {
  /** Tijdelijke fal.ai URL naar de gegenereerde MP4 — direct downloaden! */
  videoUrl: string;
}

export function isKlingEnabled(): boolean {
  return Boolean(process.env.FAL_KEY);
}

interface QueueSubmitResponse {
  request_id: string;
  status_url: string;
  response_url: string;
}

interface QueueStatusResponse {
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  logs?: { message: string }[];
}

interface KlingOutput {
  video: { url: string };
}

async function submitKling(
  input: KlingInput,
  key: string
): Promise<QueueSubmitResponse> {
  const res = await fetch(`${FAL_BASE}/${MODEL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${key}`,
    },
    body: JSON.stringify({
      image_url: input.imageUrl,
      prompt: input.prompt,
      duration: String(input.duration ?? 5),
      aspect_ratio: input.aspectRatio ?? "16:9",
      negative_prompt:
        input.negativePrompt ??
        "blur, distortion, low quality, glitch, watermark, text overlay, hands, people walking through frame, zoom, rotation",
      cfg_scale: input.cfgScale ?? 0.5,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Kling submit faalde (HTTP ${res.status}): ${text.slice(0, 400)}`
    );
  }
  return (await res.json()) as QueueSubmitResponse;
}

async function pollKling(
  statusUrl: string,
  key: string,
  options: { intervalMs?: number; maxWaitMs?: number } = {}
): Promise<void> {
  const interval = options.intervalMs ?? 3000;
  const maxWait = options.maxWaitMs ?? 180_000; // 3 min hard cap
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    const res = await fetch(statusUrl, {
      headers: { Authorization: `Key ${key}` },
    });
    if (!res.ok) {
      throw new Error(`Kling status faalde (HTTP ${res.status})`);
    }
    const json = (await res.json()) as QueueStatusResponse;
    if (json.status === "COMPLETED") return;
    if (json.status === "FAILED") {
      throw new Error(
        `Kling generatie faalde: ${json.logs?.map((l) => l.message).join(" | ") ?? "onbekende fout"}`
      );
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error(`Kling timeout — meer dan ${Math.round(maxWait / 1000)}s wachten`);
}

async function fetchKlingResult(
  responseUrl: string,
  key: string
): Promise<KlingOutput> {
  const res = await fetch(responseUrl, {
    headers: { Authorization: `Key ${key}` },
  });
  if (!res.ok) {
    throw new Error(`Kling result fetch faalde (HTTP ${res.status})`);
  }
  return (await res.json()) as KlingOutput;
}

export async function generateKlingVideo(input: KlingInput): Promise<KlingResult> {
  const key = (process.env.FAL_KEY ?? "").replace(/\s+/g, "");
  if (!key) {
    throw new Error("FAL_KEY ontbreekt — zet 'm in .env.local of Vercel.");
  }
  const submit = await submitKling(input, key);
  await pollKling(submit.status_url, key);
  const result = await fetchKlingResult(submit.response_url, key);
  if (!result.video?.url) {
    throw new Error("Kling gaf geen video-URL terug — onverwacht response shape.");
  }
  return { videoUrl: result.video.url };
}
