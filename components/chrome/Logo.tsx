import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 text-text",
        className
      )}
    >
      <span className="relative grid h-7 w-7 place-items-center rounded-md border border-border bg-elevated">
        <span className="absolute inset-[3px] rounded-[5px] bg-gradient-to-br from-accent/80 via-accent/40 to-transparent" />
        <span className="relative font-mono text-[11px] font-semibold text-bg">
          AI
        </span>
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[13px] font-medium tracking-tight">
          Content Factory
        </span>
        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-text-subtle">
          Next Level Sites
        </span>
      </span>
    </Link>
  );
}
