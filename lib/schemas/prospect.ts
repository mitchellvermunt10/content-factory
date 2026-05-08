import { z } from "zod";
import { BusinessBriefSchema } from "./brief";

// Input voor een onderzoeks-run
export const ResearchInputSchema = z.object({
  city: z.string().min(2).max(80),
  vertical: z.enum([
    "salon",
    "restaurant",
    "dentist",
    "gym",
    "tattoo",
    "barber",
    "hotel",
    "coffeeshop",
    "autobedrijf",
  ]),
  serviceTier: z
    .enum(["single", "always-on", "both"])
    .default("both")
    .describe(
      "Welk aanbod we positioneren — beïnvloedt fit-criteria (premium=always-on, eenvoudig=single)"
    ),
  extraCriteria: z.string().max(500).nullable().optional(),
  ownerEmail: z.string().email().nullable().optional(),
});

export type ResearchInput = z.infer<typeof ResearchInputSchema>;

// Eén kandidaat in de top-10
export const ProspectEntrySchema = z.object({
  rank: z.number().int().min(1).max(10),
  fitScore: z.number().int().min(0).max(100),
  name: z.string().min(2).max(120),
  city: z.string().max(80),
  ownerName: z.string().max(80).nullable().optional(),
  ownerEmail: z.string().max(120).nullable().optional(),
  websiteUrl: z.string().max(300).nullable().optional(),
  instagramHandle: z.string().max(60).nullable().optional(),
  phoneNumber: z.string().max(40).nullable().optional(),

  whyTheyFit: z.array(z.string().min(8).max(280)).min(2).max(6),
  signals: z.object({
    positive: z.array(z.string().max(140)).max(8),
    redFlags: z.array(z.string().max(140)).max(5),
  }),

  // Pre-filled brief om direct in /studio/nieuw te plakken
  suggestedBrief: BusinessBriefSchema,

  // Email-template voor cold-outreach (NL, persoonlijk)
  emailDraft: z.object({
    subject: z.string().min(4).max(120),
    body: z.string().min(40).max(1500),
  }),
});

export type ProspectEntry = z.infer<typeof ProspectEntrySchema>;

// Volledige onderzoeks-uitkomst
export const ResearchResultSchema = z.object({
  prospects: z.array(ProspectEntrySchema).min(3).max(10),
  summary: z
    .string()
    .min(20)
    .max(800)
    .describe("Korte managementsamenvatting van de markt en aanbevelingen"),
  searchedQueries: z.array(z.string().max(200)).max(15),
});

export type ResearchResult = z.infer<typeof ResearchResultSchema>;

// Status van een onderzoek (voor async lookup later — nu single-shot)
export const ResearchStatusSchema = z.enum([
  "pending",
  "running",
  "complete",
  "failed",
]);
export type ResearchStatus = z.infer<typeof ResearchStatusSchema>;
