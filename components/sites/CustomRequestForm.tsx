"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

interface Props {
  slug: string;
  /** Tagline boven het formulier */
  headline?: string;
  intro?: string;
}

/**
 * Maatwerk-aanvraag formulier voor shop-sites. POST naar
 * /api/sites/<slug>/custom-request. Voor v1: tekst-velden + optionele
 * MakerWorld-URL. STL file upload komt in v2 (Supabase Storage).
 */
export function CustomRequestForm({ slug, headline, intro }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    setSubmitting(true);
    try {
      const res = await fetch(`/api/sites/${slug}/custom-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setDone(true);
      toast.success("Aanvraag binnen", {
        description: "Je hoort binnen een werkdag van ons.",
      });
    } catch (err) {
      toast.error("Versturen mislukt", {
        description: err instanceof Error ? err.message : "Onbekende fout",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <h2 className="font-serif text-4xl font-light md:text-5xl">
          Bedankt — we lezen 'm.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-white/70">
          Binnen een werkdag krijg je antwoord met een prijsopgave en levertijd.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 sm:py-28">
      {headline ? (
        <h2 className="font-serif text-4xl font-light leading-tight md:text-5xl">
          {headline}
        </h2>
      ) : null}
      {intro ? (
        <p className="mt-6 text-lg leading-relaxed text-white/70">{intro}</p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-12 space-y-6">
        <Field name="name" label="Naam" required />
        <Field name="email" type="email" label="E-mail" required />
        <Field
          name="phone"
          type="tel"
          label="Telefoon (optioneel)"
          autoComplete="tel"
        />
        <Field
          name="sourceUrl"
          type="url"
          label="MakerWorld / Thingiverse link (optioneel)"
          placeholder="https://..."
        />
        <Field
          name="description"
          label="Wat wil je laten printen?"
          required
          multiline
          rows={5}
          placeholder="Bv. 'Een houder voor mijn AirPods Pro 2, mat zwart, formaat A6.' Hoe specifieker, hoe sneller we kunnen schatten."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            name="budget"
            label="Budget-indicatie (optioneel)"
            placeholder="€20 - €50"
          />
          <Field
            name="deadline"
            label="Deadline (optioneel)"
            placeholder="Geen haast / volgende week"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-5 text-base font-medium text-black transition-transform hover:scale-[1.01] disabled:opacity-60 sm:w-auto"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Versturen...
            </>
          ) : (
            <>
              <Send className="size-4" />
              Stuur aanvraag
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  multiline,
  rows,
  placeholder,
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  autoComplete?: string;
}) {
  const baseClass =
    "w-full rounded-xl border border-white/15 bg-white/5 px-5 py-4 text-base text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/45 focus:bg-white/10";
  return (
    <label className="block">
      <span className="block font-mono text-[10px] uppercase tracking-[0.3em] text-white/55">
        {label}
        {required ? " *" : ""}
      </span>
      <div className="mt-2">
        {multiline ? (
          <textarea
            name={name}
            required={required}
            rows={rows ?? 4}
            placeholder={placeholder}
            className={`${baseClass} resize-y`}
          />
        ) : (
          <input
            name={name}
            type={type}
            required={required}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className={baseClass}
          />
        )}
      </div>
    </label>
  );
}
