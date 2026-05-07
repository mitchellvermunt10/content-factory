// Genereert de client-facing real-assets/maison-lumiere/ folder uit
// tests/showcase/maison-lumiere-campaign.json — één final prompt per shot,
// Nederlandse visuele brief, provider settings, asset-checklist, export.sh.
//
// Run:  node tests/showcase/build-real-package.mjs

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CAMPAIGN_JSON = path.join(
  ROOT,
  "tests/showcase/maison-lumiere-campaign.json"
);
const OUT = path.join(ROOT, "real-assets/maison-lumiere");

// ---- Provider toewijzing per shot ----
// Keuze gebaseerd op waar elk model uitblinkt:
//   Runway Gen-3 Alpha  → motion blur, crowd, deliberate motion, exteriors
//   Kling 1.6 Pro       → precieze micro-motion, liquid sims, statische frames
//   Veo 3               → photoreal portretten, subtiele micro-expressies
const PROVIDER_BY_SHOT = {
  "s01-a": {
    provider: "runway",
    model: "Gen-3 Alpha",
    why: "Sterk in crowd-motion blur en organische tracking-camera.",
    settings: { duration: "tot 5s, knip naar 2s in edit" },
  },
  "s01-b": {
    provider: "runway",
    model: "Gen-3 Alpha",
    why: "Quick close-ups met scherm-content; whip-pan wordt overgenomen via motion brush.",
    settings: { duration: "tot 5s, knip naar 2s in edit" },
  },
  "s02-a": {
    provider: "kling",
    model: "1.6 Pro",
    why: "Precieze micro-motion (hand opent deur) zonder warping van architectuur.",
    settings: { duration: "5s native, knip naar 2.5s" },
  },
  "s02-b": {
    provider: "veo",
    model: "Veo 3",
    why: "Photoreal close-up portret met subtiele ademhaling en oogbewegingen.",
    settings: { duration: "tot 8s, knip naar 2.5s" },
  },
  "s03-a": {
    provider: "kling",
    model: "1.6 Pro",
    why: "Beste optie voor realistische water-physics en macro slow-mo.",
    settings: { duration: "5s native met slow-mo, knip naar 3s" },
  },
  "s03-b": {
    provider: "runway",
    model: "Gen-3 Alpha",
    why: "Bedachtzame deliberate hand-motion in warm tungsten.",
    settings: { duration: "tot 5s, knip naar 4s in edit" },
  },
  "s03-c": {
    provider: "veo",
    model: "Veo 3",
    why: "Subtiele facial micro-expressies (halve glimlach, ademteug) zonder uncanny valley.",
    settings: { duration: "tot 8s, knip naar 5s" },
  },
  "s04-a": {
    provider: "runway",
    model: "Gen-3 Alpha Turbo",
    why: "Langere takes (10s) — nodig voor de 6s twilight dolly-out exterior.",
    settings: { duration: "10s native, knip naar 6s" },
  },
};

const NEGATIVE_GLOBAL = `no AI plastic skin, no morphing limbs, no extra fingers, no warped architecture, no oversaturation, no obvious CGI, no children, no logos or text overlays unless specified, no synthetic gloss, no horror elements, no zoom artifacts, no flickering`;

const FRAMING_NL = {
  "extreme-wide": "Extreem wijde shot",
  wide: "Wijde shot",
  "medium-wide": "Medium-wide shot",
  medium: "Medium shot",
  "medium-close": "Medium close-up",
  "close-up": "Close-up",
  "extreme-close-up": "Extreme close-up macro",
  "top-down": "Top-down",
  "low-angle": "Low-angle",
  "high-angle": "High-angle",
  "over-shoulder": "Over-the-shoulder",
};

const CAMERA_NL = {
  static: "statisch",
  pan: "pan",
  tilt: "tilt",
  "dolly-in": "dolly-in (camera nadert het onderwerp)",
  "dolly-out": "dolly-out (camera trekt terug)",
  truck: "truck (camera schuift zijwaarts)",
  "zoom-in": "zoom-in",
  "zoom-out": "zoom-out",
  "whip-pan": "whip-pan (snelle horizontale beweging)",
  crane: "crane (verticale beweging)",
  handheld: "handheld (subtiel)",
  tracking: "tracking (camera volgt onderwerp)",
  orbit: "orbit (camera draait om onderwerp)",
};

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}
function write(p, content) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content);
}

