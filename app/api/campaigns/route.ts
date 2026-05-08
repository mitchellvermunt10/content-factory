import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { BusinessBriefSchema } from "@/lib/schemas/brief";
import { BrandSchema } from "@/lib/schemas/brand";
import { deriveBrand } from "@/lib/brand/presets";
import {
  createCampaignRow,
  listCampaignsForOwner,
  upsertBrandBrain,
  patchArtifact,
} from "@/lib/supabase/repo";
import { isSupabaseEnabled } from "@/lib/supabase/server";

export const runtime = "nodejs";

const CreateBody = z.object({
  brief: BusinessBriefSchema,
  ownerEmail: z.string().email().nullable().optional(),
  // Optioneel: client kan een eigen ID meegeven (voor reproducibility tijdens dev)
  id: z.string().min(6).max(20).optional(),
  // Optioneel: gescrapete website-content meegeven bij creatie zodat 'ie
  // direct op de row staat voor alle generators (geen race-condition).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scrapedContent: z.any().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = CreateBody.parse(json);
    const id = parsed.id ?? nanoid(10);
    const brand = BrandSchema.parse(deriveBrand(parsed.brief));

    if (isSupabaseEnabled()) {
      await createCampaignRow({
        id,
        brief: parsed.brief,
        brand,
        ownerEmail: parsed.ownerEmail ?? null,
      });
      // Persist scraped content meteen bij creatie — kritiek belangrijk
      // omdat alle 7 generators dit lezen tijdens de generatie-loop.
      // Eerder via fire-and-forget PATCH na navigatie miste de race.
      if (parsed.scrapedContent) {
        await patchArtifact(
          id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          "scrapedContent" as any,
          parsed.scrapedContent
        );
      }
      // Brand Brain: bij elke nieuwe campagne voor owner+business → updaten/aanmaken.
      // Hierdoor kan de wizard later "vorige brief gebruiken" aanbieden.
      if (parsed.ownerEmail) {
        upsertBrandBrain({
          ownerEmail: parsed.ownerEmail,
          businessName: parsed.brief.name,
          vertical: parsed.brief.businessType,
          tone: parsed.brief.tone,
          briefTemplate: parsed.brief,
        }).catch(() => {});
      }
    }

    return NextResponse.json({ id, brand, persisted: isSupabaseEnabled() });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "create campaign faalde" },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  const ownerEmail = req.nextUrl.searchParams.get("owner");
  if (!ownerEmail) {
    return NextResponse.json({ error: "owner querystring vereist" }, { status: 400 });
  }
  if (!isSupabaseEnabled()) {
    return NextResponse.json({ campaigns: [], persisted: false });
  }
  try {
    const campaigns = await listCampaignsForOwner(ownerEmail);
    return NextResponse.json({ campaigns, persisted: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "list faalde" },
      { status: 500 }
    );
  }
}
