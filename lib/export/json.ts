import type { Campaign } from "@/lib/schemas/campaign";
import { slugify } from "@/lib/utils";

export function downloadCampaignJSON(campaign: Campaign) {
  const blob = new Blob([JSON.stringify(campaign, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const slug = slugify(campaign.brief.name) || campaign.id;
  const link = document.createElement("a");
  link.href = url;
  link.download = `campaign-${slug}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
