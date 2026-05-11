import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  updateOutreachStatus,
  getOutreach,
  recordFollowup,
} from "@/lib/supabase/outreachRepo";
import { isSupabaseEnabled } from "@/lib/supabase/server";

export const runtime = "nodejs";

const PatchBody = z.object({
  status: z
    .enum([
      "draft",
      "sent",
      "opened",
      "replied",
      "in_call",
      "closed_won",
      "closed_lost",
      "dead",
    ])
    .optional(),
  notes: z.string().max(2000).nullable().optional(),
  recordFollowup: z.boolean().optional(),
});

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!isSupabaseEnabled()) {
    return NextResponse.json({ outreach: null });
  }
  try {
    const outreach = await getOutreach(id);
    if (!outreach) {
      return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
    }
    return NextResponse.json({ outreach });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Get faalde" },
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
    return NextResponse.json({ ok: true });
  }
  try {
    const body = PatchBody.parse(await req.json());
    if (body.status) {
      await updateOutreachStatus(id, body.status, body.notes ?? undefined);
    }
    if (body.recordFollowup) {
      await recordFollowup(id);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update faalde" },
      { status: 400 }
    );
  }
}
