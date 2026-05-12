import { Star } from "lucide-react";
import type { NextLevelSiteData } from "@/lib/sites/types";

interface Props {
  socialProof: NonNullable<NextLevelSiteData["socialProof"]>;
}

/**
 * Subtiele typografische strook met Google rating, awards, en pers-vermeldingen.
 * Past in donker premium-design: alleen mono-text, geen badges/kleuren.
 * Plek: tussen scene 1 (intro) en scene 2 (arrival), of als sticky-strip.
 */
export function SocialProofStrip({ socialProof }: Props) {
  const items: { label: string; sub?: string }[] = [];

  if (socialProof.google) {
    items.push({
      label: `★ ${socialProof.google.rating.toFixed(1)} Google`,
      sub: `${socialProof.google.count} recensies`,
    });
  }

  for (const award of socialProof.awards ?? []) {
    items.push({
      label: award.name,
      sub: [award.rank, award.year ? String(award.year) : null]
        .filter(Boolean)
        .join(" · "),
    });
  }

  for (const press of socialProof.press ?? []) {
    items.push({ label: press.name, sub: "genoemd in" });
  }

  if (items.length === 0) return null;

  return (
    <div className="border-y border-white/10 bg-black/40 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-12 gap-y-3 px-6 py-5">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-baseline gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/60"
          >
            <span className="text-white/85">{item.label}</span>
            {item.sub ? <span className="text-white/40">— {item.sub}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Compactere variant — voor gebruik in een hero of CTA-strip.
 * Toont alleen Google rating en eerste award.
 */
export function SocialProofInline({ socialProof }: Props) {
  const g = socialProof.google;
  const a = socialProof.awards?.[0];
  if (!g && !a) return null;
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">
      {g ? (
        <span className="inline-flex items-baseline gap-1.5">
          <Star className="size-3 fill-white/85 stroke-none" />
          {g.rating.toFixed(1)} Google · {g.count} recensies
        </span>
      ) : null}
      {g && a ? <span className="mx-3 text-white/30">·</span> : null}
      {a ? (
        <span>
          {a.name}
          {a.rank ? ` ${a.rank}` : ""}
        </span>
      ) : null}
    </p>
  );
}
