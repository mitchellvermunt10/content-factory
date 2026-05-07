import { z } from "zod";

// Character-limits zijn ruim genomen — Claude produceert vaak 30-50% meer
// dan een strikte limiet. Beter een tolerante schema dan een Zod-failure die
// de hele campagne afbreekt.
export const LandingPageSchema = z.object({
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
    .length(3),
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
