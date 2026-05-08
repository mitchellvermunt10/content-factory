import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createApproval, listApprovals } from "@/lib/supabase/repo";
import { isSupabaseEnabled } from "@/lib/supabase/server";

export const runtime = "nodejs";

const PostBody = z.object({
  artifactKey: z.string().max(40).optional(),
  status: z.enum(["approved", "rejected", "comment"]),
  comment: z.string().max(2000).nullable().optional(),
  createdByEmail: z.string().email().nullable().optional(),
  createdByName: z.string().max(80).nullable().optional(),
});

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!isSupabaseEnabled()) {
    return NextResponse.json({ approvals: [], persisted: false });
  }
  try {
    const approvals = await listApprovals(id);
    return NextResponse.json({ approvals, persisted: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "list faalde" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!isSupabaseEnabled()) {
    return NextResponse.json({ ok: true, persisted: false });
  }
  try {
    const body = PostBody.parse(await req.json());
    const approval = await createApproval({
      campaignId: id,
      artifactKey: body.artifactKey ?? "campaign",
      status: body.status,
      comment: body.comment ?? null,
      createdByEmail: body.createdByEmail ?? null,
      createdByName: body.createdByName ?? null,
    });
    return NextResponse.json({ approval, persisted: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "create faalde" },
      { status: 400 }
    );
  }
}
