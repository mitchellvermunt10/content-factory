import { slugify } from "@/lib/utils";
import type { CinematicCampaign } from "@/lib/schemas/artifacts/cinematic";
import type { VideoProduction } from "@/lib/schemas/artifacts/videoProduction";
import type { ExportPlan } from "@/lib/schemas/artifacts/videoProduction";

type Preset = ExportPlan["presets"][number];

interface AssemblyContext {
  campaignName: string;
  cinematic: CinematicCampaign;
  pipeline: VideoProduction["pipeline"];
  voiceOver: VideoProduction["voiceOver"];
}

function isPlaceholder(url: string | null | undefined): boolean {
  if (!url) return true;
  if (url.startsWith("blob:") || url.startsWith("data:")) return true;
  return /placeholder\./.test(url);
}

function reframeFilter(width: number, height: number) {
  return `crop='if(gt(iw/ih,${width}/${height}),ih*${width}/${height},iw)':'if(gt(iw/ih,${width}/${height}),ih,iw*${height}/${width})',scale=${width}:${height},setsar=1`;
}

/**
 * Bouwt een complete, plakbare bash-script string voor één export-preset,
 * met daadwerkelijke download/cp regels per asset zoals door de gebruiker
 * geleverd via de Assets per scene tab.
 */
export function buildAssemblyScript(
  preset: Preset,
  ctx: AssemblyContext
): string {
  const slug = slugify(ctx.campaignName) || "campaign";
  const reframe = reframeFilter(preset.width, preset.height);
  const lines: string[] = [];

  lines.push("#!/usr/bin/env bash");
  lines.push("set -euo pipefail");
  lines.push("");
  lines.push(`# Export — ${ctx.campaignName} · ${preset.label}`);
  lines.push(
    `# ${preset.width}×${preset.height} · ${preset.fps}fps · ${preset.bitrate} · ${preset.codec}`
  );
  lines.push(`# Gegenereerd: ${new Date().toISOString()}`);
  lines.push(`# Werkmap: ./${slug}/`);
  lines.push("");
  lines.push(`mkdir -p ${slug}/clips ${slug}/audio ${slug}/exports`);
  lines.push("");

  // === Stap 01: assets ophalen ===
  lines.push("# === Stap 01: Video clips ophalen ===");
  let missingClips = 0;
  let urlClips = 0;
  let localClips = 0;
  const clipFilenames: string[] = [];

  for (const scene of ctx.cinematic.scenes) {
    const ps = ctx.pipeline.scenes.find((p) => p.sceneId === scene.id);
    for (let i = 0; i < scene.shots.length; i++) {
      const shot = scene.shots[i];
      const v = ps?.assets.videos[i];
      const target = `${scene.id}-${shot.id}.mp4`;
      clipFilenames.push(target);

      if (v?.url && !isPlaceholder(v.url)) {
        lines.push(
          `curl -L --fail '${v.url.replace(/'/g, "'\\''")}' -o ${slug}/clips/${target}`
        );
        urlClips++;
      } else if (v?.localFile) {
        lines.push(
          `# Local upload: ${v.localFile.name} (${(v.localFile.size / 1024 / 1024).toFixed(1)} MB) — kopieer naar clips/`
        );
        lines.push(
          `cp '/PAD/NAAR/${v.localFile.name}' ${slug}/clips/${target}`
        );
        localClips++;
      } else {
        lines.push(
          `# ⚠ ONTBREEKT: ${target} — upload nog niet geleverd. Plaats handmatig in ${slug}/clips/${target}`
        );
        missingClips++;
      }
    }
  }
  lines.push("");

  // === Stap 02: voice-over ===
  lines.push("# === Stap 02: Voice-over MP3 ===");
  const voUrl = ctx.voiceOver.elevenLabs.audioUrl;
  if (voUrl && !isPlaceholder(voUrl) && !voUrl.startsWith("blob:")) {
    lines.push(`curl -L --fail '${voUrl}' -o ${slug}/audio/vo.mp3`);
  } else if (voUrl?.startsWith("blob:")) {
    lines.push(
      "# Voice-over is een sessie-blob (uit de browser). Download vanuit de Voice-over tab → 'Download MP3'."
    );
    lines.push(`# Plaats het bestand vervolgens als ${slug}/audio/vo.mp3`);
  } else {
    lines.push(
      `# ⚠ Geen voice-over URL. Genereer eerst de VO in de Voice-over tab en download als ${slug}/audio/vo.mp3.`
    );
  }
  lines.push("");

  // === Stap 03: muziek ===
  lines.push("# === Stap 03: Muziek (zelf voorzien) ===");
  lines.push(
    "# Plaats je eigen gelicenseerde track als ./" +
      slug +
      "/audio/music.mp3"
  );
  lines.push(`# Suggestie: ${ctx.cinematic.concept.musicDirection}`);
  lines.push("");

  // === Stap 04: concat lijst ===
  // Paden in de concat-list zijn relatief aan de directory van clips.txt zelf
  // (${slug}/), dus de clips zitten in 'clips/<filename>'.
  lines.push("# === Stap 04: Concat-lijst ===");
  lines.push(`cat > ${slug}/clips.txt <<'EOF'`);
  for (const f of clipFilenames) lines.push(`file 'clips/${f}'`);
  lines.push("EOF");
  lines.push("");

  // === Stap 05: concat ===
  lines.push("# === Stap 05: Clips concatenaten (lossless) ===");
  lines.push(
    `ffmpeg -y -f concat -safe 0 -i ${slug}/clips.txt -c copy ${slug}/master-raw.mp4`
  );
  lines.push("");

  // === Stap 06: VO mux ===
  lines.push("# === Stap 06: Voice-over toevoegen ===");
  lines.push(
    `ffmpeg -y -i ${slug}/master-raw.mp4 -i ${slug}/audio/vo.mp3 \\`
  );
  lines.push("  -map 0:v:0 -map 1:a:0 \\");
  lines.push(`  -c:v copy -c:a aac -b:a ${preset.audioBitrate} -shortest \\`);
  lines.push(`  ${slug}/master-vo.mp4`);
  lines.push("");

  // === Stap 07: muziek met side-chain ducking ===
  lines.push("# === Stap 07: Muziek mengen met VO (side-chain ducking) ===");
  lines.push(
    `ffmpeg -y -i ${slug}/master-vo.mp4 -i ${slug}/audio/music.mp3 \\`
  );
  lines.push(
    "  -filter_complex \"[1:a]volume=0.45,sidechaincompress=threshold=0.05:ratio=8:attack=20:release=400[duck]; \\"
  );
  lines.push(
    "                   [0:a][duck]amix=inputs=2:duration=first:dropout_transition=2[aout]\" \\"
  );
  lines.push("  -map 0:v -map \"[aout]\" \\");
  lines.push(`  -c:v copy -c:a aac -b:a ${preset.audioBitrate} \\`);
  lines.push(`  ${slug}/master-mix.mp4`);
  lines.push("");

  // === Stap 08: encode naar preset ===
  lines.push(`# === Stap 08: Encode naar ${preset.label} ===`);
  lines.push(`ffmpeg -y -i ${slug}/master-mix.mp4 \\`);
  lines.push(`  -vf "${reframe}" -r ${preset.fps} \\`);
  lines.push(
    `  -c:v ${preset.codec} -preset slow -profile:v high -pix_fmt yuv420p \\`
  );
  lines.push(`  -b:v ${preset.bitrate} -maxrate ${preset.bitrate} \\`);
  lines.push(`  -c:a aac -b:a ${preset.audioBitrate} -ac 2 \\`);
  lines.push(`  -movflags +faststart \\`);
  lines.push(`  ${slug}/exports/${preset.filename}`);
  lines.push("");

  // === Stap 09: QC ===
  lines.push("# === Stap 09: Quality check ===");
  lines.push(
    `ffprobe -v error -show_entries stream=width,height,r_frame_rate,duration \\`
  );
  lines.push(
    `  -of default=noprint_wrappers=1 ${slug}/exports/${preset.filename}`
  );
  lines.push("");
  lines.push(
    `echo "✓ Klaar: ${slug}/exports/${preset.filename}"`
  );

  // Header summary
  const summary: string[] = [
    "",
    "# === Asset summary ===",
    `# Clips:  ${urlClips} via curl, ${localClips} lokaal, ${missingClips} ontbreekt`,
    `# VO:     ${
      voUrl && !isPlaceholder(voUrl)
        ? "URL aangeleverd"
        : voUrl?.startsWith("blob:")
        ? "sessie-blob (download eerst)"
        : "ontbreekt"
    }`,
    `# Muziek: zelf aanleveren`,
  ];
  // Insert summary just after the metadata header (line 6)
  lines.splice(6, 0, ...summary);

  return lines.join("\n") + "\n";
}

