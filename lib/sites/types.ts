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

/**
 * Filament-kleur in shop palette. Hex is zonder #, bv. "FF6A13" voor Pumpkin
 * Orange. Bambu Lab PLA Basic palette als referentie.
 */
export interface ShopColor {
  /** Stable ID, bv. "pumpkin-orange" — gebruikt als selectie-key */
  id: string;
  /** Display-naam, bv. "Pumpkin Orange" */
  name: string;
  /** Hex zonder #, bv. "FF6A13" */
  hex: string;
}

/**
 * Eén product in een shop (bv. JJ-3D's 3D-print-catalog). Wordt
 * geïmporteerd uit MakerWorld URLs of handmatig toegevoegd.
 */
export interface ShopProduct {
  /** Stable ID (vaak MakerWorld model-ID) — gebruikt in URL en orders */
  id: string;
  /** Korte product-titel voor catalog */
  title: string;
  /** Optioneel: langere description */
  description?: string;
  /** Verkoopprijs in EUR — single-color tier (basis) */
  priceEur: number;
  /**
   * Optionele AMS-premium-tier prijs voor multi-color print (4-color via Bambu
   * Lab AMS Combo). Wanneer aanwezig toont ProductDetail een tier-selector
   * en ShopCatalog "vanaf €X". Bij ontbreken: alleen single-color verkocht.
   */
  priceAmsEur?: number;
  /** Optionele uitleg wat AMS-tier toevoegt, bv. "Gradient print" of "Letter per kleur". */
  amsDescription?: string;
  /** Local public path naar hoofd-foto (cinematic hero shot voor catalog) */
  image: string;
  /**
   * Optionele extra foto's voor de product-detail gallery. Typisch
   * MakerWorld product-shots (echte renders/foto's van het 3D-print, vs
   * de cinematic hero). Eerste = hoofdfoto, rest = klikbare thumbnails.
   * Wanneer leeg/ontbrekend toont ProductDetail alleen `image`.
   */
  gallery?: string[];
  /** Optioneel: print-tijd in minuten, voor info-tag */
  printTimeMinutes?: number;
  /** Optionele tags voor filter, bv. ['hebbedingetje', 'desk', 'wijn'] */
  tags?: string[];
  /** Optionele bron-URL (bv. MakerWorld) — niet getoond op site */
  sourceUrl?: string;
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

  /**
   * Voor shop-sites (zoals JJ-3D): producten-catalogus die mensen
   * kunnen kopen via ingebouwde Mollie-checkout.
   */
  shop?: {
    /** Mollie betaal-modus 'live' of 'test' (test gebruikt sandbox-keys) */
    mode?: "test" | "live";
    /** Verzendkosten in EUR */
    shippingEur?: number;
    /** Verwachte levertijd-tekst, bv. '3-7 werkdagen' */
    deliveryNote?: string;
    products?: ShopProduct[];
    /**
     * Beschikbare filament-kleuren shop-breed. Wordt door ProductDetail
     * gebruikt als kleur-swatch picker. Per product kan via ShopProduct.
     * availableColorIds gefilterd worden, anders zijn alle kleuren beschikbaar.
     */
    colors?: ShopColor[];
  };

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

  /**
   * /proces — uitleg over hoe een opdracht / dienst werkt. Voor shops:
   * 4-stappen flow (bestand → slicen → printen → versturen). Voor andere
   * verticals: stappen-overzicht van een service.
   */
  process?: {
    headline?: string; // bv. "Van bestand naar bureau"
    intro?: string; // 1-2 zinnen onder de headline
    steps: {
      title: string; // bv. "1. Stuur je bestand"
      body: string; // beschrijving van de stap
      icon?: string; // optionele icon-naam (lucide), bv. "upload"
    }[];
  };

  /** /faq — Q&A's, gebruikt voor FAQPage Schema.org JSON-LD */
  faq?: {
    question: string;
    answer: string;
  }[];

  /**
   * /maatwerk — custom request flow. Voor JJ-3D: STL upload of korte
   * omschrijving + budget. Submission gaat via /api/sites/<slug>/custom-request
   * naar customRequest.email (Resend) — stub tot we klant-email hebben.
   */
  customRequest?: {
    /** Klant-email waar maatwerk-aanvragen naartoe gaan */
    email?: string;
    /** Tagline boven het formulier, bv. "Stuur ons je idee" */
    headline?: string;
    intro?: string;
  };

  /**
   * Hero-image per subpage path. Default fallback per template,
   * maar kan per pagina geoverride worden. Key = pagina-path zonder
   * leading slash, bv. "contact", "proces".
   */
  subpageHeroes?: Record<string, string>;

  /**
   * Twee atmosfeer-images die NA de Kling-dolly opkomen als Ken Burns
   * cinematic shots (scroll-progress 0.32-1.0). Eerste = mid-scroll
   * "food/process" shot, tweede = late-scroll "ambiance" shot. Default
   * fallback in SiteExperience is naar restaurant-shots — voor andere
   * verticals (shop, kapsalon, etc.) hier expliciet zetten.
   */
  postVideoImages?: [string, string];

  /**
   * SEO landing-pages voor specifieke keyword-clusters (bv. skadis,
   * tesla, sinterklaas-surprise). Gerendered op /sites/<slug>/landing/<topic>.
   * Per landing: eigen hero, intro, content-secties, optionele product-
   * verwijzingen, en Schema.org metadata.
   */
  landingPages?: {
    /** URL-segment, bv. "skadis-accessoires" */
    topic: string;
    /** Primary SEO-keyword voor meta */
    keyword: string;
    /** Hero-titel */
    title: string;
    /** Hero-eyebrow (kleine bovenstaande tekst) */
    eyebrow?: string;
    /** Hero-subtitle, ook gebruikt als meta-description */
    subtitle: string;
    /** Optioneel: hero-image pad */
    heroImage?: string;
    /** Intro-paragraaf onder hero */
    intro: string;
    /** Content-secties op de page */
    sections?: {
      headline: string;
      body: string;
    }[];
    /** Referenties naar shop.products IDs die op deze landing horen */
    productIds?: string[];
    /** CTA-knop tekst onderaan */
    ctaLabel?: string;
    /** CTA-knop bestemming (default /maatwerk) */
    ctaHref?: string;
  }[];

  brand?: {
    accentColor?: string;
    fontDisplay?: string;
  };

  /**
   * Scene-specifieke labels per vertical. Restaurant gebruikt 'De kaart',
   * kapsalon 'Onze diensten', 3D-printing 'Wat we maken'. Met fallback
   * naar restaurant-defaults zodat oudere slugs niet breken.
   */
  sceneLabels?: {
    intro?: {
      eyebrow?: string; // bv. "Utrecht · Italiaans restaurant"
    };
    arrival?: {
      eyebrow?: string; // bv. "Welkom binnen"
      headline?: string; // grote tekst onder eyebrow
      ctaLabel?: string; // bv. "Reserveer een tafel" of "Boek een afspraak"
    };
    menu?: {
      eyebrow?: string; // bv. "De kaart" of "Onze diensten"
      headline?: string; // bv. "Wat we serveren" of "Wat we doen"
    };
    ambiance?: {
      eyebrow?: string; // bv. "Sfeer" of "Het werk"
      headline?: string; // bv. "Zoals het écht voelt" of "Recente projecten"
    };
    contact?: {
      eyebrow?: string; // bv. "Tot snel" of "Vraag een offerte"
      headline?: string; // bv. "Kom langs" of "Stuur ons je idee"
      ctaLabel?: string; // bv. "Reserveer nu" of "Vraag offerte aan"
    };
  };
}
