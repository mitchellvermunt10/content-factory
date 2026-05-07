import { z } from "zod";

const PHASE_STATUS = z.enum(["pending", "in-progress", "review", "done", "blocked"]);
const RENDER_STATUS = z.enum(["queued", "rendering", "ready", "failed"]);
const ASSET_STATUS = z.enum(["missing", "uploaded", "verified", "ready"]);

const LocalFileMeta = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string(),
  blobUrl: z.string(),
});

const ImageAsset = z.object({
  provider: z.enum(["midjourney", "firefly"]),
  url: z.string().nullable(),
  promptId: z.string(),
  assetStatus: ASSET_STATUS.default("missing"),
  localFile: LocalFileMeta.nullable().default(null),
});

const VideoAsset = z.object({
  provider: z.enum(["runway", "kling", "veo"]),
  url: z.string().nullable(),
  durationSec: z.number(),
  status: RENDER_STATUS,
  promptId: z.string(),
  assetStatus: ASSET_STATUS.default("missing"),
  localFile: LocalFileMeta.nullable().default(null),
});

export const PipelineSceneSchema = z.object({
  sceneId: z.string(),
  title: z.string(),
  durationSec: z.number(),
  estimatedRenderMin: z.number(),
  status: z.object({
    script: PHASE_STATUS,
    prompts: PHASE_STATUS,
    assets: PHASE_STATUS,
    voiceover: PHASE_STATUS,
    edit: PHASE_STATUS,
    export: PHASE_STATUS,
  }),
  assets: z.object({
    images: z.array(ImageAsset),
    videos: z.array(VideoAsset),
  }),
  notes: z.string(),
});

export const RenderJobSchema = z.object({
  id: z.string(),
  sceneId: z.string(),
  shotId: z.string(),
  provider: z.enum(["runway", "kling", "veo"]),
  prompt: z.string(),
  durationSec: z.number(),
  status: RENDER_STATUS,
  progress: z.number().min(0).max(100),
  startedAt: z.string().nullable(),
  finishedAt: z.string().nullable(),
  outputUrl: z.string().nullable(),
  // Render Agent fields — gevuld zodra een job via /api/render/jobs is gestart.
  externalId: z.string().nullable().default(null),
  apiMode: z.enum(["live", "mock"]).nullable().default(null),
  errorMessage: z.string().nullable().default(null),
  savedToPath: z.string().nullable().default(null),
});

export const VoiceOverSettingsSchema = z.object({
  fullScript: z.string(),
  totalDurationSec: z.number(),
  elevenLabs: z.object({
    voiceId: z.string(),
    voiceName: z.string(),
    modelId: z.string(),
    stability: z.number().min(0).max(1),
    similarity: z.number().min(0).max(1),
    styleExaggeration: z.number().min(0).max(1),
    speakerBoost: z.boolean(),
    audioUrl: z.string().nullable(),
    status: z.enum(["draft", "synthesizing", "ready", "failed"]),
  }),
});

export const ExportPlanSchema = z.object({
  activePresetId: z.enum(["reel-9x16", "square-1x1", "youtube-16x9", "feed-4x5"]),
  presets: z.array(
    z.object({
      id: z.enum(["reel-9x16", "square-1x1", "youtube-16x9", "feed-4x5"]),
      label: z.string(),
      ratio: z.string(),
      width: z.number(),
      height: z.number(),
      fps: z.number(),
      bitrate: z.string(),
      audioBitrate: z.string(),
      container: z.string(),
      codec: z.string(),
      filename: z.string(),
      status: z.enum(["pending", "encoding", "ready"]),
      outputUrl: z.string().nullable(),
    })
  ),
});

export const VideoProductionSchema = z.object({
  pipeline: z.object({
    scenes: z.array(PipelineSceneSchema),
  }),
  voiceOver: VoiceOverSettingsSchema,
  renderQueue: z.array(RenderJobSchema),
  exportPlan: ExportPlanSchema,
});

export type PipelineScene = z.infer<typeof PipelineSceneSchema>;
export type RenderJob = z.infer<typeof RenderJobSchema>;
export type VoiceOverSettings = z.infer<typeof VoiceOverSettingsSchema>;
export type ExportPlan = z.infer<typeof ExportPlanSchema>;
export type VideoProduction = z.infer<typeof VideoProductionSchema>;
