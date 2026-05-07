#!/usr/bin/env bash
# Pre-flight check voor real showcase export.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

EXPECTED_CLIPS=(
  "clips/s01-a.mp4"
  "clips/s01-b.mp4"
  "clips/s02-a.mp4"
  "clips/s02-b.mp4"
  "clips/s03-a.mp4"
  "clips/s03-b.mp4"
  "clips/s03-c.mp4"
  "clips/s04-a.mp4"
)
EXPECTED_AUDIO=(
  "audio/vo.mp3"
  "audio/music.mp3"
)
RECOMMENDED_STILLS=(
  "stills/s01-a.png"
  "stills/s01-b.png"
  "stills/s02-a.png"
  "stills/s02-b.png"
  "stills/s03-a.png"
  "stills/s03-b.png"
  "stills/s03-c.png"
  "stills/s04-a.png"
)

missing_required=()
missing_recommended=()

for f in "${EXPECTED_CLIPS[@]}" "${EXPECTED_AUDIO[@]}"; do
  if [ ! -f "$f" ]; then missing_required+=("$f"); fi
done
for f in "${RECOMMENDED_STILLS[@]}"; do
  if [ ! -f "$f" ]; then missing_recommended+=("$f"); fi
done

echo "→ Real showcase pre-flight"
echo ""

if [ ${#missing_required[@]} -eq 0 ]; then
  echo "✓ Alle 8 clips + VO + muziek aanwezig — klaar om te exporteren."
else
  echo "❌ Ontbrekende REQUIRED bestanden (export.sh zal falen):"
  printf '   - %s\n' "${missing_required[@]}"
fi
echo ""

if [ ${#missing_recommended[@]} -eq 0 ]; then
  echo "✓ Alle 8 first-frame stills aanwezig (optioneel maar aanbevolen)"
else
  echo "ⓘ Ontbrekende stills (optioneel — alleen nodig als je nog clips moet renderen):"
  printf '   - %s\n' "${missing_recommended[@]}"
fi
echo ""

if [ ${#missing_required[@]} -gt 0 ]; then exit 1; fi
exit 0
