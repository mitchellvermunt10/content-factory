import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Phone, MessageCircle } from "lucide-react";
import { SubPageShell } from "@/components/sites/SubPageShell";
import { loadSiteData, listSlugs } from "@/lib/sites/data";
import { breadcrumbSchema, renderSchemaJson } from "@/lib/sites/schema";

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
  const url = `${BASE_URL}/sites/${slug}/reserveren`;
  return {
    title: `Reserveren bij ${business.name} — ${business.vertical} ${business.city}`,
    description: `Reserveer een tafel bij ${business.name} in ${business.city}. Online, telefoon of WhatsApp.`,
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

const DAY_ORDER: { key: keyof NonNullable<typeof DEFAULT_HOURS>; label: string }[] = [
  { key: "monday", label: "Maandag" },
  { key: "tuesday", label: "Dinsdag" },
  { key: "wednesday", label: "Woensdag" },
  { key: "thursday", label: "Donderdag" },
  { key: "friday", label: "Vrijdag" },
  { key: "saturday", label: "Zaterdag" },
  { key: "sunday", label: "Zondag" },
];

// Dummy type-shape voor de keys hierboven (gedeeld met data.hours)
const DEFAULT_HOURS = {
  monday: "",
  tuesday: "",
  wednesday: "",
  thursday: "",
  friday: "",
  saturday: "",
  sunday: "",
};

export default async function ReserverenPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await loadSiteData(slug);
  if (!result) notFound();
  const { data } = result;

  const homeUrl = `${BASE_URL}/sites/${slug}`;
  const url = `${BASE_URL}/sites/${slug}/reserveren`;
  const schemaJson = renderSchemaJson(
    breadcrumbSchema([
      { name: data.business.name, url: homeUrl },
      { name: "Reserveren", url },
    ])
  );

  const waDigits = data.business.whatsapp?.replace(/[^\d]/g, "") ?? null;
  const waUrl = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(
        data.business.whatsappMessage ??
          `Hoi! Ik wil graag een tafel reserveren bij ${data.business.name}.`
      )}`
    : null;

  return (
    <SubPageShell
      data={data}
      heroImage="/sites/italian-restaurant/post-2-ambiance.jpg"
      heroEyebrow="Reserveren"
      heroTitle="Kom langs"
      heroSubtitle="Liever direct gebeld of geappt? Drie tappen of belletje en je tafel staat klaar."
    >
      {schemaJson ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: schemaJson }}
        />
      ) : null}
      <div className="mx-auto max-w-4xl px-6 py-20 sm:py-28">
        {/* Drie primaire kanalen */}
        <div className="grid gap-4 sm:grid-cols-3">
          {data.business.reservationUrl ? (
            <Link
              href={data.business.reservationUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col justify-between rounded-3xl bg-white p-6 text-black transition-transform hover:-translate-y-1"
            >
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-black/55">
                Online
              </span>
              <span className="mt-12 font-serif text-2xl">Boek direct</span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm">
                Beschikbaarheid checken
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ) : null}

          {data.business.phone ? (
            <a
              href={`tel:${data.business.phone.replace(/\s/g, "")}`}
              className="group flex flex-col justify-between rounded-3xl border border-white/15 p-6 transition-colors hover:bg-white/5"
            >
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/55">
                Bellen
              </span>
              <span className="mt-12 font-serif text-2xl">
                {data.business.phone}
              </span>
              <span className="mt-4 inline-flex items-center gap-2 text-sm text-white/70">
                <Phone className="size-4" />
                Snelste reactie
              </span>
            </a>
          ) : null}

          {waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col justify-between rounded-3xl border border-white/15 p-6 transition-colors hover:bg-white/5"
            >
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/55">
                WhatsApp
              </span>
              <span className="mt-12 font-serif text-2xl">Stuur een berichtje</span>
              <span className="mt-4 inline-flex items-center gap-2 text-sm text-white/70">
                <MessageCircle className="size-4" />
                Antwoord binnen het uur
              </span>
            </a>
          ) : null}
        </div>

        {/* Openingstijden */}
        {data.hours ? (
          <section className="mt-24">
            <h2 className="font-serif text-3xl font-light md:text-4xl">
              Openingstijden
            </h2>
            <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
              {DAY_ORDER.map((d) => {
                const value = data.hours?.[d.key];
                if (!value) return null;
                const closed = value.toLowerCase().includes("gesloten");
                return (
                  <div
                    key={d.key}
                    className="flex items-center justify-between border-b border-white/5 px-6 py-4 last:border-b-0"
                  >
                    <span className="font-serif text-base">{d.label}</span>
                    <span
                      className={`font-mono text-sm ${
                        closed ? "text-white/40" : "text-white/85"
                      }`}
                    >
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
            {data.hours.note ? (
              <p className="mt-4 text-sm text-white/55">{data.hours.note}</p>
            ) : null}
          </section>
        ) : null}
      </div>
    </SubPageShell>
  );
}
