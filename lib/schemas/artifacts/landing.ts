import { z } from "zod";

// Character-limits zijn ruim genomen — Claude produceert vaak 30-50% meer
// dan een strikte limiet. Beter een tolerante schema dan een Zod-failure die
// de hele campagne afbreekt.

// CTA-target: waar de primary CTA technisch naar moet wijzen.
// 'booking' voor salons/dentists, 'reservation' voor restaurants,
// 'offerte' voor garages, 'contact' generiek, 'menu' voor cafés/coffeeshops
const CtaTarget = z.enum([
  "booking",
  "reservation",
  "contact",
  "offerte",
  "menu",
  "shop",
  "phone",
]);

// Boekings-/reservatie-providers per branche — voor suggesties + later integreren
const BookingProvider = z.enum([
  "treatwell",
  "salonized",
  "phorest",
  "thefork",
  "opentable",
  "resengo",
  "garage-eigen-form",
  "eigen",
  "geen",
]);

// Design-style enum (synced met lib/design/themes.ts)
const DesignStyle = z.enum([
  "editorial-luxe",
  "minimal-bold",
  "warm-documentary",
  "clinical-precise",
  "playful-vibrant",
]);

// Vertical-specifieke service-section: lijst van treatments/dishes/diensten
// met optionele prijs. Dezelfde shape voor alle verticals — Sonnet vult 'm
// passend in (treatments voor salon, gerechten voor restaurant, etc.)
const VerticalServiceItem = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(220).nullable().optional().or(z.literal("")),
  priceFrom: z
    .string()
    .max(30)
    .nullable()
    .optional()
    .or(z.literal(""))
    .describe("Bijv. '€145' of 'vanaf €60' — weglaten als geen prijs"),
  duration: z
    .string()
    .max(40)
    .nullable()
    .optional()
    .or(z.literal(""))
    .describe("Bijv. '90 min' — alleen voor tijd-gebonden diensten"),
  badge: z
    .string()
    .max(30)
    .nullable()
    .optional()
    .or(z.literal(""))
    .describe("Bijv. 'Populair' of 'Nieuw'"),
});

const VerticalSection = z.object({
  title: z
    .string()
    .min(4)
    .max(80)
    .describe("Sectie-titel zoals 'Onze behandelingen' of 'Van het menu'"),
  intro: z.string().max(280).nullable().optional().or(z.literal("")),
  items: z.array(VerticalServiceItem).min(3).max(12),
  // Aanvullende booking/reservering UX
  bookingProvider: BookingProvider,
  bookingProviderHint: z
    .string()
    .max(140)
    .nullable()
    .optional()
    .or(z.literal(""))
    .describe(
      "Korte uitleg waarom dit provider past, bijv. 'Treatwell heeft sterke positie in salons'"
    ),
});

export const LandingPageSchema = z.object({
  // NIEUW: design-thema en CTA-targeting (optional — backwards-compat met
  // bestaande campagnes die deze velden niet hebben)
  designStyle: DesignStyle.optional(),
  primaryCtaTarget: CtaTarget.optional(),

  hero: z.object({
    eyebrow: z.string().max(80),
    headline: z.string().min(8).max(160),
    subheadline: z.string().min(10).max(320),
    primaryCta: z.string().max(40),
    secondaryCta: z.string().max(40),
  }),
  marquee: z
    .array(z.string().max(48))
    .min(4)
    .max(8)
    .describe("Korte trefwoorden voor een marquee onder de hero"),
  features: z
    .array(
      z.object({
        title: z.string().max(80),
        description: z.string().max(280),
        icon: z.string().max(20).describe("Emoji of icoonnaam"),
      })
    )
    .length(3),

  // NIEUW: vertical-specifieke service-sectie (treatments/menu/services)
  verticalSection: VerticalSection.optional(),

  experience: z.object({
    headline: z.string().max(140),
    body: z.string().max(640),
    bullets: z.array(z.string().max(120)).min(3).max(5),
  }),
  testimonial: z.object({
    quote: z.string().min(20).max(400),
    author: z.string().max(80),
    role: z.string().max(80),
  }),
  // Pricing — sommige branches hebben geen pakket-pricing (restaurants,
  // hotels per nacht, gyms per maand). Dan blijft array leeg en wordt
  // de hele pricing-sectie in de preview verborgen.
  pricing: z
    .array(
      z.object({
        name: z.string().max(60),
        price: z.string().max(30),
        cadence: z.string().max(30),
        description: z.string().max(180),
        features: z.array(z.string().max(80)).min(2).max(5),
        highlighted: z.boolean(),
      })
    )
    .max(3),
  faq: z
    .array(
      z.object({
        question: z.string().max(160),
        answer: z.string().max(480),
      })
    )
    .min(4)
    .max(6),
  cta: z.object({
    headline: z.string().max(140),
    body: z.string().max(320),
    button: z.string().max(40),
  }),
});

export type LandingPage = z.infer<typeof LandingPageSchema>;
export type VerticalServiceItem = z.infer<typeof VerticalServiceItem>;
