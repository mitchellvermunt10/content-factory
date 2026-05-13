import { Upload, Settings2, Boxes, Truck, type LucideIcon } from "lucide-react";
import type { NextLevelSiteData } from "@/lib/sites/types";

const ICONS: Record<string, LucideIcon> = {
  upload: Upload,
  "settings-2": Settings2,
  boxes: Boxes,
  truck: Truck,
};

interface Props {
  process: NonNullable<NextLevelSiteData["process"]>;
}

/**
 * Cinematic 4-stappen-flow voor /proces. Per stap: icon + nummer/titel +
 * body. Layout: 2x2 grid op desktop, 1-koloms op mobiel.
 */
export function ProcessSteps({ process }: Props) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
      {process.headline ? (
        <h2 className="font-serif text-4xl font-light leading-tight md:text-5xl">
          {process.headline}
        </h2>
      ) : null}
      {process.intro ? (
        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-white/70">
          {process.intro}
        </p>
      ) : null}

      <ol className="mt-16 grid gap-8 sm:grid-cols-2 sm:gap-12">
        {process.steps.map((step, idx) => {
          const Icon = step.icon ? ICONS[step.icon] : null;
          return (
            <li
              key={idx}
              className="group relative flex flex-col rounded-2xl border border-white/10 bg-black/30 p-8 transition-colors hover:border-white/25"
            >
              {Icon ? (
                <Icon
                  className="mb-6 size-7 text-white/55 transition-colors group-hover:text-white/85"
                  strokeWidth={1.25}
                />
              ) : null}
              <h3 className="font-serif text-2xl font-light leading-snug">
                {step.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-white/65">
                {step.body}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
