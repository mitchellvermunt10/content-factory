import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubPageShell } from "@/components/sites/SubPageShell";
import { ProcessSteps } from "@/components/sites/ProcessSteps";
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
  if (!result?.data.process) return { title: "Niet gevonden" };
  const { business, isDemo, process } = result.data;
  const url = `${BASE_URL}/sites/${slug}/proces`;
  return {
    title: `${process.headline ?? "Werkwijze"} — ${business.name}`,
    description:
      process.intro ?? `Zo werkt een opdracht bij ${business.name}.`,
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
    if (result?.data.process) slugs.push({ slug });
  }
  return slugs;
}

export default async function ProcesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await loadSiteData(slug);
  if (!result?.data.process) notFound();
  const { data } = result;

  return (
    <SubPageShell
      data={data}
      heroImage={data.subpageHeroes?.proces}
      heroEyebrow="Werkwijze"
      heroTitle={data.process?.headline ?? "Zo werken we"}
      heroSubtitle={data.process?.intro}
    >
      <ProcessSteps process={data.process!} />
    </SubPageShell>
  );
}
