import { z } from "zod";

// Schema-limieten: ruim genomen — Claude varieert in output. Beter wat losser
// dan rigide schema's die de hele campagne afbreken op een hashtag te weinig.

const Post = z.object({
  type: z.enum(["foto", "carousel", "reel", "story"]),
  hook: z.string().max(120),
  caption: z.string().min(20).max(640),
  hashtags: z.array(z.string().max(60)).min(3).max(15),
  visualDirection: z.string().max(280).describe("Beeldconcept of shotbeschrijving"),
  cta: z.string().max(80),
});

export const InstagramContentSchema = z.object({
  bio: z.object({
    headline: z.string().max(80),
    body: z.string().max(220),
    cta: z.string().max(60),
  }),
  pillars: z
    .array(
      z.object({
        name: z.string().max(60),
        description: z.string().max(220),
      })
    )
    .min(2)
    .max(5)
    .describe("Content pillars / onderwerpen"),
  posts: z
    .array(Post)
    .min(5)
    .max(10)
    .describe("Posts voor de eerste contentkalender (~8 ideaal)"),
  reelIdeas: z
    .array(
      z.object({
        concept: z.string().max(120),
        hook: z.string().max(120),
        beats: z.array(z.string().max(200)).min(2).max(6),
        soundDirection: z.string().max(180),
      })
    )
    .min(2)
    .max(6),
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
        topic: z.string().max(120),
      })
    )
    .length(7),
});

export type InstagramContent = z.infer<typeof InstagramContentSchema>;
