"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Film,
  Globe,
  Image as ImageIcon,
  Megaphone,
  Mic,
  Search,
  Smartphone,
  Sparkles,
  Music,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCampaigns } from "@/lib/store/campaigns";
import { LandingPagePreview } from "@/components/artifacts/LandingPagePreview";
import { ApprovalBar } from "@/components/client/ApprovalBar";
import { GradientMesh } from "@/components/motion/GradientMesh";
import { Logo } from "@/components/chrome/Logo";
import { Timecode } from "@/components/cinematic/Timecode";
import { PhoneFrame } from "@/components/cinematic/PhoneFrame";
import { AspectFrame } from "@/components/cinematic/AspectFrame";
import { CameraIcon } from "@/components/cinematic/CameraIcon";
import { BUSINESS_TYPES } from "@/lib/constants";
import type { CameraMovement } from "@/lib/constants";

const SECTIONS = [
  { id: "concept", label: "Concept", icon: Sparkles },
  { id: "landing", label: "Landing page", icon: Globe },
  { id: "seo", label: "SEO", icon: Search },
  { id: "ads", label: "Meta ads", icon: Megaphone },
  { id: "instagram", label: "Instagram", icon: ImageIcon },
  { id: "cinematic", label: "Cinematic", icon: Film },
  { id: "shorts", label: "Reels", icon: Smartphone },
  { id: "voiceover", label: "Voice-over", icon: Mic },
];

const ease = [0.16, 1, 0.3, 1] as const;