function visualBriefNL(scene, shot) {
  const frame = FRAMING_NL[shot.framing] ?? shot.framing;
  const move = CAMERA_NL[shot.cameraMovement] ?? shot.cameraMovement;
  return `${frame}, ${move}.

**Onderwerp:** ${shot.subject}.

**Wat er gebeurt:** ${shot.action}

**Belichting:** ${shot.lighting}
**Kleurnotitie:** ${shot.colorNote}
**Lens:** ${shot.lens}

Sfeer: bedachtzaam tempo, naturalistische beweging, geen synthetische gloss, fijne 35mm grain. Mood-referentie: Wong Kar-wai × Aesop × Hermès editorial.`;
}

function providerSettings(cfg, shot) {
  const lines = [];
  if (cfg.provider === "runway") {
    lines.push(`- **Model:** Runway ${cfg.model}`);
    lines.push(`- **Native duration:** ${cfg.settings.duration}`);
    lines.push(`- **Resolution:** 1080×1920 (Upscale aan)`);
    lines.push(
      `- **Image-to-video:** YES — gebruik \`stills/${shot.id}.png\` als first frame`
    );
    lines.push(
      `- **Camera control:** Motion brush voor "${shot.cameraMovement}" beweging`
    );
    lines.push(`- **Style preset:** Cinematic`);
    lines.push(`- **Seed:** vrij eerst; fix daarna voor reruns`);
    lines.push(`- **Reden voor deze keuze:** ${cfg.why}`);
  } else if (cfg.provider === "kling") {
    lines.push(`- **Model:** Kling ${cfg.model}`);
    lines.push(`- **Native duration:** ${cfg.settings.duration}`);
    lines.push(`- **Aspect:** 9:16`);
    lines.push(
      `- **Image-to-video:** YES — gebruik \`stills/${shot.id}.png\` als start frame`
    );
    lines.push(
      `- **Camera:** "${shot.cameraMovement}" via Motion Brush of laat statisch`
    );
    lines.push(`- **Quality:** "High Quality" modus (niet Standard)`);
    lines.push(`- **Reden voor deze keuze:** ${cfg.why}`);
  } else {
    // veo
    lines.push(`- **Model:** ${cfg.model} (via Vertex AI Studio of Gemini app)`);
    lines.push(`- **Native duration:** ${cfg.settings.duration}`);
    lines.push(`- **Aspect:** 9:16`);
    lines.push(
      `- **Image-to-video:** YES — gebruik \`stills/${shot.id}.png\` als first frame`
    );
    lines.push(
      `- **Generate audio:** **NO** — wij mixen onze eigen VO + muziek. Anders krijg je dubbel-audio.`
    );
    lines.push(`- **Quality:** Cinematic`);
    lines.push(`- **Reden voor deze keuze:** ${cfg.why}`);
  }
  return lines.join("\n");
}

function buildShotPrompt(scene, shot) {
  const cfg = PROVIDER_BY_SHOT[shot.id];
  const filename = `${shot.id}.mp4`;
  return `# Shot ${shot.id} — ${scene.title}
# Provider: ${cfg.provider.toUpperCase()} ${cfg.model}
# Output bestand: clips/${filename}
# Scene: ${scene.id} (${scene.intent}) · Shot duur: ${shot.durationSec}s

# ============================================================
# FINAL PROMPT — paste this into ${cfg.provider.toUpperCase()}
# ============================================================

${shot.videoPrompt}

# ============================================================
# NEGATIVE PROMPT
# ============================================================

${NEGATIVE_GLOBAL}

# ============================================================
# SETTINGS
# ============================================================

${providerSettings(cfg, shot)}

# ============================================================
# VISUELE BRIEF (Nederlands)
# ============================================================

${visualBriefNL(scene, shot)}

# ============================================================
# STYLE CONSISTENCY
# ============================================================

- First frame still: stills/${shot.id}.png (genereer eerst in Midjourney via prompts/midjourney/${shot.id}.txt)
- Color palette van scene ${scene.id}: ${scene.colorPalette}
- Lighting van scene ${scene.id}: ${scene.lighting}
- Sound design ondersteunt: ${scene.soundDesign}
- Mood-referentie consistent door alle 8 shots: Aesop × Wong Kar-wai × Hermès campaign × Apple iPhone-launch
`;
}

