import type { MetadataRoute } from "next";
import { listSlugs, loadSiteData } from "@/lib/sites/data";

/**
 * Sitemap voor Next Level Sites — alleen productie-slugs.
 * Demo-cases (isDemo: true) staan er bewust niet in.
 * Per slug worden alle 5 routes opgenomen (/, /menu, /reserveren, /verhaal, /contact).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://contentfactory.nextlevelsites.nl";
  const cleanBase = base.replace(/\/$/, "");

  const slugs: string[] = [];
  for (const slug of listSlugs()) {
    const result = await loadSiteData(slug);
    if (result && !result.data.isDemo) slugs.push(slug);
  }

  const pages = ["", "/menu", "/reserveren", "/verhaal", "/contact"];
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  // Hoofdpagina's van de agency (niet de demo-sites)
  entries.push({
    url: `${cleanBase}/`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1.0,
  });

  for (const slug of slugs) {
    for (const p of pages) {
      entries.push({
        url: `${cleanBase}/sites/${slug}${p}`,
        lastModified: now,
        changeFrequency: p === "" ? "weekly" : "monthly",
        priority: p === "" ? 0.9 : 0.7,
      });
    }
  }

  return entries;
}
