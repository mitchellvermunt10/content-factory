"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { Logo } from "@/components/chrome/Logo";
import { Button } from "@/components/ui/button";

export function MobileTopBar() {
  const pathname = usePathname() ?? "";
  const isWizard = pathname.startsWith("/studio/nieuw");
  const isCampaign = /^\/studio\/campaigns\/[^/]+/.test(pathname);

  const showBack = isWizard || isCampaign;
  const backHref = "/studio";

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-border bg-bg/85 px-4 backdrop-blur-md md:hidden">
      {showBack ? (
        <Button asChild variant="ghost" size="sm">
          <Link href={backHref} aria-label="Terug naar studio">
            <ArrowLeft className="size-4" />
            Terug
          </Link>
        </Button>
      ) : (
        <Logo />
      )}
      {!isWizard ? (
        <Button asChild variant="primary" size="sm">
          <Link href="/studio/nieuw" aria-label="Nieuwe campagne">
            <Plus className="size-3.5" />
            Nieuw
          </Link>
        </Button>
      ) : (
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
          Wizard
        </span>
      )}
    </header>
  );
}
