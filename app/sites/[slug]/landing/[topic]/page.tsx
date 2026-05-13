import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SubPageShell } from "@/components/sites/SubPageShell";
import { loadSiteData, listSlugs } from "@/lib/sites/data";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://nextlevelsites.nl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; topic: string }>;
}): Promise<Metadata> {
  const { slug, topic } = await params;
  const result = await loadSiteData(slug);
  const landing = result?.data.landingPages?.find((l) => l.topic === topic);
  if (!result || !landing) return { title: "Niet gevonden" };

  const url = `${BASE_URL}/sites/${slug}/landing/${topic}`;
  return {
    title: `${landing.title} — ${result.data.business.name}`,
    description: landing.subtitle,
    keywords: landing.keyword,
    alternates: { canonical: url },
    openGraph: {
      title: landing.title,
      description: landing.subtitle,
      url,
      locale: "nl_NL",
      type: "website",
      images: landing.heroImage ? [{ url: landing.heroImage }] : undefined,
    },
    robots: result.data.isDemo
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export async function generateStaticParams() {
  const params: { slug: string; topic: string }[] = [];
  for (const slug of listSlugs()) {
    const result = await loadSiteData(slug);
    const landings = result?.data.landingPages ?? [];
    for (const l of landings) {
      params.push({ slug, topic: l.topic });
    }
  }
  return params;
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ slug: string; topic: string }>;
}) {
  const { slug, topic } = await params;
  const result = await loadSiteData(slug);
  const landing = result?.data.landingPages?.find((l) => l.topic === topic);
  if (!result || !landing) notFound();
  const { data } = result;

  const referencedProducts =
    landing.productIds && landing.productIds.length > 0
      ? data.shop?.products?.filter((p) => landing.productIds!.includes(p.id)) ??
        []
      : [];

  const ctaHref = landing.ctaHref ?? `/sites/${slug}/maatwerk`;
  const ctaTarget = ctaHref.startsWith("/sites/")
    ? ctaHref
    : `/sites/${slug}${ctaHref}`;

  // BreadcrumbList JSON-LD voor Google
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: data.business.name,
        item: `${BASE_URL}/sites/${slug}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: landing.title,
        item: `${BASE_URL}/sites/${slug}/landing/${topic}`,
      },
    ],
  };

  return (
    <SubPageShell
      data={data}
      heroImage={landing.heroImage}
      heroEyebrow={landing.eyebrow ?? "Landing"}
      heroTitle={landing.title}
      heroSubtitle={landing.subtitle}
    >
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        {/* Intro */}
        <p className="text-pretty text-xl leading-relaxed text-white/80 md:text-2xl">
          {landing.intro}
        </p>

        {/* Content secties */}
        {landing.sections && landing.sections.length > 0 ? (
          <div className="mt-16 space-y-14">
            {landing.sections.map((section, idx) => (
              <section key={idx}>
                <h2 className="font-serif text-3xl font-light leading-tight md:text-4xl">
                  {section.headline}
                </h2>
                <p className="mt-6 text-pretty text-base leading-relaxed text-white/70 md:text-lg">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        ) : null}

        {/* Gerefereerde producten — optioneel inline blok */}
        {referencedProducts.length > 0 ? (
          <div className="mt-20 border-t border-white/10 pt-14">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/55">
              Direct uit de collectie
            </p>
            <h2 className="mt-4 font-serif text-3xl font-light md:text-4xl">
              Nu te bestellen
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {referencedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/sites/${slug}/product/${p.id}`}
                  className="group flex gap-4 overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-4 transition-colors hover:border-white/30"
                >
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <h3 className="font-serif text-base leading-snug">
                      {p.title}
                    </h3>
                    <p className="mt-1 font-serif text-lg text-white/85">
                      €{p.priceEur.toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {/* CTA */}
        <div className="mt-20 rounded-3xl border border-white/15 bg-white/5 p-10 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/55">
            Volgende stap
          </p>
          <h3 className="mt-4 font-serif text-3xl font-light leading-tight md:text-4xl">
            {landing.ctaLabel ?? "Vraag op maat aan"}
          </h3>
          <Link
            href={ctaTarget}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
          >
            Verder
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </SubPageShell>
  );
}