export default function ClientCampaignPage() {
  const params = useParams<{ id: string }>();
  const campaign = useCampaigns((s) => s.getById(params.id));
  const hydrated = useCampaigns((s) => s.hydrated);
  const fetching = useCampaigns((s) => Boolean(s.fetchingIds[params.id]));
  const fetchFromServer = useCampaigns((s) => s.fetchFromServer);
  const [activeSection, setActiveSection] = useState<string>("concept");
  const [serverChecked, setServerChecked] = useState(false);

  useEffect(() => {
    const handler = () => {
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120) current = s.id;
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (campaign) return;
    if (serverChecked) return;
    fetchFromServer(params.id).finally(() => setServerChecked(true));
  }, [hydrated, campaign, params.id, fetchFromServer, serverChecked]);

  if (!hydrated || (!campaign && !serverChecked) || fetching) {
    return (
      <div className="grid min-h-screen place-items-center text-text-muted">
        Laden…
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="grid min-h-screen place-items-center text-center">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">
            Campagne niet gevonden
          </h1>
          <p className="mt-2 text-text-muted">
            Deze campagne staat niet in deze browser.
          </p>
          <Button asChild variant="primary" className="mt-6">
            <Link href="/studio">Naar studio</Link>
          </Button>
        </div>
      </div>
    );
  }

  const type = BUSINESS_TYPES.find((t) => t.value === campaign.brief.businessType);
  const c = campaign.artifacts.cinematic;
  const seo = campaign.artifacts.seo;
  const ads = campaign.artifacts.metaAds;
  const ig = campaign.artifacts.instagram;
  const shorts = campaign.artifacts.socialShorts;

  // Per-page brand color overrides (uit campaign.brand.accent)
  const brandStyle = {
    "--client-accent": campaign.brand.accent,
  } as React.CSSProperties;

  return (
    <div
      className="relative isolate min-h-screen"
      style={brandStyle}
      data-testid="client-view"
    >
      <GradientMesh intensity="soft" />

      {/* === Top header === */}
      <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between gap-4">
          <Logo href="/" />
          <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
            <Link href={`/studio/campaigns/${campaign.id}`}>Studio (admin)</Link>
          </Button>
        </div>
      </header>

      {/* === Sticky section nav === */}
      <nav className="sticky top-14 z-20 border-b border-border bg-bg/85 backdrop-blur-md">
        <div className="container">
          <ul className="flex gap-1 overflow-x-auto py-2 no-scrollbar">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const active = activeSection === s.id;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] transition-all duration-200 ${
                      active
                        ? "bg-elevated text-text"
                        : "text-text-muted hover:text-text"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {s.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* === Concept hero === */}
      <section
        id="concept"
        data-testid="section-concept"
        className="container relative pb-16 pt-20 md:pb-24 md:pt-32"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="mx-auto max-w-3xl"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">{type?.label}</Badge>
            <Badge variant="outline">{campaign.brief.city}</Badge>
            <Badge>{campaign.brief.tone}</Badge>
          </div>
          <h1 className="mt-6 font-sans text-4xl font-medium leading-[1.05] tracking-tightest text-text md:text-6xl">
            <span className="text-gradient">{campaign.brief.name}</span>
          </h1>
          <p className="balance mt-6 max-w-2xl text-lg leading-relaxed text-text-muted md:text-xl">
            {c.concept.logline}
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Stat label="Brand pillar" value={c.concept.brandPillar} />
            <Stat label="Mood" value={c.concept.mood} />
            <Stat label="Master cut" value={`${c.concept.totalDurationSec}s · ${c.concept.primaryAspectRatio}`} />
          </div>
          <div className="mt-10">
            <ApprovalBar
              campaignId={campaign.id}
              campaignName={campaign.brief.name}
            />
          </div>
        </motion.div>
      </section>

      {/* === Landing === */}
      <Section id="landing" title="Landing page" subtitle="Volledige conceptpagina">
        <LandingPagePreview data={campaign.artifacts.landing} brand={campaign.brand} />
      </Section>

      {/* === SEO === */}
      <Section
        id="seo"
        title="SEO"
        subtitle="Vindbaarheid in Google + meta + Open Graph"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Google preview">
            <p className="mt-3 text-lg text-[#8ab4f8]">{seo.metaTitle}</p>
            <p className="mt-1 text-sm text-success">
              {seo.metaDescription.slice(0, 160)}
            </p>
            <p className="mt-3 font-mono text-[10px] text-text-subtle">
              {seo.metaTitle.length} / 70 · {seo.metaDescription.length} / 180
            </p>
          </Card>
          <Card title="Hoofd-keyword">
            <Badge variant="accent" className="text-sm">
              {seo.primaryKeyword}
            </Badge>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-text-subtle">
              Secundair
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {seo.secondaryKeywords.map((k, i) => (
                <Badge key={i}>{k}</Badge>
              ))}
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-text-subtle">
              Long-tail
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {seo.longTailKeywords.map((k, i) => (
                <Badge key={i} variant="outline">
                  {k}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
        <Card title="Pagina-structuur">
          <p className="mt-3 text-lg font-medium tracking-tight">{seo.headings.h1}</p>
          <ul className="mt-3 space-y-1 text-sm text-text-muted">
            {seo.headings.h2s.map((h, i) => (
              <li key={i}>· {h}</li>
            ))}
          </ul>
        </Card>
        <Card title="FAQ — schema-ready">
          <div className="mt-2 divide-y divide-border">
            {seo.faqSchema.map((q, i) => (
              <details key={i} className="py-3 first:pt-0 last:pb-0">
                <summary className="cursor-pointer text-sm font-medium tracking-tight text-text">
                  {q.question}
                </summary>
                <p className="mt-2 text-sm text-text-muted">{q.answer}</p>
              </details>
            ))}
          </div>
        </Card>
      </Section>

      {/* === Meta ads === */}
      <Section
        id="ads"
        title="Meta ads"
        subtitle={`${ads.variants.length} feed-varianten · ${ads.storyAds.length} story-varianten`}
      >
        <p className="mb-6 text-sm text-text-muted">
          {ads.audienceTargeting.description}
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {ads.variants.map((v, i) => (
            <Card key={i} title={`Variant ${String(i + 1).padStart(2, "0")}`}>
              <p className="mt-3 text-sm font-medium leading-relaxed text-text">
                {v.hook}
              </p>
              <p className="mt-2 text-sm text-text-muted">{v.primaryText}</p>
              <div className="mt-4 grid grid-cols-[1fr_auto] gap-2 rounded-lg border border-border bg-bg/40 p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text">{v.headline}</p>
                  <p className="text-xs text-text-muted">{v.description}</p>
                </div>
                <span className="self-center rounded-full border border-border bg-elevated px-3 py-1 text-xs">
                  {v.cta}
                </span>
              </div>
              <p className="mt-3 text-xs italic text-text-subtle">
                Beeld: {v.visualDirection}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      {/* === Instagram === */}
      <Section
        id="instagram"
        title="Instagram"
        subtitle={`${ig.posts.length} posts · weekplan · ${ig.reelIdeas.length} reel-ideeën`}
      >
        <Card title="Bio">
          <p className="mt-3 text-sm font-medium text-text">{ig.bio.headline}</p>
          <p className="mt-1 text-sm text-text-muted">{ig.bio.body}</p>
          <Badge variant="accent" className="mt-3">
            {ig.bio.cta}
          </Badge>
        </Card>
        <Card title="Feed grid">
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {ig.posts.map((p, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-md border border-border bg-gradient-to-br from-surface to-elevated"
              >
                <span className="absolute right-2 top-2 rounded-full bg-bg/60 px-1.5 py-0.5 font-mono text-[9px] uppercase text-text-muted backdrop-blur-sm">
                  {p.type}
                </span>
                <div className="flex h-full items-end p-3">
                  <p className="line-clamp-3 text-[10px] leading-tight text-text-muted">
                    {p.hook}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Weekplan">
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border">
            {ig.weeklyPlan.map((w, i) => (
              <li
                key={i}
                className="grid grid-cols-[100px_100px_1fr] items-center gap-3 px-4 py-3 text-sm"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                  {w.day}
                </span>
                <Badge variant="outline">{w.type}</Badge>
                <span className="text-text-muted">{w.topic}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Eerste post — voorbeeld">
          <p className="mt-3 text-sm font-medium tracking-tight text-text">
            {ig.posts[0].hook}
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text-muted">
            {ig.posts[0].caption}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {ig.posts[0].hashtags.map((h, i) => (
              <span key={i} className="text-xs text-accent">
                {h.startsWith("#") ? h : `#${h}`}
              </span>
            ))}
          </div>
        </Card>
      </Section>

      {/* === Cinematic === */}
      <Section
        id="cinematic"
        title="Cinematic commercial"
        subtitle={`${c.scenes.length} scenes · ${c.scenes.flatMap((s) => s.shots).length} shots · ${c.concept.totalDurationSec}s`}
      >
        <Card title="Storyboard">
          <ol className="mt-4 space-y-6">
            {(() => {
              let cumul = 0;
              return c.scenes.map((scene) => {
                const start = cumul;
                cumul += scene.durationSec;
                return (
                  <li key={scene.id}>
                    <div className="flex items-center gap-2">
                      <Badge variant="accent">{scene.id}</Badge>
                      <Badge variant="outline">{scene.intent}</Badge>
                      <Timecode start={start} duration={scene.durationSec} />
                    </div>
                    <h4 className="mt-2 text-xl font-medium tracking-tight">
                      {scene.title}
                    </h4>
                    {scene.voiceOver.text ? (
                      <p className="mt-2 text-base leading-relaxed text-text-muted">
                        “{scene.voiceOver.text}”
                      </p>
                    ) : null}
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {scene.shots.map((shot) => (
                        <div
                          key={shot.id}
                          className="overflow-hidden rounded-xl border border-border bg-bg/40"
                        >
                          <AspectFrame
                            ratio={c.concept.primaryAspectRatio}
                            framing={shot.framing}
                            cameraMove={shot.cameraMovement}
                          />
                          <div className="p-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">{shot.framing}</Badge>
                              <Badge variant="outline">
                                <CameraIcon
                                  movement={shot.cameraMovement as CameraMovement}
                                  className="size-3"
                                />
                                {shot.cameraMovement}
                              </Badge>
                              <Badge>{shot.durationSec}s</Badge>
                            </div>
                            <p className="mt-2 text-sm text-text">{shot.action}</p>
                            <p className="mt-1 text-xs text-text-muted">
                              {shot.lens} · {shot.lighting}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </li>
                );
              });
            })()}
          </ol>
        </Card>
        <Card title="Eindcard">
          <h4 className="mt-3 text-3xl font-medium tracking-tightest">
            <span className="text-gradient-accent">{c.endCard.headline}</span>
          </h4>
          <p className="mt-1 text-sm text-text-muted">{c.endCard.subline}</p>
          <Badge variant="accent" className="mt-4">
            {c.endCard.callToAction}
          </Badge>
        </Card>
      </Section>

      {/* === Social shorts === */}
      <Section
        id="shorts"
        title="Reels & shorts"
        subtitle="Reel · TikTok · YouTube Short"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {(["reel", "tiktok", "youtubeShort"] as const).map((key) => {
            const f = shorts.formats[key];
            const label = key === "reel" ? "Reel" : key === "tiktok" ? "TikTok" : "YT Short";
            return (
              <div key={key} className="flex flex-col items-center gap-3">
                <PhoneFrame label={`${label} · ${f.durationSec}s`}>
                  <div className="absolute inset-0 flex flex-col px-4 pb-12 pt-12 text-center">
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-subtle">
                      Hook
                    </p>
                    <p className="mt-2 text-base font-medium leading-tight tracking-tight text-text">
                      {f.hook}
                    </p>
                    <ol className="mt-auto space-y-1 text-left text-[10px] leading-snug text-text-muted">
                      {f.beats.slice(0, 4).map((b, i) => (
                        <li
                          key={i}
                          className="flex gap-2 rounded bg-bg/40 px-2 py-1 backdrop-blur-sm"
                        >
                          <span className="font-mono text-accent">{b.timecode}</span>
                          <span className="line-clamp-2">{b.shot}</span>
                        </li>
                      ))}
                    </ol>
                    <span className="mt-3 inline-flex justify-center rounded-full bg-text px-3 py-1 text-[10px] font-medium text-bg">
                      {f.cta}
                    </span>
                  </div>
                </PhoneFrame>
                <p className="max-w-[260px] text-center text-xs text-text-muted">
                  {f.soundDirection}
                </p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* === Voice-over === */}
      <Section
        id="voiceover"
        title="Voice-over script"
        subtitle="Met timecodes en delivery-aanwijzingen"
      >
        <Card>
          <ol className="mt-2 divide-y divide-border">
            {(() => {
              let cumul = 0;
              return c.scenes
                .filter((s) => s.voiceOver.text.trim().length > 0)
                .map((s) => {
                  const start = cumul;
                  cumul += s.durationSec;
                  return (
                    <li key={s.id} className="grid gap-3 py-4 md:grid-cols-[160px_1fr]">
                      <div className="flex flex-col gap-1.5">
                        <Timecode
                          start={start}
                          duration={s.durationSec}
                          variant="accent"
                        />
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                          {s.id} · {s.intent}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <Music className="size-3" /> {s.soundDesign}
                        </span>
                      </div>
                      <div>
                        <p className="text-base leading-relaxed text-text">
                          “{s.voiceOver.text}”
                        </p>
                        <p className="mt-2 text-xs text-text-muted">
                          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                            Delivery
                          </span>{" "}
                          {s.voiceOver.deliveryDirection}
                        </p>
                      </div>
                    </li>
                  );
                });
            })()}
          </ol>
        </Card>
      </Section>

      {/* === Footer === */}
      <footer className="border-t border-border bg-bg/40 py-12 mt-16">
        <div className="container space-y-4 text-center">
          <Logo href="/" className="justify-center" />
          <p className="text-sm text-text-muted">
            Campagne gemaakt door{" "}
            <Link href="/" className="text-text hover:underline">
              Next Level Sites
            </Link>
            . Wil je hetzelfde voor jouw bedrijf?
          </p>
          <Button asChild variant="accent" size="md">
            <Link href="/studio/nieuw">Start een eigen campagne</Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}

function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      data-testid={`section-${id}`}
      className="container scroll-mt-32 py-16 md:py-24"
    >
      <header className="mb-8 md:mb-12">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
          §
        </span>
        <h2 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
          <span className="text-gradient">{title}</span>
        </h2>
        {subtitle ? (
          <p className="mt-2 text-text-muted">{subtitle}</p>
        ) : null}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface/60 p-6 backdrop-blur-sm">
      {title ? (
        <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
          {title}
        </h3>
      ) : null}
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
        {label}
      </p>
      <p className="mt-2 text-sm text-text">{value}</p>
    </div>
  );
}
