import { z } from "zod";

// Wat we uit een prospect's bestaande website halen.
// Gebruikt om een spec-campagne te vullen met ECHTE content ipv generic AI.

export const ScrapedItemSchema = z.object({
  name: z.string().min(2).max(120),
  description: z
    .string()
    .max(280)
    .nullable()
    .optional()
    .or(z.literal("")),
  price: z
    .string()
    .max(40)
    .nullable()
    .optional()
    .or(z.literal(""))
    .describe("Bijv. '€18,50' of 'vanaf €145' — letterlijk overgenomen"),
  category: z
    .string()
    .max(60)
    .nullable()
    .optional()
    .or(z.literal(""))
    .describe(
      "Bijv. 'Voorgerechten', 'Hoofdgerechten' voor restaurant; 'Knip', 'Kleur' voor salon"
    ),
});

export const ScrapedPhotoSchema = z.object({
  url: z.string().min(8).max(2000),
  alt: z.string().max(300).nullable().optional().or(z.literal("")),
  context: z
    .enum([
      "hero",
      "gallery",
      "team",
      "interior",
      "product",
      "food",
      "treatment",
      "logo",
      "other",
    ])
    .describe("Wat je denkt dat dit beeld toont"),
  width: z.number().int().nullable().optional(),
  height: z.number().int().nullable().optional(),
});

export const ScrapedContentSchema = z.object({
  websiteUrl: z.string().min(8).max(500),
  scrapedAt: z.string().describe("ISO timestamp"),

  // Bedrijfs-info uit de site
  businessSummary: z
    .string()
    .min(20)
    .max(600)
    .describe("Wat dit bedrijf doet, in 2-3 zinnen — extracted uit de site"),
  uspsFromSite: z
    .array(z.string().min(5).max(200))
    .max(8)
    .describe("Concrete USPs/features die ze zelf benoemen op hun site"),
  toneOfSite: z
    .string()
    .max(280)
    .nullable()
    .optional()
    .or(z.literal(""))
    .describe(
      "Korte beschrijving van hun huidige tone-of-voice + visuele stijl"
    ),

  // Menu / behandelingen / services
  items: z
    .array(ScrapedItemSchema)
    .max(40)
    .describe("Echt menu / behandelingen / services + prijzen indien zichtbaar"),

  // Foto's van de site
  photos: z
    .array(ScrapedPhotoSchema)
    .max(40)
    .describe(
      "Alle relevante foto's van de site (hero, gallery, interieur, food, etc.)"
    ),

  // Contact + locatie
  address: z.string().max(220).nullable().optional().or(z.literal("")),
  openingHours: z.string().max(400).nullable().optional().or(z.literal("")),
  phone: z.string().max(40).nullable().optional().or(z.literal("")),
  email: z.string().max(120).nullable().optional().or(z.literal("")),

  // Booking / reservering / offerte
  bookingUrl: z
    .string()
    .max(500)
    .nullable()
    .optional()
    .or(z.literal(""))
    .describe(
      "Eerste werkende booking/reservering link — Treatwell/TheFork/eigen URL"
    ),
  bookingProvider: z
    .enum([
      "treatwell",
      "salonized",
      "phorest",
      "thefork",
      "opentable",
      "resengo",
      "garage-eigen-form",
      "eigen",
      "geen",
    ])
    .nullable()
    .optional(),

  // Socials
  instagramHandle: z.string().max(80).nullable().optional().or(z.literal("")),
  facebookUrl: z.string().max(300).nullable().optional().or(z.literal("")),
});

export type ScrapedContent = z.infer<typeof ScrapedContentSchema>;
export type ScrapedItem = z.infer<typeof ScrapedItemSchema>;
export type ScrapedPhoto = z.infer<typeof ScrapedPhotoSchema>;
