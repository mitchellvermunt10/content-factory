"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
  shimmer = false,
  variant = "accent",
}: {
  value: number;
  className?: string;
  shimmer?: boolean;
  variant?: "accent" | "success" | "warning" | "danger";
}) {
  const color =
    variant === "success"
      ? "bg-success"
      : variant === "warning"
      ? "bg-warning"
      : variant === "danger"
      ? "bg-danger"
      : "bg-accent";

  return (
    <div
      className={cn(
        "relative h-1 w-full overflow-hidden rounded-full bg-elevated",
        className
      )}
    >
      <motion.span
        initial={false}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={cn("absolute inset-y-0 left-0 rounded-full", color)}
      />
      {shimmer && value < 100 ? (
        <span className="absolute inset-y-0 -left-1/3 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      ) : null}
    </div>
  );
}
