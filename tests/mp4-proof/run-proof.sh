#!/usr/bin/env bash
# Echte end-to-end proof: van campagne → assembly script → MP4 output.
#
# 1. Genereert 8 testclips met FFmpeg matchend de mock-fixture shot-IDs/duraties
# 2. Genereert een silent VO MP3 + silent music MP3
# 3. Voert het door de UI gedownloade assembly script uit
# 4. Verifieert het resultaat met ffprobe
# 5. Schrijft PROOF.md met het volledige rapport
#
# Run vanuit projectroot:
#   bash tests/mp4-proof/run-proof.sh

set -uo pipefail   # geen -e: we willen elk fail-pad expliciet afhandelen voor het rapport

# --- Setup ------------------------------------------------------------------
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PROOF_DIR="${PROJECT_ROOT}/tests/mp4-proof"
WORK_DIR="${PROOF_DIR}/atelier-nord"
SCRIPT_PATH="${PROOF_DIR}/atelier-nord-export-reel-9x16.sh"
PROOF_MD="${PROOF_DIR}/PROOF.md"

# Prepend bundled binaries aan PATH zodat het script `ffmpeg`/`ffprobe` vindt.
export PATH="${PROJECT_ROOT}/node_modules/ffmpeg-static:${PROJECT_ROOT}/node_modules/@ffprobe-installer/win32-x64:${PATH}"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "❌ ffmpeg niet vindbaar. Installeer met: npm install --save-dev ffmpeg-static @ffprobe-installer/ffprobe"
  exit 1
fi
if ! command -v ffprobe >/dev/null 2>&1; then
  echo "❌ ffprobe niet vindbaar."
  exit 1
fi

if [ ! -f "${SCRIPT_PATH}" ]; then
  echo "❌ Geen gedownload script op ${SCRIPT_PATH}."
  echo "   Run eerst: npx playwright test tests/e2e/mp4-proof.spec.ts"
  exit 1
fi

echo "→ Werkmap: ${WORK_DIR}"
rm -rf "${WORK_DIR}"
mkdir -p "${WORK_DIR}/clips" "${WORK_DIR}/audio" "${WORK_DIR}/exports"

# --- 1. Genereer fixture clips ---------------------------------------------
# Shot-IDs + duraties komen uit mockCinematic (lib/generators/mockFixturesCinematic.ts)
# Format: filename:durationSec:colorHex
CLIPS=(
  "s01-s01-a.mp4:2:0x101030"   # stadsritme — donker blauw
  "s01-s01-b.mp4:2:0x102438"   # idem, iets lichter
  "s02-s02-a.mp4:2.5:0x4a3520" # drempel — warm bruin
  "s02-s02-b.mp4:2.5:0x6b4a2f" # idem, lichter
  "s03-s03-a.mp4:3:0x8c5a2b"   # ritueel — amber
  "s03-s03-b.mp4:4:0x9e6735"
  "s03-s03-c.mp4:5:0xb0723f"
  "s04-s04-a.mp4:6:0x1a2840"   # afsluiting — twilight blauw
)

echo "→ Genereer 8 fixture clips (1280x720, 30fps, met silent audio)..."
for entry in "${CLIPS[@]}"; do
  name="${entry%%:*}"
  rest="${entry#*:}"
  dur="${rest%%:*}"
  color="${rest##*:}"
  out="${WORK_DIR}/clips/${name}"
  ffmpeg -y -hide_banner -loglevel error \
    -f lavfi -i "color=c=${color}:s=1280x720:d=${dur}:r=30" \
    -f lavfi -i "anullsrc=channel_layout=stereo:sample_rate=44100" \
    -t "${dur}" -shortest \
    -c:v libx264 -preset ultrafast -pix_fmt yuv420p -g 60 \
    -c:a aac -b:a 128k -ar 44100 \
    "${out}" || { echo "❌ Clip ${name} faalde"; exit 2; }
done

# --- 2. Genereer voice-over (silent 27s) -----------------------------------
echo "→ Genereer silent voice-over (27s)..."
ffmpeg -y -hide_banner -loglevel error \
  -f lavfi -i "anullsrc=channel_layout=stereo:sample_rate=44100" \
  -t 27 -c:a libmp3lame -b:a 192k \
  "${WORK_DIR}/audio/vo.mp3" || { echo "❌ VO mp3 faalde"; exit 2; }

# --- 3. Genereer music track (silent 27s) ----------------------------------
echo "→ Genereer silent music (27s)..."
ffmpeg -y -hide_banner -loglevel error \
  -f lavfi -i "anullsrc=channel_layout=stereo:sample_rate=44100" \
  -t 27 -c:a libmp3lame -b:a 192k \
  "${WORK_DIR}/audio/music.mp3" || { echo "❌ Music mp3 faalde"; exit 2; }

# --- 4. Run het gedownloade script -----------------------------------------
echo "→ Run script: ${SCRIPT_PATH}"
SCRIPT_LOG="${PROOF_DIR}/script-run.log"
(
  cd "${PROOF_DIR}"
  bash "${SCRIPT_PATH}"
) >"${SCRIPT_LOG}" 2>&1
SCRIPT_EXIT=$?

# --- 5. Verifieer output ----------------------------------------------------
OUTPUT="${WORK_DIR}/exports/atelier-nord-reel-9x16.mp4"
PROBE_FILE="${PROOF_DIR}/probe.json"

