import { z } from "zod";

export const BrandSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  bg: z.string(),
  surface: z.string(),
  text: z.string(),
  textMuted: z.string(),
  display: z.string(),
  body: z.string(),
  voice: z.string(),
  motionTone: z.enum(["subtle", "bold", "playful"]),
});

export type Brand = z.infer<typeof BrandSchema>;
