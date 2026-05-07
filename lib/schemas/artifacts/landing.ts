import { z } from "zod";

export const LandingPageSchema = z.object({
  hero: z.object({
    eyebrow: z.string().max(60),
    headline: z.string().min(8).max(120),
    subheadline: z.string().min(10).max(220),
    primaryCta: z.string().max(28),
    secondaryCta: z.string().max(28),
  }),
  marquee: z
    .array(z.string().max(28))
    .min(4)
    .max(8)
    .describe("Korte trefwoorden voor een marquee onder de hero"),
  features: z
    .array(
      z.object({
        title: z.string().max(60),
        description: z.string().max(180),
        icon: z.string().max(20).describe("Emoji of icoonnaam"),
      })
    )
    .length(3),
  experience: z.object({
    headline: z.string().max(100),
    body: z.string().max(420),
    bullets: z.array(z.string().max(80)).min(3).max(5),
  }),
  testimonial: z.object({
    quote: z.string().min(20).max(280),
    author: z.string().max(60),
    role: z.string().max(60),
  }),
  pricing: z
    .array(
      z.object({
        name: z.string().max(40),
        price: z.string().max(20),
        cadence: z.string().max(20),
        description: z.string().max(120),
        features: z.array(z.string().max(60)).min(2).max(5),
        highlighted: z.boolean(),
      })
    )
    .length(3),
  faq: z
    .array(
      z.object({
        question: z.string().max(120),
        answer: z.string().max(320),
      })
    )
    .min(4)
    .max(6),
  cta: z.object({
    headline: z.string().max(100),
    body: z.string().max(220),
    button: z.string().max(28),
  }),
});

export type LandingPage = z.infer<typeof LandingPageSchema>;
