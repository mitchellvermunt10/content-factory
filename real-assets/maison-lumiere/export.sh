#!/usr/bin/env bash
# Build de final 9:16 reel uit AI-gegenereerde clips.
#
# Vereist: clips/s01-a.mp4 ... s04-a.mp4 + audio/vo.mp3 + audio/music.mp3
# Run vanuit deze folder:
#     bash export.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
PROJECT="$(cd "$ROOT/../.." && pwd)"

# FFmpeg + ffprobe binaries (npm ffmpeg-static + @ffprobe-installer)
export PATH="$PROJECT/node_modules/ffmpeg-static:$PROJECT/node_modules/@ffprobe-installer/win32-x64:$PATH"

cd "$ROOT"

# 1. Verify
bash verify.sh

mkdir -p exports

# 2. Concat-lijst
cat > clips.txt <<'EOF'
file 'clips/s01-a.mp4'
file 'clips/s01-b.mp4'
file 'clips/s02-a.mp4'
file 'clips/s02-b.mp4'
file 'clips/s03-a.mp4'
file 'clips/s03-b.mp4'
file 'clips/s03-c.mp4'
file 'clips/s04-a.mp4'
EOF

echo "→ Stap 1/5: concat 8 clips..."
ffmpeg -y -hide_banner -loglevel error \
  -f concat -safe 0 -i clips.txt -c copy master-raw.mp4

echo "→ Stap 2/5: voice-over toevoegen..."
ffmpeg -y -hide_banner -loglevel error \
  -i master-raw.mp4 -i audio/vo.mp3 \
  -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 192k -shortest \
  master-vo.mp4

echo "→ Stap 3/5: muziek mengen met side-chain ducking..."
ffmpeg -y -hide_banner -loglevel error \
  -i master-vo.mp4 -i audio/music.mp3 \
  -filter_complex "[1:a]volume=0.45,sidechaincompress=threshold=0.05:ratio=8:attack=20:release=400[duck]; \
                   [0:a][duck]amix=inputs=2:duration=first:dropout_transition=2[aout]" \
  -map 0:v -map "[aout]" \
  -c:v copy -c:a aac -b:a 192k \
  master-mix.mp4

echo "→ Stap 4/5: encode naar 1080×1920 30fps 8 Mbps..."
ffmpeg -y -hide_banner -loglevel error \
  -i master-mix.mp4 \
  -vf "crop='if(gt(iw/ih,1080/1920),ih*1080/1920,iw)':'if(gt(iw/ih,1080/1920),ih,iw*1920/1080)',scale=1080:1920,setsar=1" \
  -r 30 \
  -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p \
  -b:v 8M -maxrate 8M \
  -c:a aac -b:a 192k -ac 2 \
  -movflags +faststart \
  exports/maison-lumiere-reel-9x16.mp4

echo "→ Stap 5/5: ffprobe quality-check..."
ffprobe -v error \
  -show_entries stream=codec_type,codec_name,width,height,r_frame_rate,duration \
  -show_entries format=duration,bit_rate,size \
  -of default=noprint_wrappers=1 \
  exports/maison-lumiere-reel-9x16.mp4

echo ""
echo "✓ Klaar: exports/maison-lumiere-reel-9x16.mp4"
echo "  Open met:  start exports/maison-lumiere-reel-9x16.mp4   (Windows)"
echo "             open exports/maison-lumiere-reel-9x16.mp4    (macOS)"
