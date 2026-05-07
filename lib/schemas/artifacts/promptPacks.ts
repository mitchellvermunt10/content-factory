import { z } from "zod";

const ImagePrompt = z.object({
  id: z.string(),
  context: z.string().max(140),
  midjourney: z.string().min(20).max(1000),
  firefly: z.string().min(20).max(1000),
  negative: z.string().max(420).optional().or(z.literal("")),
  aspectRatio: z.enum(["16:9", "9:16", "1:1", "21:9", "4:5", "3:2"]),
  styleNote: z.string().max(220),
});

const VideoPrompt = z.object({
  id: z.string(),
  context: z.string().max(140),
  runway: z.string().min(20).max(1000),
  kling: z.string().min(20).max(1000),
  veo: z.string().min(20).max(1000),
  durationSec: z.number().min(1).max(20),
  cameraMove: z.string().max(140),
  aspectRatio: z.enum(["16:9", "9:16", "1:1", "21:9", "4:5"]),
});

const BrollClip = z.object({
  id: z.string(),
  topic: z.string().max(140),
  framing: z.string().max(120),
  durationSec: z.number().min(1).max(15),
  prompt: z.string().min(20).max(700),
  useCase: z.string().max(220),
});

export const PromptPacksSchema = z.object({
  globalStyle: z.object({
    moodboard: z.string().max(320).describe("Drie of vier referenties of look"),
    colorScript: z.string().max(280),
    grading: z.string().max(220).describe("Color grading / film stock"),
    lensing: z.string().max(220),
  }),
  imagePack: z.object({
    style: z.string().max(280),
    prompts: z.array(ImagePrompt).min(3).max(10),
  }),
  videoPack: z.object({
    style: z.string().max(280),
    prompts: z.array(VideoPrompt).min(2).max(10),
  }),
  bRollPack: z.object({
    style: z.string().max(280),
    items: z.array(BrollClip).min(2).max(10),
  }),
});

export type ImagePromptItem = z.infer<typeof ImagePrompt>;
export type VideoPromptItem = z.infer<typeof VideoPrompt>;
export type BrollItem = z.infer<typeof BrollClip>;
export type PromptPacks = z.infer<typeof PromptPacksSchema>;
