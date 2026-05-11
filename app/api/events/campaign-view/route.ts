import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { recordCampaignView } from "@/lib/supabase/outreachRepo";
import { isSupabaseEnabled } from "@/lib/supabase/server";

export const runtime = "nodejs";

const Body = z.object({
  campaignId: z.string().min(4).max(40),
});

export async function POST(req: NextRequest) {
  if (!isSupabaseEnabled()) {
    return NextResponse.json({ ok: true });
  }
  try {
    const body = Body.parse(await req.json());
    const userAgent = req.headers.get("user-agent") ?? null;
    const referrer = req.headers.get("referer") ?? null;
    await recordCampaignView({
      campaignId: body.campaignId,
      userAgent,
      referrer,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    // Geen failure tonen aan klant — analytics is best-effort
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "fout" },
      { status: 200 }
    );
  }
}
