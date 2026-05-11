// Stub frame-generator voor Phase 1.
// Genereert 60 SVG data-URIs die een "dolly-in" simuleren: een lichtbron
// in het midden die groeit, met kleurverloop van schemering → warm interieur.
// In Phase 2 vervangen we dit door echte Flux Pro-gegenereerde JPGs.

const FRAME_COUNT = 60;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function hex(r: number, g: number, b: number): string {
  const toHex = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Genereert één SVG-frame als data-URI.
 * Progress 0 = buiten op straat (donker, koel), 1 = binnen (warm, vol licht).
 */
function generateFrame(progress: number, index: number): string {
  // Buiten → binnen kleur-interpolatie
  const skyR = lerp(18, 36, progress);
  const skyG = lerp(20, 22, progress);
  const skyB = lerp(30, 16, progress);
  const sky = hex(skyR, skyG, skyB);

  const glowR = lerp(220, 255, progress);
  const glowG = lerp(150, 200, progress);
  const glowB = lerp(80, 110, progress);
  const glow = hex(glowR, glowG, glowB);

  // Doorway groeit met progress (push-in effect)
  const doorScale = lerp(0.15, 1.6, progress);
  const doorOpacity = lerp(0.35, 0.95, progress);

  // Facade-rechthoeken die groter worden naarmate we naderen
  const buildingScale = lerp(0.4, 2.2, progress);
  const buildingOpacity = lerp(0.6, 0.0, Math.min(1, progress * 1.4));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
  <defs>
    <radialGradient id="g${index}" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="${glow}" stop-opacity="${doorOpacity}"/>
      <stop offset="40%" stop-color="${glow}" stop-opacity="${doorOpacity * 0.35}"/>
      <stop offset="100%" stop-color="${sky}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bg${index}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${sky}"/>
      <stop offset="100%" stop-color="${hex(skyR * 0.6, skyG * 0.6, skyB * 0.6)}"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#bg${index})"/>
  <g opacity="${buildingOpacity}" transform="translate(800 450) scale(${buildingScale}) translate(-800 -450)">
    <rect x="180" y="200" width="220" height="500" fill="${hex(skyR * 1.3, skyG * 1.3, skyB * 1.3)}" opacity="0.5"/>
    <rect x="1200" y="180" width="240" height="520" fill="${hex(skyR * 1.3, skyG * 1.3, skyB * 1.3)}" opacity="0.5"/>
    <rect x="220" y="260" width="60" height="80" fill="${glow}" opacity="0.6"/>
    <rect x="320" y="320" width="60" height="80" fill="${glow}" opacity="0.4"/>
    <rect x="1240" y="240" width="60" height="80" fill="${glow}" opacity="0.5"/>
  </g>
  <ellipse cx="800" cy="450" rx="${380 * doorScale}" ry="${260 * doorScale}" fill="url(#g${index})"/>
  <circle cx="800" cy="450" r="${40 * doorScale}" fill="${glow}" opacity="${Math.min(1, progress * 1.1)}"/>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Genereert de complete frame-sequence voor v1.
 * Alle frames worden als data-URIs ingebed — geen HTTP-requests nodig.
 */
export function generateStubFrames(): string[] {
  const frames: string[] = [];
  for (let i = 0; i < FRAME_COUNT; i++) {
    const progress = i / (FRAME_COUNT - 1);
    frames.push(generateFrame(progress, i));
  }
  return frames;
}

export const STUB_FRAME_COUNT = FRAME_COUNT;