function buildStillPrompt(scene, shot) {
  return `# Still ${shot.id} — first frame voor ${scene.title}
# Bestand: stills/${shot.id}.png
# Tool: Midjourney v6 OF Adobe Firefly
# Aspect: 9:16

# === MIDJOURNEY PROMPT ===

${shot.imagePrompt}

# === FIREFLY ALTERNATIEF (geen --ar tags, kies 9:16 in UI) ===

${shot.imagePrompt
  .replace(/--ar \S+/g, "")
  .replace(/--style \S+/g, "")
  .replace(/--v \d+/g, "")
  .trim()}

# === NEGATIVE / DO NOT INCLUDE ===

${NEGATIVE_GLOBAL}

# === GEBRUIK ===

Genereer 4-6 variaties. Kies de still die het meest matcht met:
- Belichting: ${shot.lighting}
- Kleurnotitie: ${shot.colorNote}
- Onderwerp: ${shot.subject}

Bewaar als 9:16 PNG (1080×1920 of hoger). Gebruik daarna als first-frame
in ${PROVIDER_BY_SHOT[shot.id].provider.toUpperCase()} voor clip ${shot.id}.mp4.
`;
}

function buildShotList(allShots) {
  const lines = [];
  lines.push("# Shotlist — Maison Lumière");
  lines.push("");
  lines.push(
    "Volledige rij van 8 shots, 27 seconden master cut. Klik op een shot voor de bijbehorende prompt."
  );
  lines.push("");
  lines.push(
    "| # | Scene | Shot | Framing | Camera | Duur | Provider | Prompt | First-frame still |"
  );
  lines.push("|---|---|---|---|---|---|---|---|---|");
  let cumul = 0;
  for (const { scene, shot, cfg } of allShots) {
    const start = cumul.toFixed(1).padStart(4, "0");
    cumul += shot.durationSec;
    const tc = `${start}s → ${cumul.toFixed(1)}s`;
    lines.push(
      `| ${shot.id} | ${scene.id} ${scene.title} | \`${shot.subject.slice(0, 30)}…\` | ${shot.framing} | ${shot.cameraMovement} | ${shot.durationSec}s · ${tc} | **${cfg.provider}** ${cfg.model} | [\`prompts/${cfg.provider}/${shot.id}.txt\`](prompts/${cfg.provider}/${shot.id}.txt) | [\`prompts/midjourney/${shot.id}.txt\`](prompts/midjourney/${shot.id}.txt) |`
    );
  }
  lines.push("");
  lines.push("## Provider verdeling");
  const counts = { runway: 0, kling: 0, veo: 0 };
  for (const { cfg } of allShots) counts[cfg.provider]++;
  lines.push("");
  lines.push(
    `- **Runway** ${counts.runway} clips · **Kling** ${counts.kling} clips · **Veo** ${counts.veo} clips`
  );
  lines.push("");
  return lines.join("\n");
}

