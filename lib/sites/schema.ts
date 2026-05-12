// Schema.org JSON-LD builders voor Next Level Sites.
// Geeft Google rich results: openingstijden-card, sterren, menu-snippet,
// breadcrumbs, lokale pack. Inject via <script type="application/ld+json">.

import type { NextLevelSiteData } from "./types";

const DAYS_MAP: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

function hoursToSchema(hours: NextLevelSiteData["hours"]) {
  if (!hours) return [];
  const out: Record<string, unknown>[] = [];
  for (const [key, value] of Object.entries(hours)) {
    if (key === "note" || !value || typeof value !== "string") continue;
    const lower = value.toLowerCase();
    if (lower.includes("gesloten")) continue;
    // Parse "17:30 – 22:30" of "17:30 - 22:30"
    const match = value.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
    if (!match) continue;
    out.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAYS_MAP[key] ?? key,
      opens: match[1],
      closes: match[2],
    });
  }
  return out;
}

function postalAddressSchema(data: NextLevelSiteData) {
  const a = data.business.address;
  if (!a) return undefined;
  return {
    "@type": "PostalAddress",
    streetAddress: a.street,
    postalCode: a.postalCode,
    addressLocality: a.city,
    addressRegion: a.region,
    addressCountry: a.country,
  };
}

function geoSchema(data: NextLevelSiteData) {
  if (!data.business.geo) return undefined;
  return {
    "@type": "GeoCoordinates",
    latitude: data.business.geo.lat,
    longitude: data.business.geo.lng,
  };
}

function aggregateRatingSchema(data: NextLevelSiteData) {
  const g = data.socialProof?.google;
  if (!g) return undefined;
  return {
    "@type": "AggregateRating",
    ratingValue: g.rating,
    reviewCount: g.count,
    bestRating: 5,
    worstRating: 1,
  };
}

/**
 * Hoofd-restaurant/LocalBusiness schema. Wordt geïnjecteerd op de home-page
 * en /contact. Bevat alle Google-rich-result velden voor local pack.
 */
export function businessSchema(
  data: NextLevelSiteData,
  pageUrl: string
): Record<string, unknown> {
  const type = data.business.schemaType ?? "LocalBusiness";
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${pageUrl}#business`,
    name: data.business.name,
    description: data.business.tagline,
    url: pageUrl,
    telephone: data.business.phone,
    email: data.email,
    image: data.photos?.slice(0, 6).map((p) => p.url),
    priceRange: data.business.priceRange ?? "€€",
    ...(type === "Restaurant" && data.business.cuisine
      ? { servesCuisine: data.business.cuisine }
      : {}),
    address: postalAddressSchema(data),
    geo: geoSchema(data),
    openingHoursSpecification: hoursToSchema(data.hours),
    ...(type === "Restaurant" ? { acceptsReservations: true } : {}),
    ...(data.menuCategories ? { hasMenu: `${pageUrl}/menu` } : {}),
    aggregateRating: aggregateRatingSchema(data),
    sameAs: data.business.sameAs,
  };
}

/**
 * BreadcrumbList — voor subpagina's. Geeft Google de hiërarchie zodat
 * search-results pages "Trattoria Sole › Kaart" tonen i.p.v. lange URL.
 */
export function breadcrumbSchema(
  segments: { name: string; url: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: segments.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      item: s.url,
    })),
  };
}

/**
 * Menu schema voor /menu pagina. Toont gerechten + prijzen in Google.
 */
export function menuSchema(
  data: NextLevelSiteData,
  pageUrl: string
): Record<string, unknown> | null {
  if (!data.menuCategories || data.menuCategories.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": `${pageUrl}#menu`,
    name: `Kaart van ${data.business.name}`,
    hasMenuSection: data.menuCategories.map((cat) => ({
      "@type": "MenuSection",
      name: cat.name,
      description: cat.description,
      hasMenuItem: cat.items.map((item) => ({
        "@type": "MenuItem",
        name: item.name,
        description: item.description,
        ...(item.price
          ? {
              offers: {
                "@type": "Offer",
                price: item.price.replace(/[^\d.,]/g, "").replace(",", "."),
                priceCurrency: "EUR",
              },
            }
          : {}),
        ...(item.tags?.includes("vegetarisch")
          ? { suitableForDiet: "https://schema.org/VegetarianDiet" }
          : {}),
      })),
    })),
  };
}

/**
 * Helper: render één of meer schema-objecten als één <script>-tag-content.
 */
export function renderSchemaJson(
  ...objects: (Record<string, unknown> | null | undefined)[]
): string {
  const valid = objects.filter(Boolean) as Record<string, unknown>[];
  if (valid.length === 0) return "";
  if (valid.length === 1) return JSON.stringify(valid[0]);
  return JSON.stringify(valid);
}
