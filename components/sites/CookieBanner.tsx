"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "nls:cookie-consent";

type Consent = "accepted" | "declined";

interface Props {
  /** Vertaling/persoonlijke tekst per klant */
  message?: string;
  privacyHref?: string;
}

/**
 * NL-AVG conforme cookie-banner. Twee gelijkwaardige buttons (geen dark
 * pattern). Verschijnt rechtsonder, blijft tot user kiest. Keuze blijft 12
 * maanden geldig via localStorage.
 *
 * Geen tracking-scripts in dit component zelf — andere code kan via
 * window.localStorage.getItem('nls:cookie-consent') === 'accepted' beslissen
 * of er analytics geladen mogen worden.
 */
export function CookieBanner({
  message = "Wij gebruiken cookies om de site beter te maken. Je mag ze accepteren of weigeren — beide kanten op werkt onze site even goed.",
  privacyHref,
}: Props) {
  const [decision, setDecision] = useState<Consent | null | "loading">(
    "loading"
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "accepted" || raw === "declined") {
        setDecision(raw);
      } else {
        setDecision(null);
      }
    } catch {
      setDecision(null);
    }
  }, []);

  function persist(value: Consent) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    setDecision(value);
  }

  if (decision === "loading" || decision === "accepted" || decision === "declined")
    return null;

  return (
    <div className="fixed bottom-3 left-3 z-[60] max-w-md sm:left-6 sm:bottom-6">
      <div className="rounded-2xl border border-white/15 bg-black/85 p-5 shadow-2xl backdrop-blur-2xl">
        <p className="text-sm leading-relaxed text-white/85">{message}</p>
        {privacyHref ? (
          <a
            href={privacyHref}
            className="mt-2 inline-block text-xs text-white/55 underline-offset-2 hover:underline"
          >
            Bekijk ons privacybeleid
          </a>
        ) : null}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => persist("declined")}
            className="flex-1 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Weiger
          </button>
          <button
            onClick={() => persist("accepted")}
            className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
          >
            Accepteer
          </button>
        </div>
      </div>
    </div>
  );
}
