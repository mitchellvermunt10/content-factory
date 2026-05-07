import { cn } from "@/lib/utils";

export function GradientMesh({
  className,
  intensity = "medium",
}: {
  className?: string;
  intensity?: "soft" | "medium" | "strong";
}) {
  const opacity =
    intensity === "soft" ? 0.35 : intensity === "strong" ? 0.85 : 0.6;

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10", className)}
    >
      <div className="absolute inset-0 grid-faint opacity-30" />
      <div
        className="absolute -top-32 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full blur-3xl animate-mesh-shift"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--accent) / 0.4), transparent 70%)",
          opacity,
        }}
      />
      <div
        className="absolute right-0 top-1/3 h-[420px] w-[420px] rounded-full blur-3xl animate-mesh-shift"
        style={{
          background:
            "radial-gradient(closest-side, hsl(290 80% 60% / 0.3), transparent 70%)",
          opacity,
          animationDelay: "-6s",
        }}
      />
      <div
        className="absolute -left-20 bottom-10 h-[520px] w-[520px] rounded-full blur-3xl animate-mesh-shift"
        style={{
          background:
            "radial-gradient(closest-side, hsl(210 90% 60% / 0.25), transparent 70%)",
          opacity,
          animationDelay: "-12s",
        }}
      />
    </div>
  );
}
