// Extract frames uit MP4 met ffmpeg-static. Werkt lokaal (npm run dev),
// NIET in serverless Vercel-runtime (geen ffmpeg binary daar). Pipeline is:
// genereer-lokaal → frames in /public → commit → push → Vercel CDN serveert.

import { promises as fs } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

/**
 * Geeft het pad naar de gebundelde ffmpeg binary terug, of gooit
 * een nette fout als ffmpeg-static niet geïnstalleerd is.
 */
async function ffmpegPath(): Promise<string> {
  try {
    // ffmpeg-static heeft een default-export string met het binary path
    const mod = (await import("ffmpeg-static")) as unknown as {
      default?: string;
    };
    const p = mod.default;
    if (!p) {
      throw new Error("ffmpeg-static gaf geen pad — npm install --include=optional");
    }
    return p;
  } catch (err) {
    throw new Error(
      `ffmpeg-static niet beschikbaar: ${
        err instanceof Error ? err.message : "unknown"
      }. Run: npm install --include=optional`
    );
  }
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

interface ExtractInput {
  /** Pad naar de input MP4 op disk */
  videoPath: string;
  /** Doel-directory voor frames (wordt aangemaakt) */
  outDir: string;
  /** Frame-rate (frames per seconde) — default 20 voor web-balans */
  fps?: number;
  /** Optioneel: max breedte in pixels (scale-down). Default 1920. */
  maxWidth?: number;
  /** Quality flag voor JPG: 1 (best) - 31 (worst). Default 6. */
  quality?: number;
}

interface ExtractResult {
  frameCount: number;
  /** Pubieke URL-prefix voor de frames (relatief vanaf /public) */
  publicPrefix: string;
  /** Absolute disk paths */
  framePaths: string[];
}

/**
 * Extraheer frames met ffmpeg-static. Output: frame_0001.jpg, frame_0002.jpg, ...
 * Returns frame count en paths.
 */
export async function extractFrames(input: ExtractInput): Promise<ExtractResult> {
  const fps = input.fps ?? 20;
  const maxWidth = input.maxWidth ?? 1920;
  const quality = input.quality ?? 6;

  const ffmpeg = await ffmpegPath();
  await ensureDir(input.outDir);

  // Verwijder eventuele oude frames in deze map (idempotent re-runs)
  const existing = await fs.readdir(input.outDir).catch(() => [] as string[]);
  await Promise.all(
    existing
      .filter((f) => /^frame_\d+\.jpg$/.test(f))
      .map((f) => fs.unlink(path.join(input.outDir, f)))
  );

  // ffmpeg args:
  // -i input.mp4
  // -vf "fps=20,scale=1920:-2"   (-2 keeps aspect, rounds to even)
  // -q:v 6                       (JPG quality, 1=best 31=worst)
  // frame_%04d.jpg
  const outPattern = path.join(input.outDir, "frame_%04d.jpg");
  const args = [
    "-y", // overwrite
    "-i",
    input.videoPath,
    "-vf",
    `fps=${fps},scale='min(${maxWidth},iw)':-2`,
    "-q:v",
    String(quality),
    outPattern,
  ];

  await new Promise<void>((resolve, reject) => {
    const proc = spawn(ffmpeg, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    proc.on("error", (err) => reject(err));
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else
        reject(
          new Error(
            `ffmpeg exit-code ${code}: ${stderr.split("\n").slice(-5).join("\n")}`
          )
        );
    });
  });

  const files = (await fs.readdir(input.outDir))
    .filter((f) => /^frame_\d+\.jpg$/.test(f))
    .sort();
  const framePaths = files.map((f) => path.join(input.outDir, f));

  // Bereken de publicPrefix relatief vanaf public/
  const publicRoot = path.join(process.cwd(), "public");
  const rel = path.relative(publicRoot, input.outDir).replace(/\\/g, "/");
  const publicPrefix = `/${rel}`;

  return { frameCount: files.length, publicPrefix, framePaths };
}

/**
 * Download een MP4 URL naar disk en geef het lokale pad terug.
 */
export async function downloadMp4ToTemp(
  url: string,
  destPath: string
): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download van Kling MP4 faalde (HTTP ${res.status})`);
  }
  await ensureDir(path.dirname(destPath));
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(destPath, buf);
}

/**
 * Schrijf een manifest.json zodat de page-loader weet welke frames bestaan
 * en in welke volgorde. Vermijdt fs.readdir vanaf de Vercel-pagina.
 */
export interface FrameManifest {
  scene: string;
  fps: number;
  frameCount: number;
  publicPrefix: string;
  generatedAt: string;
  prompt?: string;
}

export async function writeManifest(
  manifestPath: string,
  manifest: FrameManifest
): Promise<void> {
  await ensureDir(path.dirname(manifestPath));
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
}

export async function readManifestSafe(
  manifestPath: string
): Promise<FrameManifest | null> {
  try {
    const txt = await fs.readFile(manifestPath, "utf-8");
    return JSON.parse(txt) as FrameManifest;
  } catch {
    return null;
  }
}
