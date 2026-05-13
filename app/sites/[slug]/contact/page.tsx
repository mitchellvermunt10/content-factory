import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Phone, Mail, Car, MessageCircle, Clock } from "lucide-react";
import { SubPageShell } from "@/components/sites/SubPageShell";
import { loadSiteData, listSlugs } from "@/lib/sites/data";
import {
  businessSchema,
  breadcrumbSchema,
  renderSchemaJson,
} from "@/lib/sites/schema";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://nextlevelsites.nl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadSiteData(slug);
  if (!result) return { title: "Niet gevonden" };
  const { business, isDemo, shop } = result.data;
  const url = `${BASE_URL}/sites/${slug}/contact`;
  const isOnlineShop = Boolean(shop);
  return {
    title: `Contact — ${business.name}${isOnlineShop ? "" : ` in ${business.city}`}`,
    description: isOnlineShop
      ? `Bereik ${business.name} via WhatsApp of e-mail. Reactie binnen een werkdag.`
      : `Adres, telefoonnummer, openingstijden en route naar ${business.name} in ${business.city}.`,
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
  const isOnlineShop = Boolean(data.shop);

  const mapsUrl = data.business.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.business.address.formatted)}`
    : null;
  const mapEmbedUrl = data.business.address
    ? `https://www.google.com/maps?q=${encodeURIComponent(data.business.address.formatted)}&output=embed`
    : null;

  const whatsappHref = data.business.whatsapp
    ? `https://wa.me/${data.business.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        data.business.whatsappMessage ?? "Hoi! Ik heb een vraag.",
      )}`
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

  const fallbackHero = isOnlineShop
    ? "/sites/jj-3d/intro/frames/frame_0150.jpg"
    : "/sites/italian-restaurant/post-2-ambiance.jpg";

  return (
    <SubPageShell
      data={data}
      heroImage={data.subpageHeroes?.contact ?? fallbackHero}
      heroEyebrow="Contact"
      heroTitle={isOnlineShop ? "Bereik ons" : "Vind ons, bel ons"}
      heroSubtitle={
        isOnlineShop
          ? `Stuur ons een bericht — we reageren binnen een werkdag.`
          : `${data.business.name} in ${data.business.city}.`
      }
    >
      {schemaJson ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: schemaJson }}
        />
      ) : null}

      {isOnlineShop ? (
        // ─── Shop-variant: WhatsApp + email + responstijd, geen kaart ───
        <div className="mx-auto max-w-2xl px-6 py-20 text-center sm:py-28">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/55">
            Snelste route
          </p>
          <h2 className="mt-4 font-serif text-4xl font-light leading-tight md:text-5xl">
            Stuur ons een bericht
          </h2>

          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-12 inline-flex items-center gap-3 rounded-full bg-[#25d366] px-8 py-5 text-base font-medium text-black transition-transform hover:scale-[1.02]"
            >
              <MessageCircle className="size-5" />
              App ons op WhatsApp
            </a>
          ) : null}

          <div className="mt-16 space-y-10 text-left">
            {data.email ? (
              <div className="flex items-start gap-4">
                <Mail className="mt-1 size-5 shrink-0 text-white/55" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/55">
                    E-mail
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

            <div className="flex items-start gap-4">
              <Clock className="mt-1 size-5 shrink-0 text-white/55" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/55">
                  Responstijd
                </p>
                <p className="mt-2 font-serif text-xl">
                  Binnen een werkdag
                </p>
                <p className="mt-1 text-sm text-white/55">
                  Antwoord vaak sneller — vooral via WhatsApp.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-20 rounded-3xl border border-white/15 bg-white/5 p-10">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/55">
              Iets specifieks?
            </p>
            <h3 className="mt-4 font-serif text-2xl font-light">
              Vraag maatwerk aan
            </h3>
            <a
              href={`/sites/${slug}/maatwerk`}
              className="mt-6 inline-flex items-center text-sm text-white/85 underline-offset-4 hover:underline"
            >
              Open het formulier →
            </a>
          </div>
        </div>
      ) : (
      // ─── Restaurant-variant: adres + uren + kaart ───
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
      )}
    </SubPageShell>
  );
}