if [ "${SCRIPT_EXIT}" -eq 0 ] && [ -f "${OUTPUT}" ]; then
  ffprobe -v error -print_format json -show_format -show_streams "${OUTPUT}" > "${PROBE_FILE}" 2>&1
  PROBE_EXIT=$?
else
  PROBE_EXIT=99
  echo "(script faalde, ffprobe overgeslagen)"
fi

# --- 6. Bouw PROOF.md ------------------------------------------------------
{
  echo "# MP4 Export Proof — Atelier Nord · Instagram Reel 9:16"
  echo ""
  echo "Run: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo ""
  echo "## Setup"
  echo ""
  echo "- ffmpeg: \`$(ffmpeg -version 2>&1 | head -1)\`"
  echo "- ffprobe: \`$(ffprobe -version 2>&1 | head -1)\`"
  echo "- Script gedownload door Playwright: \`tests/mp4-proof/atelier-nord-export-reel-9x16.sh\` ($(wc -c < "${SCRIPT_PATH}") bytes)"
  echo ""
  echo "## Inputs gegenereerd"
  echo ""
  echo "| Bestand | Type | Duur | Resolutie / bitrate |"
  echo "|---|---|---|---|"
  for entry in "${CLIPS[@]}"; do
    name="${entry%%:*}"
    rest="${entry#*:}"
    dur="${rest%%:*}"
    actual_size=$(stat -c '%s' "${WORK_DIR}/clips/${name}" 2>/dev/null || echo "?")
    echo "| \`${name}\` | h264 lavfi | ${dur}s | 1280×720 30fps · ${actual_size} bytes |"
  done
  vo_size=$(stat -c '%s' "${WORK_DIR}/audio/vo.mp3" 2>/dev/null || echo "?")
  music_size=$(stat -c '%s' "${WORK_DIR}/audio/music.mp3" 2>/dev/null || echo "?")
  echo "| \`vo.mp3\` | mp3 silent | 27s | 192kbps · ${vo_size} bytes |"
  echo "| \`music.mp3\` | mp3 silent | 27s | 192kbps · ${music_size} bytes |"
  echo ""
  echo "## Script execution"
  echo ""
  echo "- Exit code: \`${SCRIPT_EXIT}\`"
  echo "- Log: \`tests/mp4-proof/script-run.log\` ($(wc -l < "${SCRIPT_LOG}" 2>/dev/null || echo 0) regels)"
  echo ""
  echo "### Laatste 30 regels van de log"
  echo ""
  echo "\`\`\`"
  tail -30 "${SCRIPT_LOG}" 2>/dev/null || echo "(geen log)"
  echo "\`\`\`"
  echo ""
  echo "## Output"
  echo ""
  if [ -f "${OUTPUT}" ]; then
    out_size=$(stat -c '%s' "${OUTPUT}")
    echo "✓ **Bestaat**: \`tests/mp4-proof/atelier-nord/exports/atelier-nord-reel-9x16.mp4\` (${out_size} bytes)"
  else
    echo "❌ **Output ontbreekt**"
  fi
  echo ""
  if [ "${PROBE_EXIT}" -eq 0 ]; then
    echo "### ffprobe (json)"
    echo ""
    echo "\`\`\`json"
    cat "${PROBE_FILE}"
    echo "\`\`\`"
    echo ""

    # Extract key metrics — pass path als argv om Windows-backslash escapes te omzeilen.
    extract() {
      node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));$1" "${PROBE_FILE}"
    }
    duration=$(extract "console.log(j.format.duration)")
    width=$(extract "console.log(j.streams.find(s=>s.codec_type==='video').width)")
    height=$(extract "console.log(j.streams.find(s=>s.codec_type==='video').height)")
    fps=$(extract "console.log(j.streams.find(s=>s.codec_type==='video').r_frame_rate)")
    has_audio=$(extract "console.log(!!j.streams.find(s=>s.codec_type==='audio'))")
    audio_codec=$(extract "const a=j.streams.find(s=>s.codec_type==='audio');console.log(a?a.codec_name:'none')")

    echo "### Verificatie"
    echo ""
    echo "| Check | Verwacht | Gemeten | Status |"
    echo "|---|---|---|---|"
    res_pass="❌"; [ "${width}" = "1080" ] && [ "${height}" = "1920" ] && res_pass="✓"
    fps_pass="❌"; [ "${fps}" = "30/1" ] && fps_pass="✓"
    dur_pass="❌"; awk -v d="${duration}" 'BEGIN{exit !(d>=26 && d<=28)}' && dur_pass="✓"
    aud_pass="❌"; [ "${has_audio}" = "true" ] && aud_pass="✓"
    echo "| Resolutie | 1080×1920 | ${width}×${height} | ${res_pass} |"
    echo "| Framerate | 30/1 (30 fps) | ${fps} | ${fps_pass} |"
    echo "| Duration  | 27s ±1s | ${duration}s | ${dur_pass} |"
    echo "| Audio aanwezig | ja | ${has_audio} (${audio_codec}) | ${aud_pass} |"
  else
    echo "### ffprobe overgeslagen (script faalde of output ontbreekt)"
  fi
  echo ""
} > "${PROOF_MD}"

echo ""
echo "✓ PROOF.md geschreven naar: ${PROOF_MD}"
echo ""
exit "${SCRIPT_EXIT}"
