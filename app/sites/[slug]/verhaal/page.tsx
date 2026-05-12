import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubPageShell } from "@/components/sites/SubPageShell";
import { loadSiteData, listSlugs } from "@/lib/sites/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadSiteData(slug);
  if (!result) return { title: "Niet gevonden" };
  return {
    title: `Verhaal — ${result.data.business.name}`,
    description: `Het verhaal achter ${result.data.business.name}.`,
  };
}

export async function generateStaticParams() {
  return listSlugs().map((slug) => ({ slug }));
}

export default async function VerhaalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await loadSiteData(slug);
  if (!result) notFound();
  const { data } = result;
  const story = data.story;

  return (
    <SubPageShell
      data={data}
      heroImage="/sites/italian-restaurant/interior.jpg"
      heroEyebrow="Verhaal"
      heroTitle={story?.headline ?? data.business.name}
      heroSubtitle={story?.intro}
    >
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        {story?.sections.map((section, i) => (
          <section
            key={i}
            className={`relative ${i > 0 ? "mt-20 sm:mt-28" : ""}`}
          >
            {section.headline ? (
              <h2 className="font-serif text-3xl font-light tracking-tight md:text-4xl">
                {section.headline}
              </h2>
            ) : null}
            <div className="mt-6 text-pretty text-lg leading-relaxed text-white/75 md:text-xl">
              {section.body}
            </div>
            {section.image ? (
              <div className="mt-10 overflow-hidden rounded-3xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={section.image}
                  alt=""
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            ) : null}
          </section>
        ))}

        {story?.chef ? (
          <section className="mt-28 rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-12">
            <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
              {story.chef.photo ? (
                <div className="size-32 shrink-0 overflow-hidden rounded-full sm:size-40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={story.chef.photo}
                    alt={story.chef.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <div className="flex-1 text-center sm:text-left">
                {story.chef.quote ? (
                  <p className="font-serif text-2xl font-light leading-snug md:text-3xl">
                    {`"${story.chef.quote}"`}
                  </p>
                ) : null}
                <p className="mt-6 font-serif text-lg">{story.chef.name}</p>
                {story.chef.role ? (
                  <p className="mt-1 font-mono text-xs uppercase tracking-[0.3em] text-white/50">
                    {story.chef.role}
                  </p>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </SubPageShell>
  );
}
