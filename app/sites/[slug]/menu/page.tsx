import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubPageShell } from "@/components/sites/SubPageShell";
import { loadSiteData, listSlugs } from "@/lib/sites/data";
import { menuSchema, breadcrumbSchema, renderSchemaJson } from "@/lib/sites/schema";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://contentfactory.nextlevelsites.nl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadSiteData(slug);
  if (!result) return { title: "Niet gevonden" };
  const { business, isDemo } = result.data;
  const url = `${BASE_URL}/sites/${slug}/menu`;
  return {
    title: `Kaart van ${business.name} — ${business.vertical} in ${business.city}`,
    description: `De volledige kaart van ${business.name} in ${business.city}.`,
    alternates: { canonical: url },
    openGraph: { url, locale: "nl_NL", type: "website" },
    robots: isDemo
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export async function generateStaticParams() {
  return listSlugs().map((slug) => ({ slug }));
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await loadSiteData(slug);
  if (!result) notFound();
  const { data } = result;
  const categories = data.menuCategories ?? [];

  const url = `${BASE_URL}/sites/${slug}/menu`;
  const homeUrl = `${BASE_URL}/sites/${slug}`;
  const schemaJson = renderSchemaJson(
    menuSchema(data, homeUrl),
    breadcrumbSchema([
      { name: data.business.name, url: homeUrl },
      { name: "Kaart", url },
    ])
  );

  return (
    <SubPageShell
      data={data}
      heroImage="/sites/italian-restaurant/post-1-food.jpg"
      heroEyebrow="De kaart"
      heroTitle={`Kaart van ${data.business.name}`}
      heroSubtitle="Wij koken met seizoensingrediënten, dus de kaart verschuift mee. Dit is een momentopname — bel of stap binnen voor de specials van vanavond."
    >
      {schemaJson ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: schemaJson }}
        />
      ) : null}
      <div className="mx-auto max-w-4xl px-6 py-20 sm:py-28">
        {categories.length === 0 ? (
          <p className="text-center text-white/60">
            Kaart wordt binnenkort hier gepubliceerd.
          </p>
        ) : (
          <div className="space-y-20 sm:space-y-28">
            {categories.map((cat) => (
              <section key={cat.name}>
                <div className="border-b border-white/10 pb-6">
                  <h2 className="font-serif text-3xl font-light tracking-tight md:text-4xl">
                    {cat.name}
                  </h2>
                  {cat.description ? (
                    <p className="mt-3 text-sm text-white/55">{cat.description}</p>
                  ) : null}
                </div>
                <ul className="mt-8 divide-y divide-white/10">
                  {cat.items.map((item) => (
                    <li
                      key={item.name}
                      className="flex flex-col gap-2 py-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-baseline gap-3">
                          <h3 className="font-serif text-lg font-medium">
                            {item.name}
                          </h3>
                          {item.tags?.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/15 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-white/55"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        {item.description ? (
                          <p className="mt-1.5 text-sm leading-relaxed text-white/55">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                      {item.price ? (
                        <p className="font-mono text-sm text-white/70 sm:text-base">
                          {item.price}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        {data.hours?.note ? (
          <p className="mt-24 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-white/60">
            {data.hours.note}
          </p>
        ) : null}
      </div>
    </SubPageShell>
  );
}
