import { NextRequest, NextResponse } from "next/server";
import { listImagesForCampaign, deleteImage } from "@/lib/supabase/images";
import { isSupabaseEnabled } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!isSupabaseEnabled()) {
    return NextResponse.json({ images: [], persisted: false });
  }
  try {
    const images = await listImagesForCampaign(id);
    return NextResponse.json({ images, persisted: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "list faalde" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const imageId = req.nextUrl.searchParams.get("imageId");
  if (!imageId) {
    return NextResponse.json(
      { error: "imageId querystring vereist" },
      { status: 400 }
    );
  }
  try {
    await deleteImage(imageId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "delete faalde" },
      { status: 500 }
    );
  }
}
