import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateImage, isOpenAIEnabled } from "@/lib/openai/images";
import {
  uploadImageBase64,
  recordImage,
} from "@/lib/supabase/images";
import { isSupabaseEnabled } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 120;

const Body = z.object({
  campaignId: z.string().min(4).max(40),
  artifactKey: z.string().min(2).max(40),
  itemIndex: z.number().int().min(0).max(99).nullable().optional(),
  prompt: z.string().min(10).max(2000),
  size: z
    .enum(["1024x1024", "1024x1536", "1536x1024"])
    .optional(),
  quality: z.enum(["low", "medium", "high"]).optional(),
});

export async function POST(req: NextRequest) {
  if (!isOpenAIEnabled()) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY ontbreekt. Voeg 'm toe in Vercel env vars en redeploy.",
      },
      { status: 503 }
    );
  }
  if (!isSupabaseEnabled()) {
    return NextResponse.json(
      {
        error:
          "Supabase ontbreekt. Images worden opgeslagen in Supabase Storage.",
      },
      { status: 503 }
    );
  }

  try {
    const body = Body.parse(await req.json());

    const result = await generateImage({
      prompt: body.prompt,
      size: body.size ?? "1024x1024",
      quality: body.quality ?? "medium",
    });

    const { storagePath, publicUrl } = await uploadImageBase64({
      campaignId: body.campaignId,
      artifactKey: body.artifactKey,
      itemIndex: body.itemIndex ?? null,
      base64: result.base64,
    });

    const record = await recordImage({
      campaignId: body.campaignId,
      artifactKey: body.artifactKey,
      itemIndex: body.itemIndex ?? null,
      prompt: body.prompt,
      storagePath,
      publicUrl,
      width: result.width,
      height: result.height,
    });

    return NextResponse.json({ image: record });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Onbekende fout" },
      { status: 400 }
    );
  }
}
