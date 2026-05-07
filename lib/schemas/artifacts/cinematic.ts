import { z } from "zod";

const CAMERA = z.enum([
  "static",
  "pan",
  "tilt",
  "dolly-in",
  "dolly-out",
  "truck",
  "zoom-in",
  "zoom-out",
  "whip-pan",
  "crane",
  "handheld",
  "tracking",
  "orbit",
]);

const FRAMING = z.enum([
  "extreme-wide",
  "wide",
  "medium-wide",
  "medium",
  "medium-close",
  "close-up",
  "extreme-close-up",
  "top-down",
  "low-angle",
  "high-angle",
  "over-shoulder",
]);

const TRANSITION = z.enum([
  "cut",
  "match-cut",
  "whip-pan",
  "dissolve",
  "fade-to-black",
  "morph",
  "speed-ramp",
  "j-cut",
  "l-cut",
  "smash-cut",
]);

export const ShotSchema = z.object({
  id: z.string().regex(/^s\d{2}-[a-z]$/, "shot id zoals 's01-a'"),
  framing: FRAMING,
  subject: z.string().min(2).max(180),
  action: z.string().min(2).max(280),
  durationSec: z.number().min(0.5).max(30),
  cameraMovement: CAMERA,
  lens: z
    .string()
    .max(80)
    .describe("Lens omschrijving zoals '35mm prime' of '85mm tele'"),
  lighting: z.string().max(220),
  colorNote: z.string().max(140),
  imagePrompt: z
    .string()
    .min(20)
    .max(1000)
    .describe("Volledige Midjourney/Firefly prompt voor still frame"),
  videoPrompt: z
    .string()
    .min(20)
    .max(1000)
    .describe("Volledige Runway/Kling/Veo prompt voor video clip"),
});

export const SceneSchema = z.object({
  id: z.string().regex(/^s\d{2}$/, "scene id zoals 's01'"),
  title: z.string().min(2).max(100),
  intent: z.enum(["hook", "tension", "build", "reveal", "payoff", "cta"]),
  durationSec: z.number().min(1).max(60),
  voiceOver: z.object({
    text: z.string().max(640),
    deliveryDirection: z
      .string()
      .max(220)
      .describe("Toon, tempo, ademhaling, accent"),
  }),
  onScreenText: z.string().max(140).nullable().optional().or(z.literal("")),
  cameraTreatment: z.string().max(280),
  lighting: z.string().max(220),
  colorPalette: z.string().max(220),
  soundDesign: z.string().max(280),
  transitionIn: TRANSITION,
  transitionOut: TRANSITION,
  shots: z.array(ShotSchema).min(1).max(6),
});

export const CinematicCampaignSchema = z.object({
  concept: z.object({
    logline: z.string().min(15).max(420),
    brandPillar: z.string().max(180),
    mood: z.string().max(220),
    referenceFilm: z.string().max(140).describe("Referentie regisseur of stijl"),
    totalDurationSec: z.number().min(10).max(180),
    primaryAspectRatio: z.enum(["16:9", "9:16", "1:1", "21:9", "4:5"]),
    musicDirection: z.string().max(280),
  }),
  scenes: z.array(SceneSchema).min(2).max(8),
  endCard: z.object({
    headline: z.string().max(100),
    subline: z.string().max(180),
    logoTreatment: z.string().max(180),
    callToAction: z.string().max(60),
  }),
  deliverables: z.object({
    masterCut: z.object({
      durationSec: z.number(),
      aspectRatio: z.enum(["16:9", "9:16", "1:1", "21:9", "4:5"]),
    }),
    cutdowns: z
      .array(
        z.object({
          name: z.string().max(60),
          durationSec: z.number(),
          aspectRatio: z.enum(["16:9", "9:16", "1:1", "21:9", "4:5"]),
          note: z.string().max(220),
        })
      )
      .min(1)
      .max(6),
  }),
});

export type Shot = z.infer<typeof ShotSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type CinematicCampaign = z.infer<typeof CinematicCampaignSchema>;
