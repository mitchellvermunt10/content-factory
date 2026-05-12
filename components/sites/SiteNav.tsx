"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

interface Props {
  slug: string;
  businessName: string;
  /** Op de home-page start de nav transparant en wordt solid na scroll.
   *  Op subpages is hij direct solid. */
  startTransparent?: boolean;
}

const NAV_LINKS = [
  { href: "", label: "Home" },
  { href: "/menu", label: "Kaart" },
  { href: "/reserveren", label: "Reserveren" },
  { href: "/verhaal", label: "Verhaal" },
  { href: "/contact", label: "Contact" },
];

/**
 * Sticky top navigation voor de Next Level Site.
 * - Op home (startTransparent=true): begint volledig transparant,
 *   krijgt backdrop-blur na scroll > 100px.
 * - Op subpages: direct solid met backdrop-blur.
 * - Mobiel: hamburger → fullscreen drawer.
 */
export function SiteNav({ slug, businessName, startTransparent = false }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!startTransparent) {
      setScrolled(true);
      return;
    }
    function onScroll() {
      setScrolled(window.scrollY > 100);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [startTransparent]);

  const basePath = `/sites/${slug}`;
  const isActive = (href: string) =>
    href === "" ? pathname === basePath : pathname === `${basePath}${href}`;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
          scrolled
            ? "border-b border-white/10 bg-black/55 backdrop-blur-2xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href={basePath}
            className="font-serif text-lg tracking-tight text-white"
          >
            {businessName}
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const href = `${basePath}${link.href}`;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={href}
                  className={`rounded-full px-4 py-2 text-sm transition-colors ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-white md:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl md:hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <Link
              href={basePath}
              onClick={() => setOpen(false)}
              className="font-serif text-lg text-white"
            >
              {businessName}
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-white"
              aria-label="Sluit menu"
            >
              <X className="size-5" />
            </button>
          </div>
          <nav className="mt-8 flex flex-col gap-2 px-6">
            {NAV_LINKS.map((link) => {
              const href = `${basePath}${link.href}`;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl border px-5 py-4 font-serif text-2xl ${
                    active
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-white/10 text-white/70"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </>
  );
}