export function downloadAssemblyScript(
  preset: Preset,
  ctx: AssemblyContext
) {
  const text = buildAssemblyScript(preset, ctx);
  const blob = new Blob([text], { type: "text/x-shellscript" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const slug = slugify(ctx.campaignName) || "campaign";
  link.download = `${slug}-export-${preset.id}.sh`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadAllAssemblyScripts(ctx: AssemblyContext, plan: ExportPlan) {
  for (const p of plan.presets) {
    downloadAssemblyScript(p, ctx);
  }
}

export interface AssemblyReadiness {
  totalClips: number;
  clipsWithSource: number;
  clipsReady: number;
  voReady: boolean;
  presetsReady: number;
  totalPresets: number;
}

export function computeReadiness(ctx: AssemblyContext, plan: ExportPlan): AssemblyReadiness {
  let totalClips = 0;
  let clipsWithSource = 0;
  let clipsReady = 0;
  for (const ps of ctx.pipeline.scenes) {
    for (const v of ps.assets.videos) {
      totalClips++;
      if (v.url || v.localFile) clipsWithSource++;
      if ((v.assetStatus ?? "missing") === "verified" || (v.assetStatus ?? "missing") === "ready") {
        clipsReady++;
      }
    }
  }
  const voUrl = ctx.voiceOver.elevenLabs.audioUrl;
  const voReady = !!voUrl;
  const presetsReady = plan.presets.filter((p) => p.status === "ready").length;
  return {
    totalClips,
    clipsWithSource,
    clipsReady,
    voReady,
    presetsReady,
    totalPresets: plan.presets.length,
  };
}
