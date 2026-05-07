"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Cpu,
  Sparkles,
  Download,
  AlertTriangle,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusDot } from "@/components/cinematic/StatusDot";
import { ProgressBar } from "@/components/cinematic/ProgressBar";
import { relativeTime, slugify } from "@/lib/utils";
import type { RenderJob } from "@/lib/schemas/artifacts/videoProduction";

const PROVIDER_COLORS: Record<RenderJob["provider"], string> = {
  runway: "#5B7CFA",
  kling: "#FF6A3D",
  veo: "#3DD68C",
};

export function RenderQueue({
  queue,
  onUpdate,
  campaignName,
}: {
  queue: RenderJob[];
  onUpdate: (next: RenderJob[]) => void;
  campaignName: string;
}) {
  const [simulating, setSimulating] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const queueRef = useRef(queue);
  queueRef.current = queue;
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  // Client-side simulator (offline demo) — alleen actief voor jobs ZONDER externalId.
  useEffect(() => {
    if (!simulating) return;
    const id = setInterval(() => {
      const next = queueRef.current.map((j) => {
        if (j.externalId) return j; // managed by API polling
        if (j.status === "rendering") {
          const progress = Math.min(100, j.progress + 6);
          if (progress >= 100) {
            return {
              ...j,
              progress: 100,
              status: "ready" as const,
              finishedAt: new Date().toISOString(),
              outputUrl:
                j.outputUrl ??
                `https://placeholder.${
                  j.provider === "runway"
                    ? "runway.ml"
                    : j.provider === "kling"
                    ? "klingai.com"
                    : "deepmind.google"
                }/clips/${j.id}.mp4`,
            };
          }
          return { ...j, progress };
        }
        return j;
      });
      onUpdateRef.current(next);
    }, 600);
    return () => clearInterval(id);
  }, [simulating]);

  // API polling — voor elke job met externalId + status rendering/queued.
  useEffect(() => {
    const active = queue.filter(
      (j) =>
        j.externalId &&
        (j.status === "rendering" || j.status === "queued")
    );
    if (active.length === 0) return;

    const interval = setInterval(async () => {
      let next = [...queueRef.current];
      let changed = false;

      for (const job of active) {
        try {
          const res = await fetch(`/api/render/jobs/${job.id}/status`);
          if (!res.ok) continue;
          const update = (await res.json()) as {
            status: RenderJob["status"];
            progress: number;
            outputUrl: string | null;
            error: string | null;
          };
          const idx = next.findIndex((j) => j.id === job.id);
          if (idx < 0) continue;
          const cur = next[idx];
          const finishedAt =
            update.status === "ready" || update.status === "failed"
              ? cur.finishedAt ?? new Date().toISOString()
              : cur.finishedAt;
          next[idx] = {
            ...cur,
            status: update.status,
            progress: update.progress ?? cur.progress,
            outputUrl: update.outputUrl ?? cur.outputUrl,
            errorMessage: update.error ?? cur.errorMessage,
            finishedAt,
          };
          changed = true;
        } catch {
          // ignore — volgende poll probeert opnieuw
        }
      }
      if (changed) onUpdateRef.current(next);
    }, 2000);

    return () => clearInterval(interval);
  }, [queue]);

  function startNext() {
    const idx = queue.findIndex((j) => j.status === "queued");
    if (idx < 0) return;
    const next = queue.map((j, i) =>
      i === idx
        ? {
            ...j,
            status: "rendering" as const,
            startedAt: new Date().toISOString(),
            progress: 4,
          }
        : j
    );
    onUpdate(next);
  }

  function reset(jobId: string) {
    onUpdate(
      queue.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: "queued" as const,
              progress: 0,
              startedAt: null,
              finishedAt: null,
              outputUrl: null,
              externalId: null,
              apiMode: null,
              errorMessage: null,
              savedToPath: null,
            }
          : j
      )
    );
  }

  async function renderViaApi(jobId: string) {
    const job = queue.find((j) => j.id === jobId);
    if (!job) return;
    setSubmitting(jobId);

    try {
      const res = await fetch("/api/render/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          shotId: job.shotId,
          campaignSlug: slugify(campaignName) || "campaign",
          provider: job.provider,
          prompt: job.prompt,
          durationSec: job.durationSec,
          aspectRatio: "9:16",
          useLocalStill: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as {
        externalId: string;
        apiMode: "live" | "mock";
      };

      onUpdate(
        queueRef.current.map((j) =>
          j.id === jobId
            ? {
                ...j,
                status: "rendering" as const,
                progress: 5,
                startedAt: new Date().toISOString(),
                finishedAt: null,
                outputUrl: null,
                externalId: data.externalId,
                apiMode: data.apiMode,
                errorMessage: null,
                savedToPath: null,
              }
            : j
        )
      );

      toast.success("Render gestart", {
        description:
          data.apiMode === "live"
            ? `Job ${job.shotId} draait nu via Runway API`
            : `Mock-render voor ${job.shotId} (geen API key)`,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Onbekende fout bij submit.";
      onUpdate(
        queueRef.current.map((j) =>
          j.id === jobId
            ? { ...j, status: "failed" as const, errorMessage: message }
            : j
        )
      );
      toast.error("Render starten mislukt", { description: message });
    } finally {
      setSubmitting(null);
    }
  }

  async function downloadToClips(jobId: string) {
    const job = queue.find((j) => j.id === jobId);
    if (!job) return;
    setDownloading(jobId);
    try {
      const res = await fetch(`/api/render/jobs/${jobId}/download`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { savedToPath: string; bytes: number };
      onUpdate(
        queueRef.current.map((j) =>
          j.id === jobId ? { ...j, savedToPath: data.savedToPath } : j
        )
      );
      toast.success("Clip opgeslagen", {
        description: `${data.savedToPath} (${(data.bytes / 1024 / 1024).toFixed(2)} MB)`,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Onbekende fout bij download.";
      toast.error("Download mislukt", { description: message });
    } finally {
      setDownloading(null);
    }
  }

  const totalDur = queue.reduce((acc, j) => acc + j.durationSec, 0);
  const ready = queue.filter((j) => j.status === "ready").length;
  const saved = queue.filter((j) => !!j.savedToPath).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Cpu className="size-4 text-accent" />
          Render queue
          <Badge variant="outline" className="ml-2">
            {ready}/{queue.length} klaar · {saved} opgeslagen · {totalDur}s totaal
          </Badge>
        </CardTitle>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={startNext}
            data-testid="render-queue-start"
            title="Markeer eerstvolgende queued job als 'rendering' (offline simulatie, geen API)"
          >
            <Play className="size-3.5" /> Start volgende
          </Button>
          <Button
            size="sm"
            variant={simulating ? "primary" : "secondary"}
            onClick={() => setSimulating((s) => !s)}
            data-testid="render-queue-simulate"
            title={
              simulating
                ? "Pauzeer de offline simulatie"
                : "Offline demo: laat lokale 'rendering' jobs progresseren naar 'ready'"
            }
          >
            {simulating ? (
              <>
                <Pause className="size-3.5" /> Pauzeer
              </>
            ) : (
              <>
                <Play className="size-3.5" /> Simuleer (offline)
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {queue.map((job, i) => (
            <motion.li
              key={job.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              data-testid={`render-job-${job.shotId}`}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-xl border border-border bg-bg/40 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <StatusDot status={job.status} />
                <span
                  className="rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]"
                  style={{
                    color: PROVIDER_COLORS[job.provider],
                    borderColor: `${PROVIDER_COLORS[job.provider]}40`,
                    background: `${PROVIDER_COLORS[job.provider]}10`,
                  }}
                >
                  {job.provider}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                  {job.sceneId} · {job.shotId}
                </span>
                {job.apiMode ? (
                  <Badge
                    variant={job.apiMode === "live" ? "success" : "warning"}
                    className="ml-1"
                  >
                    {job.apiMode === "live" ? "API live" : "API mock"}
                  </Badge>
                ) : null}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <ProgressBar
                    value={job.progress}
                    className="flex-1"
                    shimmer={job.status === "rendering"}
                    variant={
                      job.status === "ready"
                        ? "success"
                        : job.status === "failed"
                        ? "danger"
                        : "accent"
                    }
                  />
                  <span className="w-9 text-right font-mono text-[10px] tabular-nums text-text-muted">
                    {job.progress}%
                  </span>
                </div>
                {job.errorMessage ? (
                  <p
                    className="mt-1 flex items-start gap-1.5 truncate text-xs text-danger"
                    data-testid={`render-job-${job.shotId}-error`}
                  >
                    <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                    {job.errorMessage}
                  </p>
                ) : (
                  <p className="mt-1 truncate text-xs text-text-muted">
                    {job.savedToPath ? (
                      <span className="text-success">
                        ✓ {job.savedToPath}
                      </span>
                    ) : (
                      job.prompt
                    )}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="font-mono text-[10px] tabular-nums text-text-muted">
                    {job.durationSec.toFixed(1)}s
                  </span>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-subtle">
                    {job.startedAt
                      ? `gestart ${relativeTime(job.startedAt)}`
                      : "wacht"}
                  </p>
                </div>

                {job.status === "ready" && !job.savedToPath ? (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => downloadToClips(job.id)}
                    disabled={downloading === job.id}
                    data-testid={`render-job-${job.shotId}-download`}
                    title="Download de gerenderde clip naar real-assets/<slug>/clips/"
                  >
                    <Download className="size-3.5" />
                    {downloading === job.id ? "Opslaan…" : "→ clips/"}
                  </Button>
                ) : job.savedToPath ? (
                  <Badge variant="success">
                    <Check className="size-3" /> Opgeslagen
                  </Badge>
                ) : job.status === "failed" ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => renderViaApi(job.id)}
                    disabled={submitting === job.id}
                    data-testid={`render-job-${job.shotId}-retry`}
                    title="Opnieuw proberen via API"
                  >
                    <RotateCcw className="size-3.5" />
                    Retry
                  </Button>
                ) : !job.externalId ? (
                  <Button
                    size="sm"
                    variant="accent"
                    onClick={() => renderViaApi(job.id)}
                    disabled={submitting === job.id}
                    data-testid={`render-job-${job.shotId}-api`}
                    title="Submit deze shot naar de Render Agent (Runway API of mock)"
                  >
                    <Sparkles className="size-3.5" />
                    {submitting === job.id ? "Submit…" : "Render via API"}
                  </Button>
                ) : null}

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => reset(job.id)}
                  aria-label="Reset job"
                  className="size-8"
                  title="Reset deze job naar 'queued'"
                >
                  <RotateCcw className="size-3.5" />
                </Button>
              </div>
            </motion.li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
