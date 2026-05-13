import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubPageShell } from "@/components/sites/SubPageShell";
import { FaqAccordion } from "@/components/sites/FaqAccordion";
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
  if (!result?.data.faq?.length) return { title: "Niet gevonden" };
  const { business, isDemo } = result.data;
  const url = `${BASE_URL}/sites/${slug}/faq`;
  return {
    title: `Veelgestelde vragen — ${business.name}`,
    description: `Antwoord op de meestgestelde vragen aan ${business.name}.`,
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
    if (result?.data.faq?.length) slugs.push({ slug });
  }
  return slugs;
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await loadSiteData(slug);
  if (!result?.data.faq?.length) notFound();
  const { data } = result;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faq!.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <SubPageShell
      data={data}
      heroImage={data.subpageHeroes?.faq}
      heroEyebrow="FAQ"
      heroTitle="Veelgestelde vragen"
      heroSubtitle={`Vraag staat er niet tussen? App ons via WhatsApp.`}
    >
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FaqAccordion faq={data.faq!} />
    </SubPageShell>
  );
}
