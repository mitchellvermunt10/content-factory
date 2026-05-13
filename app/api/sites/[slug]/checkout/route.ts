import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loadSiteData } from "@/lib/sites/data";

export const runtime = "nodejs";

const Body = z.object({
  productId: z.string().min(1),
  customerEmail: z.string().email().optional(),
  customerName: z.string().max(120).optional(),
});

/**
 * Shop checkout endpoint per site. Voor v1 een stub die 503 retourneert
 * tot Mollie-integratie er is. Voor JJ-3D: zodra Mitchell hun Mollie
 * API-key heeft → echte Mollie payment-session aanmaken.
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
  if (!result) {
    return NextResponse.json({ error: "Site niet gevonden" }, { status: 404 });
  }
  const product = result.data.shop?.products?.find(
    (p) => p.id === body.productId
  );
  if (!product) {
    return NextResponse.json(
      { error: "Product niet gevonden" },
      { status: 404 }
    );
  }

  // TODO: Mollie payment-session aanmaken via lib/billing/mollie.ts
  // Voor nu: 503 zodat frontend de fallback-toast toont
  return NextResponse.json(
    {
      error:
        "Mollie-integratie nog niet actief — klant kan via WhatsApp bestellen",
      product: {
        id: product.id,
        title: product.title,
        priceEur: product.priceEur,
      },
    },
    { status: 503 }
  );
}
