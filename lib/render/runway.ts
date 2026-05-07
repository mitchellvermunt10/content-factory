import type {
  AspectRatio,
  JobStatus,
  RenderProvider,
  SubmitJobInput,
  SubmitJobResult,
} from "./providers";

const RUNWAY_BASE = "https://api.dev.runwayml.com";
const RUNWAY_API_VERSION = "2024-11-06";

/** 9:16 → "768:1280" volgens Runway's ratio-format. */
const RATIO_MAP: Record<AspectRatio, string> = {
  "9:16": "768:1280",
  "16:9": "1280:768",
  "1:1": "960:960",
  "4:5": "832:1040",
  "21:9": "1280:548",
};

function authHeaders(): HeadersInit {
  const key = process.env.RUNWAY_API_KEY;
  if (!key) {
    throw new Error(
      "RUNWAY_API_KEY ontbreekt — zet de key in .env.local of laat de mock provider de job afhandelen."
    );
  }
  return {
    Authorization: `Bearer ${key}`,
    "X-Runway-Version": RUNWAY_API_VERSION,
    "Content-Type": "application/json",
  };
}

function mapRunwayStatus(s: string): JobStatus["status"] {
  switch (s) {
    case "PENDING":
    case "THROTTLED":
      return "queued";
    case "RUNNING":
      return "rendering";
    case "SUCCEEDED":
      return "ready";
    case "FAILED":
    case "CANCELLED":
      return "failed";
    default:
      return "queued";
  }
}

function mapApiError(status: number, body: string): string {
  switch (status) {
    case 401:
    case 403:
      return "Runway API-sleutel ongeldig of ontoegankelijk.";
    case 422:
      return `Runway weigerde de input: ${body.slice(0, 200)}`;
    case 429:
      return "Runway rate limit bereikt — wacht een halve minuut en probeer opnieuw.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "Runway is tijdelijk niet beschikbaar. Probeer over 1 minuut opnieuw.";
    default:
      return `Runway gaf een fout (${status}): ${body.slice(0, 160)}`;
  }
}

export const runwayProvider: RenderProvider = {
  name: "runway",

  async submitJob(input: SubmitJobInput): Promise<SubmitJobResult> {
    const model = input.model || process.env.RUNWAY_MODEL || "gen3a_turbo";
    const ratio = RATIO_MAP[input.aspectRatio] ?? RATIO_MAP["9:16"];

    if (!input.firstFrameImage) {
      throw new Error(
        "Runway image_to_video vereist een firstFrameImage (URL of data URI). Genereer eerst de still."
      );
    }

    // Negative prompt is niet eigen veld; Runway ondersteunt het via concatenatie.
    const fullPrompt = input.negativePrompt
      ? `${input.prompt}\n\nDo not include: ${input.negativePrompt}`
      : input.prompt;

    const body = {
      promptImage: input.firstFrameImage,
      promptText: fullPrompt,
      model,
      ratio,
      duration: Math.max(5, Math.min(10, Math.round(input.durationSec))),
      ...(typeof input.seed === "number" ? { seed: input.seed } : {}),
    };

    const res = await fetch(`${RUNWAY_BASE}/v1/image_to_video`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(mapApiError(res.status, text));
    }
    const data = (await res.json()) as { id?: string };
    if (!data.id) {
      throw new Error("Runway gaf geen task ID terug.");
    }
    return { externalId: data.id };
  },

  async getStatus(externalId: string): Promise<JobStatus> {
    const res = await fetch(`${RUNWAY_BASE}/v1/tasks/${externalId}`, {
      method: "GET",
      headers: authHeaders(),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(mapApiError(res.status, text));
    }
    const data = (await res.json()) as {
      status?: string;
      progress?: number;
      output?: string[];
      failure?: string;
      failureCode?: string;
    };
    const status = mapRunwayStatus(data.status ?? "PENDING");
    const progressPct =
      typeof data.progress === "number"
        ? Math.round(Math.min(1, Math.max(0, data.progress)) * 100)
        : status === "ready"
        ? 100
        : status === "rendering"
        ? 50
        : 0;
    const outputUrl =
      Array.isArray(data.output) && data.output.length > 0
        ? data.output[0]
        : null;
    const error =
      status === "failed"
        ? data.failure || data.failureCode || "Runway-render mislukt."
        : null;
    return { status, progress: progressPct, outputUrl, error };
  },

  async downloadOutput(_externalId: string, outputUrl: string): Promise<Buffer> {
    if (!outputUrl) throw new Error("Geen output URL beschikbaar voor download.");
    const res = await fetch(outputUrl);
    if (!res.ok) {
      throw new Error(
        `Download van Runway output mislukte (${res.status} ${res.statusText}).`
      );
    }
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  },
};
