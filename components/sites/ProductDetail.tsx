"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, ShoppingBag, Truck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { NextLevelSiteData, ShopProduct } from "@/lib/sites/types";

interface Props {
  data: NextLevelSiteData;
  product: ShopProduct;
}

/**
 * Cinematic product-detail pagina voor shop-sites.
 * Layout: full-bleed image links (desktop) + content rechts.
 * "Bestel nu" trigger naar /api/sites/<slug>/checkout — Mollie-flow.
 */
export function ProductDetail({ data, product }: Props) {
  const [ordering, setOrdering] = useState(false);

  async function handleOrder() {
    setOrdering(true);
    try {
      const res = await fetch(`/api/sites/${data.slug}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      if (json.checkoutUrl) {
        window.location.href = json.checkoutUrl;
      } else {
        toast.error("Checkout niet beschikbaar — Mollie nog niet gekoppeld", {
          description: "We werken eraan. Stuur even WhatsApp om handmatig te bestellen.",
        });
      }
    } catch (err) {
      toast.error("Bestellen mislukt", {
        description: err instanceof Error ? err.message : "Onbekende fout",
      });
    } finally {
      setOrdering(false);
    }
  }

  return (
    <article className="relative pt-24 sm:pt-32">
      {/* Back-link */}
      <div className="mx-auto max-w-6xl px-6">
        <Link
          href={`/sites/${data.slug}#shop`}
          className="inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Terug naar alle prints
        </Link>
      </div>

      <div className="mx-auto mt-8 max-w-6xl px-6 sm:mt-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Product image */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black">
            <div className="relative aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            {product.tags && product.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/65"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <h1 className="mt-6 font-serif text-4xl font-light leading-tight tracking-tight sm:text-5xl md:text-6xl">
              {product.title}
            </h1>

            {product.description ? (
              <p className="mt-6 text-lg leading-relaxed text-white/75 md:text-xl">
                {product.description}
              </p>
            ) : null}

            {/* Spec row */}
            <div className="mt-10 grid grid-cols-2 gap-4 border-y border-white/10 py-6 sm:grid-cols-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
                  Prijs
                </p>
                <p className="mt-2 font-serif text-3xl">
                  €{product.priceEur.toFixed(2).replace(".", ",")}
                </p>
              </div>
              {product.printTimeMinutes ? (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
                    Print-tijd
                  </p>
                  <p className="mt-2 flex items-baseline gap-1.5 font-serif text-2xl">
                    <Clock className="size-4 text-white/55" />
                    {formatPrintTime(product.printTimeMinutes)}
                  </p>
                </div>
              ) : null}
              {data.shop?.shippingEur != null ? (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
                    Verzending
                  </p>
                  <p className="mt-2 flex items-baseline gap-1.5 font-serif text-2xl">
                    <Truck className="size-4 text-white/55" />€
                    {data.shop.shippingEur.toFixed(2).replace(".", ",")}
                  </p>
                </div>
              ) : null}
            </div>

            {/* CTA */}
            <button
              onClick={handleOrder}
              disabled={ordering}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-5 text-base font-medium text-black transition-transform hover:scale-[1.01] disabled:opacity-60 sm:w-auto sm:self-start"
            >
              {ordering ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Bezig...
                </>
              ) : (
                <>
                  <ShoppingBag className="size-4" />
                  Bestel nu · €{product.priceEur.toFixed(2).replace(".", ",")}
                </>
              )}
            </button>

            {data.shop?.deliveryNote ? (
              <p className="mt-4 text-sm text-white/55">
                {data.shop.deliveryNote}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Spacing voor footer */}
      <div className="h-32 sm:h-40" />
    </article>
  );
}

function formatPrintTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} uur` : `${h}u${m}m`;
}
