import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Phone, Mail, Car } from "lucide-react";
import { SubPageShell } from "@/components/sites/SubPageShell";
import { loadSiteData, listSlugs } from "@/lib/sites/data";
import {
  businessSchema,
  breadcrumbSchema,
  renderSchemaJson,
} from "@/lib/sites/schema";

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
  const url = `${BASE_URL}/sites/${slug}/contact`;
  return {
    title: `Contact — ${business.name} in ${business.city}`,
    description: `Adres, telefoonnummer, openingstijden en route naar ${business.name} in ${business.city}.`,
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

const DAY_ORDER: {
  key: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  label: string;
}[] = [
  { key: "monday", label: "Maandag" },
  { key: "tuesday", label: "Dinsdag" },
  { key: "wednesday", label: "Woensdag" },
  { key: "thursday", label: "Donderdag" },
  { key: "friday", label: "Vrijdag" },
  { key: "saturday", label: "Zaterdag" },
  { key: "sunday", label: "Zondag" },
];

export default async function ContactPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await loadSiteData(slug);
  if (!result) notFound();
  const { data } = result;

  const mapsUrl = data.business.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.business.address.formatted)}`
    : null;
  const mapEmbedUrl = data.business.address
    ? `https://www.google.com/maps?q=${encodeURIComponent(data.business.address.formatted)}&output=embed`
    : null;

  const homeUrl = `${BASE_URL}/sites/${slug}`;
  const url = `${BASE_URL}/sites/${slug}/contact`;
  const schemaJson = renderSchemaJson(
    businessSchema(data, homeUrl),
    breadcrumbSchema([
      { name: data.business.name, url: homeUrl },
      { name: "Contact", url },
    ])
  );

  return (
    <SubPageShell
      data={data}
      heroImage="/sites/italian-restaurant/post-2-ambiance.jpg"
      heroEyebrow="Contact"
      heroTitle="Vind ons, bel ons"
      heroSubtitle={`${data.business.name} in ${data.business.city}.`}
    >
      {schemaJson ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: schemaJson }}
        />
      ) : null}
      <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          {/* Kolom 1 — gegevens */}
          <div>
            {data.business.address ? (
              <div className="flex items-start gap-4">
                <MapPin className="mt-1 size-5 shrink-0 text-white/60" />
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">
                    Adres
                  </p>
                  <address className="mt-2 font-serif text-xl not-italic leading-snug">
                    {data.business.address.street}
                    <br />
                    {data.business.address.postalCode} {data.business.address.city}
                  </address>
                  {mapsUrl ? (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-sm text-white/70 underline-offset-4 hover:underline"
                    >
                      Open in Google Maps →
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}

            {data.business.phone ? (
              <div className="mt-10 flex items-start gap-4">
                <Phone className="mt-1 size-5 shrink-0 text-white/60" />
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">
                    Telefoon
                  </p>
                  <a
                    href={`tel:${data.business.phone.replace(/\s/g, "")}`}
                    className="mt-2 block font-serif text-xl"
                  >
                    {data.business.phone}
                  </a>
                </div>
              </div>
            ) : null}

            {data.email ? (
              <div className="mt-10 flex items-start gap-4">
                <Mail className="mt-1 size-5 shrink-0 text-white/60" />
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">
                    Email
                  </p>
                  <a
                    href={`mailto:${data.email}`}
                    className="mt-2 block font-serif text-xl"
                  >
                    {data.email}
                  </a>
                </div>
              </div>
            ) : null}

            {data.parkingInfo ? (
              <div className="mt-10 flex items-start gap-4">
                <Car className="mt-1 size-5 shrink-0 text-white/60" />
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">
                    Parkeren
                  </p>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/70">
                    {data.parkingInfo}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Kolom 2 — openingstijden */}
          {data.hours ? (
            <div>
              <h2 className="font-serif text-2xl font-light md:text-3xl">
                Openingstijden
              </h2>
              <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                {DAY_ORDER.map((d) => {
                  const value = data.hours?.[d.key];
                  if (!value) return null;
                  const closed = value.toLowerCase().includes("gesloten");
                  return (
                    <div
                      key={d.key}
                      className="flex items-center justify-between border-b border-white/5 px-5 py-3.5 last:border-b-0"
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
            </div>
          ) : null}
        </div>

        {/* Map */}
        {mapEmbedUrl ? (
          <div className="mt-20 overflow-hidden rounded-3xl border border-white/10">
            <iframe
              src={mapEmbedUrl}
              className="aspect-[16/9] w-full grayscale"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Kaart van ${data.business.name}`}
            />
          </div>
        ) : null}
      </div>
    </SubPageShell>
  );
}
