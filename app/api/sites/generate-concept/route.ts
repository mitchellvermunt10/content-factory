import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { promises as fs } from "node:fs";
import path from "node:path";
import { generateFluxImage, isFluxEnabled } from "@/lib/flux/images";

export const runtime = "nodejs";
export const maxDuration = 120;

const Body = z.object({
  /** Folder onder /public/sites/ */
  folder: z
    .string()
    .regex(/^[a-z0-9/-]+$/i, "folder mag alleen lowercase, cijfers, / en streepjes")
    .max(80),
  /** Bestandsnaam (zonder pad), bv. 'garage.jpg' */
  filename: z
    .string()
    .regex(/^[a-z0-9_-]+\.(jpg|jpeg|png)$/i, "naam moet eindigen op .jpg/.png")
    .max(80),
  prompt: z.string().min(20).max(2000),
  aspectRatio: z
    .enum(["21:9", "16:9", "4:3", "3:2", "1:1", "2:3", "3:4", "9:16"])
    .default("3:4"),
  overwrite: z.boolean().default(false),
});

/**
 * Genereer een losse concept-image via Flux Pro 1.1 Ultra, schrijf naar
 * /public/sites/<folder>/<filename>. ~$0.06 per call. Lokaal aanroepen
 * via curl/script. NIET in productie — /public is read-only op Vercel.
 */
export async function POST(req: NextRequest) {
  if (!isFluxEnabled()) {
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
        { error: `Bestand bestaat al — gebruik overwrite:true` },
        { status: 409 }
      );
    } catch {
      /* doesn't exist — proceed */
    }
  }

  const flux = await generateFluxImage({
    prompt: body.prompt,
    aspectRatio: body.aspectRatio,
    rawMode: true,
  });
  const dl = await fetch(flux.imageUrl);
  if (!dl.ok) {
    return NextResponse.json(
      { error: `Download van Flux faalde (HTTP ${dl.status})` },
      { status: 502 }
    );
  }
  const buf = Buffer.from(await dl.arrayBuffer());
  await fs.writeFile(outPath, buf);

  return NextResponse.json({
    ok: true,
    path: `/sites/${body.folder}/${body.filename}`,
    width: flux.width,
    height: flux.height,
  });
}