function buildReadme(campaign, allShots) {
  const c = campaign.artifacts.cinematic;
  const total = allShots.reduce((acc, s) => acc + s.shot.durationSec, 0);
  return `# Maison Lumière — Real Showcase Workflow

> Van 8 AI-gegenereerde clips naar één 27-seconden cinematic Reel.
> Geen UI, geen platform-magie meer — pure productie-pipeline.

## Het concept

**${c.concept.logline}**

- **Pillar:** ${c.concept.brandPillar}
- **Mood:** ${c.concept.mood}
- **References:** ${c.concept.referenceFilm}
- **Music:** ${c.concept.musicDirection}
- **Master cut:** ${total}s · 1080×1920 · 30fps

## Mapstructuur

\`\`\`
real-assets/maison-lumiere/
├── README_REAL_SHOWCASE.md   ← je leest het nu
├── SHOTLIST.md               ← snelle referentie van alle 8 shots
├── verify.sh                 ← check dat alle assets aanwezig zijn
├── export.sh                 ← bouw final MP4 in één command
├── prompts/
│   ├── runway/               ← Runway-prompts (4 shots)
│   ├── kling/                ← Kling-prompts (2 shots)
│   ├── veo/                  ← Veo-prompts (2 shots)
│   └── midjourney/           ← First-frame stills (8 stills)
├── stills/                   ← drop hier 8 PNGs uit Midjourney/Firefly
├── clips/                    ← drop hier 8 MP4s uit Runway/Kling/Veo
├── audio/                    ← drop hier vo.mp3 + music.mp3
└── exports/                  ← final MP4 landt hier na export.sh
\`\`\`

## Werkstroom — 6 stappen

### 1. Stills genereren (Midjourney of Firefly) · ~30 min

Voor elke shot een first-frame still. Deze still wordt straks de start-frame
voor het video-model — dat is de #1 manier om consistente cinematografie
te krijgen.

\`\`\`
Open prompts/midjourney/s01-a.txt
→ kopieer de Midjourney prompt
→ genereer 4 variaties
→ kies de winner
→ download als 9:16 PNG
→ bewaar als stills/s01-a.png
\`\`\`

Herhaal voor alle 8 shots: \`s01-a, s01-b, s02-a, s02-b, s03-a, s03-b, s03-c, s04-a\`.

**Tip:** Genereer eerst ALLE 8 stills voordat je naar video gaat. Pas dan zie
je of het kleurpalet en de lighting consistent doorlopen tussen scenes. Reroll
de outliers.

### 2. Video clips genereren · ~2-4 uur

Per shot een specifieke provider — zie [SHOTLIST.md](SHOTLIST.md):

- **4 shots in Runway Gen-3 Alpha** (\`prompts/runway/*.txt\`)
- **2 shots in Kling 1.6 Pro** (\`prompts/kling/*.txt\`)
- **2 shots in Veo 3** (\`prompts/veo/*.txt\`)

Per shot:
\`\`\`
1. Open prompts/<provider>/<shot-id>.txt
2. Upload stills/<shot-id>.png als first frame
3. Plak de FINAL PROMPT
4. Plak de NEGATIVE PROMPT (in providers die het ondersteunen)
5. Stel de SETTINGS in zoals beschreven
6. Render. Reroll als nodig — meestal heb je 2-3 attempts nodig.
7. Download MP4.
8. Bewaar als clips/<shot-id>.mp4 (let op: gebruik s01-a.mp4, NIET s01-s01-a.mp4)
\`\`\`

**Belangrijk over duraties:** elke provider produceert clips van vaste lengte
(5s of 10s). De edit knipt op exacte duur. Bij Veo zet je explicit \`Generate
audio: NO\` aan — je krijgt anders dubbel audio.

### 3. Voice-over · ~10 min

Schrijf het volledige script in ElevenLabs (Multilingual v2, Anouk NL of Sjoerd
NL voor luxe register). De timing is opgenomen in \`prompts/voice-over.txt\`.

\`\`\`
Open ElevenLabs Studio
→ paste script (of gebruik prompts/voice-over.txt)
→ kies stem: Anouk (NL) voor luxueus / klinisch
→ stability 0.55, similarity 0.75, style 0.35
→ generate
→ download als WAV (192k+) of MP3
→ bewaar als audio/vo.mp3
\`\`\`

### 4. Muziek · zelf voorzien

Plaats je eigen gelicenseerde track als \`audio/music.mp3\`. **Music direction
uit het concept:**

> ${c.concept.musicDirection}

Suggesties: Artlist, Musicbed, Epidemic Sound — zoek op "ambient piano sub-bass
swell" of "Ólafur Arnalds-style".

### 5. Verify · 5 sec

\`\`\`bash
bash verify.sh
\`\`\`

Print groen als alle 8 clips, 8 stills (optioneel) en beide audio-bestanden
op de juiste plek staan. Print rood + lijst met ontbrekende files als dat niet
zo is.

### 6. Export · ~30 sec

\`\`\`bash
bash export.sh
\`\`\`

Doet:

1. Concat 8 clips lossless → \`master-raw.mp4\`
2. Voice-over toevoegen → \`master-vo.mp4\`
3. Muziek mengen met side-chain ducking → \`master-mix.mp4\`
4. Reframe naar exact 1080×1920 + encode H.264 8 Mbps → \`exports/maison-lumiere-reel-9x16.mp4\`
5. ffprobe QC: resolutie, fps, duration, audio-stream

## Provider tips

### Runway Gen-3 Alpha (4 shots)

- **Lock je seed** zodra je een goede take hebt — voor reruns gebruik exact dezelfde seed met kleine prompt-tweaks
- **Motion brush** is cruciaal voor camera-movement: tracking, dolly, whip-pan
- **Image-to-video** geeft 3× meer controle dan text-to-video. Altijd starten met je still.
- Knip de output altijd 0.3-0.5s in en uit — eerste/laatste frames zijn vaak instabiel

### Kling 1.6 Pro (2 shots)

- "High Quality"-mode is verplicht voor luxury werk. Standard ziet er goedkoop uit.
- Bij water/liquid: laat de duration native (5s) en knip in edit
- Camera-control sliders eerst op 0 zetten, dan handmatig per richting verhogen
- Schrijf prompts in Engels, beschrijvend, niet directief ("a hand pours water" niet "show a hand pouring")

### Veo 3 (2 shots)

- **Generate audio: NO** — anders dubbel audio in je edit
- Photoreal portretten: schrijf de leeftijd, etniciteit en kledingstijl expliciet
- Veo is sterk in subtiele facial micro-expressies — gebruik 'm voor close-ups
- Output is nu 720p; upscale via Topaz Video AI (of Runway Upscaler) naar 1080×1920

## Style consistency — borg de "rode draad"

| Element | Doel |
|---|---|
| **Color script** | Koel grijs (s01) → warm/koud split (s02) → diep amber (s03) → twilight blauw + goud (s04) |
| **Lensing** | 24mm wide voor stad, 35mm voor architectuur, 85mm voor portret, 100mm macro voor detail |
| **Grading** | Kodak 2383 emulation in post (DaVinci Resolve LUT) |
| **Grain** | 35mm fine grain in alle clips — voeg toe in post als provider 't niet doet |
| **Letterbox** | Cinemascope 21:9 binnen 9:16 (220px black bars) — voeg toe in edit, niet in render |

## Audio

- **VO**: ElevenLabs Multilingual v2, Anouk NL of Sjoerd NL
- **Muziek**: ambient piano + sub-bass swell op 0:18, uitsterving 0:24
- **SFX**: room tone, lichte voetstappen, waterdruppels — uit een SFX-library

## Eindcard

- **Headline**: ${c.endCard.headline}
- **Subline**: ${c.endCard.subline}
- **CTA**: ${c.endCard.callToAction}
- **Logo treatment**: ${c.endCard.logoTreatment}

> Tip: render het end-card apart in After Effects met een echt logo en mux het
> erin via een aparte ffmpeg-stap, OF laat \`s04-a.mp4\` over de wordmark heen
> dissolven.

## Troubleshooting

**\`export.sh\` faalt met "Impossible to open"**
→ Check of clip-bestandsnamen exact \`s01-a.mp4\` zijn (niet \`s01-s01-a.mp4\`).

**Video flikkert tussen clips**
→ Concat demuxer requires identical codec/fps/resolution. Re-encode alle clips
naar h264 1080×1920 30fps met \`ffmpeg -i in.mp4 -c:v libx264 -r 30 -s 1080:1920 out.mp4\`
voordat je export.sh draait.

**Audio is uit sync**
→ Lengte van \`vo.mp3\` moet ≥ 27s zijn. Check met \`ffprobe audio/vo.mp3\`.

**Output ziet er "fake" uit**
→ Hoogstwaarschijnlijk: stills te synthetisch. Genereer stills opnieuw met de
Firefly-variant (vaak meer photorealistisch) of voeg \`real photograph\`,
\`shot on Arri Alexa\`, \`fine grain\` toe aan de prompt.

## Reproduceren

\`\`\`bash
# Bouw dit pakket opnieuw vanuit campaign JSON
node tests/showcase/build-real-package.mjs
\`\`\`

---

_Pakket gegenereerd: ${new Date().toISOString()}_
_Bron: tests/showcase/maison-lumiere-campaign.json_
`;
}

