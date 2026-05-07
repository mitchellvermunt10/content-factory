import * as fs from "node:fs";
import * as path from "node:path";
import type {
  JobStatus,
  RenderProvider,
  SubmitJobInput,
  SubmitJobResult,
} from "./providers";

/**
 * Mock provider voor lokale dev en Playwright tests.
 *
 * Gebruikt een interne ticker om realistische progressie te emuleren
 * (queued → rendering 25/50/75 → ready) over enkele polls. Output is
 * een echte 2s lavfi-color MP4 via ffmpeg-static.
 */

interface MockState {
  createdAt: number;
  prompt: string;
  durationSec: number;
  // Hint die we gebruiken om een passende fixture-clip te kiezen.
  shotIdHint?: string;
  // Aantal getStatus polls geweest.
  pollCount: number;
}

const MOCK_STATE_KEY = Symbol.for("content-factory.render-mock-state.v1");
type GlobalWithMock = typeof globalThis & {
  [MOCK_STATE_KEY]?: Map<string, MockState>;
};
const gMock = globalThis as GlobalWithMock;
if (!gMock[MOCK_STATE_KEY]) gMock[MOCK_STATE_KEY] = new Map();
const state: Map<string, MockState> = gMock[MOCK_STATE_KEY] as Map<
  string,
  MockState
>;

/**
 * Mock provider hergebruikt bestaande gerenderde fixture clips uit
 * tests/showcase/maison-lumiere/clips/ als output. Dat zijn echte 1080×1920
 * 30fps cinematic gradient MP4's die in de showcase-build zijn aangemaakt
 * — perfect voor end-to-end testen zonder tijdens runtime ffmpeg te draaien.
 */

function pickFixtureClipForShot(shotId: string): string {
  const fixtureDir = path.resolve(
    process.cwd(),
    "tests/showcase/maison-lumiere/clips"
  );
  // Fixtures hebben 'dubbele' shot-IDs, bv. s01-s01-a.mp4. Match op trailing '-a'.
  if (fs.existsSync(fixtureDir)) {
    const files = fs.readdirSync(fixtureDir).filter((f) => f.endsWith(".mp4"));
    // Eerste keuze: file die eindigt op de exacte shot-id.
    const exact = files.find((f) => f.endsWith(`-${shotId}.mp4`));
    if (exact) return path.join(fixtureDir, exact);
    // Fallback: eerste fixture beschikbaar.
    if (files.length > 0) return path.join(fixtureDir, files[0]);
  }
  return "";
}

function getMockOutputPath(externalId: string): string {
  const out = path.resolve(
    process.cwd(),
    ".next",
    "mock-render-cache",
    `${externalId}.mp4`
  );
  fs.mkdirSync(path.dirname(out), { recursive: true });
  return out;
}

function ensureMockClip(
  externalId: string,
  shotIdHint?: string
): string {
  const out = getMockOutputPath(externalId);
  if (fs.existsSync(out) && fs.statSync(out).size > 1024) return out;

  const fixture = shotIdHint ? pickFixtureClipForShot(shotIdHint) : "";
  if (fixture && fs.existsSync(fixture)) {
    fs.copyFileSync(fixture, out);
    return out;
  }
  // Geen fixture → schrijf een minimale placeholder zodat downstream code
  // niet crasht. Er is dan geen showcase-fixture aanwezig.
  fs.writeFileSync(out, Buffer.from([0]));
  return out;
}

export const mockProvider: RenderProvider = {
  name: "mock",

  async submitJob(input: SubmitJobInput): Promise<SubmitJobResult> {
    const externalId = `mock_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    // Eerste 60 chars van de prompt mogen helpen om een fixture te kiezen,
    // maar belangrijker: caller (API route) geeft ook de shotId mee — die zit
    // nu echter NIET in SubmitJobInput. Hint laten leeg; ensureMockClip
    // valt terug op de eerste fixture.
    state.set(externalId, {
      createdAt: Date.now(),
      prompt: input.prompt,
      durationSec: input.durationSec,
      shotIdHint: input.shotIdHint,
      pollCount: 0,
    });
    return { externalId };
  },

  async getStatus(externalId: string): Promise<JobStatus> {
    const s = state.get(externalId);
    if (!s) {
      return {
        status: "failed",
        progress: 0,
        outputUrl: null,
        error: `Mock job ${externalId} niet gevonden (server is herstart).`,
      };
    }
    s.pollCount += 1;
    // Progressie-curve: poll 1 → 25, poll 2 → 60, poll 3+ → ready
    if (s.pollCount === 1) {
      return { status: "rendering", progress: 25, outputUrl: null, error: null };
    }
    if (s.pollCount === 2) {
      return { status: "rendering", progress: 60, outputUrl: null, error: null };
    }
    // Klaar: kopieer fixture clip naar mock-cache en sluit met outputUrl.
    const clipPath = ensureMockClip(externalId, s.shotIdHint);
    return {
      status: "ready",
      progress: 100,
      outputUrl: `mock-file://${clipPath}`,
      error: null,
    };
  },

  async downloadOutput(externalId: string, outputUrl: string): Promise<Buffer> {
    let filePath = outputUrl.replace(/^mock-file:\/\//, "");
    if (!filePath || !fs.existsSync(filePath)) {
      const s = state.get(externalId);
      filePath = ensureMockClip(externalId, s?.shotIdHint);
    }
    return fs.readFileSync(filePath);
  },
};
