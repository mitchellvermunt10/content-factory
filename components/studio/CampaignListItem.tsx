"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { relativeTime } from "@/lib/utils";
import { BUSINESS_TYPES } from "@/lib/constants";
import type { Campaign } from "@/lib/schemas/campaign";

export function CampaignListItem({ campaign }: { campaign: Campaign }) {
  const type = BUSINESS_TYPES.find((t) => t.value === campaign.brief.businessType);

  return (
    <Link
      href={`/studio/campaigns/${campaign.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-border bg-surface/50 p-6 transition-all duration-500 ease-expo-out hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface/90"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{type?.label}</Badge>
            <Badge variant="default">{campaign.brief.tone}</Badge>
          </div>
          <h3 className="mt-4 truncate text-xl font-medium tracking-tight text-text">
            {campaign.brief.name}
          </h3>
          <p className="mt-1 text-sm text-text-muted">{campaign.brief.city}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3">
          <ArrowUpRight className="size-5 text-text-subtle transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-text" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
            {relativeTime(campaign.createdAt)}
          </span>
        </div>
      </div>
      <div
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />
    </Link>
  );
}
