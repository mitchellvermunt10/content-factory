"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  Mail,
  Linkedin,
  MessageCircle,
  Target,
  Wrench,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  OUTREACH_SEQUENCES,
  ICP_PROFILES,
  TOOLS,
  type OutreachTemplate,
} from "@/lib/outreach/templates";
import { GradientMesh } from "@/components/motion/GradientMesh";

const VERTICAL_LABEL: Record<string, string> = {
  salon: "Salon",
  restaurant: "Restaurant",
  autobedrijf: "Autobedrijf",
  any: "Algemeen",
};

const CHANNEL_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
};

export default function OutreachPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copy(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      toast.success("Gekopieerd");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Kopiëren mislukt");
    }
  }

  const verticals = ["salon", "restaurant", "autobedrijf"] as const;

  return (
    <div className="relative isolate min-h-screen">
      <GradientMesh intensity="soft" />
      <div className="relative px-6 py-10 md:px-10 md:py-14">
        <div className="mx-auto max-w-5xl">
          <Button asChild variant="ghost" size="sm">
            <Link href="/studio">
              <ArrowLeft className="size-4" /> Studio
            </Link>
          </Button>

          <div className="mt-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
              Outreach kit
            </span>
            <h1 className="mt-3 text-4xl font-medium tracking-tightest md:text-5xl">
              <span className="text-gradient">Verkopen zonder pitchen</span>
            </h1>
            <p className="mt-4 max-w-2xl text-text-muted md:text-lg">
              Cold-outreach scripts, ICP-profielen en tooling. Persoonlijk
              geschreven — geen mass-spam-templates. Aangepast aan NL-MKB.
            </p>
          </div>

          <div className="mt-12">
            <Tabs defaultValue="sequences">
              <TabsList>
                <TabsTrigger value="sequences">
                  <Mail className="size-4" /> Sequences
                </TabsTrigger>
                <TabsTrigger value="icp">
                  <Target className="size-4" /> ICP per vertical
                </TabsTrigger>
                <TabsTrigger value="tools">
                  <Wrench className="size-4" /> Tooling
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sequences" className="mt-8 space-y-10">
                {verticals.map((v) => {
                  const items = OUTREACH_SEQUENCES.filter(
                    (t) => t.vertical === v
                  );
                  if (items.length === 0) return null;
                  return (
                    <div key={v}>
                      <div className="mb-4 flex items-center gap-3">
                        <Badge variant="accent">{VERTICAL_LABEL[v]}</Badge>
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                          {items.length} berichten
                        </span>
                      </div>
                      <div className="space-y-3">
                        {items.map((t) => (
                          <TemplateCard
                            key={t.id}
                            template={t}
                            copiedId={copiedId}
                            onCopy={copy}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <Badge variant="outline">Algemeen</Badge>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                      cross-vertical
                    </span>
                  </div>
                  <div className="space-y-3">
                    {OUTREACH_SEQUENCES.filter(
                      (t) => t.vertical === "any"
                    ).map((t) => (
                      <TemplateCard
                        key={t.id}
                        template={t}
                        copiedId={copiedId}
                        onCopy={copy}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="icp" className="mt-8 space-y-6">
                {ICP_PROFILES.map((icp) => (
                  <div
                    key={icp.vertical}
                    className="rounded-2xl border border-border bg-surface/40 p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Badge variant="accent">{VERTICAL_LABEL[icp.vertical]}</Badge>
                        <h3 className="mt-3 text-xl font-medium tracking-tight">
                          {icp.label}
                        </h3>
                        <p className="mt-2 text-sm text-text-muted">
                          {icp.size}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-5 md:grid-cols-3">
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                          Goede signalen
                        </span>
                        <ul className="mt-3 space-y-2">
                          {icp.signals.map((s) => (
                            <li
                              key={s}
                              className="flex items-start gap-2 text-sm leading-relaxed"
                            >
                              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-success" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                          Red flags
                        </span>
                        <ul className="mt-3 space-y-2">
                          {icp.redflags.map((s) => (
                            <li
                              key={s}
                              className="flex items-start gap-2 text-sm leading-relaxed"
                            >
                              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-danger" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                          Beste kanalen
                        </span>
                        <ul className="mt-3 space-y-2">
                          {icp.channels.map((s) => (
                            <li
                              key={s}
                              className="flex items-start gap-2 text-sm leading-relaxed"
                            >
                              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="tools" className="mt-8">
                <div className="grid gap-3 md:grid-cols-2">
                  {TOOLS.map((tool) => (
                    <a
                      key={tool.name}
                      href={tool.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group rounded-2xl border border-border bg-surface/40 p-5 transition-all hover:border-border-strong hover:bg-surface/80"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium tracking-tight">
                            {tool.name}
                          </h3>
                          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                            {tool.role} · {tool.monthly}
                          </span>
                        </div>
                        <ExternalLink className="size-4 text-text-subtle transition-colors group-hover:text-text" />
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-text-muted">
                        {tool.why}
                      </p>
                    </a>
                  ))}
                </div>

                <div className="mt-10 rounded-2xl border border-dashed border-border bg-surface/30 p-6">
                  <h3 className="text-lg font-medium tracking-tight">
                    Aanrader voor jouw fase
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-muted">
                    Begin met <strong>Instantly.ai ($37/mnd)</strong> +
                    handmatige LinkedIn DMs. Bij &gt;30 prospects/week stap je
                    over op Lemlist voor multi-channel. Apollo of Hunter erbij
                    voor email-finden — KvK Open Data is gratis maar trager.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-text-muted">
                    Doel eerste maand: 50 prospects gevonden, 25 stap-1
                    gestuurd, 5 calls. Dat gaat lukken.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  copiedId,
  onCopy,
}: {
  template: OutreachTemplate;
  copiedId: string | null;
  onCopy: (id: string, value: string) => void;
}) {
  const Icon = CHANNEL_ICON[template.channel] ?? Mail;
  const fullText = template.subject
    ? `Onderwerp: ${template.subject}\n\n${template.body}`
    : template.body;

  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-text-subtle" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
            Stap {template.step} · dag {template.delayDays}
          </span>
          <Badge variant="outline">{template.channel}</Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCopy(template.id, fullText)}
        >
          {copiedId === template.id ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
          {copiedId === template.id ? "Gekopieerd" : "Kopieer"}
        </Button>
      </div>

      {template.subject ? (
        <div className="mt-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
            Onderwerp
          </span>
          <p className="mt-1 text-sm font-medium">{template.subject}</p>
        </div>
      ) : null}

      <pre className="mt-4 whitespace-pre-wrap rounded-lg border border-border bg-bg/40 p-4 font-sans text-sm leading-relaxed text-text">
        {template.body}
      </pre>

      <p className="mt-3 text-xs italic text-text-subtle">
        <span className="font-mono uppercase tracking-[0.18em] not-italic">
          Waarom:
        </span>{" "}
        {template.rationale}
      </p>
    </div>
  );
}
