"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, ShoppingBag, Truck, Loader2, Palette } from "lucide-react";
import { toast } from "sonner";
import type { NextLevelSiteData, ShopProduct } from "@/lib/sites/types";

type Variant = "single" | "ams";

interface Props {
  data: NextLevelSiteData;
  product: ShopProduct;
}

/**
 * Cinematic product-detail pagina voor shop-sites.
 * Layout: full-bleed image links (desktop) + content rechts.
 * Tier-selector wanneer product een priceAmsEur heeft: single-color vs
 * AMS multi-color (Bambu Lab P2S AMS Combo).
 * "Bestel nu" trigger naar /api/sites/<slug>/checkout — Mollie-flow.
 */
export function ProductDetail({ data, product }: Props) {
  const [ordering, setOrdering] = useState(false);
  const hasAmsTier = typeof product.priceAmsEur === "number";
  const [variant, setVariant] = useState<Variant>("single");
  const activePrice =
    variant === "ams" && hasAmsTier ? product.priceAmsEur! : product.priceEur;

  // Image-gallery: hero is hoofd, gallery zijn MakerWorld-shots
  const allImages = [product.image, ...(product.gallery ?? [])];
  const [activeImage, setActiveImage] = useState(product.image);
  const hasGallery = (product.gallery?.length ?? 0) > 0;

  async function handleOrder() {
    setOrdering(true);
    try {
      const res = await fetch(`/api/sites/${data.slug}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, variant }),
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
          {/* Product image + gallery */}
          <div className="flex flex-col gap-4">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black">
              <div className="relative aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeImage}
                  alt={product.title}
                  className="h-full w-full object-cover transition-opacity duration-300"
                  key={activeImage}
                />
              </div>
            </div>

            {hasGallery ? (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, idx) => {
                  const isActive = img === activeImage;
                  const isHero = idx === 0;
                  return (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={`relative shrink-0 overflow-hidden rounded-xl border transition-all ${
                        isActive
                          ? "border-white scale-100"
                          : "border-white/10 opacity-70 hover:border-white/40 hover:opacity-100"
                      }`}
                      aria-label={
                        isHero
                          ? "Cinematic hero-shot"
                          : `Foto ${idx} van MakerWorld`
                      }
                    >
                      <div className="relative size-20 sm:size-24">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      {isHero ? (
                        <span className="absolute bottom-1 left-1 rounded-full bg-black/75 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-white/85 backdrop-blur-sm">
                          Sfeer
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
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

            {/* Tier-selector (alleen als priceAmsEur bestaat) */}
            {hasAmsTier ? (
              <div className="mt-10">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/55">
                  Uitvoering
                </p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setVariant("single")}
                    className={`flex flex-col items-start gap-1 rounded-2xl border px-5 py-4 text-left transition-colors ${
                      variant === "single"
                        ? "border-white bg-white/10"
                        : "border-white/15 hover:border-white/30"
                    }`}
                  >
                    <span className="font-serif text-lg">Eén kleur</span>
                    <span className="font-mono text-xs text-white/55">
                      Kies uit 30+ kleuren · €
                      {product.priceEur.toFixed(2).replace(".", ",")}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVariant("ams")}
                    className={`flex flex-col items-start gap-1 rounded-2xl border px-5 py-4 text-left transition-colors ${
                      variant === "ams"
                        ? "border-white bg-white/10"
                        : "border-white/15 hover:border-white/30"
                    }`}
                  >
                    <span className="flex items-center gap-2 font-serif text-lg">
                      <Palette className="size-4" />
                      AMS multi-color
                    </span>
                    <span className="font-mono text-xs text-white/55">
                      {product.amsDescription ?? "Meerdere kleuren in één print"}{" "}
                      · €{product.priceAmsEur!.toFixed(2).replace(".", ",")}
                    </span>
                  </button>
                </div>
              </div>
            ) : null}

            {/* Spec row */}
            <div className="mt-10 grid grid-cols-2 gap-4 border-y border-white/10 py-6 sm:grid-cols-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
                  Prijs
                </p>
                <p className="mt-2 font-serif text-3xl tabular-nums">
                  €{activePrice.toFixed(2).replace(".", ",")}
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
                  Bestel nu · €{activePrice.toFixed(2).replace(".", ",")}
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
