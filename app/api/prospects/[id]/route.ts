import { NextRequest, NextResponse } from "next/server";
import { getResearch } from "@/lib/supabase/prospectRepo";
import { isSupabaseEnabled } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!isSupabaseEnabled()) {
    return NextResponse.json({ research: null, persisted: false });
  }
  try {
    const research = await getResearch(id);
    if (!research) {
      return NextResponse.json({ research: null }, { status: 404 });
    }
    return NextResponse.json({ research });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "fetch faalde" },
      { status: 500 }
    );
  }
}
