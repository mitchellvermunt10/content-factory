import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loadSiteData } from "@/lib/sites/data";

export const runtime = "nodejs";

const Body = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional(),
  sourceUrl: z.string().url().max(500).optional().or(z.literal("")),
  description: z.string().min(10).max(4000),
  budget: z.string().max(80).optional(),
  deadline: z.string().max(80).optional(),
});

/**
 * Maatwerk-aanvraag endpoint per site. Voor v1 een stub die de payload
 * logt en 200 retourneert. v2: Resend-integratie naar customRequest.email
 * + opslag in Supabase voor backoffice-zicht.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid body" },
      { status: 400 }
    );
  }

  const result = await loadSiteData(slug);
  if (!result?.data.customRequest) {
    return NextResponse.json(
      { error: "Maatwerk niet beschikbaar voor deze site" },
      { status: 404 }
    );
  }

  // TODO: v2 — Resend.emails.send naar result.data.customRequest.email
  // TODO: v2 — INSERT in Supabase 'custom_requests' tabel
  // Voor nu: log naar Vercel logs zodat we 'm in production kunnen zien
  console.info("[custom-request]", {
    slug,
    timestamp: new Date().toISOString(),
    ...body,
  });

  return NextResponse.json({ ok: true });
}
