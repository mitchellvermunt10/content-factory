import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative border-t border-border mt-32">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-5">
            <Logo />
            <p className="max-w-sm text-sm leading-relaxed text-text-muted pretty">
              De AI Content Factory levert volledige campagnes voor lokale
              ondernemers. Een product van Next Level Sites.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.18em] text-text-subtle">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/studio"
                  className="text-text-muted hover:text-text transition-colors"
                >
                  Studio
                </Link>
              </li>
              <li>
                <Link
                  href="/studio/nieuw"
                  className="text-text-muted hover:text-text transition-colors"
                >
                  Nieuwe campagne
                </Link>
              </li>
              <li>
                <Link
                  href="#deliverables"
                  className="text-text-muted hover:text-text transition-colors"
                >
                  Deliverables
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.18em] text-text-subtle">
              Studio
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="text-text-muted">Next Level Sites</li>
              <li className="text-text-muted">Nederland</li>
              <li>
                <a
                  href="mailto:hello@nextlevelsites.nl"
                  className="text-text-muted hover:text-text transition-colors"
                >
                  hello@nextlevelsites.nl
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 text-xs text-text-subtle md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Next Level Sites. Alle rechten voorbehouden.</p>
          <p className="font-mono uppercase tracking-[0.18em]">
            v0.1 · made in NL
          </p>
        </div>
      </div>
    </footer>
  );
}
