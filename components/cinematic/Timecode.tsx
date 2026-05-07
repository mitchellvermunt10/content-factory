import { cn } from "@/lib/utils";

export function formatTimecode(sec: number, fps = 24): string {
  const total = Math.max(0, sec);
  const hh = Math.floor(total / 3600);
  const mm = Math.floor((total % 3600) / 60);
  const ss = Math.floor(total % 60);
  const ff = Math.round((total - Math.floor(total)) * fps);
  return [
    hh.toString().padStart(2, "0"),
    mm.toString().padStart(2, "0"),
    ss.toString().padStart(2, "0"),
    ff.toString().padStart(2, "0"),
  ].join(":");
}

export function Timecode({
  start = 0,
  duration,
  className,
  variant = "default",
}: {
  start?: number;
  duration?: number;
  className?: string;
  variant?: "default" | "accent";
}) {
  const inTc = formatTimecode(start);
  const outTc = duration ? formatTimecode(start + duration) : null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded font-mono text-[10px] uppercase tracking-[0.18em]",
        variant === "accent"
          ? "text-accent"
          : "text-text-subtle",
        className
      )}
    >
      <span>{inTc}</span>
      {outTc ? (
        <>
          <span className="opacity-50">→</span>
          <span>{outTc}</span>
        </>
      ) : null}
    </span>
  );
}
