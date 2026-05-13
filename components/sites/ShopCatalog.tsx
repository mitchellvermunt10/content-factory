"use client";

import Link from "next/link";
import { Clock, ShoppingBag } from "lucide-react";
import { Scene, SceneText, SceneStagger } from "@/components/sites/Scene";
import type { ShopProduct } from "@/lib/sites/types";

interface Props {
  /** Slug van de site, nodig voor product-detail links */
  slug: string;
  /** Lijst producten uit data.ts shop.products */
  products: ShopProduct[];
  /** Verzendkosten + levertijd-tekst */
  shippingEur?: number;
  deliveryNote?: string;
  /** Eyebrow + headline boven de grid */
  eyebrow?: string;
  headline?: string;
}

/**
 * Cinematic product-catalog voor JJ-3D-stijl shop-sites.
 * Vervangt scene-3 (menu) wanneer shop.products aanwezig is.
 * Layout: 3-koloms grid (1-koloms mobiel), per product card met image,
 * naam, print-tijd, prijs en 'Bestel'-knop die linkt naar product-detail.
 */
export function ShopCatalog({
  slug,
  products,
  shippingEur,
  deliveryNote,
  eyebrow = "Onze prints",
  headline = "Wat we voor je maken",
}: Props) {
  if (products.length === 0) return null;

  return (
    <Scene vhMultiplier={3}>
      <div className="w-full px-6">
        <div className="mx-auto max-w-6xl">
          <SceneText
            enterStart={0.0}
            enterEnd={0.1}
            exitStart={0.95}
            exitEnd={1.0}
            travel={40}
          >
            <p className="text-center font-mono text-xs uppercase tracking-[0.4em] text-white/50">
              {eyebrow}
            </p>
            <h2 className="mt-4 text-center font-serif text-4xl font-light md:text-5xl">
              {headline}
            </h2>
            {deliveryNote ? (
              <p className="mx-auto mt-4 max-w-xl text-center text-sm text-white/60">
                {deliveryNote}
                {shippingEur != null ? (
                  <>
                    {" · "}Verzending €{shippingEur.toFixed(2).replace(".", ",")}
                  </>
                ) : null}
              </p>
            ) : null}
          </SceneText>

          <SceneStagger
            windowStart={0.1}
            windowEnd={0.45}
            perItemDuration={0.18}
            exitStart={0.95}
            exitEnd={1.0}
            travel={32}
            className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/sites/${slug}/product/${product.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-white/30"
              >
                <div className="relative aspect-square overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {product.printTimeMinutes ? (
                    <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/85 backdrop-blur-md">
                      <Clock className="size-3" />
                      {formatPrintTime(product.printTimeMinutes)}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-serif text-lg leading-snug">
                    {product.title}
                  </h3>
                  {product.description ? (
                    <p className="mt-2 line-clamp-2 text-sm text-white/55">
                      {product.description}
                    </p>
                  ) : null}

                  <div className="mt-4 flex items-baseline justify-between border-t border-white/10 pt-4">
                    <span className="font-serif text-2xl text-white">
                      {product.priceAmsEur != null ? (
                        <span className="text-base text-white/55">vanaf </span>
                      ) : null}
                      €{product.priceEur.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-medium text-black transition-transform group-hover:scale-[1.04]">
                      <ShoppingBag className="size-3" />
                      Bestel
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </SceneStagger>
        </div>
      </div>
    </Scene>
  );
}

function formatPrintTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}u` : `${h}u${m}m`;
}