function buildVoiceOverScript(allShots, c) {
  const lines = [];
  lines.push("# Voice-over script — Maison Lumière");
  lines.push("");
  lines.push("Volledig script met timecodes — paste in ElevenLabs Studio.");
  lines.push("");
  lines.push("## Aanbevolen instellingen");
  lines.push("");
  lines.push("- **Model**: eleven_multilingual_v2");
  lines.push("- **Stem**: Anouk (NL) — luxueus, vrouwelijk, fluisterzacht");
  lines.push("- **Stability**: 0.55");
  lines.push("- **Similarity**: 0.75");
  lines.push("- **Style exaggeration**: 0.35");
  lines.push("- **Speaker boost**: AAN");
  lines.push("");
  lines.push("## Script");
  lines.push("");
  let cumul = 0;
  for (const scene of c.scenes) {
    const tc = `${Math.floor(cumul / 60)
      .toString()
      .padStart(2, "0")}:${Math.floor(cumul % 60)
      .toString()
      .padStart(2, "0")}`;
    if (scene.voiceOver.text.trim()) {
      lines.push(`### [${tc}] ${scene.id} · ${scene.title}`);
      lines.push("");
      lines.push(`> "${scene.voiceOver.text}"`);
      lines.push("");
      lines.push(`_Delivery:_ ${scene.voiceOver.deliveryDirection}`);
      lines.push("");
    }
    cumul += scene.durationSec;
  }
  // suppress unused warning
  void allShots;
  return lines.join("\n");
}

