import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateStubFrames } from "@/lib/sites/stubFrames";
import type { NextLevelSiteData } from "@/lib/sites/types";
import { SiteExperience } from "./SiteExperience";

// Phase 1: één hardgecodeerde demo-case zodat we de architectuur kunnen valideren.
// Phase 2+: vervangen door Supabase-lookup op slug.
const DEMO_SITES: Record<string, Omit<NextLevelSiteData, "frames">> = {
  "trattoria-sole": {
    slug: "trattoria-sole",
    business: {
      name: "Trattoria Sole",
      tagline:
        "Een Italiaanse keuken die niet probeert te imponeren. Alleen te smaken.",
      vertical: "Italiaans restaurant",
      city: "Utrecht",
      address: "Voorstraat 84, Utrecht",
      phone: "030 234 56 78",
      reservationUrl: "https://example.com/reserveren",
    },
    scenes: [
      { id: "intro", kind: "intro", frameRange: { from: 0, to: 14 }, content: {} },
      {
        id: "arrival",
        kind: "arrival",
        frameRange: { from: 15, to: 29 },
        content: {
          headline:
            "Een trattoria die je voelt zodra je binnenkomt. Houtvuur, stemmen, glaswerk.",
        },
      },
      { id: "menu", kind: "menu", frameRange: { from: 30, to: 44 }, content: {} },
      { id: "ambiance", kind: "ambiance", frameRange: { from: 45, to: 54 }, content: {} },
      { id: "contact", kind: "contact", frameRange: { from: 55, to: 59 }, content: {} },
    ],
    items: [
      {
        name: "Tagliatelle al ragù",
        description: "12 uur gestoofde rundwang, rode wijn, rozemarijn.",
        price: "€19",
      },
      {
        name: "Risotto ai funghi",
        description: "Wilde paddenstoelen, parmigiano, truffel.",
        price: "€21",
      },
      {
        name: "Pollo alla cacciatora",
        description: "Maïskip, tomaat, olijven, kappertjes.",
        price: "€24",
      },
      {
        name: "Branzino al sale",
        description: "Hele zeebaars in zoutkorst, citroen, peterselie.",
        price: "€29",
      },
      {
        name: "Tiramisù della casa",
        description: "Eigen recept, mascarpone, espresso, marsala.",
        price: "€8",
      },
      {
        name: "Affogato",
        description: "Vanille-ijs verdronken in dampende espresso.",
        price: "€7",
      },
    ],
    photos: [
      // Placeholder Unsplash food/restaurant fotos — vervangen met scraped IG in Phase 2
      { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800", alt: "Restaurant interieur" },
      { url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800", alt: "Pasta gerecht" },
      { url: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800", alt: "Wijnglas" },
      { url: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800", alt: "Italiaans gerecht" },
      { url: "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=800", alt: "Restaurant sfeer" },
      { url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800", alt: "Bord met eten" },
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = DEMO_SITES[slug];
  if (!data) return { title: "Site niet gevonden" };
  return {
    title: `${data.business.name} — ${data.business.city}`,
    description: data.business.tagline,
    openGraph: {
      title: data.business.name,
      description: data.business.tagline,
      type: "website",
      locale: "nl_NL",
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(DEMO_SITES).map((slug) => ({ slug }));
}

export default async function NextLevelSitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const base = DEMO_SITES[slug];
  if (!base) notFound();

  const frames = generateStubFrames();
  const data: NextLevelSiteData = { ...base, frames };

  return <SiteExperience data={data} />;
}
