"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { buildVideoProduction } from "@/lib/generators/buildVideoProduction";
import { ArrowLeft, Download, Eye, RefreshCw, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCampaigns } from "@/lib/store/campaigns";
import { downloadCampaignJSON } from "@/lib/export/json";
import { ShareCampaignDialog } from "@/components/studio/ShareCampaignDialog";
import { ApprovalsPanel } from "@/components/studio/ApprovalsPanel";
import { LandingPagePreview } from "@/components/artifacts/LandingPagePreview";
import { ReceptionistPreview } from "@/components/artifacts/ReceptionistPreview";
import { SeoPreview } from "@/components/artifacts/SeoPreview";
import { MetaAdsPreview } from "@/components/artifacts/MetaAdsPreview";
import { InstagramPreview } from "@/components/artifacts/InstagramPreview";
import { CinematicPreview } from "@/components/artifacts/CinematicPreview";
import { SocialShortsPreview } from "@/components/artifacts/SocialShortsPreview";
import { PromptPacksPreview } from "@/components/artifacts/PromptPacksPreview";
import { VideoProductionPreview } from "@/components/artifacts/VideoProductionPreview";
import { GradientMesh } from "@/components/motion/GradientMesh";
import { BUSINESS_TYPES } from "@/lib/constants";
import { relativeTime } from "@/lib/utils";
import type { MvpGeneratorId } from "@/lib/constants";
import type { CinematicCampaign } from "@/lib/schemas/artifacts/cinematic";
import type { PromptPacks } from "@/lib/schemas/artifacts/promptPacks";
import type { VideoProduction } from "@/lib/schemas/artifacts/videoProduction";

const ARTIFACT_KEY_MAP: Record<MvpGeneratorId, "landing" | "seo" | "metaAds" | "instagram" | "cinematic" | "socialShorts" | "promptPacks"> = {
  landing: "landing",
  seo: "seo",
  "meta-ads": "metaAds",
  instagram: "instagram",
  cinematic: "cinematic",
  "social-shorts": "socialShorts",
  "prompt-packs": "promptPacks",
};

