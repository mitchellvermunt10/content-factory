import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveVoiceId } from "@/lib/elevenlabs/voiceIdMap";

export const runtime = "nodejs";
export const maxDuration = 60;

const RequestSchema = z.object({
  text: z.string().min(1, "Script is leeg").max(5000),
  voiceId: z.string().min(1),
  modelId: z
    .enum(["eleven_multilingual_v2", "eleven_turbo_v2_5"])
    .default("eleven_multilingual_v2"),
  stability: z.number().min(0).max(1).default(0.55),
  similarity: z.number().min(0).max(1).default(0.75),
  styleExaggeration: z.number().min(0).max(1).default(0.35),
  speakerBoost: z.boolean().default(true),
});

function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Ongeldige request body — verwacht JSON.");
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      400,
      parsed.error.errors[0]?.message ?? "Ongeldige parameters."
    );
  }
  const input = parsed.data;

  // Mock-mode: geen ElevenLabs key, of globale CONTENT_FACTORY_MOCK aan.
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const forceMock = process.env.CONTENT_FACTORY_MOCK === "true";

  if (!apiKey || forceMock) {
    // Geef een mock-respons terug die de UI net zo verwerkt als een echte synthese,
    // maar zonder echte audio. Bewust JSON i.p.v. binair zodat de client
    // beide content-types kan onderscheiden.
    const stamp = Date.now().toString(36);
    return NextResponse.json(
      {
        mode: "mock",
        audioUrl: `https://placeholder.elevenlabs.io/audio/${input.voiceId}-${stamp}.mp3`,
        durationSec: estimateDurationFromText(input.text),
        reason: !apiKey
          ? "Geen ELEVENLABS_API_KEY ingesteld."
          : "CONTENT_FACTORY_MOCK staat aan.",
      },
      { status: 200 }
    );
  }

  // Echte ElevenLabs call.
  const voiceId = resolveVoiceId(input.voiceId);
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: input.text,
        model_id: input.modelId,
        voice_settings: {
          stability: input.stability,
          similarity_boost: input.similarity,
          style: input.styleExaggeration,
          use_speaker_boost: input.speakerBoost,
        },
      }),
    });
  } catch (err) {
    return jsonError(
      502,
      "Kan geen verbinding maken met ElevenLabs. Controleer je netwerk."
    );
  }

  if (!upstream.ok) {
    let upstreamMsg = "";
    try {
      const j = await upstream.json();
      upstreamMsg =
        (j as { detail?: { message?: string }; error?: string })?.detail
          ?.message ??
        (j as { error?: string })?.error ??
        "";
    } catch {
      // negeer parse-fouten
    }
    return jsonError(upstream.status, mapUpstreamError(upstream.status, upstreamMsg));
  }

  const arrayBuf = await upstream.arrayBuffer();
  const headers = new Headers({
    "Content-Type": "audio/mpeg",
    "Content-Length": String(arrayBuf.byteLength),
    "Cache-Control": "no-store",
    "X-Voice-Mode": "live",
    "X-Voice-Id": input.voiceId,
    "X-Voice-Resolved": voiceId,
    "X-Model-Id": input.modelId,
  });
  return new Response(arrayBuf, { status: 200, headers });
}

function estimateDurationFromText(text: string): number {
  // Ruwe schatting: 150 wpm ≈ 2.5 woorden/sec. Plus minimale 2s buffer.
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round((words / 2.5) * 10) / 10);
}

function mapUpstreamError(status: number, message: string): string {
  switch (status) {
    case 401:
      return "ElevenLabs API-sleutel ongeldig of verlopen.";
    case 403:
      return "Geen toegang — controleer je ElevenLabs abonnement.";
    case 422:
      return message
        ? `Ongeldige stem of model: ${message}`
        : "Stem of model niet gevonden bij ElevenLabs.";
    case 429:
      return "Rate limit bereikt — wacht een halve minuut en probeer opnieuw.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "ElevenLabs is tijdelijk niet beschikbaar. Probeer zo opnieuw.";
    default:
      return message
        ? `ElevenLabs gaf een fout (${status}): ${message}`
        : `ElevenLabs gaf een fout (${status}).`;
  }
}
