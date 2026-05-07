#!/usr/bin/env bash
set -euo pipefail

# Export — Atelier Nord · Instagram Reel · 9:16
# 1080×1920 · 30fps · 8M · libx264
# Gegenereerd: 2026-05-07T08:50:29.537Z

# === Asset summary ===
# Clips:  0 via curl, 0 lokaal, 8 ontbreekt
# VO:     ontbreekt
# Muziek: zelf aanleveren
# Werkmap: ./atelier-nord/

mkdir -p atelier-nord/clips atelier-nord/audio atelier-nord/exports

# === Stap 01: Video clips ophalen ===
# ⚠ ONTBREEKT: s01-s01-a.mp4 — upload nog niet geleverd. Plaats handmatig in atelier-nord/clips/s01-s01-a.mp4
# ⚠ ONTBREEKT: s01-s01-b.mp4 — upload nog niet geleverd. Plaats handmatig in atelier-nord/clips/s01-s01-b.mp4
# ⚠ ONTBREEKT: s02-s02-a.mp4 — upload nog niet geleverd. Plaats handmatig in atelier-nord/clips/s02-s02-a.mp4
# ⚠ ONTBREEKT: s02-s02-b.mp4 — upload nog niet geleverd. Plaats handmatig in atelier-nord/clips/s02-s02-b.mp4
# ⚠ ONTBREEKT: s03-s03-a.mp4 — upload nog niet geleverd. Plaats handmatig in atelier-nord/clips/s03-s03-a.mp4
# ⚠ ONTBREEKT: s03-s03-b.mp4 — upload nog niet geleverd. Plaats handmatig in atelier-nord/clips/s03-s03-b.mp4
# ⚠ ONTBREEKT: s03-s03-c.mp4 — upload nog niet geleverd. Plaats handmatig in atelier-nord/clips/s03-s03-c.mp4
# ⚠ ONTBREEKT: s04-s04-a.mp4 — upload nog niet geleverd. Plaats handmatig in atelier-nord/clips/s04-s04-a.mp4

# === Stap 02: Voice-over MP3 ===
# ⚠ Geen voice-over URL. Genereer eerst de VO in de Voice-over tab en download als atelier-nord/audio/vo.mp3.

# === Stap 03: Muziek (zelf voorzien) ===
# Plaats je eigen gelicenseerde track als ./atelier-nord/audio/music.mp3
# Suggestie: Slow ambient piano in C-mineur. Geen drum tot 0:18 — daarna één diepe sub-bass swell die uitsterft op 0:24. Stilte is een instrument.

# === Stap 04: Concat-lijst ===
cat > atelier-nord/clips.txt <<'EOF'
file 'clips/s01-s01-a.mp4'
file 'clips/s01-s01-b.mp4'
file 'clips/s02-s02-a.mp4'
file 'clips/s02-s02-b.mp4'
file 'clips/s03-s03-a.mp4'
file 'clips/s03-s03-b.mp4'
file 'clips/s03-s03-c.mp4'
file 'clips/s04-s04-a.mp4'
EOF

# === Stap 05: Clips concatenaten (lossless) ===
ffmpeg -y -f concat -safe 0 -i atelier-nord/clips.txt -c copy atelier-nord/master-raw.mp4

# === Stap 06: Voice-over toevoegen ===
ffmpeg -y -i atelier-nord/master-raw.mp4 -i atelier-nord/audio/vo.mp3 \
  -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 192k -shortest \
  atelier-nord/master-vo.mp4

# === Stap 07: Muziek mengen met VO (side-chain ducking) ===
ffmpeg -y -i atelier-nord/master-vo.mp4 -i atelier-nord/audio/music.mp3 \
  -filter_complex "[1:a]volume=0.45,sidechaincompress=threshold=0.05:ratio=8:attack=20:release=400[duck]; \
                   [0:a][duck]amix=inputs=2:duration=first:dropout_transition=2[aout]" \
  -map 0:v -map "[aout]" \
  -c:v copy -c:a aac -b:a 192k \
  atelier-nord/master-mix.mp4

# === Stap 08: Encode naar Instagram Reel · 9:16 ===
ffmpeg -y -i atelier-nord/master-mix.mp4 \
  -vf "crop='if(gt(iw/ih,1080/1920),ih*1080/1920,iw)':'if(gt(iw/ih,1080/1920),ih,iw*1920/1080)',scale=1080:1920,setsar=1" -r 30 \
  -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p \
  -b:v 8M -maxrate 8M \
  -c:a aac -b:a 192k -ac 2 \
  -movflags +faststart \
  atelier-nord/exports/atelier-nord-reel-9x16.mp4

# === Stap 09: Quality check ===
ffprobe -v error -show_entries stream=width,height,r_frame_rate,duration \
  -of default=noprint_wrappers=1 atelier-nord/exports/atelier-nord-reel-9x16.mp4

echo "✓ Klaar: atelier-nord/exports/atelier-nord-reel-9x16.mp4"
