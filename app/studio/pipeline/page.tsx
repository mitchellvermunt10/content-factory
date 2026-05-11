"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Mail,
  Phone,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  Send,
  Trash2,
  CreditCard,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GradientMesh } from "@/components/motion/GradientMesh";
import type { OutreachRecord, OutreachStatus } from "@/lib/supabase/outreachRepo";

const STATUS_LABEL: Record<OutreachStatus, string> = {
  draft: "Concept",
  sent: "Verzonden",
  opened: "Geopend",
  replied: "Reactie",
  in_call: "In gesprek",
  closed_won: "Gewonnen",
  closed_lost: "Verloren",
  dead: "Gestopt",
};

const STATUS_COLOR: Record<OutreachStatus, string> = {
  draft: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  sent: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  opened: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  replied: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  in_call: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  closed_won: "bg-green-500/15 text-green-400 border-green-500/30",
  closed_lost: "bg-red-500/15 text-red-400 border-red-500/30",
  dead: "bg-zinc-700/15 text-zinc-600 border-zinc-700/30",
};

export default function PipelinePage() {
  const [outreach, setOutreach] = useState<OutreachRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OutreachStatus | "all">(
    "all"
  );
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);

  // Load outreach from API on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let email: string | null = null;
      try {
        const cached = localStorage.getItem("content-factory:owner-email");
        if (cached?.includes("@")) email = cached;
      } catch {
        // niet beschikbaar
      }
      if (!email) {
        setLoading(false);
        return;
      }
      setOwnerEmail(email);
      try {
        const res = await fetch(
          `/api/outreach?owner=${encodeURIComponent(email)}`
        );
        if (!res.ok) return;
        const j = (await res.json()) as { outreach: OutreachRecord[] };
        if (!cancelled) setOutreach(j.outreach ?? []);
      } catch {
        // niet bereikbaar
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return outreach;
    return outreach.filter((o) => o.status === statusFilter);
  }, [outreach, statusFilter]);

  const stats = useMemo(() => {
    const total = outreach.length;
    const sent = outreach.filter((o) => o.status !== "draft").length;
    const opened = outreach.filter((o) =>
      ["opened", "replied", "in_call", "closed_won"].includes(o.status)
    ).length;
    const replied = outreach.filter((o) =>
      ["replied", "in_call", "closed_won"].includes(o.status)
    ).length;
    const won = outreach.filter((o) => o.status === "closed_won").length;
    return { total, sent, opened, replied, won };
  }, [outreach]);

  async function refresh() {
    if (!ownerEmail) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/outreach?owner=${encodeURIComponent(ownerEmail)}`
      );
      if (!res.ok) return;
      const j = (await res.json()) as { outreach: OutreachRecord[] };
      setOutreach(j.outreach ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative isolate min-h-screen">
      <GradientMesh intensity="soft" />
      <div className="relative px-6 py-10 md:px-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <Button asChild variant="ghost" size="sm">
            <Link href="/studio">
              <ArrowLeft className="size-4" /> Studio
            </Link>
          </Button>

          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
                Pipeline
              </span>
              <h1 className="mt-3 text-4xl font-medium tracking-tightest md:text-5xl">
                <span className="text-gradient">Outreach + status</span>
              </h1>
              <p className="mt-4 max-w-2xl text-text-muted md:text-lg">
                Track wie je hebt benaderd, of ze de spec hebben geopend, en wat
                de status is. Geen Notion of Excel meer.
              </p>
            </div>
            <Button variant="secondary" onClick={refresh} disabled={loading}>
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Vernieuwen
            </Button>
          </div>

          {/* Stats row */}
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
            <StatCard label="Totaal" value={stats.total} />
            <StatCard label="Verzonden" value={stats.sent} icon={<Send className="size-3" />} />
            <StatCard label="Geopend" value={stats.opened} icon={<Eye className="size-3" />} />
            <StatCard label="Reactie" value={stats.replied} icon={<MessageSquare className="size-3" />} />
            <StatCard label="Gewonnen" value={stats.won} icon={<CheckCircle2 className="size-3" />} accent />
          </div>

          {/* Status filters */}
          <div className="mt-8 flex flex-wrap gap-2">
            <FilterButton
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
              label={`Alles (${outreach.length})`}
            />
            {(
              [
                "draft",
                "sent",
                "opened",
                "replied",
                "in_call",
                "closed_won",
                "closed_lost",
                "dead",
              ] as const
            ).map((s) => {
              const count = outreach.filter((o) => o.status === s).length;
              if (count === 0) return null;
              return (
                <FilterButton
                  key={s}
                  active={statusFilter === s}
                  onClick={() => setStatusFilter(s)}
                  label={`${STATUS_LABEL[s]} (${count})`}
                />
              );
            })}
          </div>

          {/* List */}
          <div className="mt-8">
            {loading ? (
              <div className="rounded-2xl border border-border bg-surface/40 p-12 text-center">
                <Loader2 className="mx-auto size-6 animate-spin text-text-subtle" />
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState hasOutreach={outreach.length > 0} />
            ) : (
              <div className="space-y-2">
                {filtered.map((o) => (
                  <OutreachRow
                    key={o.id}
                    record={o}
                    onUpdated={refresh}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent
          ? "border-accent/40 bg-accent/5"
          : "border-border bg-surface/40"
      }`}
    >
      <div className="flex items-center gap-1.5">
        {icon ?? null}
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
          {label}
        </span>
      </div>
      <p className="mt-2 text-2xl font-medium tracking-tight">{value}</p>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
        active
          ? "border-accent/60 bg-accent/15 text-accent"
          : "border-border bg-surface/40 text-text-muted hover:text-text"
      }`}
    >
      {label}
    </button>
  );
}

function EmptyState({ hasOutreach }: { hasOutreach: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface/40 p-12 text-center">
      <Send className="mx-auto size-8 text-text-subtle" />
      <h3 className="mt-4 text-lg font-medium tracking-tight">
        {hasOutreach ? "Niets in deze filter" : "Nog geen outreach"}
      </h3>
      <p className="mt-2 text-sm text-text-muted">
        {hasOutreach
          ? "Switch naar een andere status."
          : "Ga naar prospect-research, vind een prospect, en markeer 'm als verzonden."}
      </p>
      {!hasOutreach ? (
        <Button asChild className="mt-6" variant="accent">
          <Link href="/studio/prospects">Open prospect-research</Link>
        </Button>
      ) : null}
    </div>
  );
}

function OutreachRow({
  record,
  onUpdated,
}: {
  record: OutreachRecord;
  onUpdated: () => void;
}) {
  const [updating, setUpdating] = useState<OutreachStatus | "delete" | null>(
    null
  );
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  async function generateCheckout(
    tier: "single" | "always-on" | "receptionist"
  ) {
    if (!record.prospectEmail) {
      toast.error("Geen prospect-email bekend", {
        description: "Stripe heeft een email nodig voor de checkout-link.",
      });
      return;
    }
    setCheckoutLoading(tier);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          customerEmail: record.prospectEmail,
          customerName: record.prospectName,
          outreachId: record.id,
          campaignId: record.campaignId ?? undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error ?? `HTTP ${res.status}`
        );
      }
      const j = (await res.json()) as { checkoutUrl: string };
      setCheckoutUrl(j.checkoutUrl);
      toast.success("Checkout-link klaar — kopieer en stuur");
    } catch (err) {
      toast.error("Checkout-link maken mislukt", {
        description: err instanceof Error ? err.message : "Onbekende fout",
      });
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function copyCheckoutLink() {
    if (!checkoutUrl) return;
    await navigator.clipboard.writeText(checkoutUrl);
    setCopiedLink(true);
    toast.success("Link gekopieerd");
    setTimeout(() => setCopiedLink(false), 2000);
  }

  async function setStatus(status: OutreachStatus) {
    setUpdating(status);
    try {
      const res = await fetch(`/api/outreach/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error ?? `HTTP ${res.status}`
        );
      }
      toast.success(`Status: ${STATUS_LABEL[status]}`);
      onUpdated();
    } catch (err) {
      toast.error("Update mislukt", {
        description: err instanceof Error ? err.message : "Onbekende fout",
      });
    } finally {
      setUpdating(null);
    }
  }

  const sentAgo = record.sentAt
    ? Math.floor(
        (Date.now() - new Date(record.sentAt).getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;
  const needsFollowup =
    (record.status === "sent" || record.status === "opened") &&
    sentAgo !== null &&
    sentAgo >= 4;

  return (
    <div className="rounded-xl border border-border bg-surface/40 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-medium tracking-tight">
              {record.prospectName}
            </h3>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS_COLOR[record.status]}`}
            >
              {STATUS_LABEL[record.status]}
            </span>
            {record.openCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[11px] font-medium text-purple-400">
                <Eye className="size-3" />
                {record.openCount}× geopend
              </span>
            ) : null}
            {needsFollowup ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                <Clock className="size-3" />
                Follow-up nodig ({sentAgo}d)
              </span>
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap gap-3 text-xs text-text-muted">
            {record.prospectCity ? <span>{record.prospectCity}</span> : null}
            {record.prospectVertical ? (
              <span>· {record.prospectVertical}</span>
            ) : null}
            {record.sentAt ? (
              <span>
                · Verzonden:{" "}
                {new Date(record.sentAt).toLocaleDateString("nl-NL", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            ) : null}
            {record.firstOpenedAt ? (
              <span>
                · Geopend:{" "}
                {new Date(record.firstOpenedAt).toLocaleDateString("nl-NL", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            ) : null}
          </div>

          {/* Quick links */}
          <div className="mt-3 flex flex-wrap gap-2">
            {record.campaignId ? (
              <Button asChild variant="ghost" size="sm">
                <a
                  href={`/c/${record.campaignId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="size-3" />
                  Spec
                </a>
              </Button>
            ) : null}
            {record.prospectEmail ? (
              <Button asChild variant="ghost" size="sm">
                <a href={`mailto:${record.prospectEmail}`}>
                  <Mail className="size-3" />
                  Email
                </a>
              </Button>
            ) : null}
            {record.prospectPhone ? (
              <Button asChild variant="ghost" size="sm">
                <a href={`tel:${record.prospectPhone}`}>
                  <Phone className="size-3" />
                  Bel
                </a>
              </Button>
            ) : null}
            {record.prospectWebsite ? (
              <Button asChild variant="ghost" size="sm">
                <a
                  href={record.prospectWebsite}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="size-3" />
                  Site
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        {/* Status actions */}
        <div className="flex flex-wrap gap-1">
          {record.status === "draft" ? (
            <Button
              size="sm"
              variant="accent"
              onClick={() => setStatus("sent")}
              disabled={updating === "sent"}
            >
              <Send className="size-3" /> Verzonden
            </Button>
          ) : null}
          {record.status === "sent" || record.status === "opened" ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setStatus("replied")}
              disabled={updating === "replied"}
            >
              <MessageSquare className="size-3" /> Reactie
            </Button>
          ) : null}
          {record.status === "replied" ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setStatus("in_call")}
              disabled={updating === "in_call"}
            >
              <Phone className="size-3" /> In gesprek
            </Button>
          ) : null}
          {(record.status === "in_call" || record.status === "replied") ? (
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowCheckout((v) => !v)}
              >
                <CreditCard className="size-3" /> Betaal-link
              </Button>
              <Button
                size="sm"
                variant="accent"
                onClick={() => setStatus("closed_won")}
                disabled={updating === "closed_won"}
              >
                <CheckCircle2 className="size-3" /> Gewonnen
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setStatus("closed_lost")}
                disabled={updating === "closed_lost"}
              >
                <XCircle className="size-3" /> Verloren
              </Button>
            </>
          ) : null}
          {!["closed_won", "closed_lost", "dead"].includes(record.status) ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setStatus("dead")}
              disabled={updating === "dead"}
              className="text-text-subtle"
            >
              <Trash2 className="size-3" />
            </Button>
          ) : null}
        </div>
      </div>

      {/* Checkout panel — verschijnt onder de row na klik op 'Betaal-link' */}
      {showCheckout ? (
        <div className="mt-5 rounded-xl border border-accent/30 bg-accent/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium">
              Genereer Stripe checkout-link voor {record.prospectName}
            </p>
            <button
              onClick={() => setShowCheckout(false)}
              className="text-xs text-text-subtle hover:text-text"
            >
              Sluit
            </button>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <button
              onClick={() => generateCheckout("single")}
              disabled={checkoutLoading !== null}
              className="rounded-lg border border-border bg-elevated p-3 text-left transition-all hover:border-border-strong disabled:opacity-50"
            >
              <p className="text-sm font-medium">Eenmalig</p>
              <p className="font-mono text-lg tracking-tight">€750</p>
              <p className="text-xs text-text-subtle">1× betaling</p>
              {checkoutLoading === "single" ? (
                <Loader2 className="mt-2 size-3 animate-spin" />
              ) : null}
            </button>
            <button
              onClick={() => generateCheckout("always-on")}
              disabled={checkoutLoading !== null}
              className="rounded-lg border-2 border-accent/40 bg-accent/10 p-3 text-left transition-all hover:border-accent disabled:opacity-50"
            >
              <p className="text-sm font-medium">Always-On</p>
              <p className="font-mono text-lg tracking-tight text-accent">
                €497
              </p>
              <p className="text-xs text-text-subtle">/ maand</p>
              {checkoutLoading === "always-on" ? (
                <Loader2 className="mt-2 size-3 animate-spin" />
              ) : null}
            </button>
            <button
              onClick={() => generateCheckout("receptionist")}
              disabled={checkoutLoading !== null}
              className="rounded-lg border border-border bg-elevated p-3 text-left transition-all hover:border-border-strong disabled:opacity-50"
            >
              <p className="text-sm font-medium">Receptionist</p>
              <p className="font-mono text-lg tracking-tight">€299</p>
              <p className="text-xs text-text-subtle">/ maand</p>
              {checkoutLoading === "receptionist" ? (
                <Loader2 className="mt-2 size-3 animate-spin" />
              ) : null}
            </button>
          </div>

          {checkoutUrl ? (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-bg/40 p-3">
              <input
                value={checkoutUrl}
                readOnly
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 bg-transparent font-mono text-xs text-text"
              />
              <Button size="sm" variant="secondary" onClick={copyCheckoutLink}>
                {copiedLink ? (
                  <Check className="size-3" />
                ) : (
                  <Copy className="size-3" />
                )}
                {copiedLink ? "Gekopieerd" : "Kopieer"}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
