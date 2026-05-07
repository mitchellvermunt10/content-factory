import { z } from "zod";

const AdVariant = z.object({
  hook: z.string().max(100).describe("Korte aandachttrekkende opening"),
  primaryText: z.string().min(20).max(400),
  headline: z.string().max(60),
  description: z.string().max(180),
  cta: z.enum([
    "Boek nu",
    "Reserveer",
    "Plan afspraak",
    "Ontdek meer",
    "Meer info",
    "Bel nu",
    "Bestel nu",
    "Aanmelden",
  ]),
  visualDirection: z.string().max(280).describe("Korte beschrijving van het beeld"),
});

export const MetaAdsSchema = z.object({
  campaignObjective: z.enum([
    "awareness",
    "traffic",
    "engagement",
    "leads",
    "sales",
    "bookings",
  ]),
  audienceTargeting: z.object({
    description: z.string().max(320),
    locations: z.array(z.string().max(60)).min(1).max(8),
    ageRange: z.string().max(40),
    interests: z.array(z.string().max(80)).min(2).max(12),
  }),
  variants: z
    .array(AdVariant)
    .min(2)
    .max(6)
    .describe("Advertentievarianten voor A/B"),
  storyAds: z
    .array(
      z.object({
        hook: z.string().max(100),
        body: z.string().max(220),
        sticker: z.string().max(80).describe("Idee voor sticker / overlay"),
      })
    )
    .min(1)
    .max(5),
});

export type MetaAds = z.infer<typeof MetaAdsSchema>;
