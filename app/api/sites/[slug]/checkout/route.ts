import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loadSiteData } from "@/lib/sites/data";

export const runtime = "nodejs";

const Body = z.object({
  productId: z.string().min(1),
  /**
   * Prijs-tier keuze. "single" = enkele kleur (priceEur), "ams" = multi-color
   * Bambu AMS premium (priceAmsEur). Default "single" voor backward compat
   * met oudere clients zonder tier-selector.
   */
  variant: z.enum(["single", "ams"]).default("single"),
  /**
   * Gekozen filament-kleur-id uit shop.colors. Alleen relevant bij
   * variant="single". Null/ontbrekend = klant heeft niets gekozen of het
   * is een AMS-bestelling waar kleur-combo via WhatsApp wordt afgestemd.
   */
  colorId: z.string().nullable().optional(),
  /**
   * Gekozen filament-materiaal-id uit shop.materials (PLA/PETG/ABS/TPU).
   * Toeslag uit material.priceModifierEur wordt opgeteld bij effective price.
   */
  materialId: z.string().nullable().optional(),
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

  // Bepaal effectieve prijs op basis van variant
  const isAms = body.variant === "ams";
  if (isAms && product.priceAmsEur == null) {
    return NextResponse.json(
      { error: "Dit product heeft geen AMS-tier beschikbaar" },
      { status: 400 }
    );
  }
  const effectivePrice = isAms ? product.priceAmsEur! : product.priceEur;

  // Valideer kleurkeuze (single-tier) tegen shop.colors palette
  let chosenColor: { id: string; name: string; hex: string } | null = null;
  if (!isAms && body.colorId) {
    const c = result.data.shop?.colors?.find((x) => x.id === body.colorId);
    if (!c) {
      return NextResponse.json(
        { error: "Ongeldige kleurkeuze" },
        { status: 400 }
      );
    }
    chosenColor = c;
  }

  // Valideer materiaal-keuze + bereken toeslag
  let materialPriceModifier = 0;
  let chosenMaterial:
    | { id: string; name: string; priceModifierEur: number }
    | null = null;
  if (body.materialId) {
    const m = result.data.shop?.materials?.find(
      (x) => x.id === body.materialId
    );
    if (!m) {
      return NextResponse.json(
        { error: "Ongeldige materiaal-keuze" },
        { status: 400 }
      );
    }
    materialPriceModifier = m.priceModifierEur;
    chosenMaterial = {
      id: m.id,
      name: m.name,
      priceModifierEur: m.priceModifierEur,
    };
  }

  const totalPrice = effectivePrice + materialPriceModifier;

  // TODO: Mollie payment-session aanmaken via lib/billing/mollie.ts
  // Voor nu: 503 zodat frontend de fallback-toast toont
  return NextResponse.json(
    {
      error:
        "Mollie-integratie nog niet actief — klant kan via WhatsApp bestellen",
      product: {
        id: product.id,
        title: product.title,
        variant: body.variant,
        color: chosenColor,
        material: chosenMaterial,
        basePriceEur: effectivePrice,
        priceEur: totalPrice,
      },
    },
    { status: 503 }
  );
}
