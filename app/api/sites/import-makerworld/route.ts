import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  scrapeMakerWorld,
  downloadProductImage,
} from "@/lib/sites/makerworld";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({
  /** Volledige MakerWorld URL */
  url: z.string().url(),
  /** Shop-folder, bv. 'jj-3d' — bepaalt waar foto's worden opgeslagen */
  shopFolder: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(40),
  /** Verkoopprijs in euro's (bv. 12.50). Wordt door JJ-3D bepaald. */
  price: z.number().positive(),
  /** Optioneel: korte interne SKU/tagline */
  shopTitle: z.string().max(120).optional(),
});

/**
 * Scrape een MakerWorld URL, download primary-image, return product-entry
 * die je in lib/sites/data.ts onder jj-3d.products[] kunt droppen.
 *
 * Lokaal aanroepen:
 *   curl.exe -X POST "http://localhost:3008/api/sites/import-makerworld" \
 *     -H "Content-Type: application/json" \
 *     -d '{"url":"https://makerworld.com/nl/models/2391957-...","shopFolder":"jj-3d","price":12.50}'
 */
export async function POST(req: NextRequest) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid body" },
      { status: 400 }
    );
  }

  try {
    const product = await scrapeMakerWorld(body.url);
    const localImagePath = await downloadProductImage(product, body.shopFolder);

    return NextResponse.json({
      ok: true,
      product: {
        ...product,
        localImagePath,
        importedAt: new Date().toISOString(),
      },
      // Klaar-om-te-plakken data.ts entry:
      dataEntry: {
        id: product.modelId,
        title: body.shopTitle ?? product.title,
        description: product.description,
        priceEur: body.price,
        image: localImagePath,
        printTimeMinutes: product.printTimeMinutes,
        sourceUrl: product.sourceUrl,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Import faalde" },
      { status: 500 }
    );
  }
}
