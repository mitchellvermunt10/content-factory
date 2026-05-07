import { z } from "zod";

export const SeoCopySchema = z.object({
  metaTitle: z.string().min(15).max(100),
  metaDescription: z.string().min(50).max(260),
  ogTitle: z.string().max(120),
  ogDescription: z.string().max(280),
  primaryKeyword: z.string().max(120),
  secondaryKeywords: z.array(z.string().max(80)).min(2).max(15),
  longTailKeywords: z.array(z.string().max(120)).min(2).max(12),
  headings: z.object({
    h1: z.string().min(5).max(120),
    h2s: z.array(z.string().max(120)).min(2).max(12),
  }),
  faqSchema: z
    .array(
      z.object({
        question: z.string().max(200),
        answer: z.string().max(640),
      })
    )
    .min(2)
    .max(12),
  imageAlts: z
    .array(
      z.object({
        context: z.string().max(80),
        alt: z.string().max(180),
      })
    )
    .min(2)
    .max(12),
  localSchema: z.object({
    businessType: z.string().max(80),
    description: z.string().max(320),
    serviceArea: z.array(z.string().max(60)).min(1).max(10),
  }),
});

export type SeoCopy = z.infer<typeof SeoCopySchema>;
