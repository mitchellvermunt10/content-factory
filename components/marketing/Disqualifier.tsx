import { Check, X } from "lucide-react";
import { Reveal, RevealStagger, RevealItem } from "@/components/motion/Reveal";

interface DisqualifierProps {
  heading: string;
  subheading?: string;
  positive: { label: string; items: string[] };
  negative: { label: string; items: string[] };
}

/**
 * Editorial twee-koloms "voor wie wel / voor wie niet" sectie.
 * Premium agency-pattern: zelf-disqualifying tekst toont vertrouwen.
 * Geen sales-pitch — duidelijkheid. Mixed mono labels + serif headings.
 */
export function Disqualifier({
  heading,
  subheading,
  positive,
  negative,
}: DisqualifierProps) {
  return (
    <section className="relative border-t border-white/10 bg-black px-6 py-24 text-white sm:py-32">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/45">
            Eerlijk
          </p>
          <h2 className="mt-6 font-serif text-4xl font-light leading-tight tracking-tight md:text-6xl">
            {heading}
          </h2>
          {subheading ? (
            <p className="mt-6 max-w-2xl text-lg text-white/65">{subheading}</p>
          ) : null}
        </Reveal>

        <div className="mt-16 grid gap-12 md:grid-cols-2 md:gap-16">
          <RevealStagger stagger={0.08}>
            <RevealItem>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/55">
                {positive.label}
              </p>
            </RevealItem>
            <ul className="mt-6 space-y-4">
              {positive.items.map((item) => (
                <RevealItem key={item}>
                  <li className="flex items-start gap-3 border-b border-white/8 pb-4">
                    <Check className="mt-1 size-4 shrink-0 text-accent" />
                    <span className="text-base leading-relaxed text-white/85 sm:text-lg">
                      {item}
                    </span>
                  </li>
                </RevealItem>
              ))}
            </ul>
          </RevealStagger>

          <RevealStagger stagger={0.08}>
            <RevealItem>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
                {negative.label}
              </p>
            </RevealItem>
            <ul className="mt-6 space-y-4">
              {negative.items.map((item) => (
                <RevealItem key={item}>
                  <li className="flex items-start gap-3 border-b border-white/8 pb-4">
                    <X className="mt-1 size-4 shrink-0 text-white/30" />
                    <span className="text-base leading-relaxed text-white/55 sm:text-lg">
                      {item}
                    </span>
                  </li>
                </RevealItem>
              ))}
            </ul>
          </RevealStagger>
        </div>
      </div>
    </section>
  );
}
