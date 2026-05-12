import { NextResponse, type NextRequest } from "next/server";
import { hostToSlug, isAgencyHost } from "@/lib/sites/domains";

/**
 * Multi-tenant domain mapping.
 *
 * Voor onze eigen domeinen (nextlevelsites.nl, contentfactory subdomein,
 * Vercel-previews, localhost) doet middleware NIETS — alles blijft op de
 * canonieke /sites/<slug>/* paden.
 *
 * Voor klant-domeinen (geconfigureerd in lib/sites/domains.ts) rewriten we
 * paden zodat trattoriasole.nl/menu intern naar /sites/trattoria-sole/menu
 * wordt opgelost — zonder dat de browser-URL verandert. Schone URLs voor
 * de klant, eigen SEO-juice, zelfde codebase eronder.
 */
export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const { pathname, search } = req.nextUrl;

  // Agency / preview / localhost → niets doen
  if (isAgencyHost(host)) {
    return NextResponse.next();
  }

  // Statische assets en /sites/* paden direct doorlaten (geen rewrite)
  // /public assets staan op paden als /sites/italian-restaurant/exterior.jpg
  // en moeten van hun letterlijke pad geserveerd worden.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/sites/") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.svg" ||
    /\.(jpg|jpeg|png|webp|avif|svg|gif|ico|mp4|webm|woff2?|json|xml|txt|map)$/i.test(
      pathname
    )
  ) {
    return NextResponse.next();
  }

  // Klant-domein check
  const slug = hostToSlug(host);
  if (!slug) {
    // Onbekend host — geen rewrite. Vercel toont de root-app (kan 404 zijn
    // als het domein nog niet gekoppeld is aan een slug).
    return NextResponse.next();
  }

  // Rewrite /<anything> → /sites/<slug>/<anything>
  const url = req.nextUrl.clone();
  const targetPath =
    pathname === "/" ? `/sites/${slug}` : `/sites/${slug}${pathname}`;
  url.pathname = targetPath;
  return NextResponse.rewrite(url);
}

export const config = {
  // Run middleware op alle paden behalve interne Next.js paths
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - _next/data (RSC data)
     * - api/ (API routes — laten we expliciet zelf afhandelen)
     * - favicon en icon assets
     */
    "/((?!_next/static|_next/image|_next/data|favicon.ico|icon.svg).*)",
  ],
};
