"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { InstagramContent } from "@/lib/schemas/artifacts/instagram";
import { PostImageSlot } from "./PostImageSlot";
import { useCampaignImages } from "./useCampaignImages";
import { IGProfileMockup } from "@/components/instagram/IGProfileMockup";
import { IGStoryMockup } from "@/components/instagram/IGStoryMockup";
import { IGReelMockup } from "@/components/instagram/IGReelMockup";

type Props = {
  data: InstagramContent;
  campaignId?: string;
  /** Voor profile-mockup — bedrijfsnaam + stad */
  businessName?: string;
  city?: string;
  accentColor?: string;
};

export function InstagramPreview({
  data,
  campaignId,
  businessName = "Brand",
  city = "Amsterdam",
  accentColor,
}: Props) {
  // Image-feature is alleen actief als we een campaignId hebben (studio view).
  // Op de publieke /c/[id] geven we een aparte read-only preview later.
  const showImageGen = Boolean(campaignId);

  // IG-handle gebaseerd op businessName
  const handle = `@${businessName.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

  return (
    <div className="space-y-8">
      {/* === ECHTE INSTAGRAM-MOCKUP === */}
      <IGMockupSwitcher
        campaignId={campaignId}
        username={handle}
        displayName={businessName}
        city={city}
        data={data}
        accentColor={accentColor}
      />

      {/* === Studio-only: image-gen grid voor productie-werk === */}
      {showImageGen && campaignId ? (
        <FeedGridWithImages campaignId={campaignId} data={data} />
      ) : null}

      {/* === Tekst-detail-cards onder de mockup === */}
      <Card>
        <CardHeader>
          <CardTitle>Bio (tekstversie)</CardTitle>
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

function IGMockupSwitcher({
  campaignId,
  username,
  displayName,
  city,
  data,
  accentColor,
}: {
  campaignId?: string;
  username: string;
  displayName: string;
  city: string;
  data: InstagramContent;
  accentColor?: string;
}) {
  const [view, setView] = useState<"profile" | "story" | "reel">("profile");
  const { findLatest } = useCampaignImages(campaignId ?? "");
  const findImage = (artifactKey: string, itemIndex: number) =>
    artifactKey === "instagram" ? findLatest("instagram", itemIndex) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <ViewButton
          active={view === "profile"}
          onClick={() => setView("profile")}
          label="Profielpagina"
        />
        <ViewButton
          active={view === "story"}
          onClick={() => setView("story")}
          label="Story"
        />
        <ViewButton
          active={view === "reel"}
          onClick={() => setView("reel")}
          label="Reel"
        />
      </div>

      {view === "profile" ? (
        <IGProfileMockup
          username={username}
          displayName={displayName}
          city={city}
          data={data}
          accentColor={accentColor}
          findImage={campaignId ? findImage : undefined}
        />
      ) : null}
      {view === "story" ? (
        <IGStoryMockup
          username={username}
          displayName={displayName}
          data={data}
          accentColor={accentColor}
          findImage={campaignId ? findImage : undefined}
        />
      ) : null}
      {view === "reel" ? (
        <IGReelMockup
          username={username}
          displayName={displayName}
          data={data}
          accentColor={accentColor}
          findImage={campaignId ? findImage : undefined}
        />
      ) : null}
    </div>
  );
}

function ViewButton({
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
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
        active
          ? "border-accent/60 bg-accent/15 text-accent"
          : "border-border bg-surface/40 text-text-muted hover:border-border-strong hover:text-text"
      }`}
    >
      {label}
    </button>
  );
}

function FeedGridWithImages({
  campaignId,
  data,
}: {
  campaignId: string;
  data: InstagramContent;
}) {
  const { findLatest, upsertLocal } = useCampaignImages(campaignId);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feed grid</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-xs text-text-subtle">
          Klik <span className="font-mono uppercase tracking-[0.18em]">Engine</span> om
          tussen <strong>OpenAI</strong> (€0,04, snel), <strong>Flux Pro</strong> (€0,06,
          beter photoreal) of <strong>Midjourney prompt</strong> (kopiëren naar je MJ
          Discord) te kiezen. Server bouwt zelf een rich prompt op basis van je
          merk + cinematic concept + vakcontext — geen generieke AI-look.
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {data.posts.map((p, i) => (
            <div key={i} className="space-y-2">
              <PostImageSlot
                campaignId={campaignId}
                artifactKey="instagram"
                itemIndex={i}
                existing={findLatest("instagram", i)}
                onGenerated={upsertLocal}
                aspect={p.type === "reel" ? "portrait" : "square"}
              />
              <p className="line-clamp-2 text-[11px] leading-tight text-text-muted">
                {p.hook}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
