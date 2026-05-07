"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Film, Image as ImageIcon, Layers, Circle } from "lucide-react";
import type { InstagramContent } from "@/lib/schemas/artifacts/instagram";

const ICON: Record<string, React.ElementType> = {
  foto: ImageIcon,
  carousel: Layers,
  reel: Film,
  story: Circle,
};

export function InstagramPreview({ data }: { data: InstagramContent }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border bg-bg/40 p-5">
            <p className="text-sm font-medium text-text">{data.bio.headline}</p>
            <p className="mt-1 text-sm text-text-muted">{data.bio.body}</p>
            <Badge variant="accent" className="mt-3">
              {data.bio.cta}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content pijlers</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {data.pillars.map((p, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-bg/40 p-4"
            >
              <p className="text-sm font-medium tracking-tight text-text">
                {p.name}
              </p>
              <p className="mt-1 text-xs text-text-muted">{p.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feed grid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-1.5">
            {data.posts.map((p, i) => {
              const Icon = ICON[p.type] ?? ImageIcon;
              return (
                <div
                  key={i}
                  className="group relative aspect-square overflow-hidden rounded-md border border-border bg-gradient-to-br from-surface to-elevated"
                >
                  <div className="absolute right-2 top-2 rounded-full bg-bg/60 p-1.5 backdrop-blur-sm">
                    <Icon className="size-3 text-text-muted" />
                  </div>
                  <div className="flex h-full items-end p-3">
                    <p className="line-clamp-3 text-[10px] leading-tight text-text-muted">
                      {p.hook}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.posts.map((p, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-bg/40 p-4"
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline">{p.type}</Badge>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                  Post {i + 1}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-text">{p.hook}</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text-muted">
                {p.caption}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.hashtags.map((h, j) => (
                  <span key={j} className="text-xs text-accent">
                    {h.startsWith("#") ? h : `#${h}`}
                  </span>
                ))}
              </div>
              <div className="mt-3 grid gap-2 text-xs sm:grid-cols-[120px_1fr]">
                <span className="font-mono uppercase tracking-[0.18em] text-text-subtle">
                  Beeld
                </span>
                <span className="text-text-muted">{p.visualDirection}</span>
                <span className="font-mono uppercase tracking-[0.18em] text-text-subtle">
                  CTA
                </span>
                <span className="text-text">{p.cta}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reel ideeën</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.reelIdeas.map((r, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-bg/40 p-4"
            >
              <p className="text-sm font-medium text-text">{r.concept}</p>
              <p className="mt-1 text-xs text-text-muted">Hook: {r.hook}</p>
              <ol className="mt-3 space-y-1 text-xs text-text-muted">
                {r.beats.map((b, j) => (
                  <li key={j}>
                    {String(j + 1).padStart(2, "0")} · {b}
                  </li>
                ))}
              </ol>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                Sound: <span className="text-text-muted">{r.soundDirection}</span>
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekplan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border border-border">
            {data.weeklyPlan.map((w, i) => (
              <div
                key={i}
                className="grid grid-cols-[100px_100px_1fr] items-center gap-3 border-b border-border px-4 py-3 text-sm last:border-b-0"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                  {w.day}
                </span>
                <Badge variant="outline">{w.type}</Badge>
                <span className="text-text-muted">{w.topic}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