export default function CampaignPage() {
  const params = useParams<{ id: string }>();
  const campaign = useCampaigns((s) => s.getById(params.id));
  const hydrated = useCampaigns((s) => s.hydrated);
  const fetching = useCampaigns((s) => Boolean(s.fetchingIds[params.id]));
  const fetchFromServer = useCampaigns((s) => s.fetchFromServer);
  const updateArtifact = useCampaigns((s) => s.updateArtifact);
  const removeCampaign = useCampaigns((s) => s.removeCampaign);
  const receptionist = useCampaigns((s) =>
    s.receptionists[params.id]
  );
  const setReceptionist = useCampaigns((s) => s.setReceptionist);
  const [regenerating, setRegenerating] = useState<MvpGeneratorId | null>(null);
  const [serverChecked, setServerChecked] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (campaign) return;
    if (serverChecked) return;
    fetchFromServer(params.id).finally(() => setServerChecked(true));
  }, [hydrated, campaign, params.id, fetchFromServer, serverChecked]);

  // Backwards-compat: oudere campagnes hebben mogelijk geen videoProduction
  // gepersisteerd in Supabase (final PATCH lukte niet altijd). Bouw 'm dan
  // on-the-fly uit cinematic — dezelfde pure functie als de wizard gebruikt.
  const videoProductionFallback = useMemo(() => {
    if (!campaign) return null;
    if (campaign.artifacts.videoProduction) {
      return campaign.artifacts.videoProduction;
    }
    return buildVideoProduction(
      campaign.artifacts.cinematic,
      campaign.brief.name,
      campaign.brief.tone
    );
  }, [campaign]);

  if (!hydrated || (!campaign && !serverChecked) || fetching) {
    return (
      <div className="px-6 py-10 md:px-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="h-10 w-1/3 animate-pulse rounded-lg bg-elevated" />
          <div className="mt-8 h-[600px] animate-pulse rounded-2xl bg-elevated" />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="px-6 py-20 text-center">
        <h2 className="text-2xl font-medium tracking-tight">
          Campagne niet gevonden
        </h2>
        <p className="mt-2 text-text-muted">
          Deze campagne is niet meer in deze browser opgeslagen.
        </p>
        <Button asChild className="mt-6" variant="primary">
          <Link href="/studio">
            <ArrowLeft className="size-4" /> Terug naar studio
          </Link>
        </Button>
      </div>
    );
  }

  const type = BUSINESS_TYPES.find(
    (t) => t.value === campaign.brief.businessType
  );

  async function regenerate(artifact: MvpGeneratorId) {
    if (!campaign) return;
    setRegenerating(artifact);
    try {
      const res = await fetch(`/api/generate/${artifact}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...campaign.brief,
          ...(campaign.artifacts.scrapedContent
            ? { _scrapedContent: campaign.artifacts.scrapedContent }
            : {}),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Regeneratie mislukt");
      }
      const { value } = await res.json();
      updateArtifact(campaign.id, ARTIFACT_KEY_MAP[artifact], value);
      toast.success("Opnieuw gegenereerd");
    } catch (err) {
      toast.error("Regeneratie mislukt", {
        description: err instanceof Error ? err.message : "Onbekende fout",
      });
    } finally {
      setRegenerating(null);
    }
  }

  function handleDelete() {
    if (!campaign) return;
    if (!confirm("Deze campagne verwijderen?")) return;
    removeCampaign(campaign.id);
    window.location.href = "/studio";
  }

  function patchCinematicShotPrompt(
    sceneId: string,
    shotId: string,
    kind: "imagePrompt" | "videoPrompt",
    value: string
  ) {
    if (!campaign) return;
    const next: CinematicCampaign = {
      ...campaign.artifacts.cinematic,
      scenes: campaign.artifacts.cinematic.scenes.map((s) =>
        s.id === sceneId
          ? {
              ...s,
              shots: s.shots.map((sh) =>
                sh.id === shotId ? { ...sh, [kind]: value } : sh
              ),
            }
          : s
      ),
    };
    updateArtifact(campaign.id, "cinematic", next);
  }

  function patchPromptPacks(next: PromptPacks) {
    if (!campaign) return;
    updateArtifact(campaign.id, "promptPacks", next);
  }

  function patchVideoProduction(next: VideoProduction) {
    if (!campaign) return;
    updateArtifact(campaign.id, "videoProduction", next);
  }

  return (
    <div className="relative isolate min-h-screen">
      <GradientMesh intensity="soft" />
      <div className="relative px-6 py-10 md:px-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/studio">
                <ArrowLeft className="size-4" /> Studio
              </Link>
            </Button>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              · {relativeTime(campaign.createdAt)}
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="accent">{type?.label}</Badge>
                <Badge>{campaign.brief.tone}</Badge>
                <Badge variant="outline">{campaign.brief.city}</Badge>
              </div>
              <h1 className="mt-4 text-4xl font-medium tracking-tightest md:text-5xl">
                <span className="text-gradient">{campaign.brief.name}</span>
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <ShareCampaignDialog
                campaignId={campaign.id}
                campaignName={campaign.brief.name}
              />
              <Button
                asChild
                variant="secondary"
                data-testid="open-client-view"
              >
                <Link href={`/c/${campaign.id}`} target="_blank">
                  <Eye className="size-4" />
                  Voorvertonen
                </Link>
              </Button>
              <Button
                variant="ghost"
                onClick={() => downloadCampaignJSON(campaign)}
                data-testid="export-json"
              >
                <Download className="size-4" />
                Export JSON
              </Button>
              <Button
                variant="ghost"
                onClick={handleDelete}
                className="text-text-subtle hover:text-danger"
              >
                <Trash2 className="size-4" />
                Verwijder
              </Button>
            </div>
          </div>

          <div className="mt-12">
            <ApprovalsPanel campaignId={campaign.id} />
          </div>

          <div className="mt-8">
            <Tabs defaultValue="landing">
              <div className="overflow-x-auto pb-2 no-scrollbar">
                <TabsList className="flex-nowrap">
                  <TabsTrigger value="landing">Landing</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="meta-ads">Meta ads</TabsTrigger>
                  <TabsTrigger value="instagram">Instagram</TabsTrigger>
                  <TabsTrigger value="cinematic">Cinematic</TabsTrigger>
                  <TabsTrigger value="social-shorts">Social shorts</TabsTrigger>
                  <TabsTrigger value="prompt-packs">Prompt packs</TabsTrigger>
                  <TabsTrigger value="video-production">
                    Productie · intern
                  </TabsTrigger>
                  <TabsTrigger value="receptionist">Receptionist</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="landing" data-testid="tab-landing">
                <ArtifactToolbar
                  onRegenerate={() => regenerate("landing")}
                  busy={regenerating === "landing"}
                />
                <LandingPagePreview
                  data={campaign.artifacts.landing}
                  brand={campaign.brand}
                  scrapedContent={campaign.artifacts.scrapedContent}
                />
              </TabsContent>

              <TabsContent value="seo">
                <ArtifactToolbar
                  onRegenerate={() => regenerate("seo")}
                  busy={regenerating === "seo"}
                />
                <SeoPreview data={campaign.artifacts.seo} />
              </TabsContent>

              <TabsContent value="meta-ads">
                <ArtifactToolbar
                  onRegenerate={() => regenerate("meta-ads")}
                  busy={regenerating === "meta-ads"}
                />
                <MetaAdsPreview
                  data={campaign.artifacts.metaAds}
                  campaignId={campaign.id}
                />
              </TabsContent>

              <TabsContent value="instagram">
                <ArtifactToolbar
                  onRegenerate={() => regenerate("instagram")}
                  busy={regenerating === "instagram"}
                />
                <InstagramPreview
                  data={campaign.artifacts.instagram}
                  campaignId={campaign.id}
                  businessName={campaign.brief.name}
                  city={campaign.brief.city}
                  accentColor={campaign.brand.accent}
                  scrapedPhotos={
                    campaign.artifacts.scrapedContent?.photos?.map((p) => ({
                      url: p.url,
                      alt: p.alt,
                    })) ?? undefined
                  }
                />
              </TabsContent>

              <TabsContent value="cinematic" data-testid="tab-cinematic">
                <ArtifactToolbar
                  onRegenerate={() => regenerate("cinematic")}
                  busy={regenerating === "cinematic"}
                />
                <CinematicPreview
                  data={campaign.artifacts.cinematic}
                  campaignName={campaign.brief.name}
                  campaignId={campaign.id}
                  onChangePrompt={patchCinematicShotPrompt}
                />
              </TabsContent>

              <TabsContent value="social-shorts" data-testid="tab-social-shorts">
                <ArtifactToolbar
                  onRegenerate={() => regenerate("social-shorts")}
                  busy={regenerating === "social-shorts"}
                />
                <SocialShortsPreview data={campaign.artifacts.socialShorts} />
              </TabsContent>

              <TabsContent value="prompt-packs" data-testid="tab-prompt-packs">
                <ArtifactToolbar
                  onRegenerate={() => regenerate("prompt-packs")}
                  busy={regenerating === "prompt-packs"}
                />
                <PromptPacksPreview
                  data={campaign.artifacts.promptPacks}
                  onChange={patchPromptPacks}
                />
              </TabsContent>

              <TabsContent
                value="video-production"
                data-testid="tab-video-production"
              >
                <div className="mb-6 rounded-xl border border-warning/40 bg-warning/5 p-4">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-warning">
                      Intern
                    </span>
                    <p className="text-sm leading-relaxed text-text-muted">
                      Deze tab is een productie-checklist voor jou — niet
                      zichtbaar voor de klant op /c/[id]. De render-pipeline
                      en export-knoppen zijn nog niet gekoppeld aan
                      Runway/Kling. Voice-over via ElevenLabs werkt wel.
                    </p>
                  </div>
                </div>
                <VideoProductionPreview
                  data={videoProductionFallback!}
                  cinematic={campaign.artifacts.cinematic}
                  campaignName={campaign.brief.name}
                  onChange={patchVideoProduction}
                />
              </TabsContent>

              <TabsContent value="receptionist" data-testid="tab-receptionist">
                <ReceptionistPreview
                  brief={campaign.brief}
                  config={receptionist ?? null}
                  onGenerated={(cfg) => setReceptionist(campaign.id, cfg)}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArtifactToolbar({
  onRegenerate,
  busy,
}: {
  onRegenerate: () => void;
  busy: boolean;
}) {
  return (
    <div className="mb-5 flex items-center justify-end">
      <Button
        size="sm"
        variant="secondary"
        onClick={onRegenerate}
        disabled={busy}
      >
        {busy ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <RefreshCw className="size-3.5" />
        )}
        Opnieuw genereren
      </Button>
    </div>
  );
}
