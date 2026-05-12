import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { promises as fs } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";
import { generateKlingVideo, isKlingEnabled } from "@/lib/sites/kling";
import {
  downloadMp4ToTemp,
  extractFrames,
  writeManifest,
} from "@/lib/sites/frameExtract";

export const runtime = "nodejs";
export const maxDuration = 300;

const Body = z.object({
  /** Folder in /public/sites/<folder>/ */
  folder: z
    .string()
    .regex(/^[a-z0-9-]+$/, "folder mag alleen lowercase letters, cijfers en streepjes bevatten")
    .max(40),
  /** Scene-key: 'intro' voor de dolly-in. Frames belanden in <folder>/<scene>/ */
  scene: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(40)
    .default("intro"),
  /** URL naar het start-frame. Mag een Flux-URL zijn of /public-relative pad. */
  imageUrl: z.string().min(1),
  /** Cinematic prompt voor de dolly-shot */
  prompt: z.string().min(20).max(2000),
  /** 5 of 10 sec */
  duration: z.union([z.literal(5), z.literal(10)]).default(5),
  /** Frames per seconde voor extractie. Default 24 (premium-tier). */
  fps: z.number().int().min(8).max(30).default(24),
  /** Max breedte in pixels. Default 2400 (premium-tier). */
  maxWidth: z.number().int().min(640).max(3840).default(2400),
  /** JPG quality (1=best, 31=worst). Default 3 (premium-tier). */
  quality: z.number().int().min(1).max(31).default(3),
});

/**
 * Genereer een cinematic dolly-shot via Kling 3.0 + extract frames lokaal.
 *
 * Pipeline:
 *  1. Kling 3.0 image-to-video (fal.ai async, polling ~45-90s)
 *  2. Download MP4 → /tmp
 *  3. ffmpeg-static → frame_0001.jpg, frame_0002.jpg, ...
 *  4. Schrijf manifest.json met frame URLs en metadata
 *
 * Output landt in /public/sites/<folder>/<scene>/frames/ + manifest.json.
 *
 * Lokaal aanroepen:
 *   curl -X POST http://localhost:3007/api/sites/generate-video \
 *     -H "Content-Type: application/json" \
 *     -d '{
 *       "folder":"italian-restaurant",
 *       "scene":"intro",
 *       "imageUrl":"https://nextlevelsites.nl/sites/italian-restaurant/exterior.jpg",
 *       "prompt":"Slow cinematic dolly-in...",
 *       "duration":5
 *     }'
 *
 * NIET aanroepen vanuit Vercel — /public is daar read-only.
 */
export async function POST(req: NextRequest) {
  if (!isKlingEnabled()) {
    return NextResponse.json(
      { error: "FAL_KEY ontbreekt — zet 'm in .env.local" },
      { status: 503 }
    );
  }

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid body" },
      { status: 400 }
    );
  }

  // /public-relatieve paden mappen naar publieke URL — Kling heeft een
  // bereikbare URL nodig, dus lokale dev-server moet via ngrok of zo. In
  // praktijk: laat de user altijd een Vercel-URL geven naar de hero JPG
  // (die hebben we al gecommit naar /public/sites/italian-restaurant/).
  let imageUrl = body.imageUrl;
  if (imageUrl.startsWith("/")) {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://nextlevelsites.nl";
    imageUrl = `${base.replace(/\/$/, "")}${imageUrl}`;
  }

  try {
    // 1. Kling
    const klingResult = await generateKlingVideo({
      imageUrl,
      prompt: body.prompt,
      duration: body.duration,
      aspectRatio: "16:9",
    });

    // 2. Download MP4 naar tmp
    const tmpVideo = path.join(
      tmpdir(),
      `kling-${randomBytes(6).toString("hex")}.mp4`
    );
    await downloadMp4ToTemp(klingResult.videoUrl, tmpVideo);

    // 3. Extract frames naar /public/sites/<folder>/<scene>/frames/
    const sceneDir = path.join(
      process.cwd(),
      "public",
      "sites",
      body.folder,
      body.scene
    );
    const framesDir = path.join(sceneDir, "frames");
    const extract = await extractFrames({
      videoPath: tmpVideo,
      outDir: framesDir,
      fps: body.fps,
      maxWidth: body.maxWidth,
      quality: body.quality,
    });

    // 4. Manifest
    await writeManifest(path.join(sceneDir, "manifest.json"), {
      scene: body.scene,
      fps: body.fps,
      frameCount: extract.frameCount,
      publicPrefix: extract.publicPrefix,
      generatedAt: new Date().toISOString(),
      prompt: body.prompt,
    });

    // 5. Opruimen tmp
    await fs.unlink(tmpVideo).catch(() => {});

    return NextResponse.json({
      ok: true,
      folder: body.folder,
      scene: body.scene,
      frameCount: extract.frameCount,
      publicPrefix: extract.publicPrefix,
      manifest: `/sites/${body.folder}/${body.scene}/manifest.json`,
      videoUrl: klingResult.videoUrl,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generatie faalde" },
      { status: 500 }
    );
  }
}
