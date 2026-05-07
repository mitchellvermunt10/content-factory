import { NextResponse } from "next/server";
import { BusinessBriefSchema } from "@/lib/schemas/brief";
import { regenerateArtifact } from "@/lib/generators/orchestrator";
import { MVP_GENERATORS, type MvpGeneratorId } from "@/lib/constants";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ artifact: string }> }
) {
  try {
    const { artifact } = await params;
    if (!MVP_GENERATORS.includes(artifact as MvpGeneratorId)) {
      return NextResponse.json(
        { error: `Onbekend artifact: ${artifact}` },
        { status: 400 }
      );
    }
    const body = await req.json();
    const brief = BusinessBriefSchema.parse(body);
    const result = await regenerateArtifact(brief, artifact as MvpGeneratorId);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Onbekende fout";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
