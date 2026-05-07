import { slugify } from "@/lib/utils";
import { formatTimecode } from "@/components/cinematic/Timecode";
import type { CinematicCampaign } from "@/lib/schemas/artifacts/cinematic";

export interface EdlClip {
  id: string;
  inTc: string;
  outTc: string;
  durationSec: number;
  shotId: string;
  framing: string;
  cameraMovement: string;
  lens: string;
  imagePrompt: string;
  videoPrompt: string;
}

export interface EdlAudioCue {
  inTc: string;
  outTc: string;
  type: "vo" | "music" | "sfx";
  text: string;
  deliveryDirection?: string;
}

export interface EdlPayload {
  meta: {
    campaign: string;
    logline: string;
    aspectRatio: string;
    totalDurationSec: number;
    fps: number;
    generatedAt: string;
  };
  scenes: {
    id: string;
    title: string;
    intent: string;
    inTc: string;
    outTc: string;
    transitionIn: string;
    transitionOut: string;
    lighting: string;
    colorPalette: string;
    soundDesign: string;
  }[];
  tracks: {
    video: EdlClip[];
    audio: EdlAudioCue[];
  };
}

export function buildEdl(
  cinematic: CinematicCampaign,
  campaignName: string
): EdlPayload {
  const fps = 24;
  const sceneRows: EdlPayload["scenes"] = [];
  const videoTrack: EdlClip[] = [];
  const audioTrack: EdlAudioCue[] = [];

  let cumul = 0;
  for (const scene of cinematic.scenes) {
    const sceneStart = cumul;
    const sceneEnd = cumul + scene.durationSec;

    sceneRows.push({
      id: scene.id,
      title: scene.title,
      intent: scene.intent,
      inTc: formatTimecode(sceneStart, fps),
      outTc: formatTimecode(sceneEnd, fps),
      transitionIn: scene.transitionIn,
      transitionOut: scene.transitionOut,
      lighting: scene.lighting,
      colorPalette: scene.colorPalette,
      soundDesign: scene.soundDesign,
    });

    if (scene.voiceOver.text.trim()) {
      audioTrack.push({
        inTc: formatTimecode(sceneStart, fps),
        outTc: formatTimecode(sceneEnd, fps),
        type: "vo",
        text: scene.voiceOver.text,
        deliveryDirection: scene.voiceOver.deliveryDirection,
      });
    }

    let shotCumul = sceneStart;
    for (const shot of scene.shots) {
      const inTc = formatTimecode(shotCumul, fps);
      const outTc = formatTimecode(shotCumul + shot.durationSec, fps);
      videoTrack.push({
        id: `${scene.id}/${shot.id}`,
        inTc,
        outTc,
        durationSec: shot.durationSec,
        shotId: shot.id,
        framing: shot.framing,
        cameraMovement: shot.cameraMovement,
        lens: shot.lens,
        imagePrompt: shot.imagePrompt,
        videoPrompt: shot.videoPrompt,
      });
      shotCumul += shot.durationSec;
    }

    cumul = sceneEnd;
  }

  return {
    meta: {
      campaign: campaignName,
      logline: cinematic.concept.logline,
      aspectRatio: cinematic.concept.primaryAspectRatio,
      totalDurationSec: cinematic.concept.totalDurationSec,
      fps,
      generatedAt: new Date().toISOString(),
    },
    scenes: sceneRows,
    tracks: { video: videoTrack, audio: audioTrack },
  };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadEdlJson(payload: EdlPayload, campaignName: string) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, `cinematic-edl-${slugify(campaignName) || "campaign"}.json`);
}

function csvEscape(s: string) {
  return `"${s.replace(/"/g, '""').replace(/\n/g, " ")}"`;
}

export function downloadShotListCsv(
  cinematic: CinematicCampaign,
  campaignName: string
) {
  const headers = [
    "scene_id",
    "shot_id",
    "intent",
    "framing",
    "camera_movement",
    "lens",
    "duration_sec",
    "in_tc",
    "out_tc",
    "subject",
    "action",
    "lighting",
    "color_note",
    "image_prompt",
    "video_prompt",
  ];
  const rows: string[][] = [];
  let cumul = 0;
  for (const scene of cinematic.scenes) {
    let cur = cumul;
    for (const shot of scene.shots) {
      rows.push([
        scene.id,
        shot.id,
        scene.intent,
        shot.framing,
        shot.cameraMovement,
        shot.lens,
        String(shot.durationSec),
        formatTimecode(cur),
        formatTimecode(cur + shot.durationSec),
        shot.subject,
        shot.action,
        shot.lighting,
        shot.colorNote,
        shot.imagePrompt,
        shot.videoPrompt,
      ]);
      cur += shot.durationSec;
    }
    cumul += scene.durationSec;
  }
  const lines = [
    headers.join(","),
    ...rows.map((r) => r.map(csvEscape).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  downloadBlob(
    blob,
    `cinematic-shotlist-${slugify(campaignName) || "campaign"}.csv`
  );
}
