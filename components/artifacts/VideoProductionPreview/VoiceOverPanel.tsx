"use client";

import { useEffect, useRef, useState } from "react";
import {
  Mic,
  Sparkles,
  Volume2,
  Waves,
  Loader2,
  Download,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { CopyableBlock } from "@/components/cinematic/CopyableBlock";
import { Timecode } from "@/components/cinematic/Timecode";
import { ProgressBar } from "@/components/cinematic/ProgressBar";
import {
  ELEVENLABS_MODELS,
  ELEVENLABS_VOICES,
} from "@/lib/constants";
import type { VoiceOverSettings } from "@/lib/schemas/artifacts/videoProduction";

type SynthMode = "live" | "mock";

function isPlayableUrl(url: string | null): boolean {
  if (!url) return false;
  return (
    url.startsWith("blob:") ||
    url.startsWith("data:audio/") ||
    /^https?:\/\/(?!placeholder\.)/.test(url)
  );
}

function isStaleBlobUrl(url: string | null): boolean {
  return !!url && url.startsWith("blob:");
}

export function VoiceOverPanel({
  data,
  onChange,
}: {
  data: VoiceOverSettings;
  onChange: (next: VoiceOverSettings) => void;
}) {
  const [synthesizing, setSynthesizing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastMode, setLastMode] = useState<SynthMode | null>(null);
  // Eigen blob-tracking om geheugen vrij te geven bij volgende synthese / unmount.
  const blobUrlRef = useRef<string | null>(null);

  // Cleanup stale blob: URLs na page reload (zustand persisteert audioUrl,
  // maar Blob-URLs overleven geen herstart).
  useEffect(() => {
    if (isStaleBlobUrl(data.elevenLabs.audioUrl) && !blobUrlRef.current) {
      onChange({
        ...data,
        elevenLabs: {
          ...data.elevenLabs,
          audioUrl: null,
          status: "draft",
        },
      });
    }
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function patch(p: Partial<VoiceOverSettings["elevenLabs"]>) {
    onChange({ ...data, elevenLabs: { ...data.elevenLabs, ...p } });
  }

  async function synthesize() {
    setSynthesizing(true);
    setErrorMsg(null);
    patch({ status: "synthesizing" });

    try {
      const res = await fetch("/api/voice-over", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: data.fullScript,
          voiceId: data.elevenLabs.voiceId,
          modelId: data.elevenLabs.modelId,
          stability: data.elevenLabs.stability,
          similarity: data.elevenLabs.similarity,
          styleExaggeration: data.elevenLabs.styleExaggeration,
          speakerBoost: data.elevenLabs.speakerBoost,
        }),
      });

      if (!res.ok) {
        let msg = `Onverwachte fout (${res.status}).`;
        try {
          const j = await res.json();
          msg = (j as { error?: string }).error ?? msg;
        } catch {
          // ignore JSON parse failure
        }
        throw new Error(msg);
      }

      const ct = res.headers.get("content-type") ?? "";

      if (ct.startsWith("audio/")) {
        // Echte ElevenLabs binary respons.
        const blob = await res.blob();
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        patch({ audioUrl: url, status: "ready" });
        setLastMode("live");
        toast.success("Audio gegenereerd", {
          description: `${data.elevenLabs.voiceName} · ${(blob.size / 1024).toFixed(0)} KB`,
        });
      } else {
        // Mock-mode JSON respons.
        const j = (await res.json()) as {
          mode: SynthMode;
          audioUrl: string;
          durationSec: number;
          reason?: string;
        };
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
          blobUrlRef.current = null;
        }
        patch({ audioUrl: j.audioUrl, status: "ready" });
        setLastMode("mock");
        toast.message("Mock-audio aangemaakt", {
          description:
            j.reason ??
            "Stel ELEVENLABS_API_KEY in om echte audio te genereren.",
        });
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Onbekende fout bij synthese.";
      setErrorMsg(msg);
      patch({ status: "failed" });
      toast.error("Synthese mislukt", { description: msg });
    } finally {
      setSynthesizing(false);
    }
  }

  function downloadAudio() {
    const url = data.elevenLabs.audioUrl;
    if (!url || !isPlayableUrl(url)) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `voice-over-${data.elevenLabs.voiceId}.mp3`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  const v = data.elevenLabs;
  const playable = isPlayableUrl(v.audioUrl);
  const showMockHint = !!v.audioUrl && !playable;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Mic className="size-4 text-accent" />
          ElevenLabs voice-over
        </CardTitle>
        <div className="flex items-center gap-2">
          {lastMode === "mock" || showMockHint ? (
            <Badge variant="warning" data-testid="vo-mode-mock">
              Mock-mode
            </Badge>
          ) : lastMode === "live" || playable ? (
            <Badge variant="success" data-testid="vo-mode-live">
              Live ElevenLabs
            </Badge>
          ) : null}
          <Badge
            variant={
              v.status === "ready"
                ? "success"
                : v.status === "synthesizing"
                ? "warning"
                : v.status === "failed"
                ? "outline"
                : "outline"
            }
          >
            {v.status === "ready"
              ? "Audio klaar"
              : v.status === "synthesizing"
              ? "Synthese loopt"
              : v.status === "failed"
              ? "Fout"
              : "Concept"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <div>
            <Label>Volledig script</Label>
            <CopyableBlock
              value={data.fullScript}
              onChange={(v) => onChange({ ...data, fullScript: v })}
              rows={10}
              meta={
                <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                  <Timecode duration={data.totalDurationSec} />
                </span>
              }
              className="mt-2"
            />
          </div>

          <div>
            <Label>Audio output URL</Label>
            <Input
              className="mt-2 font-mono text-xs"
              value={v.audioUrl ?? ""}
              onChange={(e) => {
                if (blobUrlRef.current) {
                  URL.revokeObjectURL(blobUrlRef.current);
                  blobUrlRef.current = null;
                }
                patch({ audioUrl: e.target.value || null });
              }}
              placeholder="https://elevenlabs.io/audio/..."
              data-testid="vo-audio-url"
            />
          </div>

          {errorMsg ? (
            <div
              role="alert"
              data-testid="vo-error"
              className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/5 p-3 text-sm text-danger"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : null}

          {v.audioUrl ? (
            <div className="space-y-3 rounded-xl border border-border bg-bg/40 p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-text-muted">
                  <Volume2 className="size-3.5 text-accent" />
                  {v.voiceName} · {v.modelId}
                </span>
                <Timecode duration={data.totalDurationSec} />
              </div>
              <ProgressBar
                value={v.status === "ready" ? 100 : 0}
                shimmer={v.status === "synthesizing"}
                variant="success"
              />

              {playable ? (
                <>
                  <audio
                    data-testid="vo-audio-player"
                    controls
                    src={v.audioUrl}
                    className="w-full"
                    preload="metadata"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-mono text-[10px] text-text-subtle">
                      {v.audioUrl.startsWith("blob:")
                        ? "Sessie-blob (download voor blijvend gebruik)"
                        : v.audioUrl}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={downloadAudio}
                      data-testid="vo-download"
                    >
                      <Download className="size-3.5" />
                      Download MP3
                    </Button>
                  </div>
                </>
              ) : (
                <p className="truncate font-mono text-[10px] text-text-subtle">
                  {v.audioUrl}
                </p>
              )}
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Stem</Label>
            <Select
              value={v.voiceId}
              onValueChange={(val) => {
                const found = ELEVENLABS_VOICES.find((x) => x.id === val);
                patch({
                  voiceId: val,
                  voiceName: found?.name ?? val,
                });
              }}
            >
              <SelectTrigger data-testid="vo-voice">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ELEVENLABS_VOICES.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name} · {voice.accent}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Model</Label>
            <Select
              value={v.modelId}
              onValueChange={(val) => patch({ modelId: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ELEVENLABS_MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Slider
            label="Stability"
            value={v.stability}
            onChange={(val) => patch({ stability: val })}
          />
          <Slider
            label="Similarity"
            value={v.similarity}
            onChange={(val) => patch({ similarity: val })}
          />
          <Slider
            label="Style"
            value={v.styleExaggeration}
            onChange={(val) => patch({ styleExaggeration: val })}
          />
          <label className="flex items-center justify-between rounded-xl border border-border bg-bg/40 px-3 py-2 text-xs">
            <span className="flex items-center gap-2 text-text-muted">
              <Waves className="size-3.5 text-accent" />
              Speaker boost
            </span>
            <input
              type="checkbox"
              checked={v.speakerBoost}
              onChange={(e) => patch({ speakerBoost: e.target.checked })}
              className="size-4 accent-current"
            />
          </label>

          <Button
            size="md"
            variant="primary"
            className="w-full"
            disabled={synthesizing || !data.fullScript.trim()}
            onClick={synthesize}
            data-testid="vo-synthesize"
          >
            {synthesizing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Synthese...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Genereer audio
              </>
            )}
          </Button>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
            Stel ELEVENLABS_API_KEY in voor echte synthese.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="font-mono text-[10px] tabular-nums text-text-muted">
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-current"
      />
    </div>
  );
}
