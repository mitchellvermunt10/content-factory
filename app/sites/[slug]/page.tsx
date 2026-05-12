import type { Metadata } from "next";
import { promises as fs } from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import { generateStubFrames } from "@/lib/sites/stubFrames";
import { readManifestSafe } from "@/lib/sites/frameExtract";
import type { NextLevelSiteData } from "@/lib/sites/types";
import { SiteExperience, type SiteRenderMode } from "./SiteExperience";

type DemoSpec = Omit<NextLevelSiteData, "frames"> & {
  /** Folder in /public/sites/ waar de Flux-gegenereerde hero-frames staan.
   *  Als de bestanden ontbreken, valt de page terug op stub-frames. */
  frameFolder?: string;
};

// Phase 2: hardgecodeerde demo-case, maar nu met optionele real-frames folder.
// Phase 3+: vervangen door Supabase-lookup op slug.
const DEMO_SITES: Record<string, DemoSpec> = {
  "trattoria-sole": {
    slug: "trattoria-sole",
    frameFolder: "italian-restaurant",
    business: {
      name: "Trattoria Sole",
      tagline:
        "Een Italiaanse keuken die niet probeert te imponeren. Alleen te smaken.",
      vertical: "Italiaans restaurant",
      city: "Utrecht",
      address: "Voorstraat 84, Utrecht",
      phone: "030 234 56 78",
      reservationUrl: "https://example.com/reserveren",
      whatsapp: "+31612345678",
      whatsappMessage:
        "Hoi! Ik wil graag een tafel reserveren bij Trattoria Sole.",
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

async function tryLoadHeroFrames(folder: string): Promise<string[] | null> {
  const dir = path.join(process.cwd(), "public", "sites", folder);
  const required = ["exterior.jpg", "doorway.jpg", "interior.jpg"];
  try {
    for (const f of required) {
      await fs.access(path.join(dir, f));
    }
    return required.map((f) => `/sites/${folder}/${f}`);
  } catch {
    return null;
  }
}

/**
 * Probeer Kling-gegenereerde video-frames te laden via manifest.json.
 * Geeft de geordende lijst frame-URLs terug, of null als nog niet beschikbaar.
 */
async function tryLoadVideoFrames(
  folder: string,
  scene: string
): Promise<string[] | null> {
  const manifestPath = path.join(
    process.cwd(),
    "public",
    "sites",
    folder,
    scene,
    "manifest.json"
  );
  const manifest = await readManifestSafe(manifestPath);
  if (!manifest || manifest.frameCount < 5) return null;
  const frames: string[] = [];
  for (let i = 1; i <= manifest.frameCount; i++) {
    const padded = String(i).padStart(4, "0");
    frames.push(`${manifest.publicPrefix}/frame_${padded}.jpg`);
  }
  return frames;
}

export default async function NextLevelSitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { frameFolder, ...base } = DEMO_SITES[slug] ?? {};
  if (!base.slug) notFound();

  // Priority: Kling video-frames → Flux hero-frames → SVG stubs
  let frames: string[] = generateStubFrames();
  let mode: SiteRenderMode = "stub";

  if (frameFolder) {
    const videoFrames = await tryLoadVideoFrames(frameFolder, "intro");
    if (videoFrames && videoFrames.length >= 5) {
      frames = videoFrames;
      mode = "video";
    } else {
      const heroFrames = await tryLoadHeroFrames(frameFolder);
      if (heroFrames && heroFrames.length === 3) {
        frames = heroFrames;
        mode = "cinematic";
      }
    }
  }

  const data: NextLevelSiteData = {
    ...(base as Omit<NextLevelSiteData, "frames">),
    frames,
  };

  return <SiteExperience data={data} mode={mode} />;
}
