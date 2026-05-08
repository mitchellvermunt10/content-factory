import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { uploadImageBase64, recordImage } from "@/lib/supabase/images";
import { isSupabaseEnabled } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// Hand-uploaded image (van Midjourney, eigen camera, klant-bibliotheek).
// Body is JSON met base64 — multipart parsing via Next 16 zou nog flakey zijn,
// dus we doen FileReader.readAsDataURL client-side en strippen de prefix.
const Body = z.object({
  campaignId: z.string().min(4).max(40),
  artifactKey: z.enum([
    "instagram",
    "metaAds",
    "metaAdsStory",
    "cinematic",
    "landingHero",
  ]),
  itemIndex: z.number().int().min(0).max(99).nullable().optional(),
  base64: z.string().min(100), // PNG/JPG base64 zonder data:-prefix
  source: z.enum(["midjourney", "manual", "stock"]).optional(),
  width: z.number().int().min(64).max(8192).optional(),
  height: z.number().int().min(64).max(8192).optional(),
});

export async function POST(req: NextRequest) {
  if (!isSupabaseEnabled()) {
    return NextResponse.json(
      { error: "Supabase ontbreekt — kan image niet opslaan." },
      { status: 503 }
    );
  }

  try {
    const body = Body.parse(await req.json());

    const { storagePath, publicUrl } = await uploadImageBase64({
      campaignId: body.campaignId,
      artifactKey: body.artifactKey,
      itemIndex: body.itemIndex ?? null,
      base64: body.base64,
    });

    const record = await recordImage({
      campaignId: body.campaignId,
      artifactKey: body.artifactKey,
      itemIndex: body.itemIndex ?? null,
      prompt: `Hand-upload (${body.source ?? "manual"})`,
      storagePath,
      publicUrl,
      width: body.width ?? 1024,
      height: body.height ?? 1024,
    });

    return NextResponse.json({ image: record });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload faalde" },
      { status: 400 }
    );
  }
}
