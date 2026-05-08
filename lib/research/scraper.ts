import { getAnthropic } from "@/lib/ai/client";
import {
  ScrapedContentSchema,
  type ScrapedContent,
} from "@/lib/schemas/scrapedContent";
import type { BusinessTypeValue } from "@/lib/constants";
import {
  scrapeInstagramProfile,
  isApifyEnabled,
} from "./instagramScraper";
import { getSupabase, isSupabaseEnabled } from "@/lib/supabase/server";

/**
 * Download een externe image-URL en upload 'm naar onze Supabase Storage
 * 'scraped-images' bucket. Geeft permanente public URL terug. Lost CORS,
 * referrer-blocking en URL-expiry op (Instagram CDN URLs verlopen ~24u).
 *
 * Failure = return originele URL, geen showstopper.
 */
async function persistExternalImage(
  externalUrl: string,
  prospectId: string
): Promise<string> {
  if (!isSupabaseEnabled()) return externalUrl;
  try {
    const res = await fetch(externalUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      },
    });
    if (!res.ok) return externalUrl;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 1024) return externalUrl; // te klein, waarschijnlijk fout
    const supa = getSupabase();
    const filename = `prospects/${prospectId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.jpg`;
    // Bucket campaign-images bestaat al (migratie 0003)
    const { error } = await supa.storage
      .from("campaign-images")
      .upload(filename, buffer, {
        contentType: "image/jpeg",
        cacheControl: "31536000",
        upsert: false,
      });
    if (error) return externalUrl;
    const { data } = supa.storage
      .from("campaign-images")
      .getPublicUrl(filename);
    return data.publicUrl ?? externalUrl;
  } catch {
    return externalUrl;
  }
}

const VERTICAL_LABEL: Record<string, string> = {
  salon: "kapsalon",
  restaurant: "restaurant",
  dentist: "tandartsenpraktijk",
  gym: "sportschool",
  tattoo: "tattoo-shop",
  barber: "barbershop",
  hotel: "hotel/B&B",
  coffeeshop: "café/coffeehouse",
  autobedrijf: "autobedrijf",
};

const ITEM_LABEL: Record<string, string> = {
  salon: "behandelingen + prijzen",
  restaurant: "menu-items + prijzen",
  dentist: "behandelingen",
  gym: "lidmaatschappen + lessen",
  tattoo: "stijlen + tarieven",
  barber: "diensten + prijzen",
  hotel: "kamers + prijzen",
  coffeeshop: "drank/eten + prijzen",
  autobedrijf: "diensten + prijzen",
};

// Maximale HTML-grootte die we naar Sonnet sturen — meer = meer cost + slower
const MAX_HTML_LENGTH = 80_000;

/**
 * Strips scripts/styles en behoudt alle textuele inhoud + img-tags.
 * Maakt HTML kleiner zodat Sonnet 'm sneller kan parsen + minder tokens.
 */
function cleanHtml(html: string): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, "")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Pakt alle absolute image URLs uit de HTML. Filtert SVG's, data-URLs en
 * tracking-pixels. Resolveert relatieve paths naar absoluut.
 */
function extractImageUrls(html: string, baseUrl: string): string[] {
  const urls = new Set<string>();
  const base = new URL(baseUrl);

  // Standard <img src="...">
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  for (const match of html.matchAll(imgRegex)) {
    let url = match[1];
    if (!url) continue;
    if (url.startsWith("data:")) continue;
    if (url.endsWith(".svg")) continue;

    // Maak absoluut
    if (url.startsWith("//")) url = base.protocol + url;
    else if (url.startsWith("/")) url = `${base.protocol}//${base.host}${url}`;
    else if (!url.startsWith("http")) {
      try {
        url = new URL(url, baseUrl).href;
      } catch {
        continue;
      }
    }

    // Filter tracking-pixels (1x1) en favicons
    if (/favicon|tracker|pixel|spacer|analytics/i.test(url)) continue;
    urls.add(url);
  }

  // Open Graph image
  const ogRegex = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i;
  const ogMatch = html.match(ogRegex);
  if (ogMatch) urls.add(ogMatch[1]);

  // background-image inline styles
  const bgRegex = /background-image:\s*url\(["']?([^"')]+)["']?\)/gi;
  for (const match of html.matchAll(bgRegex)) {
    let url = match[1];
    if (!url || url.startsWith("data:")) continue;
    if (url.startsWith("/")) url = `${base.protocol}//${base.host}${url}`;
    if (!url.startsWith("http")) {
      try {
        url = new URL(url, baseUrl).href;
      } catch {
        continue;
      }
    }
    urls.add(url);
  }

  return Array.from(urls).slice(0, 50);
}

export interface ScrapeResult {
  content: ScrapedContent;
  costCents: number;
  durationMs: number;
}

