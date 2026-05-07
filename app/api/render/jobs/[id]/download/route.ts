import { NextResponse } from "next/server";
import * as fs from "node:fs";
import * as path from "node:path";
import { getJob, patchJob } from "@/lib/render/store";
import { getProvider } from "@/lib/render/providers";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = getJob(id);
  if (!job) {
    return NextResponse.json(
      { error: "Job niet gevonden." },
      { status: 404 }
    );
  }
  if (job.status !== "ready") {
    return NextResponse.json(
      {
        error: `Job is nog niet klaar (status: ${job.status}). Wacht totdat de render afgerond is.`,
      },
      { status: 409 }
    );
  }
  if (!job.outputUrl) {
    return NextResponse.json(
      { error: "Geen output URL beschikbaar voor deze job." },
      { status: 422 }
    );
  }

  try {
    const provider = getProvider(job.provider);
    const buf = await provider.downloadOutput(job.externalId, job.outputUrl);

    const dir = path.resolve(
      process.cwd(),
      "real-assets",
      job.campaignSlug,
      "clips"
    );
    fs.mkdirSync(dir, { recursive: true });
    const target = path.join(dir, `${job.shotId}.mp4`);
    fs.writeFileSync(target, buf);

    const rel = path.relative(process.cwd(), target).replace(/\\/g, "/");
    patchJob(job.jobId, { savedToPath: rel });

    return NextResponse.json({
      jobId: id,
      savedToPath: rel,
      bytes: buf.length,
      shotId: job.shotId,
      campaignSlug: job.campaignSlug,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Onbekende fout bij download.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
