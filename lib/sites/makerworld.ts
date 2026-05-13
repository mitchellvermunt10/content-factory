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
  /**
   * Volledige gallery — alle product-images op de MakerWorld pagina,
   * inclusief primary. Geüpload als <img> of in srcset attributen.
   * Gefilterd op MakerWorld CDN-hosts en gedeupliceerd.
   */
  galleryImageUrls: string[];
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
  /** Lokale paden van gallery-images in /public */
  localGalleryPaths: string[];
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
 * Scrape een MakerWorld model-URL via een headless browser (Playwright).
 * MakerWorld zit achter Cloudflare's "Just a moment..." JS-challenge —
 * een simpele fetch krijgt alleen de challenge-pagina, geen product-data.
 * Met Playwright laden we de pagina volledig (incl JS) en wachten tot
 * Cloudflare ons doorlaat, daarna extracten we de meta-tags.
 *
 * LOKAAL ALLEEN: vereist `npx playwright install chromium` (chromium-
 * binary ~150MB). Niet bedoeld voor productie — wordt gebruikt door
 * Mitchell tijdens product-import van klant-URLs.
 */
export async function scrapeMakerWorld(url: string): Promise<MakerWorldProduct> {
  const parsed = parseMakerWorldUrl(url);
  if (!parsed) {
    throw new Error("Geen geldige MakerWorld URL — verwacht /models/<id>-<slug>");
  }

  // Dynamische import zodat build niet faalt als playwright niet geïnstalleerd is
  let chromium: typeof import("playwright").chromium;
  try {
    const pw = await import("playwright");
    chromium = pw.chromium;
  } catch {
    throw new Error(
      "Playwright niet beschikbaar — run: npm install --save-optional playwright && npx playwright install chromium"
    );
  }

  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 },
      locale: "nl-NL",
    });
    const page = await context.newPage();

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Wacht tot Cloudflare-challenge weg is. Page-title is "Just a moment..."
    // tot de challenge slaagt — daarna verandert hij naar de echte titel.
    try {
      await page.waitForFunction(
        () => !document.title.includes("Just a moment"),
        { timeout: 20000 }
      );
    } catch {
      // Misschien is er geen challenge, of het duurde te lang — proberen we
      // toch de extractie. Als og-tags er zijn is alles OK.
    }

    // Zorg dat de meta-tags er zijn — wacht max 5s op og:title aanwezigheid
    try {
      await page.waitForSelector('meta[property="og:title"]', { timeout: 5000 });
    } catch {
      // Doorgaan — extractie zal falen met duidelijke boodschap
    }

    const data = await page.evaluate(() => {
      const get = (sel: string) =>
        (document.querySelector(sel) as HTMLMetaElement | null)?.content ?? "";

      // Extract gallery: alle <img> tags binnen de page met MakerWorld CDN
      // URLs. Dedup, sort by appearance, strip OSS-resize-suffix.
      const imageUrls = new Set<string>();
      const stripResize = (url: string) =>
        url.replace(/\?x-oss-process=[^&"]+/, "");

      document.querySelectorAll("img").forEach((img) => {
        const candidates = [
          img.getAttribute("src"),
          img.getAttribute("data-src"),
          ...(img.getAttribute("srcset") ?? "")
            .split(",")
            .map((s) => s.trim().split(" ")[0]),
        ].filter(Boolean) as string[];

        for (const c of candidates) {
          if (
            c.includes("makerworld.bblmw.com") ||
            c.includes("portal.bblmw.com")
          ) {
            // Filter out tiny thumbnails (avatar, icon) by skipping width<200 in resize-param
            const smallMatch = c.match(/w_(\d+)/);
            if (smallMatch && parseInt(smallMatch[1]) < 200) continue;
            // Filter avatars en logos via path
            if (/\/(avatar|logo|icon|emoji|cover-bg)\//i.test(c)) continue;
            imageUrls.add(stripResize(c));
          }
        }
      });

      return {
        title: get('meta[property="og:title"]'),
        image: get('meta[property="og:image"]'),
        description: get('meta[property="og:description"]'),
        bodyText: document.body?.innerText?.slice(0, 5000) ?? "",
        galleryUrls: Array.from(imageUrls),
      };
    });

    if (!data.title || !data.image) {
      throw new Error(
        "Kon geen og:title of og:image vinden na laden — Cloudflare-challenge niet doorgekomen?"
      );
    }

    // Strip MakerWorld's standaard og:title suffix
    const cleanTitle = decodeEntities(data.title.trim()).replace(
      /\s*[-–|·]\s*(?:Free\s+)?3D\s+Print\s+Model\s*[-–|·]\s*MakerWorld\s*$/i,
      ""
    ).trim();

    // Combine og:image + gallery, dedup, primary altijd voorop
    const primary = data.image.replace(/\?x-oss-process=[^&]+$/, "");
    const galleryUrls = [
      primary,
      ...data.galleryUrls.filter((u) => u !== primary),
    ];

    return {
      modelId: parsed.modelId,
      slug: parsed.slug,
      title: cleanTitle,
      description: data.description ? decodeEntities(data.description.trim()) : "",
      primaryImageUrl: data.image,
      galleryImageUrls: galleryUrls.slice(0, 8), // Max 8 om download-bloat te voorkomen
      printTimeMinutes: parsePrintTime(data.bodyText),
      sourceUrl: url,
    };
  } finally {
    await browser.close();
  }
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

/**
 * Download alle gallery-images naar /public/sites/<shop>/products/<id>/gallery/.
 * Returns lokale public-paden, gesorteerd zoals galleryImageUrls. Voorbij de
 * primary die door downloadProductImage al is opgeslagen.
 */
export async function downloadGalleryImages(
  product: MakerWorldProduct,
  shopFolder: string
): Promise<string[]> {
  const outDir = path.join(
    process.cwd(),
    "public",
    "sites",
    shopFolder,
    "products",
    product.modelId,
    "gallery"
  );
  await fs.mkdir(outDir, { recursive: true });

  const localPaths: string[] = [];
  for (let i = 0; i < product.galleryImageUrls.length; i++) {
    const url = product.galleryImageUrls[i];
    const ext = url.match(/\.(jpe?g|png|webp)(\?|$)/i)?.[1]?.toLowerCase() ?? "jpg";
    const filename = `gallery-${String(i + 1).padStart(2, "0")}.${ext}`;
    const outPath = path.join(outDir, filename);
    const publicPath = `/sites/${shopFolder}/products/${product.modelId}/gallery/${filename}`;

    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "NextLevelSites/1.0" },
      });
      if (!res.ok) {
        // Skip failing image, log but don't break
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      await fs.writeFile(outPath, buf);
      localPaths.push(publicPath);
    } catch {
      // Individual image-failure is non-fatal — skip and continue
    }
  }
  return localPaths;
}
