// Next Level Sites — datamodel
// Beschrijft een cinematic scroll-site voor een lokale ondernemer.

export type SceneKind =
  | "intro" // gevel + naam + push-in start
  | "arrival" // binnenkomst + tagline + reservering-pin
  | "menu" // menu-kaarten
  | "ambiance" // sfeerbeelden-grid (Instagram)
  | "contact"; // reservering / openingstijden / kaart

export interface SceneSpec {
  id: string;
  kind: SceneKind;
  /** Frame-range binnen de globale frame-sequence die deze scene "bezit" */
  frameRange: { from: number; to: number };
  /** Tekst-content per scene, vrij vorm — wordt door specifieke Scene-componenten geïnterpreteerd */
  content: Record<string, unknown>;
}

export interface NextLevelSiteData {
  slug: string;
  business: {
    name: string;
    tagline: string;
    vertical: string; // restaurant, salon, garage...
    city: string;
    address?: string;
    phone?: string;
    reservationUrl?: string;
    /** WhatsApp-nummer in internationaal formaat (+31612345678) */
    whatsapp?: string;
    /** Optioneel: bericht dat WhatsApp-link automatisch invult */
    whatsappMessage?: string;
  };
  /** Volledige frame-sequence (data URI of remote URL) */
  frames: string[];
  scenes: SceneSpec[];
  /** Sfeerbeelden uit IG/website */
  photos?: { url: string; alt?: string }[];
  /** Menu / dienst-items */
  items?: { name: string; description?: string; price?: string }[];
  brand?: {
    accentColor?: string;
    fontDisplay?: string;
  };
}
