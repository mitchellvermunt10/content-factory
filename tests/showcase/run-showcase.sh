#!/usr/bin/env bash
# Maison Lumière showcase — full assembly using cinematic clips.
#
# Pre-conditions:
#   1. tests/showcase/maison-lumiere-export-reel-9x16.sh + maison-lumiere-campaign.json
#      exist (run: npx playwright test tests/e2e/showcase.spec.ts)
#   2. tests/showcase/maison-lumiere/clips/*.mp4 exist
#      (run: bash tests/showcase/render-cinematic-clips.sh)

set -uo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SHOWCASE_DIR="${PROJECT_ROOT}/tests/showcase"
WORK_DIR="${SHOWCASE_DIR}/maison-lumiere"
SCRIPT_PATH="${SHOWCASE_DIR}/maison-lumiere-export-reel-9x16.sh"
CAMPAIGN_JSON="${SHOWCASE_DIR}/maison-lumiere-campaign.json"
SHOWCASE_MD="${SHOWCASE_DIR}/SHOWCASE.md"
SCRIPT_LOG="${SHOWCASE_DIR}/script-run.log"
PROBE_FILE="${SHOWCASE_DIR}/probe.json"

export PATH="${PROJECT_ROOT}/node_modules/ffmpeg-static:${PROJECT_ROOT}/node_modules/@ffprobe-installer/win32-x64:${PATH}"

if [ ! -f "${SCRIPT_PATH}" ] || [ ! -f "${CAMPAIGN_JSON}" ]; then
  echo "❌ Showcase artefacten missen. Run eerst:"
  echo "    npx playwright test tests/e2e/showcase.spec.ts"
  exit 1
fi

if ! ls "${WORK_DIR}/clips/"*.mp4 >/dev/null 2>&1; then
  echo "→ Cinematic clips ontbreken — render ze eerst"
  bash "${SHOWCASE_DIR}/render-cinematic-clips.sh"
fi

# Generate VO + music (silent, juiste duur).
mkdir -p "${WORK_DIR}/audio" "${WORK_DIR}/exports"
echo "→ Genereer silent VO + music..."
ffmpeg -y -hide_banner -loglevel error \
  -f lavfi -i "anullsrc=channel_layout=stereo:sample_rate=44100" \
  -t 27 -c:a libmp3lame -b:a 192k \
  "${WORK_DIR}/audio/vo.mp3"
ffmpeg -y -hide_banner -loglevel error \
  -f lavfi -i "anullsrc=channel_layout=stereo:sample_rate=44100" \
  -t 27 -c:a libmp3lame -b:a 192k \
  "${WORK_DIR}/audio/music.mp3"

# Run het gedownloade assembly script.
echo "→ Run assembly script..."
(
  cd "${SHOWCASE_DIR}"
  bash "${SCRIPT_PATH}"
) >"${SCRIPT_LOG}" 2>&1
SCRIPT_EXIT=$?

OUTPUT="${WORK_DIR}/exports/maison-lumiere-reel-9x16.mp4"
if [ "${SCRIPT_EXIT}" -eq 0 ] && [ -f "${OUTPUT}" ]; then
  ffprobe -v error -print_format json -show_format -show_streams "${OUTPUT}" \
    > "${PROBE_FILE}" 2>&1
  PROBE_EXIT=$?
else
  PROBE_EXIT=99
fi

# Helper voor extractie.
extract() {
  node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));$1" "${PROBE_FILE}"
}

