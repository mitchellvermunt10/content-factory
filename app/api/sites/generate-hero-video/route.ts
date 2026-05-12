import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { promises as fs } from "node:fs";
import path from "node:path";
import { generateKlingVideo, isKlingEnabled } from "@/lib/sites/kling";

export const runtime = "nodejs";
export const maxDuration = 300;

const Body = z.object({
  /** Folder onder /public/sites/ */
  folder: z
    .string()
    .regex(/^[a-z0-9/-]+$/i)
    .max(80),
  /** Bestandsnaam zonder pad, bv. 'espresso.mp4' */
  filename: z
    .string()
    .regex(/^[a-z0-9_-]+\.mp4$/i)
    .max(80),
  /** URL of /public-relatief pad naar start-frame (Flux Pro hero) */
  imageUrl: z.string().min(1),
  prompt: z.string().min(20).max(2000),
  duration: z.union([z.literal(5), z.literal(10)]).default(5),
  overwrite: z.boolean().default(false),
});

/**
 * Genereer een Kling 3.0 video clip en sla 'm direct op als MP4 in
 * /public/sites/<folder>/<filename>. Geen frame-extractie — bedoeld voor
 * autoplay-loop achtergronden op marketing-pagina's, niet voor scroll-
 * driven scrubbing.
 *
 * Cost: ~$0.42 per 5-sec clip @ 1080p.
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

  const outDir = path.join(process.cwd(), "public", "sites", body.folder);
  const outPath = path.join(outDir, body.filename);
  await fs.mkdir(outDir, { recursive: true });

  if (!body.overwrite) {
    try {
      await fs.access(outPath);
      return NextResponse.json(
        { error: "Bestand bestaat al — gebruik overwrite:true" },
        { status: 409 }
      );
    } catch {
      /* proceed */
    }
  }

  // Maak imageUrl absoluut indien relatief
  let imageUrl = body.imageUrl;
  if (imageUrl.startsWith("/")) {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://nextlevelsites.nl";
    imageUrl = `${base.replace(/\/$/, "")}${imageUrl}`;
  }

  try {
    const klingResult = await generateKlingVideo({
      imageUrl,
      prompt: body.prompt,
      duration: body.duration,
      aspectRatio: "16:9",
    });

    const dl = await fetch(klingResult.videoUrl);
    if (!dl.ok) {
      return NextResponse.json(
        { error: `Download van Kling MP4 faalde (HTTP ${dl.status})` },
        { status: 502 }
      );
    }
    const buf = Buffer.from(await dl.arrayBuffer());
    await fs.writeFile(outPath, buf);

    return NextResponse.json({
      ok: true,
      path: `/sites/${body.folder}/${body.filename}`,
      sizeBytes: buf.length,
      videoUrl: klingResult.videoUrl,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generatie faalde" },
      { status: 500 }
    );
  }
}
