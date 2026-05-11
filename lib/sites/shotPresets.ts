// Cinematic shot-presets per vertical.
// Elke preset definieert 3 hero-frames + camera-choreografie die samen
// een 0-1 scroll-progressie afdekken.

import type { CinematicShot } from "@/components/sites/CinematicCanvas";

export interface FrameSet {
  /** URLs naar de hero-frames in volgorde (exterior → doorway → interior) */
  frames: [string, string, string];
}

export function buildRestaurantShots(set: FrameSet): CinematicShot[] {
  return [
    // Shot 1 — gevel bij schemering, langzaam ingezoomd
    {
      imageUrl: set.frames[0],
      startProgress: 0.0,
      endProgress: 0.5,
      scale: { from: 1.0, to: 1.6 },
      offsetY: { from: 0.02, to: -0.04 },
      warmth: { from: -0.2, to: 0.05 },
      brightness: { from: 0.78, to: 0.95 },
      vignette: { from: 0.35, to: 0.12 },
    },
    // Shot 2 — doorway, naderend, opwarmend
    {
      imageUrl: set.frames[1],
      startProgress: 0.42,
      endProgress: 0.78,
      scale: { from: 1.15, to: 1.55 },
      warmth: { from: 0.1, to: 0.3 },
      brightness: { from: 1.0, to: 1.08 },
      vignette: { from: 0.1, to: 0.0 },
    },
    // Shot 3 — interior, settling
    {
      imageUrl: set.frames[2],
      startProgress: 0.7,
      endProgress: 1.0,
      scale: { from: 1.3, to: 1.0 },
      offsetY: { from: -0.02, to: 0.0 },
      warmth: { from: 0.32, to: 0.38 },
      brightness: { from: 1.05, to: 1.0 },
      vignette: { from: 0.0, to: 0.18 },
    },
  ];
}

/**
 * Flux Pro prompts voor restaurant dolly-in.
 * Gebruikt rawMode (foto-realistisch) en 21:9 voor cinematic aspect.
 */
export const RESTAURANT_FLUX_PROMPTS = {
  exterior:
    "Cinematic wide shot of an Italian trattoria facade at blue hour dusk, warm amber light spilling through a wooden door and large arched windows onto rain-slick cobblestones, vintage signage, hanging lanterns, atmospheric film grain, anamorphic lens flare, moody color grade, Roger Deakins lighting, photorealistic, no people visible, shot on Arri Alexa, 35mm",
  doorway:
    "Cinematic medium shot looking through the open wooden door of an Italian trattoria at night, glimpse of warm candlelit interior with hanging Edison bulbs and exposed brick walls visible inside, soft bokeh, golden warm color palette, atmospheric haze, anamorphic lens, photorealistic, intimate, no people, shallow depth of field",
  interior:
    "Cinematic interior of a cozy intimate Italian trattoria at evening service, warm candlelight on small wooden tables with linen tablecloths, exposed brick walls, dark ceiling beams, hanging Edison bulbs creating golden pools of light, bottles of wine on shelves, atmospheric, photorealistic, anamorphic, shallow depth of field, Roger Deakins moody color grade, no people visible, empty tables ready for service",
} as const;
