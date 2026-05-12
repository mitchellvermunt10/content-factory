import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/sites/SiteNav";
import { loadSiteData, listSlugs } from "@/lib/sites/data";
import { SiteExperience } from "./SiteExperience";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadSiteData(slug);
  if (!result) return { title: "Site niet gevonden" };
  return {
    title: `${result.data.business.name} — ${result.data.business.city}`,
    description: result.data.business.tagline,
    openGraph: {
      title: result.data.business.name,
      description: result.data.business.tagline,
      type: "website",
      locale: "nl_NL",
    },
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

  return (
    <>
      <SiteNav
        slug={result.data.slug}
        businessName={result.data.business.name}
        startTransparent
      />
      <SiteExperience data={result.data} mode={result.mode} />
    </>
  );
}
