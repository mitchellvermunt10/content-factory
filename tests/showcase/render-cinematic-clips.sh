#!/usr/bin/env bash
# Cinematic art-direction layer voor de showcase MP4.
#
# Vervangt platte lavfi-color clips met visueel deliberate shots:
#   - animated 2-color gradients per shot (luxury palette)
#   - slow scale ramp (mimics dolly-in/dolly-out)
#   - letterbox via crop+pad (cinemascope feel binnen 9:16)
#   - vignette + film grain
#   - subtle eq color grade
#   - drawtext title cards on key shots in Georgia (system serif)
#
# Output: 8 MP4 clips matchend de mockCinematic shot-IDs/duraties.

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WORK_DIR="${1:-${PROJECT_ROOT}/tests/showcase/maison-lumiere}"
CLIPS_DIR="${WORK_DIR}/clips"
FONTS_DIR="${PROJECT_ROOT}/tests/showcase/.fonts"

export PATH="${PROJECT_ROOT}/node_modules/ffmpeg-static:${PROJECT_ROOT}/node_modules/@ffprobe-installer/win32-x64:${PATH}"

mkdir -p "${CLIPS_DIR}" "${FONTS_DIR}"

# Kopieer system serif font naar lokale folder om Windows-pad escapes in
# drawtext te voorkomen.
SERIF_SRC="/c/Windows/Fonts/georgia.ttf"
SERIF_BOLD_SRC="/c/Windows/Fonts/georgiab.ttf"
SERIF_LOCAL="${FONTS_DIR}/serif.ttf"
SERIF_BOLD_LOCAL="${FONTS_DIR}/serif-bold.ttf"

if [ ! -f "${SERIF_LOCAL}" ]; then
  if [ -f "${SERIF_SRC}" ]; then
    cp "${SERIF_SRC}" "${SERIF_LOCAL}"
  else
    echo "❌ ${SERIF_SRC} niet gevonden — heb je Georgia op het systeem?"
    exit 1
  fi
fi
if [ ! -f "${SERIF_BOLD_LOCAL}" ]; then
  cp "${SERIF_BOLD_SRC}" "${SERIF_BOLD_LOCAL}" 2>/dev/null || cp "${SERIF_SRC}" "${SERIF_BOLD_LOCAL}"
fi

# Resolutie source (groter dan 1080x1920 zodat reframe in pipeline ruimte heeft).
W=1080
H=1920
FPS=30

# Common chain: vignette + grain + mild color grade.
# Letterbox = 220px black bars top/bottom (cinemascope ~ 21:9 binnen 9:16).
LB_TOP=220
LB_BOT=220

base_filter() {
  local time_offset="${1:-0}"
  echo "format=yuv420p,vignette=PI/4,noise=alls=8:allf=t,eq=contrast=1.08:brightness=-0.02:saturation=1.05,drawbox=y=0:w=iw:h=${LB_TOP}:color=black:t=fill,drawbox=y=ih-${LB_BOT}:w=iw:h=${LB_BOT}:color=black:t=fill"
}

