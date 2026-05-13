// MakerWorld product scraper — extract title, images, description en
// print-time uit een MakerWorld model-URL. Voor JJ-3D shop: paste URL,
// krijg product-data terug die we in /public/sites/jj-3d/products/ + data.ts
// kunnen droppen.

import { promises as fs } from "node:fs";
import path from "node:path";

export interface MakerWorldProduct {
  /** Het model-ID uit de URL, bv. '2391957' */
  modelId: string;
  /** Slug uit de URL, bv. 'the-north-face-down-jacket-pen-holder' */
  slug: string;
  /** Product-titel uit og:title */
  title: string;
  /** Korte beschrijving uit og:description */
  description: string;
  /** Primary image-URL (uit og:image), origineel op MakerWorld CDN */
  primaryImageUrl: string;
  /** Designer/maker naam, indien herkenbaar */
  designer?: string;
  /** Geschatte print-tijd in minuten, indien herkenbaar */
  printTimeMinutes?: number;
  /** Originele URL waarvan deze data komt */
  sourceUrl: string;
}

export interface ImportedProduct extends MakerWorldProduct {
  /** Lokaal pad in /public na download */
  localImagePath: string;
  /** Geïmporteerd op timestamp */
  importedAt: string;
}

/**
 * Parse model-ID en slug uit een MakerWorld URL.
 * https://makerworld.com/nl/models/2391957-the-north-face-down-jacket-pen-holder
 */
function parseMakerWorldUrl(url: string): { modelId: string; slug: string } | null {
  const match = url.match(/\/models\/(\d+)-([a-z0-9-]+)/i);
  if (!match) return null;
  return { modelId: match[1], slug: match[2] };
}

/**
 * Decode HTML-entities naar normale tekst (&amp; → &, &#39; → ', etc.)
 */
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/**
 * Probeer print-tijd uit body-tekst te halen. MakerWorld gebruikt formats
 * als "Print Time: 4 hour 32 min" of "4h 32m" of "32m".
 */
function parsePrintTime(html: string): number | undefined {
  // Probeer 'X hour Y min' of 'Xh Ym'
  const hourMin = html.match(/(\d+)\s*(?:hour|h|uur)s?\s*(\d+)\s*(?:min|m)/i);
  if (hourMin) return parseInt(hourMin[1]) * 60 + parseInt(hourMin[2]);
  const hourOnly = html.match(/(\d+)\s*(?:hour|h|uur)s?\b/i);
  if (hourOnly) return parseInt(hourOnly[1]) * 60;
  const minOnly = html.match(/(\d+)\s*(?:min|m)\b/i);
  if (minOnly) return parseInt(minOnly[1]);
  return undefined;
}

/**
 * Scrape een MakerWorld model-URL en geef product-data terug.
 * NIET cross-origin — runs server-side. Voegt User-Agent toe om
 * niet als bot geblokkeerd te worden.
 */
export async function scrapeMakerWorld(url: string): Promise<MakerWorldProduct> {
  const parsed = parseMakerWorldUrl(url);
  if (!parsed) {
    throw new Error("Geen geldige MakerWorld URL — verwacht /models/<id>-<slug>");
  }

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; NextLevelSitesBot/1.0; +https://nextlevelsites.nl)",
      Accept: "text/html,application/xhtml+xml",
    },
  });
  if (!res.ok) {
    throw new Error(`MakerWorld gaf HTTP ${res.status} terug`);
  }
  const html = await res.text();

  // Open Graph tags zijn meestal aanwezig
  const ogTitle = html.match(
    /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i
  )?.[1];
  const ogImage = html.match(
    /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i
  )?.[1];
  const ogDesc = html.match(
    /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i
  )?.[1];

  if (!ogTitle || !ogImage) {
    throw new Error(
      "Kon geen og:title of og:image vinden — page-structuur is gewijzigd?"
    );
  }

  // Designer-extractie: MakerWorld heeft "by @username" patroon in HTML
  const designerMatch = html.match(
    /["'](?:designer|creator|author)["']\s*[:=]\s*["']([^"']+)["']/i
  );

  return {
    modelId: parsed.modelId,
    slug: parsed.slug,
    title: decodeEntities(ogTitle.trim()),
    description: ogDesc ? decodeEntities(ogDesc.trim()) : "",
    primaryImageUrl: ogImage,
    designer: designerMatch ? designerMatch[1] : undefined,
    printTimeMinutes: parsePrintTime(html),
    sourceUrl: url,
  };
}

/**
 * Download de primary-image van MakerWorld CDN naar lokale /public,
 * zodat we niet hot-linken (CDN kan blokkeren of weg). Returns het
 * lokale public-pad.
 */
export async function downloadProductImage(
  product: MakerWorldProduct,
  shopFolder: string
): Promise<string> {
  const outDir = path.join(
    process.cwd(),
    "public",
    "sites",
    shopFolder,
    "products",
    product.modelId
  );
  await fs.mkdir(outDir, { recursive: true });

  const ext =
    product.primaryImageUrl.match(/\.(jpe?g|png|webp)(\?|$)/i)?.[1] ?? "jpg";
  const outPath = path.join(outDir, `primary.${ext.toLowerCase()}`);
  const publicPath = `/sites/${shopFolder}/products/${product.modelId}/primary.${ext.toLowerCase()}`;

  const res = await fetch(product.primaryImageUrl, {
    headers: { "User-Agent": "NextLevelSites/1.0" },
  });
  if (!res.ok) throw new Error(`Image download faalde (HTTP ${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(outPath, buf);

  return publicPath;
}
