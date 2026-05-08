import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getCampaignRow,
  patchArtifact,
  setStatus,
  type CampaignStatus,
} from "@/lib/supabase/repo";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import type { Artifacts } from "@/lib/schemas/campaign";

export const runtime = "nodejs";

const PatchBody = z.object({
  artifactKey: z
    .enum([
      "landing",
      "seo",
      "metaAds",
      "instagram",
      "cinematic",
      "socialShorts",
      "promptPacks",
      "videoProduction",
      "scrapedContent",
    ])
    .optional(),
  artifactValue: z.unknown().optional(),
  status: z.enum(["generating", "complete", "failed"]).optional(),
});

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!isSupabaseEnabled()) {
    return NextResponse.json(
      { campaign: null, persisted: false, message: "Supabase niet geconfigureerd" },
      { status: 200 }
    );
  }
  try {
    const campaign = await getCampaignRow(id);
    if (!campaign) {
      return NextResponse.json({ campaign: null }, { status: 404 });
    }
    return NextResponse.json({ campaign, persisted: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "fetch faalde" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!isSupabaseEnabled()) {
    return NextResponse.json({ ok: true, persisted: false });
  }
  try {
    const body = PatchBody.parse(await req.json());
    if (body.artifactKey && body.artifactValue !== undefined) {
      await patchArtifact(
        id,
        body.artifactKey as keyof Artifacts,
        body.artifactValue as Artifacts[keyof Artifacts]
      );
    }
    if (body.status) {
      await setStatus(id, body.status as CampaignStatus);
    }
    return NextResponse.json({ ok: true, persisted: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "patch faalde" },
      { status: 400 }
    );
  }
}
