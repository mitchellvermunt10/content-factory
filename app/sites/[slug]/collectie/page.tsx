import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubPageShell } from "@/components/sites/SubPageShell";
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
  if (!result?.data.shop?.products?.length) return { title: "Niet gevonden" };
  const { business, isDemo } = result.data;
  const url = `${BASE_URL}/sites/${slug}/collectie`;
  return {
    title: `Collectie — ${business.name}`,
    description: `De volledige collectie van ${business.name}. Alle prints op bestelling, in de kleur die jij kiest.`,
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
    if (result?.data.shop?.products?.length) slugs.push({ slug });
  }
  return slugs;
}

export default async function CollectiePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await loadSiteData(slug);
  if (!result?.data.shop?.products?.length) notFound();
  const { data } = result;

  return (
    <SubPageShell
      data={data}
      heroImage={data.subpageHeroes?.collectie}
      heroEyebrow="Collectie"
      heroTitle="Wat we voor je maken"
      heroSubtitle={data.shop?.deliveryNote}
    >
      {/* Standalone collectie — niet binnen Scene-wrapper, dus dropped scroll-driven animaties */}
      <div className="bg-black px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.shop!.products!.map((p) => (
              <a
                key={p.id}
                href={`/sites/${slug}/product/${p.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-white/30"
              >
                <div className="relative aspect-square overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-serif text-lg leading-snug">{p.title}</h3>
                  {p.description ? (
                    <p className="mt-2 line-clamp-2 text-sm text-white/55">
                      {p.description}
                    </p>
                  ) : null}
                  <div className="mt-4 flex items-baseline justify-between border-t border-white/10 pt-4">
                    <span className="font-serif text-2xl text-white">
                      €{p.priceEur.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-black">
                      Bestel
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Maatwerk-uitnodiging onderaan */}
          <div className="mx-auto mt-20 max-w-2xl rounded-3xl border border-white/15 bg-white/5 p-10 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/55">
              Niet wat je zoekt?
            </p>
            <h3 className="mt-4 font-serif text-3xl font-light">
              Vraag maatwerk aan
            </h3>
            <p className="mt-4 text-base text-white/65">
              Stuur ons je idee, een MakerWorld-link, of je eigen STL-bestand.
              Binnen een werkdag krijg je een prijsopgave.
            </p>
            <a
              href={`/sites/${slug}/maatwerk`}
              className="mt-8 inline-flex items-center rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black"
            >
              Maatwerk aanvragen →
            </a>
          </div>
        </div>
      </div>

    </SubPageShell>
  );
}
