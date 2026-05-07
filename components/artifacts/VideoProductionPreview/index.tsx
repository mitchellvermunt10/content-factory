"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PipelineTable } from "./PipelineTable";
import { RenderQueue } from "./RenderQueue";
import { VoiceOverPanel } from "./VoiceOverPanel";
import { ExportPanel } from "./ExportPanel";
import { AssemblyTab } from "./AssemblyTab";
import { WorkflowDoc } from "./WorkflowDoc";
import { SceneAssets } from "./SceneAssets";
import type { CinematicCampaign } from "@/lib/schemas/artifacts/cinematic";
import type {
  VideoProduction,
} from "@/lib/schemas/artifacts/videoProduction";
import type {
  PipelinePhaseId,
  PhaseStatus,
  RenderStatus,
} from "@/lib/constants";

const ease = [0.16, 1, 0.3, 1] as const;

export function VideoProductionPreview({
  data,
  cinematic,
  campaignName,
  onChange,
}: {
  data: VideoProduction;
  cinematic: CinematicCampaign;
  campaignName: string;
  onChange: (next: VideoProduction) => void;
}) {
  const [activeSceneId, setActiveSceneId] = useState(
    data.pipeline.scenes[0]?.sceneId ?? ""
  );

  function patchPhase(
    sceneId: string,
    phase: PipelinePhaseId,
    value: PhaseStatus
  ) {
    onChange({
      ...data,
      pipeline: {
        scenes: data.pipeline.scenes.map((s) =>
          s.sceneId === sceneId
            ? { ...s, status: { ...s.status, [phase]: value } }
            : s
        ),
      },
    });
  }

  function patchImage(
    sceneId: string,
    idx: number,
    patch: Partial<VideoProduction["pipeline"]["scenes"][number]["assets"]["images"][number]>
  ) {
    onChange({
      ...data,
      pipeline: {
        scenes: data.pipeline.scenes.map((s) =>
          s.sceneId === sceneId
            ? {
                ...s,
                assets: {
                  ...s.assets,
                  images: s.assets.images.map((im, i) =>
                    i === idx ? { ...im, ...patch } : im
                  ),
                },
              }
            : s
        ),
      },
    });
  }

  function patchVideo(
    sceneId: string,
    idx: number,
    patch: Partial<VideoProduction["pipeline"]["scenes"][number]["assets"]["videos"][number]>
  ) {
    onChange({
      ...data,
      pipeline: {
        scenes: data.pipeline.scenes.map((s) =>
          s.sceneId === sceneId
            ? {
                ...s,
                assets: {
                  ...s.assets,
                  videos: s.assets.videos.map((v, i) =>
                    i === idx ? { ...v, ...patch } : v
                  ),
                },
              }
            : s
        ),
      },
    });
  }

  const activeScene = data.pipeline.scenes.find((s) => s.sceneId === activeSceneId);
  const activeCinematicScene = cinematic.scenes.find((s) => s.id === activeSceneId);

  return (
    <div className="space-y-6" data-testid="video-production-preview">
      <Tabs defaultValue="pipeline">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="assets">Assets per scene</TabsTrigger>
          <TabsTrigger value="voiceover">Voice-over</TabsTrigger>
          <TabsTrigger value="assembly">Assembly</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="workflow">Werkstroom</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-6">
          <PipelineTable
            pipeline={data.pipeline}
            onCyclePhase={patchPhase}
            onSelectScene={setActiveSceneId}
            activeSceneId={activeSceneId}
          />
          <RenderQueue
            queue={data.renderQueue}
            campaignName={campaignName}
            onUpdate={(next) => {
              // Sync video asset status with queue when a job becomes ready
              const updatedScenes = data.pipeline.scenes.map((s) => ({
                ...s,
                assets: {
                  ...s.assets,
                  videos: s.assets.videos.map((v, i) => {
                    const matched = next.find(
                      (j) =>
                        j.sceneId === s.sceneId &&
                        j.shotId === cinematic.scenes.find((cs) => cs.id === s.sceneId)?.shots[i]?.id
                    );
                    if (!matched) return v;
                    return {
                      ...v,
                      status: matched.status,
                      url: matched.outputUrl ?? v.url,
                    };
                  }),
                },
              }));
              onChange({ ...data, renderQueue: next, pipeline: { scenes: updatedScenes } });
            }}
          />
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {data.pipeline.scenes.map((s) => (
              <button
                key={s.sceneId}
                type="button"
                onClick={() => setActiveSceneId(s.sceneId)}
                data-testid={`assets-scene-${s.sceneId}`}
                className={`rounded-full border px-3 py-1 text-xs font-medium tracking-tight transition-colors ${
                  s.sceneId === activeSceneId
                    ? "border-accent/50 bg-accent/10 text-accent"
                    : "border-border text-text-muted hover:border-border-strong hover:text-text"
                }`}
              >
                {s.sceneId} · {s.title}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            {activeScene && activeCinematicScene ? (
              <motion.div
                key={activeSceneId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease }}
              >
                <SceneAssets
                  pipelineScene={activeScene}
                  scene={activeCinematicScene}
                  ratio={cinematic.concept.primaryAspectRatio}
                  onChangeImageUrl={(idx, url) => {
                    const cur = activeScene.assets.images[idx];
                    const wasMissing =
                      (cur.assetStatus ?? "missing") === "missing";
                    patchImage(activeSceneId, idx, {
                      url,
                      assetStatus:
                        url && wasMissing ? "uploaded" : cur.assetStatus,
                    });
                  }}
                  onChangeImageFile={(idx, file) => {
                    const cur = activeScene.assets.images[idx];
                    const wasMissing =
                      (cur.assetStatus ?? "missing") === "missing";
                    patchImage(activeSceneId, idx, {
                      localFile: file,
                      assetStatus:
                        file && wasMissing ? "uploaded" : cur.assetStatus,
                    });
                  }}
                  onChangeImageStatus={(idx, status) =>
                    patchImage(activeSceneId, idx, { assetStatus: status })
                  }
                  onChangeVideoUrl={(idx, url) => {
                    const cur = activeScene.assets.videos[idx];
                    const wasMissing =
                      (cur.assetStatus ?? "missing") === "missing";
                    patchVideo(activeSceneId, idx, {
                      url,
                      assetStatus:
                        url && wasMissing ? "uploaded" : cur.assetStatus,
                    });
                  }}
                  onChangeVideoFile={(idx, file) => {
                    const cur = activeScene.assets.videos[idx];
                    const wasMissing =
                      (cur.assetStatus ?? "missing") === "missing";
                    patchVideo(activeSceneId, idx, {
                      localFile: file,
                      assetStatus:
                        file && wasMissing ? "uploaded" : cur.assetStatus,
                    });
                  }}
                  onChangeVideoStatus={(idx, status: RenderStatus) =>
                    patchVideo(activeSceneId, idx, { status })
                  }
                  onChangeVideoAssetStatus={(idx, status) =>
                    patchVideo(activeSceneId, idx, { assetStatus: status })
                  }
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="voiceover">
          <VoiceOverPanel
            data={data.voiceOver}
            onChange={(next) => onChange({ ...data, voiceOver: next })}
          />
        </TabsContent>

        <TabsContent value="assembly">
          <AssemblyTab
            cinematic={cinematic}
            data={data}
            campaignName={campaignName}
            onChangeExportPlan={(next) =>
              onChange({ ...data, exportPlan: next })
            }
          />
        </TabsContent>

        <TabsContent value="export">
          <ExportPanel
            cinematic={cinematic}
            exportPlan={data.exportPlan}
            campaignName={campaignName}
            onChange={(next) => onChange({ ...data, exportPlan: next })}
          />
        </TabsContent>

        <TabsContent value="workflow">
          <WorkflowDoc />
        </TabsContent>
      </Tabs>
    </div>
  );
}
