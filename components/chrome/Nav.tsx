"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { label: "Werkwijze", href: "#werkwijze" },
  { label: "Deliverables", href: "#deliverables" },
  { label: "Verticals", href: "#verticals" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-500 ease-expo-out",
        scrolled ? "py-2.5" : "py-5"
      )}
    >
      <div className="container">
        <div
          className={cn(
            "mx-auto flex items-center justify-between rounded-full px-4 transition-all duration-500 ease-expo-out",
            scrolled
              ? "h-12 max-w-3xl border border-border bg-bg/70 backdrop-blur-xl shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]"
              : "h-14 max-w-5xl border border-transparent"
          )}
        >
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full px-3.5 py-1.5 text-[13px] text-text-muted transition-colors hover:text-text"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Link href="/studio">Studio</Link>
            </Button>
            <Button asChild variant="primary" size="sm">
              <Link href="/studio/nieuw">
                Start campagne
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
