import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/sites/SiteNav";
import { SiteFooter } from "@/components/sites/SiteFooter";
import { SmoothScrollProvider } from "@/components/sites/SmoothScrollProvider";
import { WhatsAppFAB } from "@/components/sites/WhatsAppFAB";
import { CookieBanner } from "@/components/sites/CookieBanner";
import { loadSiteData, listSlugs } from "@/lib/sites/data";
import { ProductDetail } from "@/components/sites/ProductDetail";

const BASE =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://contentfactory.nextlevelsites.nl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { slug, id } = await params;
  const result = await loadSiteData(slug);
  const product = result?.data.shop?.products?.find((p) => p.id === id);
  if (!result || !product) return { title: "Product niet gevonden" };

  return {
    title: `${product.title} — ${result.data.business.name}`,
    description: product.description ?? product.title,
    alternates: { canonical: `${BASE}/sites/${slug}/product/${id}` },
    openGraph: {
      title: product.title,
      description: product.description ?? "",
      type: "website",
      locale: "nl_NL",
      url: `${BASE}/sites/${slug}/product/${id}`,
      images: [{ url: product.image }],
    },
    robots: result.data.isDemo
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export async function generateStaticParams() {
  const params: { slug: string; id: string }[] = [];
  for (const slug of listSlugs()) {
    const result = await loadSiteData(slug);
    const products = result?.data.shop?.products;
    if (!products) continue;
    for (const p of products) {
      params.push({ slug, id: p.id });
    }
  }
  return params;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const result = await loadSiteData(slug);
  if (!result) notFound();
  const product = result.data.shop?.products?.find((p) => p.id === id);
  if (!product) notFound();

  return (
    <SmoothScrollProvider>
      <SiteNav
        slug={result.data.slug}
        businessName={result.data.business.name}
        startTransparent={false}
        variant={result.data.shop ? "shop" : "restaurant"}
      />
      <main className="relative min-h-screen bg-black text-white">
        <ProductDetail data={result.data} product={product} />
        <SiteFooter data={result.data} />
      </main>
      <WhatsAppFAB
        whatsapp={result.data.business.whatsapp}
        defaultMessage={
          result.data.business.whatsappMessage ??
          `Hoi! Ik heb een vraag over '${product.title}'.`
        }
      />
      <CookieBanner />
    </SmoothScrollProvider>
  );
}
