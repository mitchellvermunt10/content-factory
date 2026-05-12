import type { MetadataRoute } from "next";
import { listSlugs } from "@/lib/sites/data";
import { loadSiteData } from "@/lib/sites/data";

/**
 * Robots-policy:
 * - Demo-sites worden expliciet geblokkeerd (we willen geen "Trattoria Sole
 *   in Utrecht" in Google terwijl het een fictief showcase-restaurant is).
 * - Echte klanten worden toegestaan op /sites/<slug>.
 * - Studio + interne API's blocken altijd.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const demoDisallows: string[] = [];
  for (const slug of listSlugs()) {
    const result = await loadSiteData(slug);
    if (result?.data.isDemo) {
      demoDisallows.push(`/sites/${slug}`, `/sites/${slug}/*`);
    }
  }

  const base =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://contentfactory.nextlevelsites.nl";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio", "/studio/*", "/api/", "/c/*", ...demoDisallows],
      },
    ],
    sitemap: `${base.replace(/\/$/, "")}/sitemap.xml`,
  };
}
