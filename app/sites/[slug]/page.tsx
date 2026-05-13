import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/sites/SiteNav";
import { loadSiteData, listSlugs } from "@/lib/sites/data";
import {
  businessSchema,
  breadcrumbSchema,
  renderSchemaJson,
} from "@/lib/sites/schema";
import { SiteExperience } from "./SiteExperience";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://contentfactory.nextlevelsites.nl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadSiteData(slug);
  if (!result) return { title: "Site niet gevonden" };
  const { business, isDemo } = result.data;
  const url = `${BASE_URL}/sites/${slug}`;
  const title = `${business.name} — ${business.vertical} in ${business.city}`;

  return {
    title,
    description: business.tagline,
    keywords: [
      business.name.toLowerCase(),
      `${business.vertical.toLowerCase()} ${business.city.toLowerCase()}`,
      business.cuisine ? `${business.cuisine.toLowerCase()} ${business.city.toLowerCase()}` : "",
      `reserveren ${business.vertical.toLowerCase()} ${business.city.toLowerCase()}`,
    ].filter(Boolean) as string[],
    alternates: { canonical: url },
    openGraph: {
      title,
      description: business.tagline,
      type: "website",
      locale: "nl_NL",
      url,
      siteName: business.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: business.tagline,
    },
    robots: isDemo
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export async function generateStaticParams() {
  return listSlugs().map((slug) => ({ slug }));
}

export default async function NextLevelSitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await loadSiteData(slug);
  if (!result) notFound();

  const url = `${BASE_URL}/sites/${slug}`;
  const schemaJson = renderSchemaJson(
    businessSchema(result.data, url),
    breadcrumbSchema([{ name: result.data.business.name, url }])
  );

  return (
    <>
      {schemaJson ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: schemaJson }}
        />
      ) : null}
      <SiteNav
        slug={result.data.slug}
        businessName={result.data.business.name}
        startTransparent
        variant={result.data.shop ? "shop" : "restaurant"}
        logo={result.data.business.logo}
      />
      <SiteExperience data={result.data} mode={result.mode} />
    </>
  );
}
