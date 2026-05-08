import { NextRequest, NextResponse } from "next/server";
import { listResearchForOwner } from "@/lib/supabase/prospectRepo";
import { isSupabaseEnabled } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const owner = req.nextUrl.searchParams.get("owner");
  if (!owner) {
    return NextResponse.json(
      { error: "owner querystring vereist" },
      { status: 400 }
    );
  }
  if (!isSupabaseEnabled()) {
    return NextResponse.json({ research: [], persisted: false });
  }
  try {
    const items = await listResearchForOwner(owner);
    return NextResponse.json({ research: items });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "list faalde" },
      { status: 500 }
    );
  }
}
