import { NextResponse } from "next/server";
import { BusinessBriefSchema } from "@/lib/schemas/brief";
import { runCampaign } from "@/lib/generators/orchestrator";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const brief = BusinessBriefSchema.parse(body);
    const campaign = await runCampaign(brief);
    return NextResponse.json(campaign);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Onbekende fout";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
