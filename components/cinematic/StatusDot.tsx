import { cn } from "@/lib/utils";
import type { PhaseStatus, RenderStatus } from "@/lib/constants";

const COLOR: Record<PhaseStatus | RenderStatus, string> = {
  pending: "bg-text-subtle/40",
  "in-progress": "bg-warning",
  rendering: "bg-warning",
  review: "bg-accent",
  done: "bg-success",
  ready: "bg-success",
  blocked: "bg-danger",
  queued: "bg-text-subtle/40",
  failed: "bg-danger",
};

const PULSE: (PhaseStatus | RenderStatus)[] = [
  "in-progress",
  "rendering",
  "review",
];

export function StatusDot({
  status,
  size = "md",
  className,
}: {
  status: PhaseStatus | RenderStatus;
  size?: "sm" | "md";
  className?: string;
}) {
  const dim = size === "sm" ? "size-1.5" : "size-2";
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      aria-label={status}
      title={status}
    >
      {PULSE.includes(status) && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
            COLOR[status]
          )}
        />
      )}
      <span
        className={cn(
          "relative inline-flex rounded-full",
          dim,
          COLOR[status]
        )}
      />
    </span>
  );
}
