import { Suspense } from "react";
import { BriefWizard } from "@/components/studio/BriefWizard";
import { GradientMesh } from "@/components/motion/GradientMesh";

export default function NewCampaignPage() {
  return (
    <div className="relative isolate min-h-screen">
      <GradientMesh intensity="soft" />
      <div className="relative px-6 py-10 md:px-10 md:py-16">
        <Suspense
          fallback={
            <div className="mx-auto max-w-3xl">
              <div className="h-10 w-1/3 animate-pulse rounded bg-elevated" />
              <div className="mt-8 h-[400px] animate-pulse rounded-2xl bg-elevated" />
            </div>
          }
        >
          <BriefWizard />
        </Suspense>
      </div>
    </div>
  );
}
