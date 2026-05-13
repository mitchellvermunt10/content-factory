"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import type { NextLevelSiteData } from "@/lib/sites/types";

interface Props {
  faq: NonNullable<NextLevelSiteData["faq"]>;
}

/**
 * Q&A accordion voor /faq. Eén-tegelijk-open patroon. Smooth height-transition
 * via grid-template-rows hack (geen JS-meting nodig). Heading-niveaus: h2 voor
 * vraag (was h3 — opgewaardeerd zodat FAQPage JSON-LD beter klopt).
 */
export function FaqAccordion({ faq }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
      <ul className="divide-y divide-white/10 border-y border-white/10">
        {faq.map((item, idx) => {
          const isOpen = idx === openIdx;
          return (
            <li key={idx}>
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="flex w-full items-start justify-between gap-6 py-7 text-left transition-colors hover:text-white"
                aria-expanded={isOpen}
              >
                <h2 className="font-serif text-xl font-light leading-snug md:text-2xl">
                  {item.question}
                </h2>
                <span
                  className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 transition-colors group-hover:border-white/40"
                  aria-hidden
                >
                  {isOpen ? (
                    <Minus className="size-4" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                </span>
              </button>
              <div
                className={`grid transition-all duration-500 ease-out ${
                  isOpen
                    ? "grid-rows-[1fr] pb-7 opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
                    {item.answer}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
