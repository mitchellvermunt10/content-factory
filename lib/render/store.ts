import type { ProviderName } from "./providers";

/**
 * In-memory job store voor de Render Agent.
 *
 * Server-only. Wordt gedeeld tussen alle /api/render/jobs/* routes binnen
 * dezelfde Node.js proces-instance. Bij hot-reload of server-restart wordt
 * de Map leeggemaakt — voor dev usage acceptabel.
 *
 * Productie zou dit naar bv. Supabase / Postgres / Redis moeten verplaatsen.
 */

export interface RenderJobRecord {
  jobId: string;
  shotId: string;
  campaignSlug: string;
  provider: ProviderName;
  apiMode: "live" | "mock";
  externalId: string;
  status: "queued" | "rendering" | "ready" | "failed";
  progress: number;
  prompt: string;
  durationSec: number;
  aspectRatio: string;
  outputUrl: string | null;
  errorMessage: string | null;
  savedToPath: string | null;
  createdAt: string;
  updatedAt: string;
}

// Gebruik een globalThis-bound Map zodat de store overleeft over Next.js
// dev hot-reloads en per-route module-instances heen.
const STORE_KEY = Symbol.for("content-factory.render-jobs.v1");
type GlobalWithStore = typeof globalThis & {
  [STORE_KEY]?: Map<string, RenderJobRecord>;
};
const g = globalThis as GlobalWithStore;
if (!g[STORE_KEY]) g[STORE_KEY] = new Map();
const store: Map<string, RenderJobRecord> = g[STORE_KEY] as Map<
  string,
  RenderJobRecord
>;

export function putJob(job: RenderJobRecord): void {
  store.set(job.jobId, { ...job, updatedAt: new Date().toISOString() });
}

export function getJob(jobId: string): RenderJobRecord | undefined {
  return store.get(jobId);
}

export function patchJob(
  jobId: string,
  patch: Partial<RenderJobRecord>
): RenderJobRecord | undefined {
  const cur = store.get(jobId);
  if (!cur) return undefined;
  const next = { ...cur, ...patch, updatedAt: new Date().toISOString() };
  store.set(jobId, next);
  return next;
}

export function deleteJob(jobId: string): boolean {
  return store.delete(jobId);
}

export function listJobs(): RenderJobRecord[] {
  return Array.from(store.values());
}
