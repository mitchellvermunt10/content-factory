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

/** Gestructureerd adres voor Schema.org + lokale SEO */
export interface StructuredAddress {
  street: string; // "Voorstraat 84"
  postalCode: string; // "3512 AS"
  city: string;
  region?: string; // "Utrecht" (provincie)
  country: string; // "NL"
  formatted: string; // "Voorstraat 84, 3512 AS Utrecht"
}

export interface NextLevelSiteData {
  slug: string;
  /** Markeer als demo zodat sitemap/robots 'm uitsluiten en noindex aan staat */
  isDemo?: boolean;
  business: {
    name: string;
    tagline: string;
    vertical: string;
    /** Schema.org vertical type, bv. "Restaurant", "BeautySalon", "AutoRepair", "Dentist" */
    schemaType?: "Restaurant" | "BeautySalon" | "AutoRepair" | "Dentist" | "LocalBusiness";
    city: string;
    address?: StructuredAddress;
    /** Latitude/longitude voor Google's local pack */
    geo?: { lat: number; lng: number };
    /** Cuisine voor restaurants, type-of-service voor andere verticals */
    cuisine?: string;
    /** "€", "€€", "€€€", "€€€€" */
    priceRange?: "€" | "€€" | "€€€" | "€€€€";
    phone?: string;
    reservationUrl?: string;
    whatsapp?: string;
    whatsappMessage?: string;
    /** Externe profielen voor sameAs in Schema (IG, FB, Google Business) */
    sameAs?: string[];
    /** Voor footer-compliance */
    kvk?: string;
    btw?: string;
  };
  /** Volledige frame-sequence (data URI of remote URL) */
  frames: string[];
  scenes: SceneSpec[];
  /** Sfeerbeelden uit IG/website */
  photos?: { url: string; alt?: string }[];
  /** Menu / dienst-items (korte versie voor home-page scene 3) */
  items?: { name: string; description?: string; price?: string }[];

  // ────────────────────────────────────────────────────────────
  // Subpage content — uitgebreid per-pagina materiaal
  // ────────────────────────────────────────────────────────────

  /** /menu — volledige kaart met categorieën */
  menuCategories?: {
    name: string;
    description?: string;
    items: {
      name: string;
      description?: string;
      price?: string;
      photo?: string;
      tags?: string[]; // bv. "vegetarisch", "specialty"
    }[];
  }[];

  /** /verhaal — over de zaak */
  story?: {
    headline: string;
    intro: string; // 1-2 paragrafen, opening
    sections: {
      headline?: string;
      body: string;
      image?: string;
    }[];
    chef?: {
      name: string;
      role?: string;
      photo?: string;
      quote?: string;
    };
  };

  /** /contact + /reserveren — openingstijden */
  hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
    /** Optionele losse opmerking, bv. "Keuken sluit 30 min eerder" */
    note?: string;
  };

  /** Extra contact-velden */
  email?: string;
  parkingInfo?: string;

  /** Sociaal-bewijs blok — gebruikt door SocialProofStrip + ReviewsSection */
  socialProof?: {
    google?: {
      rating: number; // 4.8
      count: number; // 312
      url?: string;
    };
    awards?: { name: string; year?: number; rank?: string }[]; // bv. Lekker500 #84
    press?: { name: string; quote?: string; url?: string; logoUrl?: string }[];
    testimonials?: {
      quote: string;
      author: string;
      source?: string; // "Google review, maart 2026"
      date?: string;
    }[];
  };

  brand?: {
    accentColor?: string;
    fontDisplay?: string;
  };
}
