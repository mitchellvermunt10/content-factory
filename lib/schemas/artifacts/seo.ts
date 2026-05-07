import { z } from "zod";

export const SeoCopySchema = z.object({
  metaTitle: z.string().min(20).max(70),
  metaDescription: z.string().min(80).max(180),
  ogTitle: z.string().max(80),
  ogDescription: z.string().max(200),
  primaryKeyword: z.string().max(80),
  secondaryKeywords: z.array(z.string().max(60)).min(4).max(10),
  longTailKeywords: z.array(z.string().max(80)).min(4).max(8),
  headings: z.object({
    h1: z.string().min(8).max(80),
    h2s: z.array(z.string().max(80)).min(4).max(8),
  }),
  faqSchema: z
    .array(
      z.object({
        question: z.string().max(140),
        answer: z.string().max(420),
      })
    )
    .min(4)
    .max(8),
  imageAlts: z
    .array(
      z.object({
        context: z.string().max(60),
        alt: z.string().max(120),
      })
    )
    .min(4)
    .max(8),
  localSchema: z.object({
    businessType: z.string().max(60),
    description: z.string().max(220),
    serviceArea: z.array(z.string().max(40)).min(1).max(6),
  }),
});

export type SeoCopy = z.infer<typeof SeoCopySchema>;
