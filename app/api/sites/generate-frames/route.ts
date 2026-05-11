import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { promises as fs } from "node:fs";
import path from "node:path";
import { generateFluxImage, isFluxEnabled } from "@/lib/flux/images";
import { RESTAURANT_FLUX_PROMPTS } from "@/lib/sites/shotPresets";

export const runtime = "nodejs";
export const maxDuration = 300;

const Body = z.object({
  vertical: z.enum(["restaurant"]),
  /** Onder welke folder ze gesaved worden in /public/sites/[folder] */
  folder: z
    .string()
    .regex(/^[a-z0-9-]+$/, "folder mag alleen lowercase letters, cijfers en streepjes bevatten")
    .max(40),
  /** Optioneel: overschrijf bestaande frames met dezelfde naam */
  overwrite: z.boolean().default(false),
});

/**
 * Genereert 3 hero-frames (exterior/doorway/interior) via Flux Pro 1.1 Ultra
 * en schrijft ze als JPG naar /public/sites/[folder]/.
 *
 * Lokaal aanroepen:
 *   curl -X POST http://localhost:3007/api/sites/generate-frames \
 *     -H "Content-Type: application/json" \
 *     -d '{"vertical":"restaurant","folder":"italian-restaurant"}'
 *
 * Cost: 3 × ~$0.06 = ~$0.18 per set.
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

  const prompts =
    body.vertical === "restaurant" ? RESTAURANT_FLUX_PROMPTS : null;
  if (!prompts) {
    return NextResponse.json(
      { error: `Geen prompt-set voor vertical='${body.vertical}'` },
      { status: 400 }
    );
  }

  const outDir = path.join(process.cwd(), "public", "sites", body.folder);
  await fs.mkdir(outDir, { recursive: true });

  const results: Record<string, string> = {};
  const shotKeys: (keyof typeof prompts)[] = ["exterior", "doorway", "interior"];

  for (const key of shotKeys) {
    const filename = `${key}.jpg`;
    const filepath = path.join(outDir, filename);
    if (!body.overwrite) {
      try {
        await fs.access(filepath);
        results[key] = `/sites/${body.folder}/${filename}`;
        continue; // bestaat al, overslaan
      } catch {
        // bestaat niet, doorgaan met genereren
      }
    }
    const prompt = prompts[key];
    const flux = await generateFluxImage({
      prompt,
      aspectRatio: "21:9",
      rawMode: true,
    });
    const dl = await fetch(flux.imageUrl);
    if (!dl.ok) {
      return NextResponse.json(
        { error: `Download van Flux faalde voor ${key}` },
        { status: 502 }
      );
    }
    const buf = Buffer.from(await dl.arrayBuffer());
    await fs.writeFile(filepath, buf);
    results[key] = `/sites/${body.folder}/${filename}`;
  }

  return NextResponse.json({
    ok: true,
    folder: body.folder,
    frames: results,
  });
}
