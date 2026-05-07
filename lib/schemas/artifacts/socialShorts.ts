import { z } from "zod";

const Beat = z.object({
  timecode: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Tijdcode formaat 'SS:FF' (sec:frames) of 'MM:SS'"),
  shot: z.string().max(120).describe("Wat je ziet in deze beat"),
  vo: z.string().max(180).describe("Wat je hoort / spreekt"),
  onScreenText: z.string().max(60).optional().or(z.literal("")),
});

const ShortFormat = z.object({
  durationSec: z.number().min(7).max(90),
  hook: z.string().min(8).max(120),
  beats: z.array(Beat).min(3).max(8),
  cta: z.string().max(60),
  soundDirection: z.string().max(180),
  captionsStyle: z.string().max(140),
  loopOpportunity: z
    .string()
    .max(140)
    .describe("Hoe het einde naar het begin terugloopt"),
});

const Hook = z.object({
  text: z.string().min(6).max(120),
  type: z.enum(["text-overlay", "voice-over", "performative"]),
  note: z.string().max(120).optional().or(z.literal("")),
});

export const SocialShortsSchema = z.object({
  formats: z.object({
    reel: ShortFormat,
    tiktok: ShortFormat,
    youtubeShort: ShortFormat,
  }),
  hookBank: z.object({
    curiosity: z.array(Hook).min(3).max(5),
    benefit: z.array(Hook).min(3).max(5),
    contrarian: z.array(Hook).min(3).max(5),
    story: z.array(Hook).min(3).max(5),
    urgency: z.array(Hook).min(3).max(5),
  }),
  ctaBank: z.array(z.string().max(40)).min(4).max(8),
  trendingFormats: z
    .array(
      z.object({
        name: z.string().max(60),
        why: z.string().max(140),
        adaptation: z.string().max(180),
      })
    )
    .min(2)
    .max(4),
});

export type SocialShorts = z.infer<typeof SocialShortsSchema>;