function buildVerifySh() {
  return `#!/usr/bin/env bash
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

for f in "\${EXPECTED_CLIPS[@]}" "\${EXPECTED_AUDIO[@]}"; do
  if [ ! -f "$f" ]; then missing_required+=("$f"); fi
done
for f in "\${RECOMMENDED_STILLS[@]}"; do
  if [ ! -f "$f" ]; then missing_recommended+=("$f"); fi
done

echo "→ Real showcase pre-flight"
echo ""

if [ \${#missing_required[@]} -eq 0 ]; then
  echo "✓ Alle 8 clips + VO + muziek aanwezig — klaar om te exporteren."
else
  echo "❌ Ontbrekende REQUIRED bestanden (export.sh zal falen):"
  printf '   - %s\\n' "\${missing_required[@]}"
fi
echo ""

if [ \${#missing_recommended[@]} -eq 0 ]; then
  echo "✓ Alle 8 first-frame stills aanwezig (optioneel maar aanbevolen)"
else
  echo "ⓘ Ontbrekende stills (optioneel — alleen nodig als je nog clips moet renderen):"
  printf '   - %s\\n' "\${missing_recommended[@]}"
fi
echo ""

if [ \${#missing_required[@]} -gt 0 ]; then exit 1; fi
exit 0
`;
}

function buildExportSh() {
  return `#!/usr/bin/env bash
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
ffmpeg -y -hide_banner -loglevel error \\
  -f concat -safe 0 -i clips.txt -c copy master-raw.mp4

echo "→ Stap 2/5: voice-over toevoegen..."
ffmpeg -y -hide_banner -loglevel error \\
  -i master-raw.mp4 -i audio/vo.mp3 \\
  -map 0:v:0 -map 1:a:0 \\
  -c:v copy -c:a aac -b:a 192k -shortest \\
  master-vo.mp4

echo "→ Stap 3/5: muziek mengen met side-chain ducking..."
ffmpeg -y -hide_banner -loglevel error \\
  -i master-vo.mp4 -i audio/music.mp3 \\
  -filter_complex "[1:a]volume=0.45,sidechaincompress=threshold=0.05:ratio=8:attack=20:release=400[duck]; \\
                   [0:a][duck]amix=inputs=2:duration=first:dropout_transition=2[aout]" \\
  -map 0:v -map "[aout]" \\
  -c:v copy -c:a aac -b:a 192k \\
  master-mix.mp4

echo "→ Stap 4/5: encode naar 1080×1920 30fps 8 Mbps..."
ffmpeg -y -hide_banner -loglevel error \\
  -i master-mix.mp4 \\
  -vf "crop='if(gt(iw/ih,1080/1920),ih*1080/1920,iw)':'if(gt(iw/ih,1080/1920),ih,iw*1920/1080)',scale=1080:1920,setsar=1" \\
  -r 30 \\
  -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p \\
  -b:v 8M -maxrate 8M \\
  -c:a aac -b:a 192k -ac 2 \\
  -movflags +faststart \\
  exports/maison-lumiere-reel-9x16.mp4

echo "→ Stap 5/5: ffprobe quality-check..."
ffprobe -v error \\
  -show_entries stream=codec_type,codec_name,width,height,r_frame_rate,duration \\
  -show_entries format=duration,bit_rate,size \\
  -of default=noprint_wrappers=1 \\
  exports/maison-lumiere-reel-9x16.mp4

echo ""
echo "✓ Klaar: exports/maison-lumiere-reel-9x16.mp4"
echo "  Open met:  start exports/maison-lumiere-reel-9x16.mp4   (Windows)"
echo "             open exports/maison-lumiere-reel-9x16.mp4    (macOS)"
`;
}

