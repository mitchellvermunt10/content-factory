import { NextResponse } from "next/server";
import { z } from "zod";
import * as fs from "node:fs";
import * as path from "node:path";
import { getProvider, isLiveAvailable } from "@/lib/render/providers";
import { putJob } from "@/lib/render/store";

export const runtime = "nodejs";
export const maxDuration = 30;

const RequestSchema = z.object({
  jobId: z.string().min(1),
  shotId: z.string().min(1),
  campaignSlug: z.string().min(1),
  provider: z.enum(["runway", "kling", "veo", "fal", "mock"]).default("runway"),
  prompt: z.string().min(1),
  negativePrompt: z.string().optional(),
  durationSec: z.number().min(1).max(20),
  aspectRatio: z.enum(["9:16", "16:9", "1:1", "4:5", "21:9"]).default("9:16"),
  /** Public URL of data URI naar first-frame still. */
  firstFrameUrl: z.string().nullable().optional(),
  /** Of de server een lokale still uit real-assets/<slug>/stills/<shotId>.png moet inlezen als data URI. */
  useLocalStill: z.boolean().default(false),
  model: z.string().optional(),
  seed: z.number().int().optional(),
});

function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

function readLocalStillAsDataUri(slug: string, shotId: string): string | null {
  const exts = ["png", "jpg", "jpeg"];
  for (const ext of exts) {
    const p = path.resolve(
      process.cwd(),
      "real-assets",
      slug,
      "stills",
      `${shotId}.${ext}`
    );
    if (fs.existsSync(p)) {
      const buf = fs.readFileSync(p);
      const mime = ext === "png" ? "image/png" : "image/jpeg";
      return `data:${mime};base64,${buf.toString("base64")}`;
    }
  }
  return null;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Ongeldige JSON body.");
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      400,
      parsed.error.errors[0]?.message ?? "Ongeldige parameters."
    );
  }
  const input = parsed.data;

  // Bepaal provider en apiMode
  const provider = getProvider(input.provider);
  const apiMode: "live" | "mock" =
    provider.name === "mock" ? "mock" : isLiveAvailable(provider.name) ? "live" : "mock";

  // Resolve first-frame: expliciete URL > lokale still > geen
  let firstFrame = input.firstFrameUrl ?? undefined;
  if (!firstFrame && input.useLocalStill) {
    const local = readLocalStillAsDataUri(input.campaignSlug, input.shotId);
    if (local) firstFrame = local;
  }

  try {
    const result = await provider.submitJob({
      prompt: input.prompt,
      negativePrompt: input.negativePrompt,
      firstFrameImage: firstFrame,
      durationSec: input.durationSec,
      aspectRatio: input.aspectRatio,
      model: input.model,
      seed: input.seed,
      shotIdHint: input.shotId,
    });

    const now = new Date().toISOString();
    putJob({
      jobId: input.jobId,
      shotId: input.shotId,
      campaignSlug: input.campaignSlug,
      provider: provider.name,
      apiMode,
      externalId: result.externalId,
      status: "queued",
      progress: 0,
      prompt: input.prompt,
      durationSec: input.durationSec,
      aspectRatio: input.aspectRatio,
      outputUrl: null,
      errorMessage: null,
      savedToPath: null,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      jobId: input.jobId,
      provider: provider.name,
      apiMode,
      externalId: result.externalId,
      status: "queued",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Onbekende fout bij submit.";
    return jsonError(502, message);
  }
}
