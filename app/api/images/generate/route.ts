import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateImage, isOpenAIEnabled } from "@/lib/openai/images";
import {
  generateFluxImage,
  downloadAsBase64,
  isFluxEnabled,
} from "@/lib/flux/images";
import { uploadImageBase64, recordImage } from "@/lib/supabase/images";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { getCampaignRow } from "@/lib/supabase/repo";
import {
  buildImagePrompts,
  aspectToOpenAISize,
  type ArtifactKey,
} from "@/lib/imagePrompt/builder";

export const runtime = "nodejs";
export const maxDuration = 180;

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
  hint: z.string().max(2000).optional(),
  engine: z.enum(["openai", "flux", "midjourney-prompt"]).optional(),
  quality: z.enum(["low", "medium", "high"]).optional(),
});

export async function POST(req: NextRequest) {
  if (!isSupabaseEnabled()) {
    return NextResponse.json(
      { error: "Supabase ontbreekt — campaign-context kan niet worden opgehaald." },
      { status: 503 }
    );
  }

  try {
    const body = Body.parse(await req.json());
    const engine = body.engine ?? "openai";

    // Haal campagne op zodat we server-side een rijk prompt kunnen bouwen
    // met brand + cinematic + vertical-pack context.
    const campaign = await getCampaignRow(body.campaignId);
    if (!campaign) {
      return NextResponse.json(
        { error: `Campagne ${body.campaignId} niet gevonden in Supabase.` },
        { status: 404 }
      );
    }

    const prompts = await buildImagePrompts({
      campaign,
      artifactKey: body.artifactKey as ArtifactKey,
      itemIndex: body.itemIndex ?? null,
      hint: body.hint ?? null,
    });

    // Engine "midjourney-prompt": geen generatie — alleen het MJ-prompt
    // teruggeven zodat de UI 'm naar clipboard kan kopiëren.
    if (engine === "midjourney-prompt") {
      return NextResponse.json({
        engine,
        prompts,
        // Geen image — gebruiker rendert zelf in MJ Discord
        image: null,
      });
    }

    if (engine === "openai" && !isOpenAIEnabled()) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY ontbreekt." },
        { status: 503 }
      );
    }
    if (engine === "flux" && !isFluxEnabled()) {
      return NextResponse.json(
        { error: "FAL_KEY ontbreekt — Flux Pro is niet geconfigureerd." },
        { status: 503 }
      );
    }

    let base64: string;
    let width: number;
    let height: number;

    if (engine === "flux") {
      const aspect = aspectForFlux(body.artifactKey as ArtifactKey);
      const flux = await generateFluxImage({
        prompt: prompts.openai, // dezelfde rich prompt werkt prima voor Flux
        aspectRatio: aspect,
        rawMode: true,
      });
      base64 = await downloadAsBase64(flux.imageUrl);
      width = flux.width;
      height = flux.height;
    } else {
      // openai (default)
      const size = aspectToOpenAISize(body.artifactKey as ArtifactKey);
      const result = await generateImage({
        prompt: prompts.openai,
        size,
        quality: body.quality ?? "medium",
      });
      base64 = result.base64;
      width = result.width;
      height = result.height;
    }

    const { storagePath, publicUrl } = await uploadImageBase64({
      campaignId: body.campaignId,
      artifactKey: body.artifactKey,
      itemIndex: body.itemIndex ?? null,
      base64,
    });

    const record = await recordImage({
      campaignId: body.campaignId,
      artifactKey: body.artifactKey,
      itemIndex: body.itemIndex ?? null,
      prompt: prompts.openai,
      storagePath,
      publicUrl,
      width,
      height,
    });

    return NextResponse.json({ image: record, prompts, engine });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Onbekende fout" },
      { status: 400 }
    );
  }
}

function aspectForFlux(
  artifactKey: ArtifactKey
):
  | "1:1"
  | "16:9"
  | "9:16"
  | "4:3"
  | "3:4"
  | "2:3"
  | "3:2"
  | "21:9"
  | "9:21" {
  switch (artifactKey) {
    case "instagram":
    case "metaAds":
      return "1:1";
    case "metaAdsStory":
      return "9:16";
    case "cinematic":
    case "landingHero":
      return "16:9";
    default:
      return "1:1";
  }
}
