import Link from "next/link";
import type { NextLevelSiteData } from "@/lib/sites/types";

interface Props {
  data: NextLevelSiteData;
}

/**
 * Volledige site-footer voor zowel home als subpages.
 * Bevat NAP (Name/Address/Phone) voor SEO-validatie + compliance-blok
 * (KVK/BTW/privacy) + alle 5 page-links voor crawlability.
 */
export function SiteFooter({ data }: Props) {
  const base = `/sites/${data.slug}`;
  const a = data.business.address;
  return (
    <footer className="relative z-10 border-t border-white/10 bg-black px-6 pb-12 pt-16 text-white/60">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-3 md:gap-16">
          {/* NAP */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
              Vind ons
            </p>
            <p className="mt-4 font-serif text-xl text-white">
              {data.business.name}
            </p>
            {a ? (
              <address className="mt-2 text-sm not-italic leading-relaxed">
                {a.street}
                <br />
                {a.postalCode} {a.city}
              </address>
            ) : null}
            {data.business.phone ? (
              <p className="mt-2 text-sm">
                <a
                  href={`tel:${data.business.phone.replace(/\s/g, "")}`}
                  className="hover:text-white"
                >
                  {data.business.phone}
                </a>
              </p>
            ) : null}
            {data.email ? (
              <p className="mt-1 text-sm">
                <a href={`mailto:${data.email}`} className="hover:text-white">
                  {data.email}
                </a>
              </p>
            ) : null}
          </div>

          {/* Navigatie */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
              Pagina's
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href={base} className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href={`${base}/menu`} className="hover:text-white">
                  Kaart
                </Link>
              </li>
              <li>
                <Link href={`${base}/reserveren`} className="hover:text-white">
                  Reserveren
                </Link>
              </li>
              <li>
                <Link href={`${base}/verhaal`} className="hover:text-white">
                  Verhaal
                </Link>
              </li>
              <li>
                <Link href={`${base}/contact`} className="hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Sociale + compliance */}
          <div>
            {data.business.sameAs && data.business.sameAs.length > 0 ? (
              <>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
                  Volg ons
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  {data.business.sameAs.map((href) => {
                    const platform = href.includes("instagram")
                      ? "Instagram"
                      : href.includes("facebook")
                        ? "Facebook"
                        : href.includes("maps.google")
                          ? "Google"
                          : "Profiel";
                    return (
                      <li key={href}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-white"
                        >
                          {platform}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : null}

            {data.business.kvk || data.business.btw ? (
              <div className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
                {data.business.kvk ? <p>KVK {data.business.kvk}</p> : null}
                {data.business.btw ? <p className="mt-1">{data.business.btw}</p> : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-center sm:flex-row sm:text-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/35">
            Gemaakt door Next Level Sites
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/35">
            © {new Date().getFullYear()} {data.business.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
