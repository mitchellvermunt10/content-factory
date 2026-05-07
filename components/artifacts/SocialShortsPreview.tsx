"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhoneFrame } from "@/components/cinematic/PhoneFrame";
import { CopyableBlock } from "@/components/cinematic/CopyableBlock";
import { Music2, Sparkles, TrendingUp, Volume2, Volume } from "lucide-react";
import type {
  SocialShorts,
} from "@/lib/schemas/artifacts/socialShorts";
import { HOOK_CATEGORIES } from "@/lib/constants";

type Format = SocialShorts["formats"]["reel"];

const PLATFORMS: {
  id: keyof SocialShorts["formats"];
  label: string;
  ratio: string;
  audience: string;
}[] = [
  { id: "reel", label: "Instagram Reel", ratio: "9:16", audience: "IG / FB" },
  { id: "tiktok", label: "TikTok", ratio: "9:16", audience: "TikTok" },
  { id: "youtubeShort", label: "YouTube Short", ratio: "9:16", audience: "YouTube" },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function SocialShortsPreview({ data }: { data: SocialShorts }) {
  return (
    <div className="space-y-8" data-testid="social-shorts-preview">
      <Tabs defaultValue="reel">
        <div className="flex items-center justify-between gap-4">
          <TabsList>
            {PLATFORMS.map((p) => (
              <TabsTrigger key={p.id} value={p.id}>
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {PLATFORMS.map((p) => (
          <TabsContent key={p.id} value={p.id}>
            <PlatformView format={data.formats[p.id]} platform={p} />
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-accent" />
            Hook bank
          </CardTitle>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
            5 categorieën
          </span>
        </CardHeader>
        <CardContent>
          <HookBank bank={data.hookBank} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-4 text-accent" />
            Trending formats
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {data.trendingFormats.map((t, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-bg/40 p-4"
            >
              <p className="text-sm font-medium tracking-tight">{t.name}</p>
              <p className="mt-1 text-xs text-text-muted">{t.why}</p>
              <p className="mt-3 text-xs text-text">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                  Adapt
                </span>{" "}
                {t.adaptation}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CTA bank</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {data.ctaBank.map((c, i) => (
            <Badge key={i} variant="accent">
              {c}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function PlatformView({
  format,
  platform,
}: {
  format: Format;
  platform: (typeof PLATFORMS)[number];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="grid gap-6 lg:grid-cols-[auto_1fr]"
    >
      <div className="flex justify-center">
        <PhoneFrame label={`${platform.audience} · ${format.durationSec}s`}>
          <div className="absolute inset-0 flex flex-col">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 30%, hsl(var(--accent)/0.18), transparent 60%)",
              }}
            />
            <div className="relative z-10 flex flex-1 flex-col justify-between px-4 pb-16 pt-12 text-center text-text">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-subtle">
                  Hook
                </p>
                <p className="mt-2 text-base font-medium leading-tight tracking-tight">
                  {format.hook}
                </p>
              </div>
              <ol className="space-y-1 text-left text-[10px] leading-snug text-text-muted">
                {format.beats.map((b, i) => (
                  <li
                    key={i}
                    className="flex gap-2 rounded bg-bg/40 px-2 py-1 backdrop-blur-sm"
                  >
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent">
                      {b.timecode}
                    </span>
                    <span className="line-clamp-2">{b.shot}</span>
                  </li>
                ))}
              </ol>
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-text px-3 py-1 text-[10px] font-medium text-bg">
                  {format.cta}
                </span>
              </div>
            </div>
          </div>
        </PhoneFrame>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Beats &amp; script</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="overflow-hidden rounded-xl border border-border">
              {format.beats.map((b, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[80px_1fr] gap-3 border-b border-border p-4 text-sm last:border-b-0"
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                    {b.timecode}
                  </span>
                  <div className="space-y-1">
                    <p className="text-text">{b.shot}</p>
                    {b.vo ? (
                      <p className="flex items-start gap-1.5 text-xs text-text-muted">
                        <Volume2 className="mt-0.5 size-3 shrink-0" />
                        {b.vo}
                      </p>
                    ) : null}
                    {b.onScreenText ? (
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                        On-screen: {b.onScreenText}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music2 className="size-4 text-accent" />
              Sound &amp; captions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <DefRow icon={<Volume className="size-3.5 text-accent" />} label="Sound">
              {format.soundDirection}
            </DefRow>
            <DefRow label="Captions">{format.captionsStyle}</DefRow>
            <DefRow label="Loop">{format.loopOpportunity}</DefRow>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function DefRow({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-baseline gap-3">
      <dt className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
        {icon}
        {label}
      </dt>
      <dd className="text-sm text-text">{children}</dd>
    </div>
  );
}

function HookBank({ bank }: { bank: SocialShorts["hookBank"] }) {
  const [active, setActive] = useState<keyof SocialShorts["hookBank"]>("curiosity");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {HOOK_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActive(c)}
            className={`rounded-full border px-3 py-1 text-xs font-medium tracking-tight transition-all duration-300 ${
              active === c
                ? "border-accent/50 bg-accent/10 text-accent"
                : "border-border text-text-muted hover:border-border-strong hover:text-text"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease }}
          className="grid gap-2 sm:grid-cols-2"
        >
          {bank[active].map((h, i) => (
            <CopyableBlock
              key={i}
              label={h.type}
              value={h.text}
              rows={2}
              meta={
                h.note ? (
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                    {h.note}
                  </span>
                ) : null
              }
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
