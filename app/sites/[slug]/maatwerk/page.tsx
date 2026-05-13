import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubPageShell } from "@/components/sites/SubPageShell";
import { CustomRequestForm } from "@/components/sites/CustomRequestForm";
import { loadSiteData, listSlugs } from "@/lib/sites/data";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://nextlevelsites.nl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadSiteData(slug);
  if (!result?.data.customRequest) return { title: "Niet gevonden" };
  const { business, isDemo, customRequest } = result.data;
  const url = `${BASE_URL}/sites/${slug}/maatwerk`;
  return {
    title: `Maatwerk — ${business.name}`,
    description:
      customRequest.intro ??
      `Vraag een maatwerk-print aan bij ${business.name}.`,
    alternates: { canonical: url },
    openGraph: { url, locale: "nl_NL", type: "website" },
    robots: isDemo
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export async function generateStaticParams() {
  const slugs: { slug: string }[] = [];
  for (const slug of listSlugs()) {
    const result = await loadSiteData(slug);
    if (result?.data.customRequest) slugs.push({ slug });
  }
  return slugs;
}

export default async function MaatwerkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await loadSiteData(slug);
  if (!result?.data.customRequest) notFound();
  const { data } = result;

  return (
    <SubPageShell
      data={data}
      heroImage={data.subpageHeroes?.maatwerk}
      heroEyebrow="Maatwerk"
      heroTitle={data.customRequest!.headline ?? "Stuur ons je idee"}
      heroSubtitle={data.customRequest!.intro}
    >
      <CustomRequestForm
        slug={slug}
        headline="Vul het formulier in"
        intro="Hoe specifieker, hoe sneller we kunnen schatten."
      />
    </SubPageShell>
  );
}
