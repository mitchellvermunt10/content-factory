import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCheckoutSession, isStripeEnabled } from "@/lib/billing/stripe";

export const runtime = "nodejs";

const Body = z.object({
  tier: z.enum(["single", "always-on", "receptionist"]),
  customerEmail: z.string().email(),
  customerName: z.string().max(120).optional(),
  outreachId: z.string().uuid().optional(),
  campaignId: z.string().max(40).optional(),
});

export async function POST(req: NextRequest) {
  if (!isStripeEnabled()) {
    return NextResponse.json(
      {
        error:
          "STRIPE_SECRET_KEY ontbreekt. Maak account op stripe.com, voeg test/live secret key toe in Vercel.",
      },
      { status: 503 }
    );
  }
  try {
    const body = Body.parse(await req.json());
    const session = await createCheckoutSession(body);
    return NextResponse.json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout faalde" },
      { status: 400 }
    );
  }
}
