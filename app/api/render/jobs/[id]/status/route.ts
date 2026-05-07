import { NextResponse } from "next/server";
import { getJob, patchJob } from "@/lib/render/store";
import { getProvider } from "@/lib/render/providers";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = getJob(id);
  if (!job) {
    return NextResponse.json(
      {
        error:
          "Job niet gevonden. Mogelijk is de server herstart — start de render opnieuw.",
        jobId: id,
      },
      { status: 404 }
    );
  }

  // Geen verdere polling nodig als de job al klaar of failed is.
  if (job.status === "ready" || job.status === "failed") {
    return NextResponse.json({
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      outputUrl: job.outputUrl,
      error: job.errorMessage,
      provider: job.provider,
      apiMode: job.apiMode,
      shotId: job.shotId,
      campaignSlug: job.campaignSlug,
      savedToPath: job.savedToPath,
    });
  }

  // Vraag verse status op bij de provider en update de store.
  try {
    const provider = getProvider(job.provider);
    const upstream = await provider.getStatus(job.externalId);
    const next = patchJob(job.jobId, {
      status: upstream.status,
      progress: upstream.progress,
      outputUrl: upstream.outputUrl,
      errorMessage: upstream.error,
    });

    return NextResponse.json({
      jobId: id,
      status: next?.status ?? upstream.status,
      progress: next?.progress ?? upstream.progress,
      outputUrl: next?.outputUrl ?? upstream.outputUrl,
      error: next?.errorMessage ?? upstream.error,
      provider: job.provider,
      apiMode: job.apiMode,
      shotId: job.shotId,
      campaignSlug: job.campaignSlug,
      savedToPath: next?.savedToPath ?? null,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Onbekende fout bij status-poll.";
    return NextResponse.json(
      {
        jobId: id,
        status: "failed",
        progress: job.progress,
        error: message,
      },
      { status: 502 }
    );
  }
}
