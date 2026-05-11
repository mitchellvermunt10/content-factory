import Stripe from "stripe";

let cached: Stripe | null = null;

export function isStripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

function getClient(): Stripe {
  if (cached) return cached;
  const key = (process.env.STRIPE_SECRET_KEY ?? "").replace(/\s+/g, "");
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY ontbreekt — zet 'm in Vercel env vars.");
  }
  cached = new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
  return cached;
}

export type CheckoutTier = "single" | "always-on" | "receptionist";

const TIER_CONFIG: Record<
  CheckoutTier,
  { amount: number; mode: "payment" | "subscription"; label: string }
> = {
  single: {
    amount: 75000, // €750.00 in cents
    mode: "payment",
    label: "Content Factory — Eenmalige campagne",
  },
  "always-on": {
    amount: 49700, // €497.00/mnd
    mode: "subscription",
    label: "Always-On abonnement — Content Factory",
  },
  receptionist: {
    amount: 29900, // €299.00/mnd
    mode: "subscription",
    label: "AI Receptionist abonnement",
  },
};

export interface CreateCheckoutInput {
  tier: CheckoutTier;
  customerEmail: string;
  customerName?: string;
  outreachId?: string; // voor metadata-koppeling
  campaignId?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export async function createCheckoutSession(
  input: CreateCheckoutInput
): Promise<{ id: string; url: string }> {
  const stripe = getClient();
  const config = TIER_CONFIG[input.tier];

  const successDefault = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/studio/pipeline?paid=1`
    : "https://nextlevelsites.nl/studio/pipeline?paid=1";

  const session = await stripe.checkout.sessions.create({
    mode: config.mode,
    payment_method_types: ["card", "ideal"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: config.label,
          },
          unit_amount: config.amount,
          ...(config.mode === "subscription"
            ? { recurring: { interval: "month" } }
            : {}),
        },
        quantity: 1,
      },
    ],
    customer_email: input.customerEmail,
    metadata: {
      tier: input.tier,
      outreachId: input.outreachId ?? "",
      campaignId: input.campaignId ?? "",
      customerName: input.customerName ?? "",
    },
    success_url: input.successUrl ?? successDefault,
    cancel_url: input.cancelUrl ?? successDefault,
    locale: "nl",
  });

  if (!session.url) {
    throw new Error("Stripe gaf geen checkout-URL terug");
  }

  return { id: session.id, url: session.url };
}
