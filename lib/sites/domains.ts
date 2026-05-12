// Mapping van klant-domeinen naar site-slugs.
// Voor multi-tenant deployment: elke klant krijgt zijn eigen domein
// (bv. trattoriasole.nl), wij hosten dat op onze Vercel-infrastructuur
// en de middleware rewrite paden naar de juiste slug.
//
// EDGE-SAFE: deze file mag GEEN fs, path, of andere Node-only modules
// importeren — wordt gebruikt door middleware.ts dat op Vercel Edge draait.

/**
 * Host → slug mapping. Vul aan zodra een klant zijn domein koppelt.
 *
 * Setup voor een nieuwe klant:
 *  1. Vercel dashboard → Settings → Domains → Add 'trattoriasole.nl'
 *  2. Klant zet DNS: CNAME 'cname.vercel-dns.com' (of A-record voor apex)
 *  3. Wacht ~5 min op SSL-certificaat (auto via Let's Encrypt)
 *  4. Voeg hier toe:
 *       "trattoriasole.nl": "trattoria-sole",
 *       "www.trattoriasole.nl": "trattoria-sole",
 *  5. Git commit + push → Vercel deploy
 *  6. Klaar — klant heeft eigen domein, eigen SEO-juice
 */
const HOST_TO_SLUG: Record<string, string> = {
  // Voorbeeld voor eerste echte klant — uncomment + pas aan:
  // "trattoriasole.nl": "trattoria-sole",
  // "www.trattoriasole.nl": "trattoria-sole",
};

/**
 * Onze eigen agency-domeinen + dev/preview-omgevingen.
 * Op deze hosts doet middleware NIETS (no rewrite) — `/sites/<slug>`
 * blijft de canonieke URL.
 */
const AGENCY_HOSTS = new Set<string>([
  "nextlevelsites.nl",
  "www.nextlevelsites.nl",
  "contentfactory.nextlevelsites.nl",
]);

/** Geef de slug terug voor een gegeven host, of null als niet gemapt. */
export function hostToSlug(host: string): string | null {
  if (!host) return null;
  // Strip eventuele port (localhost:3008 → localhost)
  const cleanHost = host.split(":")[0].toLowerCase();
  return HOST_TO_SLUG[cleanHost] ?? HOST_TO_SLUG[host.toLowerCase()] ?? null;
}

/**
 * True als deze host onze eigen agency-site/dev/preview is —
 * geen rewrites toepassen.
 */
export function isAgencyHost(host: string): boolean {
  if (!host) return true;
  const cleanHost = host.split(":")[0].toLowerCase();
  if (AGENCY_HOSTS.has(cleanHost)) return true;
  // Vercel preview-deploys: <project>-<git>-<team>.vercel.app
  if (cleanHost.endsWith(".vercel.app")) return true;
  // Lokale dev
  if (cleanHost === "localhost" || cleanHost === "127.0.0.1") return true;
  return false;
}

/**
 * Voor SEO-canonical: geef de absolute URL terug voor een pad.
 * Op een klant-host: gebruikt het klant-domein (bv. https://trattoriasole.nl/menu).
 * Op agency-host: gebruikt de agency-URL met /sites/<slug>/ prefix.
 */
export function canonicalUrl(
  host: string,
  slug: string,
  subpath: string = ""
): string {
  const cleanHost = host.split(":")[0].toLowerCase();
  if (HOST_TO_SLUG[cleanHost] === slug) {
    // Op klant-host — schone URL zonder /sites/<slug>/
    const proto =
      cleanHost === "localhost" || cleanHost === "127.0.0.1"
        ? "http"
        : "https";
    return `${proto}://${cleanHost}${subpath}`;
  }
  // Agency- of preview-context — gebruik /sites/<slug>/ prefix
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://contentfactory.nextlevelsites.nl";
  return `${base.replace(/\/$/, "")}/sites/${slug}${subpath}`;
}

/** Geef alle geconfigureerde klant-hosts terug (voor sitemap/admin). */
export function listCustomHosts(): string[] {
  return Object.keys(HOST_TO_SLUG);
}
