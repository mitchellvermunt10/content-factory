/**
 * Provider-agnostische render interface.
 * Server-only — wordt aangeroepen vanuit /api/render/jobs/*.
 */

export type ProviderName = "runway" | "kling" | "veo" | "fal" | "mock";

export type AspectRatio = "9:16" | "16:9" | "1:1" | "4:5" | "21:9";

export interface SubmitJobInput {
  prompt: string;
  negativePrompt?: string;
  /** URL OR data URI naar de first-frame still. Optioneel. */
  firstFrameImage?: string;
  durationSec: number;
  aspectRatio: AspectRatio;
  model?: string;
  seed?: number;
  /** Optioneel: shot-id hint voor mock-fixture matching. Genegeerd door live providers. */
  shotIdHint?: string;
}

export interface SubmitJobResult {
  externalId: string;
}

export interface JobStatus {
  status: "queued" | "rendering" | "ready" | "failed";
  progress: number; // 0-100
  outputUrl: string | null;
  error: string | null;
}

export interface RenderProvider {
  name: ProviderName;
  /** Zet een nieuwe render-taak in de provider-queue. */
  submitJob(input: SubmitJobInput): Promise<SubmitJobResult>;
  /** Vraag de huidige status op via de externe job-ID. */
  getStatus(externalId: string): Promise<JobStatus>;
  /** Download de output. Returns Buffer. */
  downloadOutput(externalId: string, outputUrl: string): Promise<Buffer>;
}

import { runwayProvider } from "./runway";
import { mockProvider } from "./mock";

/**
 * Registreer hier nieuwe providers. Resolutie-orde:
 *   1. expliciete preferred provider name
 *   2. live provider met geldige API key
 *   3. mock provider
 */
export function getProvider(preferred?: ProviderName): RenderProvider {
  const forceMock = process.env.CONTENT_FACTORY_MOCK === "true";

  if (forceMock) return mockProvider;
  if (preferred === "mock") return mockProvider;

  if (preferred === "runway" || !preferred) {
    if (process.env.RUNWAY_API_KEY) return runwayProvider;
    if (preferred === "runway") {
      // Expliciet om Runway gevraagd zonder key — val terug op mock met warning.
      return mockProvider;
    }
  }

  // Kling/Veo/fal — niet geïmplementeerd; placeholder voor uitbreiding.
  // if (preferred === "kling" && process.env.KLING_API_KEY) return klingProvider;

  return mockProvider;
}

/** True als er voor deze provider live mode beschikbaar is. */
export function isLiveAvailable(name: ProviderName): boolean {
  if (process.env.CONTENT_FACTORY_MOCK === "true") return false;
  switch (name) {
    case "runway":
      return !!process.env.RUNWAY_API_KEY;
    case "mock":
      return false;
    default:
      return false;
  }
}
