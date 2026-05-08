import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { scrapeProspectWebsite } from "@/lib/research/scraper";

export const runtime = "nodejs";
export const maxDuration = 120;

const Body = z.object({
  websiteUrl: z.string().url(),
  vertical: z.enum([
    "salon",
    "restaurant",
    "dentist",
    "gym",
    "tattoo",
    "barber",
    "hotel",
    "coffeeshop",
    "autobedrijf",
  ]),
  businessName: z.string().max(120).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = Body.parse(await req.json());
    const result = await scrapeProspectWebsite(body);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scrape faalde" },
      { status: 400 }
    );
  }
}