// ---- Run ----

const campaign = JSON.parse(fs.readFileSync(CAMPAIGN_JSON, "utf8"));
const cinematic = campaign.artifacts.cinematic;

// Reset OUT
fs.rmSync(OUT, { recursive: true, force: true });
ensureDir(path.join(OUT, "clips"));
ensureDir(path.join(OUT, "stills"));
ensureDir(path.join(OUT, "audio"));
ensureDir(path.join(OUT, "exports"));
ensureDir(path.join(OUT, "prompts/runway"));
ensureDir(path.join(OUT, "prompts/kling"));
ensureDir(path.join(OUT, "prompts/veo"));
ensureDir(path.join(OUT, "prompts/midjourney"));

// .gitkeep met instructie
write(
  path.join(OUT, "clips/.gitkeep"),
  "# Plaats hier de 8 AI-gegenereerde MP4 clips.\n# Verwacht: s01-a.mp4, s01-b.mp4, s02-a.mp4, s02-b.mp4, s03-a.mp4, s03-b.mp4, s03-c.mp4, s04-a.mp4\n"
);
write(
  path.join(OUT, "stills/.gitkeep"),
  "# Plaats hier de 8 first-frame stills (PNG, 9:16) uit Midjourney/Firefly.\n# Verwacht: s01-a.png, s01-b.png, s02-a.png, s02-b.png, s03-a.png, s03-b.png, s03-c.png, s04-a.png\n"
);
write(
  path.join(OUT, "audio/.gitkeep"),
  "# Plaats hier:\n#   vo.mp3     — ElevenLabs voice-over (≥27s)\n#   music.mp3  — jouw gelicenseerde muziekspoor (≥27s)\n"
);
write(
  path.join(OUT, "exports/.gitkeep"),
  "# Final MP4 landt hier na export.sh\n"
);

// Per-shot prompts
const allShots = [];
for (const scene of cinematic.scenes) {
  for (const shot of scene.shots) {
    const cfg = PROVIDER_BY_SHOT[shot.id];
    if (!cfg) {
      console.warn(`Geen provider mapping voor ${shot.id} — overgeslagen`);
      continue;
    }
    allShots.push({ scene, shot, cfg });
    write(
      path.join(OUT, `prompts/${cfg.provider}/${shot.id}.txt`),
      buildShotPrompt(scene, shot)
    );
    write(
      path.join(OUT, `prompts/midjourney/${shot.id}.txt`),
      buildStillPrompt(scene, shot)
    );
  }
}

write(
  path.join(OUT, "prompts/voice-over.md"),
  buildVoiceOverScript(allShots, cinematic)
);

// Top-level docs
write(path.join(OUT, "SHOTLIST.md"), buildShotList(allShots));
write(path.join(OUT, "README_REAL_SHOWCASE.md"), buildReadme(campaign, allShots));

// Scripts
const exportSh = path.join(OUT, "export.sh");
const verifySh = path.join(OUT, "verify.sh");
write(exportSh, buildExportSh());
write(verifySh, buildVerifySh());
fs.chmodSync(exportSh, 0o755);
fs.chmodSync(verifySh, 0o755);

// Summary
console.log(`✓ Real showcase pakket gebouwd op: ${OUT}`);
console.log(`  ${allShots.length} shots verdeeld over:`);
const counts = { runway: 0, kling: 0, veo: 0 };
for (const { cfg } of allShots) counts[cfg.provider]++;
console.log(
  `    runway: ${counts.runway} · kling: ${counts.kling} · veo: ${counts.veo}`
);
console.log("");
console.log(`Volgende stappen:`);
console.log(
  `  1. Lees real-assets/maison-lumiere/README_REAL_SHOWCASE.md`
);
console.log(`  2. Genereer stills via prompts/midjourney/*.txt`);
console.log(`  3. Genereer clips via prompts/{runway,kling,veo}/*.txt`);
console.log(`  4. Run: bash real-assets/maison-lumiere/verify.sh`);
console.log(`  5. Run: bash real-assets/maison-lumiere/export.sh`);
