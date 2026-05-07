import { z } from "zod";

const Beat = z.object({
  timecode: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Tijdcode formaat 'SS:FF' (sec:frames) of 'MM:SS'"),
  shot: z.string().max(220).describe("Wat je ziet in deze beat"),
  vo: z.string().max(280).describe("Wat je hoort / spreekt"),
  onScreenText: z.string().max(120).optional().or(z.literal("")),
});

const ShortFormat = z.object({
  durationSec: z.number().min(5).max(120),
  hook: z.string().min(5).max(200),
  beats: z.array(Beat).min(2).max(12),
  cta: z.string().max(100),
  soundDirection: z.string().max(280),
  captionsStyle: z.string().max(220),
  loopOpportunity: z
    .string()
    .max(220)
    .describe("Hoe het einde naar het begin terugloopt"),
});

const Hook = z.object({
  text: z.string().min(4).max(200),
  type: z.enum(["text-overlay", "voice-over", "performative"]),
  note: z.string().max(180).optional().or(z.literal("")),
});

export const SocialShortsSchema = z.object({
  formats: z.object({
    reel: ShortFormat,
    tiktok: ShortFormat,
    youtubeShort: ShortFormat,
  }),
  hookBank: z.object({
    curiosity: z.array(Hook).min(2).max(8),
    benefit: z.array(Hook).min(2).max(8),
    contrarian: z.array(Hook).min(2).max(8),
    story: z.array(Hook).min(2).max(8),
    urgency: z.array(Hook).min(2).max(8),
  }),
  ctaBank: z.array(z.string().max(80)).min(2).max(12),
  trendingFormats: z
    .array(
      z.object({
        name: z.string().max(100),
        why: z.string().max(220),
        adaptation: z.string().max(280),
      })
    )
    .min(1)
    .max(6),
});

export type SocialShorts = z.infer<typeof SocialShortsSchema>;
