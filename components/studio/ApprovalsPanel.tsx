"use client";

import { useEffect, useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Approval = {
  id: string;
  status: "approved" | "rejected" | "comment";
  comment: string | null;
  createdByName: string | null;
  createdByEmail: string | null;
  createdAt: string;
};

const STATUS_LABEL: Record<Approval["status"], string> = {
  approved: "Goedgekeurd",
  rejected: "Wijziging gevraagd",
  comment: "Opmerking",
};

const STATUS_VARIANT: Record<
  Approval["status"],
  "success" | "warning" | "default"
> = {
  approved: "success",
  rejected: "warning",
  comment: "default",
};

export function ApprovalsPanel({ campaignId }: { campaignId: string }) {
  const [approvals, setApprovals] = useState<Approval[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchApprovals() {
    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/approvals`);
      if (!res.ok) {
        setApprovals([]);
        return;
      }
      const j = (await res.json()) as { approvals: Approval[] };
      setApprovals(j.approvals ?? []);
    } catch {
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApprovals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  if (approvals === null) {
    return (
      <div className="rounded-2xl border border-border bg-surface/40 p-4">
        <div className="flex items-center gap-2 text-text-subtle">
          <Loader2 className="size-3.5 animate-spin" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
            Feedback laden…
          </span>
        </div>
      </div>
    );
  }

  if (approvals.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface/40 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              Klantfeedback
            </span>
            <p className="mt-2 text-sm text-text-muted">
              Nog geen reactie van de klant. Verschijnt hier zodra ze
              goedkeuren of een opmerking sturen via de share-link.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchApprovals}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            Vernieuwen
          </Button>
        </div>
      </div>
    );
  }

  // Tel statussen voor de samenvatting bovenaan
  const approvedCount = approvals.filter((a) => a.status === "approved").length;
  const rejectedCount = approvals.filter((a) => a.status === "rejected").length;
  const commentCount = approvals.filter((a) => a.status === "comment").length;

  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
            Klantfeedback
          </span>
          {approvedCount > 0 ? (
            <Badge variant="success">
              <ThumbsUp className="mr-1 size-3" />
              {approvedCount}× goedgekeurd
            </Badge>
          ) : null}
          {rejectedCount > 0 ? (
            <Badge variant="warning">
              <ThumbsDown className="mr-1 size-3" />
              {rejectedCount}× wijziging
            </Badge>
          ) : null}
          {commentCount > 0 ? (
            <Badge>
              <MessageSquare className="mr-1 size-3" />
              {commentCount}× opmerking
            </Badge>
          ) : null}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchApprovals}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
          Vernieuwen
        </Button>
      </div>

      <ul className="mt-4 space-y-2">
        {approvals.map((a) => (
          <li
            key={a.id}
            className="rounded-lg border border-border bg-elevated/50 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge variant={STATUS_VARIANT[a.status]}>
                  {STATUS_LABEL[a.status]}
                </Badge>
                <span className="text-sm font-medium text-text">
                  {a.createdByName ?? "Anoniem"}
                </span>
                {a.createdByEmail ? (
                  <span className="font-mono text-[10px] text-text-subtle">
                    {a.createdByEmail}
                  </span>
                ) : null}
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                {new Date(a.createdAt).toLocaleString("nl-NL", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </div>
            {a.comment ? (
              <p className="mt-3 text-sm leading-relaxed text-text-muted whitespace-pre-wrap">
                {a.comment}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
