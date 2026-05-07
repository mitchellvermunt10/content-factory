"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CopyableBlock({
  value,
  onChange,
  label,
  meta,
  rows = 4,
  className,
  readOnly = false,
}: {
  value: string;
  onChange?: (v: string) => void;
  label?: string;
  meta?: React.ReactNode;
  rows?: number;
  className?: string;
  readOnly?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Gekopieerd");
      setTimeout(() => setCopied(false), 1400);
    } catch {
      toast.error("Kopiëren mislukt");
    }
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-bg/40",
        className
      )}
    >
      {(label || meta) && (
        <div className="flex items-center justify-between gap-3 border-b border-border bg-surface/40 px-4 py-2">
          {label ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              {label}
            </span>
          ) : (
            <span />
          )}
          {meta}
        </div>
      )}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          rows={rows}
          readOnly={readOnly || !onChange}
          spellCheck={false}
          className="block w-full resize-none border-0 bg-transparent px-4 py-3 pr-12 font-mono text-xs leading-relaxed text-text outline-none placeholder:text-text-subtle"
        />
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "absolute right-2 top-2 grid size-8 place-items-center rounded-lg border border-border bg-elevated text-text-muted transition-all duration-200",
            "hover:border-border-strong hover:text-text",
            copied && "border-accent/40 text-accent"
          )}
          aria-label="Kopieer prompt"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>
    </div>
  );
}
