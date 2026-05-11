import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createOutreach,
  listOutreach,
  listFollowupsNeeded,
} from "@/lib/supabase/outreachRepo";
import { isSupabaseEnabled } from "@/lib/supabase/server";

export const runtime = "nodejs";

const CreateBody = z.object({
  ownerEmail: z.string().email(),
  prospectName: z.string().min(2).max(200),
  prospectEmail: z.string().email().nullable().optional(),
  prospectPhone: z.string().max(40).nullable().optional(),
  prospectCity: z.string().max(120).nullable().optional(),
  prospectVertical: z.string().max(40).nullable().optional(),
  prospectWebsite: z.string().max(500).nullable().optional(),
  prospectInstagram: z.string().max(120).nullable().optional(),
  campaignId: z.string().max(40).nullable().optional(),
  researchId: z.string().max(40).nullable().optional(),
  emailSubject: z.string().max(280).nullable().optional(),
  emailBody: z.string().max(5000).nullable().optional(),
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
});

export async function POST(req: NextRequest) {
  if (!isSupabaseEnabled()) {
    return NextResponse.json(
      { error: "Supabase niet geconfigureerd" },
      { status: 503 }
    );
  }
  try {
    const body = CreateBody.parse(await req.json());
    const outreach = await createOutreach(body);
    return NextResponse.json({ outreach });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Create faalde" },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  const owner = req.nextUrl.searchParams.get("owner");
  const followups = req.nextUrl.searchParams.get("followups") === "1";
  if (!owner) {
    return NextResponse.json(
      { error: "owner querystring vereist" },
      { status: 400 }
    );
  }
  if (!isSupabaseEnabled()) {
    return NextResponse.json({ outreach: [] });
  }
  try {
    const records = followups
      ? await listFollowupsNeeded(owner)
      : await listOutreach(owner);
    return NextResponse.json({ outreach: records });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "List faalde" },
      { status: 500 }
    );
  }
}