export async function scrapeProspectWebsite(input: {
  websiteUrl: string;
  vertical: BusinessTypeValue;
  businessName?: string;
}): Promise<ScrapeResult> {
  const start = Date.now();

  // Stap 1: fetch HTML
  let html: string;
  try {
    const res = await fetch(input.websiteUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      },
      redirect: "follow",
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} bij ophalen website`);
    }
    html = await res.text();
  } catch (err) {
    throw new Error(
      `Website kon niet worden opgehaald: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }

  // Stap 2: voorbewerken
  const imageUrls = extractImageUrls(html, input.websiteUrl);
  const cleaned = cleanHtml(html).slice(0, MAX_HTML_LENGTH);

  // Stap 3: Sonnet structured extraction
  const client = getAnthropic();
  const verticalLabel = VERTICAL_LABEL[input.vertical] ?? input.vertical;
  const itemLabel = ITEM_LABEL[input.vertical] ?? "diensten";

  const submitTool = {
    name: "submit_scraped_content",
    description:
      "Submit de gestructureerde content die je uit de website hebt gehaald.",
    input_schema: {
      type: "object" as const,
      properties: {
        businessSummary: {
          type: "string",
          description: "Wat dit bedrijf doet in 2-3 zinnen, gebaseerd op site",
        },
        uspsFromSite: {
          type: "array",
          items: { type: "string" },
          description: "Concrete USPs die ze zelf benoemen, max 6",
        },
        toneOfSite: {
          type: "string",
          description: "Korte indruk van hun huidige tone-of-voice",
        },
        items: {
          type: "array",
          maxItems: 30,
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              price: {
                type: "string",
                description: "Letterlijk zoals op site, bijv. '€18,50'",
              },
              category: { type: "string" },
            },
            required: ["name"],
          },
          description: `Concrete ${itemLabel} uit de website`,
        },
        photoSelections: {
          type: "array",
          maxItems: 15,
          items: {
            type: "object",
            properties: {
              urlIndex: {
                type: "number",
                description:
                  "Index in de meegegeven imageUrls array — kies de meest representatieve",
              },
              alt: { type: "string" },
              context: {
                type: "string",
                enum: [
                  "hero",
                  "gallery",
                  "team",
                  "interior",
                  "product",
                  "food",
                  "treatment",
                  "logo",
                  "other",
                ],
              },
            },
            required: ["urlIndex", "context"],
          },
          description:
            "Selecteer max 15 foto's uit de meegegeven imageUrls — kies VARIATIE: hero + interieur + items + team",
        },
        address: { type: "string" },
        openingHours: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
        bookingUrl: { type: "string" },
        bookingProvider: {
          type: "string",
          enum: [
            "treatwell",
            "salonized",
            "phorest",
            "thefork",
            "opentable",
            "resengo",
            "garage-eigen-form",
            "eigen",
            "geen",
          ],
        },
        instagramHandle: { type: "string" },
        facebookUrl: { type: "string" },
      },
      required: [
        "businessSummary",
        "uspsFromSite",
        "items",
        "photoSelections",
      ],
    },
  };

  const userPrompt = `Hieronder de HTML-content (gestripped van scripts/styles) van de website van een ${verticalLabel}${
    input.businessName ? ` (${input.businessName})` : ""
  }.

WEBSITE: ${input.websiteUrl}

ALLE GEVONDEN AFBEELDINGEN (geïndexeerd, kies de beste):
${imageUrls.map((u, i) => `${i}: ${u}`).join("\n")}

GESTRIPDE HTML-CONTENT:
${cleaned}

OPDRACHT
Extract structured content uit deze website. Roep submit_scraped_content aan.

REGELS:
1. items: pak ALLE ${itemLabel} die je vindt op de site (max 30) — letterlijke namen, beschrijvingen, prijzen zoals ze er staan
2. photoSelections: kies max 15 representatieve foto's uit de imageUrls bovenaan. Geef de INDEX (urlIndex 0-${imageUrls.length - 1}). Mix: 1-2 hero, 4-6 ${input.vertical === "restaurant" ? "food" : input.vertical === "salon" ? "treatment" : "product"}, 2-3 interior, 1-2 team. Vermijd logo's en pagina-decoratie.
3. uspsFromSite: 4-6 concrete USPs die ze zelf benoemen (niet generieke marketing-taal)
4. bookingUrl: eerste werkbare booking/reservering link op site (Treatwell, TheFork, eigen reserverings-pagina)
5. bookingProvider: detect uit booking-URL (treatwell.nl → treatwell, thefork.com → thefork, etc.)
6. Adres/uren/contact: letterlijk uit de site

Wees feitelijk — geen interpretatie waar het feiten betreft. Wees concreet — geen vage marketing-taal in summary.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    system:
      "Je bent een precieze content-extractor. Je leest een website-HTML en haalt er gestructureerde data uit zonder dingen te verzinnen. Als iets niet op de site staat, laat je het veld leeg of weg.",
    tools: [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      submitTool as any,
    ],
    tool_choice: { type: "tool", name: "submit_scraped_content" },
    messages: [{ role: "user", content: userPrompt }],
  });

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const inputCost = Math.ceil((inputTokens / 1_000_000) * 300);
  const outputCost = Math.ceil((outputTokens / 1_000_000) * 1500);
  const costCents = inputCost + outputCost;

  const submitBlock = response.content.find(
    (b) =>
      b.type === "tool_use" &&
      "name" in b &&
      b.name === "submit_scraped_content"
  );

  if (!submitBlock || !("input" in submitBlock)) {
    throw new Error("Sonnet eindigde zonder submit_scraped_content aan te roepen");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = submitBlock.input as any;

  // Map photoSelections (urlIndex) terug naar volledige photo-objecten
  const photos = Array.isArray(raw.photoSelections)
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (raw.photoSelections as any[])
        .map((sel) => {
          const idx = typeof sel?.urlIndex === "number" ? sel.urlIndex : -1;
          const url = imageUrls[idx];
          if (!url) return null;
          return {
            url,
            alt: sel?.alt ?? "",
            context: sel?.context ?? "other",
          };
        })
        .filter(Boolean)
    : [];

  // Optioneel: Instagram-posts ophalen als Apify is geconfigureerd EN
  // Sonnet een handle heeft gevonden. Voegt 8-12 extra foto's toe per profile.
  // BELANGRIJK: IG-CDN-URLs verlopen na ~24u + blokkeren hotlinking via referrer.
  // We downloaden ze direct naar onze Supabase Storage voor persistente URLs.
  const detectedHandle =
    typeof raw.instagramHandle === "string" ? raw.instagramHandle : "";
  let igPhotos: Array<{ url: string; alt: string; context: string }> = [];
  if (detectedHandle && isApifyEnabled()) {
    try {
      const igPosts = await scrapeInstagramProfile({
        handle: detectedHandle,
        maxPosts: 12,
      });
      const prospectKey = detectedHandle.replace(/[^a-z0-9]/gi, "");
      // Persisteer parallel — sneller dan sequentieel
      const persisted = await Promise.all(
        igPosts
          .filter((p) => p.imageUrl)
          .map(async (p) => ({
            url: await persistExternalImage(p.imageUrl, prospectKey),
            alt: p.caption.slice(0, 200),
            context: (p.type === "reel" ? "gallery" : "food") as string,
          }))
      );
      igPhotos = persisted;
    } catch {
      // Apify-fout = geen showstopper, gewoon doorgaan met website-foto's
    }
  }

  // Combineer website-foto's + IG-foto's (IG eerst — meestal beter materiaal)
  const allPhotos = [...igPhotos, ...photos];

  const content: ScrapedContent = {
    websiteUrl: input.websiteUrl,
    scrapedAt: new Date().toISOString(),
    businessSummary:
      typeof raw.businessSummary === "string" ? raw.businessSummary : "",
    uspsFromSite: Array.isArray(raw.uspsFromSite)
      ? raw.uspsFromSite
          .filter((u: unknown) => typeof u === "string" && u.length >= 5)
          .slice(0, 8)
      : [],
    toneOfSite: typeof raw.toneOfSite === "string" ? raw.toneOfSite : "",
    items: Array.isArray(raw.items)
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        raw.items
          .filter((i: any) => typeof i?.name === "string")
          .map((i: { name: string; description?: string; price?: string; category?: string }) => ({
            name: i.name.slice(0, 120),
            description: typeof i.description === "string" ? i.description.slice(0, 280) : "",
            price: typeof i.price === "string" ? i.price.slice(0, 40) : "",
            category: typeof i.category === "string" ? i.category.slice(0, 60) : "",
          }))
          .slice(0, 40)
      : [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    photos: allPhotos as any[],
    address: typeof raw.address === "string" ? raw.address : "",
    openingHours:
      typeof raw.openingHours === "string" ? raw.openingHours : "",
    phone: typeof raw.phone === "string" ? raw.phone : "",
    email: typeof raw.email === "string" ? raw.email : "",
    bookingUrl: typeof raw.bookingUrl === "string" ? raw.bookingUrl : "",
    bookingProvider: typeof raw.bookingProvider === "string" ? raw.bookingProvider : null,
    instagramHandle:
      typeof raw.instagramHandle === "string" ? raw.instagramHandle : "",
    facebookUrl: typeof raw.facebookUrl === "string" ? raw.facebookUrl : "",
  };

  // Final validate
  const parsed = ScrapedContentSchema.safeParse(content);
  if (!parsed.success) {
    throw new Error(
      `Scraped content validation failed: ${JSON.stringify(parsed.error.errors).slice(0, 400)}`
    );
  }

  return {
    content: parsed.data,
    costCents,
    durationMs: Date.now() - start,
  };
}
