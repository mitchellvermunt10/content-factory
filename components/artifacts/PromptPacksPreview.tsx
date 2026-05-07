"use client";

import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyableBlock } from "@/components/cinematic/CopyableBlock";
import { AspectFrame } from "@/components/cinematic/AspectFrame";
import {
  Image as ImageIcon,
  Film,
  Layers,
  Palette,
  Aperture,
  Sun,
} from "lucide-react";
import type { PromptPacks } from "@/lib/schemas/artifacts/promptPacks";

const ease = [0.16, 1, 0.3, 1] as const;

export function PromptPacksPreview({
  data,
  onChange,
}: {
  data: PromptPacks;
  onChange?: (next: PromptPacks) => void;
}) {
  function patchImage(id: string, key: "midjourney" | "firefly", value: string) {
    if (!onChange) return;
    onChange({
      ...data,
      imagePack: {
        ...data.imagePack,
        prompts: data.imagePack.prompts.map((p) =>
          p.id === id ? { ...p, [key]: value } : p
        ),
      },
    });
  }
  function patchVideo(
    id: string,
    key: "runway" | "kling" | "veo",
    value: string
  ) {
    if (!onChange) return;
    onChange({
      ...data,
      videoPack: {
        ...data.videoPack,
        prompts: data.videoPack.prompts.map((p) =>
          p.id === id ? { ...p, [key]: value } : p
        ),
      },
    });
  }
  function patchBroll(id: string, value: string) {
    if (!onChange) return;
    onChange({
      ...data,
      bRollPack: {
        ...data.bRollPack,
        items: data.bRollPack.items.map((p) =>
          p.id === id ? { ...p, prompt: value } : p
        ),
      },
    });
  }

  return (
    <div className="space-y-6" data-testid="prompt-packs-preview">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="size-4 text-accent" />
            Visual style guide
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <StyleStat
            icon={<Layers className="size-3.5 text-accent" />}
            label="Moodboard"
            value={data.globalStyle.moodboard}
          />
          <StyleStat
            icon={<Sun className="size-3.5 text-accent" />}
            label="Color script"
            value={data.globalStyle.colorScript}
          />
          <StyleStat
            icon={<Palette className="size-3.5 text-accent" />}
            label="Grading"
            value={data.globalStyle.grading}
          />
          <StyleStat
            icon={<Aperture className="size-3.5 text-accent" />}
            label="Lensing"
            value={data.globalStyle.lensing}
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="image">
        <TabsList>
          <TabsTrigger value="image">
            <ImageIcon className="size-3.5" />
            Image ({data.imagePack.prompts.length})
          </TabsTrigger>
          <TabsTrigger value="video">
            <Film className="size-3.5" />
            Video ({data.videoPack.prompts.length})
          </TabsTrigger>
          <TabsTrigger value="broll">
            <Layers className="size-3.5" />
            B-roll ({data.bRollPack.items.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="image">
          <p className="mb-4 text-sm text-text-muted">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              Style
            </span>{" "}
            {data.imagePack.style}
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            {data.imagePack.prompts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: i * 0.04 }}
                className="overflow-hidden rounded-2xl border border-border bg-surface/50"
              >
                <AspectFrame ratio={p.aspectRatio} framing={p.styleNote}>
                  <div className="space-y-1 text-xs text-text">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                      {p.id}
                    </span>
                    <p className="line-clamp-2">{p.context}</p>
                  </div>
                </AspectFrame>
                <div className="space-y-3 p-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="accent">{p.context}</Badge>
                    <Badge variant="outline">{p.aspectRatio}</Badge>
                  </div>
                  <CopyableBlock
                    label="Midjourney"
                    value={p.midjourney}
                    onChange={(v) => patchImage(p.id, "midjourney", v)}
                    rows={3}
                  />
                  <CopyableBlock
                    label="Firefly"
                    value={p.firefly}
                    onChange={(v) => patchImage(p.id, "firefly", v)}
                    rows={3}
                  />
                  {p.negative ? (
                    <CopyableBlock
                      label="Negative"
                      value={p.negative}
                      rows={2}
                      readOnly
                    />
                  ) : null}
                  <p className="text-xs text-text-muted">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                      Style note
                    </span>{" "}
                    {p.styleNote}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="video">
          <p className="mb-4 text-sm text-text-muted">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              Style
            </span>{" "}
            {data.videoPack.style}
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            {data.videoPack.prompts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: i * 0.04 }}
                className="overflow-hidden rounded-2xl border border-border bg-surface/50"
              >
                <AspectFrame
                  ratio={p.aspectRatio}
                  framing={p.context}
                  cameraMove={p.cameraMove}
                >
                  <div className="space-y-1 text-xs text-text">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                      {p.id} · {p.durationSec}s
                    </span>
                  </div>
                </AspectFrame>
                <div className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="accent">{p.context}</Badge>
                    <Badge variant="outline">{p.aspectRatio}</Badge>
                    <Badge>{p.durationSec}s</Badge>
                    <Badge>{p.cameraMove}</Badge>
                  </div>
                  <CopyableBlock
                    label="Runway"
                    value={p.runway}
                    onChange={(v) => patchVideo(p.id, "runway", v)}
                    rows={3}
                  />
                  <CopyableBlock
                    label="Kling"
                    value={p.kling}
                    onChange={(v) => patchVideo(p.id, "kling", v)}
                    rows={3}
                  />
                  <CopyableBlock
                    label="Veo"
                    value={p.veo}
                    onChange={(v) => patchVideo(p.id, "veo", v)}
                    rows={3}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="broll">
          <p className="mb-4 text-sm text-text-muted">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              Style
            </span>{" "}
            {data.bRollPack.style}
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.bRollPack.items.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: i * 0.04 }}
                className="overflow-hidden rounded-2xl border border-border bg-surface/50"
              >
                <AspectFrame ratio="16:9" framing={b.framing}>
                  <div className="space-y-1 text-xs text-text">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                      {b.id} · {b.durationSec}s
                    </span>
                  </div>
                </AspectFrame>
                <div className="space-y-3 p-4">
                  <p className="text-sm font-medium">{b.topic}</p>
                  <CopyableBlock
                    label="Prompt"
                    value={b.prompt}
                    onChange={(v) => patchBroll(b.id, v)}
                    rows={4}
                  />
                  <p className="text-xs text-text-muted">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                      Use case
                    </span>{" "}
                    {b.useCase}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StyleStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg/40 p-4">
      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm text-text">{value}</p>
    </div>
  );
}
