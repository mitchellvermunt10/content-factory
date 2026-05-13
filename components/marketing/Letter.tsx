import { Reveal } from "@/components/motion/Reveal";

/**
 * Persoonlijke brief van Mitchell — editorial moment dat Substack-vibes
 * geeft i.p.v. agency-template. Licht-creme achtergrond breekt het
 * eindeloze zwart-cinematic. Mixed typography (serif body + monospace
 * metadata) voelt magazine-achtig.
 *
 * COPY wordt finaal ingevuld na agent-review.
 */
interface LetterProps {
  /** Plaatsbepaling boven de brief, bv. "Brief van de maker" */
  eyebrow?: string;
  /** Paragrafen — gewone JSX/string */
  paragraphs: React.ReactNode[];
  /** Handtekening-tekst, bv. "Mitchell Vermunt · Utrecht" */
  signature: string;
  /** Datum, bv. "Mei 2026" */
  dateLine?: string;
}

export function Letter({
  eyebrow = "Een woord vooraf",
  paragraphs,
  signature,
  dateLine,
}: LetterProps) {
  return (
    <section className="relative border-y border-black/10 bg-[#F5F1EA] px-6 py-24 text-zinc-900 sm:py-32">
      <Reveal className="mx-auto max-w-2xl">
        {/* Header met datum/locatie als metadata */}
        <div className="flex items-baseline justify-between border-b border-black/15 pb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
          <span>{eyebrow}</span>
          {dateLine ? <span>{dateLine}</span> : null}
        </div>

        {/* Body */}
        <div className="mt-10 space-y-7 font-serif text-xl leading-[1.65] text-zinc-800 sm:text-[22px]">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* Handtekening */}
        <div className="mt-12 border-t border-black/15 pt-6 font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
          {signature}
        </div>
      </Reveal>
    </section>
  );
}