# Gradient + slow scale + base chain
make_gradient_clip() {
  local out="$1"
  local dur="$2"
  local c0="$3"        # first gradient color
  local c1="$4"        # second gradient color
  local zoom_dir="$5"  # "in" or "out"
  local title="${6:-}" # optional title text
  local subtitle="${7:-}"

  local zoom_expr
  if [ "${zoom_dir}" = "in" ]; then
    zoom_expr="zoom='1.0+0.06*t/${dur}':d=1:s=${W}x${H}:fps=${FPS}"
  else
    zoom_expr="zoom='1.06-0.06*t/${dur}':d=1:s=${W}x${H}:fps=${FPS}"
  fi

  local title_drawtext=""
  if [ -n "${title}" ]; then
    # Fade in 0.4s, hold, fade out last 0.6s
    local fade_out_start
    fade_out_start=$(awk "BEGIN{printf \"%.2f\", ${dur} - 0.8}")
    title_drawtext=",drawtext=fontfile='serif.ttf':text='${title}':fontsize=64:fontcolor=white@0.95:x=(w-text_w)/2:y=h*0.5-text_h/2:alpha='if(lt(t,0.4),t/0.4,if(lt(t,${fade_out_start}),1,if(lt(t,${dur}),(${dur}-t)/0.6,0)))'"
    if [ -n "${subtitle}" ]; then
      title_drawtext+=",drawtext=fontfile='serif.ttf':text='${subtitle}':fontsize=24:fontcolor=white@0.7:x=(w-text_w)/2:y=h*0.5+50:alpha='if(lt(t,0.7),t/0.7-0.3,if(lt(t,${fade_out_start}),1,if(lt(t,${dur}),(${dur}-t)/0.6,0)))'"
    fi
  fi

  ffmpeg -y -hide_banner -loglevel error \
    -f lavfi -i "gradients=size=${W}x${H}:duration=${dur}:speed=0.012:nb_colors=2:c0=${c0}:c1=${c1}:type=radial:rate=${FPS}" \
    -f lavfi -i "anullsrc=channel_layout=stereo:sample_rate=44100" \
    -t "${dur}" -shortest \
    -filter_complex "[0:v]$(base_filter)${title_drawtext}[v]" \
    -map "[v]" -map 1:a \
    -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -g $((FPS*2)) \
    -c:a aac -b:a 128k -ar 44100 \
    -cd "${CLIPS_DIR}/$(basename "${out}")" "${out}" 2>/dev/null || \
  ffmpeg -y -hide_banner -loglevel error \
    -f lavfi -i "gradients=size=${W}x${H}:duration=${dur}:speed=0.012:nb_colors=2:c0=${c0}:c1=${c1}:type=radial:rate=${FPS}" \
    -f lavfi -i "anullsrc=channel_layout=stereo:sample_rate=44100" \
    -t "${dur}" -shortest \
    -filter_complex "[0:v]$(base_filter)${title_drawtext}[v]" \
    -map "[v]" -map 1:a \
    -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -g $((FPS*2)) \
    -c:a aac -b:a 128k -ar 44100 \
    "${out}"
}

# Run vanaf de fonts dir zodat 'serif.ttf' relatief resolveerbaar is.
cd "${FONTS_DIR}"

echo "→ Render 8 cinematic clips naar ${CLIPS_DIR}/"

# s01-a — Het stadsritme (2s) — koel asfaltgrijs / neon-blauw, slight zoom-in
make_gradient_clip "${CLIPS_DIR}/s01-s01-a.mp4" 2 "0x141a26" "0x2a3a55" "in" "" ""

# s01-b — Notificaties close-up (2s) — koud blauw / zwart
make_gradient_clip "${CLIPS_DIR}/s01-s01-b.mp4" 2 "0x0e1828" "0x2050a0" "in" "" ""

# s02-a — Drempel (2.5s) — warm/koud split via gradient
make_gradient_clip "${CLIPS_DIR}/s02-s02-a.mp4" 2.5 "0x162030" "0x6a3818" "in" "" ""

# s02-b — Diepe ademteug portret (2.5s) — diep amber, slow zoom-in
make_gradient_clip "${CLIPS_DIR}/s02-s02-b.mp4" 2.5 "0x1a0e08" "0x8a4a20" "in" "" ""

# s03-a — Water op steen (3s) — donker met warme rim
make_gradient_clip "${CLIPS_DIR}/s03-s03-a.mp4" 3 "0x080404" "0x6e4a1e" "in" "" ""

# s03-b — Hands at work (4s) — fluwelig amber + halation
make_gradient_clip "${CLIPS_DIR}/s03-s03-b.mp4" 4 "0x2a1608" "0xb87838" "in" "" ""

# s03-c — Profielportret halve glimlach (5s) — warm soft, dolly-in feel
make_gradient_clip "${CLIPS_DIR}/s03-s03-c.mp4" 5 "0x1f1410" "0x9a6a3a" "in" "" ""

# s04-a — Twilight wide met end-card titel (6s) — twilight blauw → goud
# DIT is de hero shot; zet hier een Maison Lumière titel bovenop.
make_gradient_clip "${CLIPS_DIR}/s04-s04-a.mp4" 6 "0x10192e" "0x8a7048" "out" "Maison Lumière" "Op afspraak · Amsterdam"

echo "✓ 8 cinematic clips gerendered"
