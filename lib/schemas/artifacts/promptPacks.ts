import { z } from "zod";

const ImagePrompt = z.object({
  id: z.string(),
  context: z.string().max(80),
  midjourney: z.string().min(40).max(700),
  firefly: z.string().min(40).max(700),
  negative: z.string().max(280).optional().or(z.literal("")),
  aspectRatio: z.enum(["16:9", "9:16", "1:1", "21:9", "4:5", "3:2"]),
  styleNote: z.string().max(140),
});

const VideoPrompt = z.object({
  id: z.string(),
  context: z.string().max(80),
  runway: z.string().min(40).max(700),
  kling: z.string().min(40).max(700),
  veo: z.string().min(40).max(700),
  durationSec: z.number().min(2).max(12),
  cameraMove: z.string().max(80),
  aspectRatio: z.enum(["16:9", "9:16", "1:1", "21:9", "4:5"]),
});

const BrollClip = z.object({
  id: z.string(),
  topic: z.string().max(80),
  framing: z.string().max(60),
  durationSec: z.number().min(1).max(8),
  prompt: z.string().min(40).max(500),
  useCase: z.string().max(140),
});

export const PromptPacksSchema = z.object({
  globalStyle: z.object({
    moodboard: z.string().max(220).describe("Drie of vier referenties of look"),
    colorScript: z.string().max(180),
    grading: z.string().max(140).describe("Color grading / film stock"),
    lensing: z.string().max(120),
  }),
  imagePack: z.object({
    style: z.string().max(180),
    prompts: z.array(ImagePrompt).min(5).max(8),
  }),
  videoPack: z.object({
    style: z.string().max(180),
    prompts: z.array(VideoPrompt).min(4).max(8),
  }),
  bRollPack: z.object({
    style: z.string().max(180),
    items: z.array(BrollClip).min(4).max(8),
  }),
});

export type ImagePromptItem = z.infer<typeof ImagePrompt>;
export type VideoPromptItem = z.infer<typeof VideoPrompt>;
export type BrollItem = z.infer<typeof BrollClip>;
export type PromptPacks = z.infer<typeof PromptPacksSchema>;
