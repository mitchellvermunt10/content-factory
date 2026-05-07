import { nanoid } from "nanoid";
import { slugify } from "@/lib/utils";
import { EXPORT_PRESETS } from "@/lib/constants";
import type { CinematicCampaign } from "@/lib/schemas/artifacts/cinematic";
import type {
  VideoProduction,
  PipelineScene,
  RenderJob,
} from "@/lib/schemas/artifacts/videoProduction";

const VIDEO_PROVIDERS = ["runway", "kling", "veo"] as const;

/**
 * Wisselende statussen per scene zodat de pipeline-tabel direct levend voelt
 * (1ste scene volledig klaar, latere scenes progressief minder ver).
 */
const STATUS_TEMPLATES: PipelineScene["status"][] = [
  {
    script: "done",
    prompts: "done",
    assets: "done",
    voiceover: "done",
    edit: "done",
    export: "review",
  },
  {
    script: "done",
    prompts: "done",
    assets: "done",
    voiceover: "in-progress",
    edit: "pending",
    export: "pending",
  },
  {
    script: "done",
    prompts: "done",
    assets: "in-progress",
    voiceover: "pending",
    edit: "pending",
    export: "pending",
  },
  {
    script: "done",
    prompts: "review",
    assets: "pending",
    voiceover: "pending",
    edit: "pending",
    export: "pending",
  },
  {
    script: "done",
    prompts: "done",
    assets: "pending",
    voiceover: "pending",
    edit: "pending",
    export: "pending",
  },
  {
    script: "done",
    prompts: "done",
    assets: "pending",
    voiceover: "pending",
    edit: "pending",
    export: "pending",
  },
];

function placeholderRunwayUrl(seed: string) {
  return `https://placeholder.runway.ml/clips/${seed}.mp4`;
}
function placeholderKlingUrl(seed: string) {
  return `https://placeholder.klingai.com/render/${seed}.mp4`;
}
function placeholderVeoUrl(seed: string) {
  return `https://placeholder.deepmind.google/veo/${seed}.mp4`;
}
function placeholderImageUrl(seed: string, kind: "midjourney" | "firefly") {
  const host = kind === "midjourney" ? "cdn.midjourney.com" : "cdn.firefly.adobe";
  return `https://placeholder.${host}/i/${seed}.png`;
}
function placeholderElevenAudio(seed: string) {
  return `https://placeholder.elevenlabs.io/audio/${seed}.mp3`;
}

function pickProvider(idx: number): typeof VIDEO_PROVIDERS[number] {
  return VIDEO_PROVIDERS[idx % VIDEO_PROVIDERS.length];
}

