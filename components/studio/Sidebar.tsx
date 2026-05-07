"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  PlusCircle,
  Settings,
  ArrowUpRight,
  HelpCircle,
} from "lucide-react";
import { Logo } from "@/components/chrome/Logo";
import { cn } from "@/lib/utils";

const items = [
  { href: "/studio", label: "Campagnes", icon: LayoutGrid },
  { href: "/studio/nieuw", label: "Nieuwe campagne", icon: PlusCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-border bg-bg/60 backdrop-blur-md md:flex">
      <div className="flex h-[68px] items-center border-b border-border px-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {items.map((it) => {
          const active =
            it.href === "/studio"
              ? pathname === "/studio"
              : pathname?.startsWith(it.href);
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ease-expo-out",
                active
                  ? "bg-elevated text-text shadow-[inset_0_1px_0_0_hsl(var(--text)/0.06)]"
                  : "text-text-muted hover:bg-surface hover:text-text"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="font-medium tracking-tight">{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 p-3">
        <Link
          href="/"
          className="flex items-center justify-between rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text-muted transition-colors hover:text-text"
        >
          <span className="flex items-center gap-2.5">
            <ArrowUpRight className="size-4" />
            Naar marketing
          </span>
        </Link>
        <div className="flex items-center justify-between rounded-xl bg-surface/40 px-3 py-2.5 text-xs text-text-subtle">
          <span className="flex items-center gap-2">
            <HelpCircle className="size-3.5" />
            Mock-mode actief?
          </span>
          <code className="font-mono">.env</code>
        </div>
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-text-subtle">
          <Settings className="size-3.5" />
          v0.1 · Next Level Sites
        </div>
      </div>
    </aside>
  );
}
