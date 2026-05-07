"use client";

import { Check, AlertTriangle, UploadCloud, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ASSET_STATUSES,
  ASSET_STATUS_LABEL,
  type AssetStatus,
} from "@/lib/constants";

const STYLE: Record<AssetStatus, string> = {
  missing: "border-border text-text-muted bg-surface/40",
  uploaded: "border-warning/40 bg-warning/10 text-warning",
  verified: "border-accent/40 bg-accent/10 text-accent",
  ready: "border-success/40 bg-success/10 text-success",
};

const ICON: Record<AssetStatus, React.ElementType> = {
  missing: AlertTriangle,
  uploaded: UploadCloud,
  verified: Check,
  ready: Lock,
};

function next(s: AssetStatus): AssetStatus {
  const i = ASSET_STATUSES.indexOf(s);
  return ASSET_STATUSES[(i + 1) % ASSET_STATUSES.length];
}

export function AssetStatusPill({
  status,
  onCycle,
  className,
  testId,
}: {
  status: AssetStatus;
  onCycle?: (next: AssetStatus) => void;
  className?: string;
  testId?: string;
}) {
  const Icon = ICON[status];
  const upcoming = next(status);
  const interactive = !!onCycle;

  const Element = interactive ? "button" : "span";

  return (
    <Element
      type={interactive ? "button" : undefined}
      data-testid={testId}
      onClick={interactive ? () => onCycle(upcoming) : undefined}
      title={
        interactive
          ? `${ASSET_STATUS_LABEL[status]} → klik voor ${ASSET_STATUS_LABEL[upcoming]}`
          : ASSET_STATUS_LABEL[status]
      }
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-tight",
        "transition-all duration-200",
        STYLE[status],
        interactive && "cursor-pointer hover:brightness-110",
        className
      )}
    >
      <Icon className="size-3" />
      {ASSET_STATUS_LABEL[status]}
    </Element>
  );
}
