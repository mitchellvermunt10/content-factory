"use client";

import { useEffect, useState } from "react";
import { Check, MessageSquare, X, Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ApprovalStatus = "approved" | "rejected" | "comment";

type Approval = {
  id: string;
  status: ApprovalStatus;
  comment: string | null;
  createdByName: string | null;
  createdAt: string;
};

type Props = {
  campaignId: string;
  campaignName: string;
};

const STORAGE_KEY = "content-factory:approver-name";

export function ApprovalBar({ campaignId, campaignName }: Props) {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState<ApprovalStatus | null>(null);
  const [approvals, setApprovals] = useState<Approval[]>([]);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) setName(cached);
    } catch {
      // niet beschikbaar — geen probleem
    }
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  async function refresh() {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/approvals`);
      if (!res.ok) return;
      const j = (await res.json()) as { approvals: Approval[] };
      setApprovals(j.approvals ?? []);
    } catch {
      // geen probleem — feature is optioneel
    }
  }

  async function send(status: ApprovalStatus) {
    if (!name.trim() && status !== "comment") {
      toast.error("Vul je naam in", {
        description: "Zo weten we van wie de feedback komt.",
      });
      return;
    }
    if (status === "comment" && !comment.trim()) {
      toast.error("Schrijf eerst een bericht");
      return;
    }
    setBusy(status);
    try {
      try {
        localStorage.setItem(STORAGE_KEY, name);
      } catch {
        // geen probleem — sommige browsers blokkeren in private mode
      }
      const res = await fetch(`/api/campaigns/${campaignId}/approvals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          comment: comment.trim() || null,
          createdByName: name.trim() || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const j = (await res.json()) as { persisted?: boolean };
      if (j.persisted === false) {
        toast.warning("Feedback opgeslagen lokaal", {
          description: "Server-persistentie staat uit — meld dit bij Mitchell.",
        });
      } else {
        toast.success(
          status === "approved"
            ? "Goedgekeurd"
            : status === "rejected"
              ? "Afwijzing verzonden"
              : "Comment verzonden"
        );
      }
      setComment("");
      refresh();
    } catch (err) {
      toast.error("Versturen mislukt", {
        description: err instanceof Error ? err.message : "Onbekende fout",
      });
    } finally {
      setBusy(null);
    }
  }

  const lastApproved = approvals.find((a) => a.status === "approved");
  const lastRejected = approvals.find((a) => a.status === "rejected");

  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              Feedback
            </span>
            {lastApproved ? (
              <Badge variant="success">
                <ThumbsUp className="mr-1 size-3" />
                Goedgekeurd door {lastApproved.createdByName ?? "klant"}
              </Badge>
            ) : null}
            {lastRejected ? (
              <Badge variant="warning">
                <ThumbsDown className="mr-1 size-3" />
                Wijziging gevraagd
              </Badge>
            ) : null}
            {!lastApproved && !lastRejected ? (
              <Badge variant="outline">In review</Badge>
            ) : null}
          </div>
          <h3 className="mt-3 text-lg font-medium tracking-tight">
            Wat vind je van {campaignName}?
          </h3>
          <p className="mt-1 text-sm text-text-muted">
            Goedkeuren als het klopt, anders een korte opmerking.
          </p>

          <div className="mt-4 grid gap-2 md:grid-cols-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Je naam"
              className="rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text"
              data-testid="approver-name"
            />
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optioneel — wat vond je goed of moet anders?"
            rows={3}
            className="mt-2 w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text"
            data-testid="approver-comment"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="accent"
          size="md"
          onClick={() => send("approved")}
          disabled={busy !== null}
          data-testid="approve-button"
        >
          {busy === "approved" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
          Goedkeuren
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={() => send("comment")}
          disabled={busy !== null || !comment.trim()}
        >
          {busy === "comment" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <MessageSquare className="size-4" />
          )}
          Stuur opmerking
        </Button>
        <Button
          variant="ghost"
          size="md"
          onClick={() => send("rejected")}
          disabled={busy !== null}
        >
          {busy === "rejected" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <X className="size-4" />
          )}
          Wijziging gevraagd
        </Button>
      </div>

      {approvals.length > 0 ? (
        <div className="mt-6 border-t border-border pt-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
            Geschiedenis ({approvals.length})
          </span>
          <ul className="mt-3 space-y-2">
            {approvals.slice(0, 5).map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-border bg-elevated/50 p-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      a.status === "approved"
                        ? "success"
                        : a.status === "rejected"
                          ? "warning"
                          : "outline"
                    }
                  >
                    {a.status === "approved"
                      ? "Goedgekeurd"
                      : a.status === "rejected"
                        ? "Wijziging"
                        : "Comment"}
                  </Badge>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                    {a.createdByName ?? "Onbekend"} ·{" "}
                    {new Date(a.createdAt).toLocaleString("nl-NL", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                {a.comment ? (
                  <p className="mt-2 leading-relaxed">{a.comment}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
