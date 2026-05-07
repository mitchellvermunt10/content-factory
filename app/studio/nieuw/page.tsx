import { BriefWizard } from "@/components/studio/BriefWizard";
import { GradientMesh } from "@/components/motion/GradientMesh";

export default function NewCampaignPage() {
  return (
    <div className="relative isolate min-h-screen">
      <GradientMesh intensity="soft" />
      <div className="relative px-6 py-10 md:px-10 md:py-16">
        <BriefWizard />
      </div>
    </div>
  );
}
