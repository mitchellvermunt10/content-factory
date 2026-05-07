import { z } from "zod";

const Post = z.object({
  type: z.enum(["foto", "carousel", "reel", "story"]),
  hook: z.string().max(80),
  caption: z.string().min(40).max(500),
  hashtags: z.array(z.string().max(40)).min(6).max(12),
  visualDirection: z.string().max(220).describe("Beeldconcept of shotbeschrijving"),
  cta: z.string().max(60),
});

export const InstagramContentSchema = z.object({
  bio: z.object({
    headline: z.string().max(50),
    body: z.string().max(140),
    cta: z.string().max(40),
  }),
  pillars: z
    .array(
      z.object({
        name: z.string().max(40),
        description: z.string().max(140),
      })
    )
    .min(3)
    .max(4)
    .describe("Content pillars / onderwerpen"),
  posts: z.array(Post).length(8).describe("8 posts voor de eerste contentkalender"),
  reelIdeas: z
    .array(
      z.object({
        concept: z.string().max(80),
        hook: z.string().max(80),
        beats: z.array(z.string().max(140)).min(3).max(5),
        soundDirection: z.string().max(120),
      })
    )
    .min(3)
    .max(5),
  weeklyPlan: z
    .array(
      z.object({
        day: z.enum([
          "maandag",
          "dinsdag",
          "woensdag",
          "donderdag",
          "vrijdag",
          "zaterdag",
          "zondag",
        ]),
        type: z.enum(["foto", "carousel", "reel", "story"]),
        topic: z.string().max(80),
      })
    )
    .length(7),
});

export type InstagramContent = z.infer<typeof InstagramContentSchema>;
