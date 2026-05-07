import type { Brand } from "@/lib/schemas/brand";
import type { BusinessBrief } from "@/lib/schemas/brief";
import type { ToneValue } from "@/lib/constants";

const VOICE_BY_TONE: Record<ToneValue, string> = {
  luxueus:
    "warm, statig, met bedachtzame ritmiek; sensorische beschrijvingen; gebruikt 'u' bij twijfel.",
  speels:
    "luchtig en uitnodigend; korte zinnen; 'je' vorm; gebruikt af en toe ironie.",
  klinisch:
    "feitelijk, geruststellend, geen jargon, kort en duidelijk; 'u' vorm.",
  stoer: "kort en krachtig; werkwoord vooraan; geen poespas; 'je' vorm.",
  warm: "menselijk, persoonlijke voornaamwoorden; verhalend; 'je' vorm.",
  minimal:
    "ultrakort, ritmisch, witregels werken hard; geen overbodige bijvoeglijke naamwoorden.",
};

const MOTION_BY_TONE: Record<ToneValue, Brand["motionTone"]> = {
  luxueus: "subtle",
  speels: "playful",
  klinisch: "subtle",
  stoer: "bold",
  warm: "subtle",
  minimal: "subtle",
};

const TYPE_BY_TONE: Record<ToneValue, { display: string; body: string }> = {
  luxueus: { display: "Cormorant Garamond", body: "Inter" },
  speels: { display: "Inter Display", body: "Inter" },
  klinisch: { display: "Inter Display", body: "Inter" },
  stoer: { display: "Anton", body: "Inter" },
  warm: { display: "Fraunces", body: "Inter" },
  minimal: { display: "Inter Display", body: "Inter" },
};

function lighten(hex: string, amount: number): string {
  const c = hex.replace("#", "");
  const num = parseInt(c, 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount));
  const b = Math.min(255, (num & 0xff) + Math.round(255 * amount));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function darken(hex: string, amount: number): string {
  return lighten(hex, -amount);
}

export function deriveBrand(brief: BusinessBrief): Brand {
  const [primary, secondary, accent] = [
    brief.brandColors[0],
    brief.brandColors[1] ?? lighten(brief.brandColors[0], 0.15),
    brief.brandColors[2] ?? brief.brandColors[1] ?? brief.brandColors[0],
  ];

  return {
    primary,
    secondary,
    accent,
    bg: "#0A0A0B",
    surface: darken(primary, 0.6),
    text: "#F5F4F2",
    textMuted: "#A0A0A8",
    display: TYPE_BY_TONE[brief.tone].display,
    body: TYPE_BY_TONE[brief.tone].body,
    voice: VOICE_BY_TONE[brief.tone],
    motionTone: MOTION_BY_TONE[brief.tone],
  };
}
