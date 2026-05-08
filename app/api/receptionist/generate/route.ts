import { NextResponse } from "next/server";
import { BusinessBriefSchema } from "@/lib/schemas/brief";
import { generateReceptionist } from "@/lib/generators/receptionist";
import { MOCK_MODE } from "@/lib/ai/client";
import { mockReceptionist } from "@/lib/generators/mockFixturesReceptionist";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const brief = BusinessBriefSchema.parse(body);
    const config = MOCK_MODE
      ? mockReceptionist(brief)
      : await generateReceptionist(brief);
    return NextResponse.json({ config });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Onbekende fout";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