export function buildVideoProduction(
  cinematic: CinematicCampaign,
  campaignName: string,
  toneSuggestion: string
): VideoProduction {
  const slug = slugify(campaignName) || "campaign";

  // Build VO-script — concatenate all scene VO with timecode markers.
  let cumul = 0;
  const voChunks = cinematic.scenes.map((s) => {
    const start = cumul;
    cumul += s.durationSec;
    if (!s.voiceOver.text.trim()) return null;
    const mins = Math.floor(start / 60)
      .toString()
      .padStart(2, "0");
    const secs = Math.floor(start % 60)
      .toString()
      .padStart(2, "0");
    return `[${mins}:${secs}] ${s.voiceOver.text}`;
  });
  const fullScript = voChunks.filter(Boolean).join("\n\n");

  // Pipeline scenes
  const pipelineScenes: PipelineScene[] = cinematic.scenes.map((scene, i) => {
    const tpl = STATUS_TEMPLATES[i] ?? STATUS_TEMPLATES[STATUS_TEMPLATES.length - 1];
    const images = scene.shots.map((sh) => {
      const hasUrl = tpl.assets === "done" || tpl.assets === "in-progress";
      return {
        provider: (i % 2 === 0 ? "midjourney" : "firefly") as
          | "midjourney"
          | "firefly",
        url: hasUrl
          ? placeholderImageUrl(
              `${slug}-${sh.id}`,
              i % 2 === 0 ? "midjourney" : "firefly"
            )
          : null,
        promptId: `img-${sh.id}`,
        assetStatus: (tpl.assets === "done"
          ? "verified"
          : hasUrl
          ? "uploaded"
          : "missing") as "missing" | "uploaded" | "verified" | "ready",
        localFile: null,
      };
    });

    const videos = scene.shots.map((sh, j) => {
      const provider = pickProvider(i + j);
      const status =
        tpl.assets === "done"
          ? ("ready" as const)
          : tpl.assets === "in-progress" && j === 0
          ? ("rendering" as const)
          : tpl.assets === "in-progress"
          ? ("queued" as const)
          : ("queued" as const);
      const url =
        status === "ready"
          ? provider === "runway"
            ? placeholderRunwayUrl(`${slug}-${sh.id}`)
            : provider === "kling"
            ? placeholderKlingUrl(`${slug}-${sh.id}`)
            : placeholderVeoUrl(`${slug}-${sh.id}`)
          : null;
      const assetStatus =
        status === "ready"
          ? ("verified" as const)
          : status === "rendering"
          ? ("uploaded" as const)
          : ("missing" as const);
      return {
        provider,
        url,
        durationSec: sh.durationSec,
        status,
        promptId: `vid-${sh.id}`,
        assetStatus,
        localFile: null,
      };
    });

    return {
      sceneId: scene.id,
      title: scene.title,
      durationSec: scene.durationSec,
      estimatedRenderMin: Math.max(2, Math.round(scene.shots.length * 1.5 + scene.durationSec / 4)),
      status: tpl,
      assets: { images, videos },
      notes:
        i === 0
          ? "Hero scene — extra time spent on color grading."
          : i === cinematic.scenes.length - 1
          ? "Eindcard: logo treatment apart in After Effects."
          : "Match-cut met vorige scene aandachtig timen.",
    };
  });

  // Render queue: collect all video assets that are queued/rendering.
  const renderQueue: RenderJob[] = [];
  cinematic.scenes.forEach((scene, sIdx) => {
    scene.shots.forEach((sh, shIdx) => {
      const ps = pipelineScenes[sIdx];
      const v = ps.assets.videos[shIdx];
      const startedAt =
        v.status === "rendering"
          ? new Date(Date.now() - 90 * 1000).toISOString()
          : v.status === "ready"
          ? new Date(Date.now() - 12 * 60 * 1000).toISOString()
          : null;
      renderQueue.push({
        id: nanoid(8),
        sceneId: scene.id,
        shotId: sh.id,
        provider: v.provider,
        prompt: sh.videoPrompt,
        durationSec: sh.durationSec,
        status: v.status,
        progress: v.status === "ready" ? 100 : v.status === "rendering" ? 62 : 0,
        startedAt,
        finishedAt:
          v.status === "ready"
            ? new Date(Date.now() - 8 * 60 * 1000).toISOString()
            : null,
        outputUrl: v.url,
        externalId: null,
        apiMode: null,
        errorMessage: null,
        savedToPath: null,
      });
    });
  });

  const totalDur = cinematic.concept.totalDurationSec;
  const voSuggestionVoice =
    /klinisch|luxueus/.test(toneSuggestion) ? "anouk" : "sjoerd";

  const voiceOver: VideoProduction["voiceOver"] = {
    fullScript,
    totalDurationSec: totalDur,
    elevenLabs: {
      voiceId: voSuggestionVoice,
      voiceName: voSuggestionVoice === "anouk" ? "Anouk (NL)" : "Sjoerd (NL)",
      modelId: "eleven_multilingual_v2",
      stability: 0.55,
      similarity: 0.75,
      styleExaggeration: 0.35,
      speakerBoost: true,
      audioUrl: placeholderElevenAudio(`${slug}-vo-master`),
      status: "ready",
    },
  };

  const exportPlan: VideoProduction["exportPlan"] = {
    activePresetId: "reel-9x16",
    presets: EXPORT_PRESETS.map((p) => ({
      id: p.id,
      label: p.label,
      ratio: p.ratio,
      width: p.width,
      height: p.height,
      fps: p.fps,
      bitrate: p.bitrate,
      audioBitrate: p.audioBitrate,
      container: p.container,
      codec: p.codec,
      filename: `${slug}-${p.id}.mp4`,
      status: p.id === "reel-9x16" ? "ready" : "pending",
      outputUrl:
        p.id === "reel-9x16"
          ? `https://placeholder.cdn.studio-vermunt.nl/exports/${slug}-${p.id}.mp4`
          : null,
    })),
  };

  return {
    pipeline: { scenes: pipelineScenes },
    voiceOver,
    renderQueue,
    exportPlan,
  };
}

