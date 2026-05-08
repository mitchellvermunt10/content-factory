import { z } from "zod";
import { BusinessBriefSchema } from "./brief";
import { BrandSchema } from "./brand";
import { LandingPageSchema } from "./artifacts/landing";
import { SeoCopySchema } from "./artifacts/seo";
import { MetaAdsSchema } from "./artifacts/metaAds";
import { InstagramContentSchema } from "./artifacts/instagram";
import { CinematicCampaignSchema } from "./artifacts/cinematic";
import { SocialShortsSchema } from "./artifacts/socialShorts";
import { PromptPacksSchema } from "./artifacts/promptPacks";
import { VideoProductionSchema } from "./artifacts/videoProduction";
import { ScrapedContentSchema } from "./scrapedContent";

export const ArtifactsSchema = z.object({
  landing: LandingPageSchema,
  seo: SeoCopySchema,
  metaAds: MetaAdsSchema,
  instagram: InstagramContentSchema,
  cinematic: CinematicCampaignSchema,
  socialShorts: SocialShortsSchema,
  promptPacks: PromptPacksSchema,
  videoProduction: VideoProductionSchema,
  // Optional: echte content gescrapet uit prospect-website. Als deze er is,
  // gebruiken preview-componenten dit ipv (of bovenop) AI-gegenereerd.
  scrapedContent: ScrapedContentSchema.optional(),
});

export type Artifacts = z.infer<typeof ArtifactsSchema>;

export const CampaignSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  brief: BusinessBriefSchema,
  brand: BrandSchema,
  artifacts: ArtifactsSchema,
});

export type Campaign = z.infer<typeof CampaignSchema>;
