import { z } from "zod";

const AdVariant = z.object({
  hook: z.string().max(60).describe("Korte aandachttrekkende opening"),
  primaryText: z.string().min(40).max(280),
  headline: z.string().max(40),
  description: z.string().max(120),
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
  visualDirection: z.string().max(180).describe("Korte beschrijving van het beeld"),
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
    description: z.string().max(220),
    locations: z.array(z.string().max(40)).min(1).max(5),
    ageRange: z.string().max(20),
    interests: z.array(z.string().max(60)).min(3).max(8),
  }),
  variants: z
    .array(AdVariant)
    .min(3)
    .max(4)
    .describe("3-4 advertentievarianten voor A/B"),
  storyAds: z
    .array(
      z.object({
        hook: z.string().max(60),
        body: z.string().max(160),
        sticker: z.string().max(40).describe("Idee voor sticker / overlay"),
      })
    )
    .min(2)
    .max(3),
});

export type MetaAds = z.infer<typeof MetaAdsSchema>;
