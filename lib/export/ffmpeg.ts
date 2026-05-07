import { slugify } from "@/lib/utils";
import { EXPORT_PRESETS } from "@/lib/constants";
import type { CinematicCampaign } from "@/lib/schemas/artifacts/cinematic";
import type { ExportPlan } from "@/lib/schemas/artifacts/videoProduction";

export interface FfmpegStep {
  step: number;
  title: string;
  description: string;
  command: string;
}

/** Aspect-ratio aware crop+scale filter. */
function reframeFilter(width: number, height: number) {
  // crop to target ratio first, then scale to exact dimensions, then pad if needed.
  return `crop='if(gt(iw/ih,${width}/${height}),ih*${width}/${height},iw)':'if(gt(iw/ih,${width}/${height}),ih,iw*${height}/${width})',scale=${width}:${height},setsar=1`;
}

export function buildFfmpegPlan(
  cinematic: CinematicCampaign,
  exportPlan: ExportPlan,
  campaignName: string
): FfmpegStep[] {
  const slug = slugify(campaignName) || "campaign";
  const preset =
    exportPlan.presets.find((p) => p.id === exportPlan.activePresetId) ??
    exportPlan.presets[0];
  const reframe = reframeFilter(preset.width, preset.height);

  // Build clip list: one entry per shot in scene order. Paden zijn relatief
  // aan de directory van clips.txt (${slug}/), clips zitten in 'clips/'.
  const clipLines = cinematic.scenes
    .flatMap((s) => s.shots.map((sh) => `${s.id}-${sh.id}.mp4`))
    .map((f) => `file 'clips/${f}'`)
    .join("\n");

  const totalDur = cinematic.concept.totalDurationSec;

  return [
    {
      step: 1,
      title: "Voorbereiden — clips en bestandsstructuur",
      description:
        "Download alle Runway/Kling/Veo clips met naam <scene>-<shot>.mp4 in één werkmap. Maak clips.txt voor de concat-stap.",
      command: `# Maak werkmap
mkdir -p ${slug}/clips ${slug}/audio ${slug}/exports
# Plaats hier clips.txt (één regel per clip in scene-volgorde):
cat > ${slug}/clips.txt <<'EOF'
${clipLines}
EOF`,
    },
    {
      step: 2,
      title: "Concat — alle shots achter elkaar",
      description:
        "Lossless concat zonder re-encode (alle clips moeten zelfde codec/fps/resolutie hebben).",
      command: `ffmpeg -f concat -safe 0 -i ${slug}/clips.txt \\
  -c copy ${slug}/master-raw.mp4`,
    },
    {
      step: 3,
      title: "Voice-over toevoegen",
      description:
        "Voeg de ElevenLabs VO mp3 toe op de video track. Audio wordt afgekapt op de kortste duur.",
      command: `ffmpeg -i ${slug}/master-raw.mp4 -i ${slug}/audio/vo.mp3 \\
  -map 0:v:0 -map 1:a:0 \\
  -c:v copy -c:a aac -b:a ${preset.audioBitrate} \\
  -shortest ${slug}/master-vo.mp4`,
    },
    {
      step: 4,
      title: "Muziek mengen onder de VO",
      description:
        "Side-chain compressie: muziek dipt 6 dB onder de stem. Gebruik je eigen muziek-licentie.",
      command: `ffmpeg -i ${slug}/master-vo.mp4 -i ${slug}/audio/music.mp3 \\
  -filter_complex "[1:a]volume=0.45,sidechaincompress=threshold=0.05:ratio=8:attack=20:release=400[duck]; \\
                   [0:a][duck]amix=inputs=2:duration=first:dropout_transition=2[aout]" \\
  -map 0:v -map "[aout]" \\
  -c:v copy -c:a aac -b:a ${preset.audioBitrate} \\
  ${slug}/master-mix.mp4`,
    },
    {
      step: 5,
      title: "Color grade (LUT) — Kodak 2383 emulation",
      description:
        "Optioneel: pas een 3DLUT toe voor de cinematic look. Vervang lut.cube door je eigen file.",
      command: `ffmpeg -i ${slug}/master-mix.mp4 -vf "lut3d=lut/kodak_2383.cube" \\
  -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p \\
  -c:a copy ${slug}/master-graded.mp4`,
    },
    {
      step: 6,
      title: `Encode — ${preset.label}`,
      description: `Reframe naar ${preset.width}×${preset.height} (${preset.ratio}) en encode op ${preset.fps}fps, ${preset.bitrate}.`,
      command: `ffmpeg -i ${slug}/master-graded.mp4 \\
  -vf "${reframe}" -r ${preset.fps} \\
  -c:v ${preset.codec} -preset slow -profile:v high -pix_fmt yuv420p \\
  -b:v ${preset.bitrate} -maxrate ${preset.bitrate} -bufsize ${preset.bitrate.replace(
        /[A-Z]/i,
        ""
      )}M \\
  -c:a aac -b:a ${preset.audioBitrate} -ac 2 \\
  -movflags +faststart \\
  ${slug}/exports/${preset.filename}`,
    },
    {
      step: 7,
      title: "QC — controleer duur, ratio en file size",
      description:
        `Bevestig dat de output exact ${totalDur}s duurt en in ${preset.ratio} staat.`,
      command: `ffprobe -v error -show_entries stream=width,height,r_frame_rate,duration \\
  -of default=noprint_wrappers=1 ${slug}/exports/${preset.filename}`,
    },
    {
      step: 8,
      title: "Batch — alle 4 export presets in één run",
      description:
        "Wil je alle ratio's tegelijk uitleveren? Loop over de 4 presets vanaf master-graded.mp4.",
      command: EXPORT_PRESETS.map(
        (p) =>
          `ffmpeg -y -i ${slug}/master-graded.mp4 -vf "${reframeFilter(p.width, p.height)}" -r ${p.fps} -c:v ${p.codec} -preset slow -b:v ${p.bitrate} -c:a aac -b:a ${p.audioBitrate} -movflags +faststart ${slug}/exports/${slug}-${p.id}.mp4`
      ).join(" && \\\n"),
    },
  ];
}

export function ffmpegScriptString(steps: FfmpegStep[]): string {
  const out: string[] = ["#!/usr/bin/env bash", "set -euo pipefail", ""];
  for (const s of steps) {
    out.push(`# === Stap ${s.step}: ${s.title} ===`);
    out.push(`# ${s.description}`);
    out.push(s.command);
    out.push("");
  }
  return out.join("\n");
}

export function downloadFfmpegScript(
  steps: FfmpegStep[],
  campaignName: string
) {
  const slug = slugify(campaignName) || "campaign";
  const blob = new Blob([ffmpegScriptString(steps)], {
    type: "text/x-shellscript",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slug}-export.sh`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
