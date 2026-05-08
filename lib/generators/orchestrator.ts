import { nanoid } from "nanoid";
import { MOCK_MODE } from "@/lib/ai/client";
import { deriveBrand } from "@/lib/brand/presets";
import { generateLandingPage } from "./landingPage";
import { generateSeoCopy } from "./seo";
import { generateMetaAds } from "./metaAds";
import { generateInstagramContent } from "./instagram";
import { generateCinematic } from "./cinematic";
import { generateSocialShorts } from "./socialShorts";
import { generatePromptPacks } from "./promptPacks";
import { buildVideoProduction } from "./buildVideoProduction";
import {
  mockLanding,
  mockSeo,
  mockMetaAds,
  mockInstagram,
} from "./mockFixtures";
import {
  mockCinematic,
  mockSocialShorts,
  mockPromptPacks,
} from "./mockFixturesCinematic";
import type { BusinessBrief } from "@/lib/schemas/brief";
import type { Campaign } from "@/lib/schemas/campaign";
import type { MvpGeneratorId } from "@/lib/constants";
import type { ScrapedContent } from "@/lib/schemas/scrapedContent";

export async function runCampaign(brief: BusinessBrief): Promise<Campaign> {
  const brand = deriveBrand(brief);

  let landing, seo, metaAds, instagram, cinematic, socialShorts, promptPacks;

  if (MOCK_MODE) {
    landing = mockLanding(brief);
    seo = mockSeo(brief);
    metaAds = mockMetaAds(brief);
    instagram = mockInstagram(brief);
    cinematic = mockCinematic(brief);
    socialShorts = mockSocialShorts(brief);
    promptPacks = mockPromptPacks(brief);
  } else {
    // Sequentieel uitvoeren — Anthropic Tier 1 rate limit is 8K output tokens/min,
    // parallel uitvoering reserveert ~33K tokens en triggert direct 429.
    // Sequentieel: ~30-60s per generator × 7 = totaal 3-5 min.
    landing = await generateLandingPage(brief);
    seo = await generateSeoCopy(brief);
    metaAds = await generateMetaAds(brief);
    instagram = await generateInstagramContent(brief);
    cinematic = await generateCinematic(brief);
    socialShorts = await generateSocialShorts(brief);
    promptPacks = await generatePromptPacks(brief);
  }

  const videoProduction = buildVideoProduction(cinematic, brief.name, brief.tone);

  const now = new Date().toISOString();
  return {
    id: nanoid(10),
    createdAt: now,
    updatedAt: now,
    brief,
    brand,
    artifacts: {
      landing,
      seo,
      metaAds,
      instagram,
      cinematic,
      socialShorts,
      promptPacks,
      videoProduction,
    },
  };
}

export async function regenerateArtifact(
  brief: BusinessBrief,
  artifact: MvpGeneratorId,
  scraped?: ScrapedContent | null
) {
  if (MOCK_MODE) {
    switch (artifact) {
      case "landing":
        return { artifact, value: mockLanding(brief) };
      case "seo":
        return { artifact, value: mockSeo(brief) };
      case "meta-ads":
        return { artifact, value: mockMetaAds(brief) };
      case "instagram":
        return { artifact, value: mockInstagram(brief) };
      case "cinematic":
        return { artifact, value: mockCinematic(brief) };
      case "social-shorts":
        return { artifact, value: mockSocialShorts(brief) };
      case "prompt-packs":
        return { artifact, value: mockPromptPacks(brief) };
    }
  }

  switch (artifact) {
    case "landing":
      return { artifact, value: await generateLandingPage(brief, scraped) };
    case "seo":
      return { artifact, value: await generateSeoCopy(brief, scraped) };
    case "meta-ads":
      return { artifact, value: await generateMetaAds(brief, scraped) };
    case "instagram":
      return {
        artifact,
        value: await generateInstagramContent(brief, scraped),
      };
    case "cinematic":
      return { artifact, value: await generateCinematic(brief, scraped) };
    case "social-shorts":
      return { artifact, value: await generateSocialShorts(brief, scraped) };
    case "prompt-packs":
      return { artifact, value: await generatePromptPacks(brief, scraped) };
  }
}
