import { z } from "zod";

export const BusinessBriefSchema = z.object({
  businessType: z.enum([
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
  name: z.string().min(2, "Voer een bedrijfsnaam in").max(80),
  city: z.string().min(2, "Voer een stad in").max(60),
  website: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  usps: z
    .array(z.string().min(3).max(140))
    .min(1, "Voeg minstens één USP toe")
    .max(6),
  tone: z.enum(["luxueus", "speels", "klinisch", "stoer", "warm", "minimal"]),
  audience: z
    .string()
    .min(20, "Beschrijf de doelgroep iets uitgebreider")
    .max(600),
  offer: z.string().max(280).optional().or(z.literal("")),
  brandColors: z
    .array(z.string().regex(/^#[0-9a-fA-F]{6}$/, "Gebruik hex zoals #1A1A1A"))
    .min(1)
    .max(3),
});

export type BusinessBrief = z.infer<typeof BusinessBriefSchema>;
