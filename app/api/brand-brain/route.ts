import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BusinessBriefSchema } from "@/lib/schemas/brief";
import { getBrandBrain, upsertBrandBrain } from "@/lib/supabase/repo";
import { isSupabaseEnabled } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const owner = req.nextUrl.searchParams.get("owner");
  const business = req.nextUrl.searchParams.get("business");
  if (!owner || !business) {
    return NextResponse.json(
      { error: "owner & business querystrings vereist" },
      { status: 400 }
    );
  }
  if (!isSupabaseEnabled()) {
    return NextResponse.json({ brain: null, persisted: false });
  }
  try {
    const brain = await getBrandBrain(owner, business);
    return NextResponse.json({ brain, persisted: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "fetch faalde" },
      { status: 500 }
    );
  }
}

const UpsertBody = z.object({
  ownerEmail: z.string().email(),
  briefTemplate: BusinessBriefSchema,
  contextSummary: z.string().max(2000).nullable().optional(),
});

export async function POST(req: NextRequest) {
  if (!isSupabaseEnabled()) {
    return NextResponse.json({ ok: true, persisted: false });
  }
  try {
    const body = UpsertBody.parse(await req.json());
    await upsertBrandBrain({
      ownerEmail: body.ownerEmail,
      businessName: body.briefTemplate.name,
      vertical: body.briefTemplate.businessType,
      tone: body.briefTemplate.tone,
      briefTemplate: body.briefTemplate,
      contextSummary: body.contextSummary ?? null,
    });
    return NextResponse.json({ ok: true, persisted: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "upsert faalde" },
      { status: 400 }
    );
  }
}
