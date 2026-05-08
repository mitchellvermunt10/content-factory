import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { ResearchInputSchema } from "@/lib/schemas/prospect";
import { runProspectResearch } from "@/lib/research/agent";
import {
  createResearchRow,
  completeResearch,
  failResearch,
} from "@/lib/supabase/prospectRepo";
import { isSupabaseEnabled } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300; // Vercel Pro

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = ResearchInputSchema.parse(body);

    const id = nanoid(10);

    // Persist intent — laat user later via /api/prospects/[id] terughalen
    if (isSupabaseEnabled()) {
      await createResearchRow({ id, research: input });
    }

    try {
      const out = await runProspectResearch(input);

      if (isSupabaseEnabled()) {
        await completeResearch({
          id,
          result: out.result,
          costCents: out.costCents,
          durationMs: out.durationMs,
        });
      }

      return NextResponse.json({
        id,
        ...out,
        persisted: isSupabaseEnabled(),
      });
    } catch (innerErr) {
      const message =
        innerErr instanceof Error ? innerErr.message : "Onbekende fout";
      if (isSupabaseEnabled()) {
        await failResearch({ id, errorMessage: message });
      }
      throw innerErr;
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Research faalde" },
      { status: 400 }
    );
  }
}