# Bouw SHOWCASE.md.
{
  echo "# Maison Lumière — Showcase Campaign"
  echo ""
  echo "_Een complete cinematic campagne gegenereerd door AI Content Factory._"
  echo "Run: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo ""
  echo "---"
  echo ""
  echo "## Het concept"
  echo ""
  if [ "${PROBE_EXIT}" -eq 0 ]; then
    LOGLINE=$(node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));console.log(j.artifacts.cinematic.concept.logline)" "${CAMPAIGN_JSON}")
    PILLAR=$(node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));console.log(j.artifacts.cinematic.concept.brandPillar)" "${CAMPAIGN_JSON}")
    MOOD=$(node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));console.log(j.artifacts.cinematic.concept.mood)" "${CAMPAIGN_JSON}")
    REF=$(node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));console.log(j.artifacts.cinematic.concept.referenceFilm)" "${CAMPAIGN_JSON}")
    MUSIC=$(node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));console.log(j.artifacts.cinematic.concept.musicDirection)" "${CAMPAIGN_JSON}")
    echo "**Logline.** ${LOGLINE}"
    echo ""
    echo "**Brand pillar.** ${PILLAR}"
    echo ""
    echo "**Mood.** ${MOOD}"
    echo ""
    echo "**References.** ${REF}"
    echo ""
    echo "**Music direction.** ${MUSIC}"
  fi
  echo ""
  echo "---"
  echo ""
  echo "## De storyboard"
  echo ""
  echo "| Scene | Titel | Intent | Duration | Voice-over |"
  echo "|---|---|---|---|---|"
  node -e "
    const fs=require('fs');
    const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));
    for (const s of j.artifacts.cinematic.scenes) {
      const vo = (s.voiceOver.text || '').replace(/\|/g, '\\\|');
      console.log(\`| \${s.id} | \${s.title} | \${s.intent} | \${s.durationSec}s | \\\"\${vo}\\\" |\`);
    }
  " "${CAMPAIGN_JSON}"
  echo ""
  echo "### Shot-by-shot"
  echo ""
  node -e "
    const fs=require('fs');
    const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));
    for (const s of j.artifacts.cinematic.scenes) {
      console.log(\`#### \${s.id} · \${s.title}\`);
      console.log('');
      console.log(\`- Lighting: \${s.lighting}\`);
      console.log(\`- Color palette: \${s.colorPalette}\`);
      console.log(\`- Sound design: \${s.soundDesign}\`);
      console.log(\`- Transition: \${s.transitionIn} → \${s.transitionOut}\`);
      console.log('');
      for (const sh of s.shots) {
        console.log(\`**\${sh.id}** · \${sh.framing} · \${sh.cameraMovement} · \${sh.lens} · \${sh.durationSec}s\`);
        console.log(\`  \${sh.action}\`);
        console.log('');
      }
    }
  " "${CAMPAIGN_JSON}"
  echo ""
  echo "---"
  echo ""
  echo "## AI video prompts (Runway voorbeeld)"
  echo ""
  echo "Drie van de acht shots — elk met een Runway/Kling/Veo variant:"
  echo ""
  node -e "
    const fs=require('fs');
    const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));
    const shots = j.artifacts.cinematic.scenes.flatMap(s => s.shots);
    for (const sh of [shots[0], shots[4], shots[7]]) {
      console.log(\`### \${sh.id}\`);
      console.log('');
      console.log('\`\`\`');
      console.log(sh.videoPrompt);
      console.log('\`\`\`');
      console.log('');
    }
  " "${CAMPAIGN_JSON}"
  echo ""
  echo "---"
  echo ""
  echo "## Social shorts (Reel · TikTok · YouTube)"
  echo ""
  node -e "
    const fs=require('fs');
    const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));
    const f = j.artifacts.socialShorts.formats;
    for (const [name, fmt] of Object.entries(f)) {
      console.log(\`### \${name} (\${fmt.durationSec}s)\`);
      console.log('');
      console.log(\`**Hook.** \${fmt.hook}\`);
      console.log('');
      console.log(\`**Beats.**\`);
      for (const b of fmt.beats) {
        const vo = b.vo ? \` — \\\"\${b.vo}\\\"\` : '';
        console.log(\`- \\\`\${b.timecode}\\\` \${b.shot}\${vo}\`);
      }
      console.log('');
      console.log(\`**Sound.** \${fmt.soundDirection}\`);
      console.log('');
      console.log(\`**CTA.** \${fmt.cta}\`);
      console.log('');
    }
  " "${CAMPAIGN_JSON}"
  echo ""
  echo "### Hook bank"
  echo ""
  node -e "
    const fs=require('fs');
    const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));
    const bank = j.artifacts.socialShorts.hookBank;
    for (const [cat, hooks] of Object.entries(bank)) {
      console.log(\`**\${cat}**\`);
      console.log('');
      for (const h of hooks) console.log(\`- \\\"\${h.text}\\\" _(\${h.type})_\`);
      console.log('');
    }
  " "${CAMPAIGN_JSON}"
  echo ""
  echo "---"
  echo ""
  echo "## Meta ads"
  echo ""
  node -e "
    const fs=require('fs');
    const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));
    const ads = j.artifacts.metaAds;
    console.log(\`**Objective.** \${ads.campaignObjective}\`);
    console.log('');
    console.log(\`**Audience.** \${ads.audienceTargeting.description}\`);
    console.log('');
    console.log(\`**Locations.** \${ads.audienceTargeting.locations.join(', ')}\`);
    console.log(\`**Age.** \${ads.audienceTargeting.ageRange}\`);
    console.log('');
    console.log('### Feed varianten');
    console.log('');
    for (const v of ads.variants) {
      console.log(\`#### \${v.hook}\`);
      console.log('');
      console.log(v.primaryText);
      console.log('');
      console.log(\`> \${v.headline} — \${v.description} — CTA: \${v.cta}\`);
      console.log(\`> _Beeld:_ \${v.visualDirection}\`);
      console.log('');
    }
  " "${CAMPAIGN_JSON}"
  echo ""
  echo "---"
  echo ""
  echo "## Landing page"
  echo ""
  node -e "
    const fs=require('fs');
    const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));
    const l = j.artifacts.landing;
    console.log(\`### Hero\`);
    console.log('');
    console.log(\`**\${l.hero.eyebrow}**  \`);
    console.log(\`# \${l.hero.headline}\`);
    console.log('');
    console.log(l.hero.subheadline);
    console.log('');
    console.log(\`> CTA: **\${l.hero.primaryCta}** · \${l.hero.secondaryCta}\`);
    console.log('');
    console.log(\`### Experience\`);
    console.log('');
    console.log(\`**\${l.experience.headline}**\`);
    console.log('');
    console.log(l.experience.body);
    console.log('');
    for (const b of l.experience.bullets) console.log(\`- \${b}\`);
    console.log('');
    console.log(\`### Testimonial\`);
    console.log('');
    console.log(\`> \\\"\${l.testimonial.quote}\\\"\`);
    console.log(\`>\`);
    console.log(\`> — **\${l.testimonial.author}**, \${l.testimonial.role}\`);
    console.log('');
    console.log(\`### Eindcall\`);
    console.log('');
    console.log(\`**\${l.cta.headline}**\`);
    console.log('');
    console.log(l.cta.body);
  " "${CAMPAIGN_JSON}"
  echo ""
  echo "---"
  echo ""
  echo "## Eindcard / brand lockup"
  echo ""
  node -e "
    const fs=require('fs');
    const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));
    const e = j.artifacts.cinematic.endCard;
    console.log(\`**\${e.headline}**\`);
    console.log('');
    console.log(\`\${e.subline}\`);
    console.log('');
    console.log(\`_Logo treatment:_ \${e.logoTreatment}\`);
    console.log('');
    console.log(\`_CTA:_ \${e.callToAction}\`);
  " "${CAMPAIGN_JSON}"
  echo ""
  echo "---"
  echo ""
  echo "## MP4 export"
  echo ""
  echo "**Pipeline:** Het door de UI gedownloade \`maison-lumiere-export-reel-9x16.sh\` is uitgevoerd met de cinematic clips uit \`render-cinematic-clips.sh\` (luxury 2-color radial gradients, slow zoom, letterbox, vignette + grain, drawtext serif title op end-card)."
  echo ""
  echo "- Script exit code: \`${SCRIPT_EXIT}\`"
  if [ -f "${OUTPUT}" ]; then
    out_size=$(stat -c '%s' "${OUTPUT}")
    echo "- Output: \`tests/showcase/maison-lumiere/exports/maison-lumiere-reel-9x16.mp4\` ($(awk -v s="${out_size}" 'BEGIN{printf "%.2f MB", s/1024/1024}'))"
  else
    echo "- ❌ Output ontbreekt"
  fi
  echo ""
  if [ "${PROBE_EXIT}" -eq 0 ]; then
    duration=$(extract "console.log(j.format.duration)")
    width=$(extract "console.log(j.streams.find(s=>s.codec_type==='video').width)")
    height=$(extract "console.log(j.streams.find(s=>s.codec_type==='video').height)")
    fps=$(extract "console.log(j.streams.find(s=>s.codec_type==='video').r_frame_rate)")
    has_audio=$(extract "console.log(!!j.streams.find(s=>s.codec_type==='audio'))")
    audio_codec=$(extract "const a=j.streams.find(s=>s.codec_type==='audio');console.log(a?a.codec_name:'none')")
    bitrate=$(extract "console.log(Math.round(j.format.bit_rate/1000)+' kbps')")

    echo "### Output verificatie (ffprobe)"
    echo ""
    echo "| Check | Verwacht | Gemeten | Status |"
    echo "|---|---|---|---|"
    res_pass="❌"; [ "${width}" = "1080" ] && [ "${height}" = "1920" ] && res_pass="✓"
    fps_pass="❌"; [ "${fps}" = "30/1" ] && fps_pass="✓"
    dur_pass="❌"; awk -v d="${duration}" 'BEGIN{exit !(d>=26 && d<=28)}' && dur_pass="✓"
    aud_pass="❌"; [ "${has_audio}" = "true" ] && aud_pass="✓"
    echo "| Resolutie | 1080×1920 | ${width}×${height} | ${res_pass} |"
    echo "| Framerate | 30 fps | ${fps} | ${fps_pass} |"
    echo "| Duration | 27s ±1s | ${duration}s | ${dur_pass} |"
    echo "| Audio | aac | ${audio_codec} | ${aud_pass} |"
    echo "| Bitrate | ~8 Mbps target | ${bitrate} | — |"
  fi
  echo ""
  echo "---"
  echo ""
  echo "## Reproduceren"
  echo ""
  echo '```bash'
  echo "# 1. Download script + campaign JSON via Playwright (UI)"
  echo "npx playwright test tests/e2e/showcase.spec.ts"
  echo ""
  echo "# 2. Render cinematic clips"
  echo "bash tests/showcase/render-cinematic-clips.sh"
  echo ""
  echo "# 3. Run assembly + ffprobe + dit rapport"
  echo "bash tests/showcase/run-showcase.sh"
  echo '```'
  echo ""
  echo "## Bestanden"
  echo ""
  echo "- \`tests/showcase/maison-lumiere-campaign.json\` — volledige campagne (alle 8 artifacts)"
  echo "- \`tests/showcase/maison-lumiere-export-reel-9x16.sh\` — gedownload assembly script"
  echo "- \`tests/showcase/maison-lumiere/clips/\` — 8 cinematic gradient clips (1080×1920 30fps)"
  echo "- \`tests/showcase/maison-lumiere/audio/\` — silent VO + music placeholders"
  echo "- \`tests/showcase/maison-lumiere/exports/maison-lumiere-reel-9x16.mp4\` — **de demo**"
} > "${SHOWCASE_MD}"

echo ""
echo "✓ Showcase compleet"
echo "  → ${OUTPUT}"
echo "  → ${SHOWCASE_MD}"
exit "${SCRIPT_EXIT}"
