# Maison Lumière — Real Showcase Workflow

> Van 8 AI-gegenereerde clips naar één 27-seconden cinematic Reel.
> Geen UI, geen platform-magie meer — pure productie-pipeline.

## Het concept

**Een ritueel van licht, stilte en vakmanschap. Maison Lumière maakt ruimte voor wat haast verdrijft.**

- **Pillar:** Op afspraak. Voor één persoon. Voor één moment.
- **Mood:** Bedachtzaam, sensueel, statig — Aesop ontmoet Wong Kar-wai.
- **References:** Wong Kar-wai · Sofia Coppola · Hermès campaigns
- **Music:** Slow ambient piano in C-mineur. Geen drum tot 0:18 — daarna één diepe sub-bass swell die uitsterft op 0:24. Stilte is een instrument.
- **Master cut:** 27s · 1080×1920 · 30fps

## Mapstructuur

```
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
```

## Werkstroom — 6 stappen

### 1. Stills genereren (Midjourney of Firefly) · ~30 min

Voor elke shot een first-frame still. Deze still wordt straks de start-frame
voor het video-model — dat is de #1 manier om consistente cinematografie
te krijgen.

```
Open prompts/midjourney/s01-a.txt
→ kopieer de Midjourney prompt
→ genereer 4 variaties
→ kies de winner
→ download als 9:16 PNG
→ bewaar als stills/s01-a.png
```

Herhaal voor alle 8 shots: `s01-a, s01-b, s02-a, s02-b, s03-a, s03-b, s03-c, s04-a`.

**Tip:** Genereer eerst ALLE 8 stills voordat je naar video gaat. Pas dan zie
je of het kleurpalet en de lighting consistent doorlopen tussen scenes. Reroll
de outliers.

### 2. Video clips genereren · ~2-4 uur

Per shot een specifieke provider — zie [SHOTLIST.md](SHOTLIST.md):

- **4 shots in Runway Gen-3 Alpha** (`prompts/runway/*.txt`)
- **2 shots in Kling 1.6 Pro** (`prompts/kling/*.txt`)
- **2 shots in Veo 3** (`prompts/veo/*.txt`)

Per shot:
```
1. Open prompts/<provider>/<shot-id>.txt
2. Upload stills/<shot-id>.png als first frame
3. Plak de FINAL PROMPT
4. Plak de NEGATIVE PROMPT (in providers die het ondersteunen)
5. Stel de SETTINGS in zoals beschreven
6. Render. Reroll als nodig — meestal heb je 2-3 attempts nodig.
7. Download MP4.
8. Bewaar als clips/<shot-id>.mp4 (let op: gebruik s01-a.mp4, NIET s01-s01-a.mp4)
```

**Belangrijk over duraties:** elke provider produceert clips van vaste lengte
(5s of 10s). De edit knipt op exacte duur. Bij Veo zet je explicit `Generate
audio: NO` aan — je krijgt anders dubbel audio.

### 3. Voice-over · ~10 min

Schrijf het volledige script in ElevenLabs (Multilingual v2, Anouk NL of Sjoerd
NL voor luxe register). De timing is opgenomen in `prompts/voice-over.txt`.

```
Open ElevenLabs Studio
→ paste script (of gebruik prompts/voice-over.txt)
→ kies stem: Anouk (NL) voor luxueus / klinisch
→ stability 0.55, similarity 0.75, style 0.35
→ generate
→ download als WAV (192k+) of MP3
→ bewaar als audio/vo.mp3
```

### 4. Muziek · zelf voorzien

Plaats je eigen gelicenseerde track als `audio/music.mp3`. **Music direction
uit het concept:**

> Slow ambient piano in C-mineur. Geen drum tot 0:18 — daarna één diepe sub-bass swell die uitsterft op 0:24. Stilte is een instrument.

Suggesties: Artlist, Musicbed, Epidemic Sound — zoek op "ambient piano sub-bass
swell" of "Ólafur Arnalds-style".

### 5. Verify · 5 sec

```bash
bash verify.sh
```

Print groen als alle 8 clips, 8 stills (optioneel) en beide audio-bestanden
op de juiste plek staan. Print rood + lijst met ontbrekende files als dat niet
zo is.

### 6. Export · ~30 sec

```bash
bash export.sh
```

Doet:

1. Concat 8 clips lossless → `master-raw.mp4`
2. Voice-over toevoegen → `master-vo.mp4`
3. Muziek mengen met side-chain ducking → `master-mix.mp4`
4. Reframe naar exact 1080×1920 + encode H.264 8 Mbps → `exports/maison-lumiere-reel-9x16.mp4`
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

- **Headline**: Maison Lumière
- **Subline**: Beautysalon · Amsterdam
- **CTA**: Op afspraak
- **Logo treatment**: Wordmark verschijnt in soft-glow over fade-to-black. Opacity 0→100 over 1.4s, lichte chromatic aberration.

> Tip: render het end-card apart in After Effects met een echt logo en mux het
> erin via een aparte ffmpeg-stap, OF laat `s04-a.mp4` over de wordmark heen
> dissolven.

## Troubleshooting

**`export.sh` faalt met "Impossible to open"**
→ Check of clip-bestandsnamen exact `s01-a.mp4` zijn (niet `s01-s01-a.mp4`).

**Video flikkert tussen clips**
→ Concat demuxer requires identical codec/fps/resolution. Re-encode alle clips
naar h264 1080×1920 30fps met `ffmpeg -i in.mp4 -c:v libx264 -r 30 -s 1080:1920 out.mp4`
voordat je export.sh draait.

**Audio is uit sync**
→ Lengte van `vo.mp3` moet ≥ 27s zijn. Check met `ffprobe audio/vo.mp3`.

**Output ziet er "fake" uit**
→ Hoogstwaarschijnlijk: stills te synthetisch. Genereer stills opnieuw met de
Firefly-variant (vaak meer photorealistisch) of voeg `real photograph`,
`shot on Arri Alexa`, `fine grain` toe aan de prompt.

## Reproduceren

```bash
# Bouw dit pakket opnieuw vanuit campaign JSON
node tests/showcase/build-real-package.mjs
```

---

_Pakket gegenereerd: 2026-05-06T15:13:36.358Z_
_Bron: tests/showcase/maison-lumiere-campaign.json_
