"use client";

import { Calendar, Clock, MapPin, Phone, ExternalLink } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Badge } from "@/components/ui/badge";
import type { LandingPage } from "@/lib/schemas/artifacts/landing";
import type { Brand } from "@/lib/schemas/brand";
import type { ScrapedContent } from "@/lib/schemas/scrapedContent";
import { getTheme, type DesignStyle } from "@/lib/design/themes";

const PROVIDER_LABELS: Record<string, string> = {
  treatwell: "Boeking via Treatwell",
  salonized: "Boeking via Salonized",
  phorest: "Boeking via Phorest",
  thefork: "Reserveren via TheFork",
  opentable: "Reserveren via OpenTable",
  resengo: "Reserveren via Resengo",
  "garage-eigen-form": "Offerte via eigen formulier",
  eigen: "Eigen booking-systeem",
  geen: "Direct contact",
};

const CTA_TARGET_ICON: Record<string, React.ElementType> = {
  booking: Calendar,
  reservation: Calendar,
  offerte: ExternalLink,
  contact: Phone,
  menu: MapPin,
  shop: ExternalLink,
  phone: Phone,
};

export function LandingPagePreview({
  data,
  brand,
  scrapedContent,
}: {
  data: LandingPage;
  brand: Brand;
  scrapedContent?: ScrapedContent;
}) {
  const themeId =
    (data.designStyle as DesignStyle | undefined) ?? "warm-documentary";
  const theme = getTheme(themeId);
  const ctaTarget = data.primaryCtaTarget ?? "contact";
  const CtaIcon = CTA_TARGET_ICON[ctaTarget] ?? Calendar;

  // Theme-derived inline styles toegepast op container
  const themeStyle: React.CSSProperties = {
    ["--lp-radius" as string]: theme.cornerRadiusValue,
    ["--lp-section" as string]: theme.sectionSpacingValue,
    ["--lp-track" as string]: theme.letterSpacingValue,
    ["--lp-max" as string]: theme.containerMaxWidth,
    ["--lp-accent" as string]: brand.accent,
    fontFamily: theme.fontBody,
  };

  const headingStyle: React.CSSProperties = {
    fontFamily: theme.fontHeading,
    fontWeight: theme.headingWeight,
    letterSpacing: theme.letterSpacingValue,
  };

  return (
    <div
      className="overflow-hidden border border-border bg-elevated"
      style={{ ...themeStyle, borderRadius: "16px" }}
    >
      <BrowserChrome label={`landing · ${theme.label}`} />
      <div className="relative">
        {/* === DESIGN-PATROON ACHTERGROND === */}
        <ThemeBackground theme={theme} accent={brand.accent} />

        {/* === HERO === */}
        <Hero
          data={data}
          theme={theme}
          headingStyle={headingStyle}
          accent={brand.accent}
          ctaTarget={ctaTarget}
          CtaIcon={CtaIcon}
        />

        {/* === MARQUEE === */}
        <div
          className="border-y border-border bg-surface/40 py-4"
          style={{ borderRadius: 0 }}
        >
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
            {data.marquee.map((m, i) => (
              <span key={i}>· {m}</span>
            ))}
          </div>
        </div>

        {/* === FEATURES === */}
        <section
          className="px-8 md:px-16"
          style={{ paddingTop: theme.sectionSpacingValue, paddingBottom: theme.sectionSpacingValue }}
        >
          <FeatureGrid data={data} theme={theme} accent={brand.accent} />
        </section>

        {/* === VERTICAL SECTION (treatments / menu / services) === */}
        {/* Als er scraped content is, gebruik die echte items ipv AI-gegenereerd */}
        {(() => {
          const baseSection = data.verticalSection;
          const realItems = scrapedContent?.items ?? [];

          // Als we ECHTE items hebben, bouw nieuwe section met die items
          const useRealContent = realItems.length >= 3;
          const section = useRealContent
            ? {
                title: baseSection?.title ?? "Wat we bieden",
                intro: scrapedContent?.businessSummary ?? baseSection?.intro,
                items: realItems.slice(0, 12).map((it) => ({
                  name: it.name,
                  description: it.description ?? "",
                  priceFrom: it.price ?? "",
                  duration: "",
                  badge: "",
                })),
                bookingProvider:
                  (scrapedContent?.bookingProvider as
                    | "treatwell"
                    | "salonized"
                    | "phorest"
                    | "thefork"
                    | "opentable"
                    | "resengo"
                    | "garage-eigen-form"
                    | "eigen"
                    | "geen") ??
                  baseSection?.bookingProvider ??
                  "geen",
                bookingProviderHint: baseSection?.bookingProviderHint,
              }
            : baseSection;

          if (!section) return null;
          return (
            <section
              className="px-8 md:px-16"
              style={{
                paddingTop: theme.sectionSpacingValue,
                paddingBottom: theme.sectionSpacingValue,
              }}
            >
              {useRealContent ? (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                  <span className="size-1.5 rounded-full bg-success" />
                  Echte content uit hun website
                </div>
              ) : null}
              <VerticalSectionView
                section={section}
                theme={theme}
                accent={brand.accent}
                headingStyle={headingStyle}
                ctaTarget={ctaTarget}
              />
            </section>
          );
        })()}

        {/* === EXPERIENCE === */}
        <section
          className="px-8 md:px-16"
          style={{
            paddingTop: theme.sectionSpacingValue,
            paddingBottom: theme.sectionSpacingValue,
          }}
        >
          <Reveal>
            <div className="grid gap-12 md:grid-cols-[1.4fr_1fr] md:items-center">
              <div>
                <h2
                  className="balance text-3xl tracking-tight md:text-4xl"
                  style={headingStyle}
                >
                  {data.experience.headline}
                </h2>
                <p className="mt-5 leading-relaxed text-text-muted pretty">
                  {data.experience.body}
                </p>
              </div>
              <ul className="space-y-3">
                {data.experience.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="border border-border bg-surface/40 px-4 py-3 text-sm"
                    style={{ borderRadius: theme.cornerRadiusValue }}
                  >
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </section>

        {/* === TESTIMONIAL === */}
        <section
          className="px-8 md:px-16"
          style={{
            paddingTop: theme.sectionSpacingValue,
            paddingBottom: theme.sectionSpacingValue,
          }}
        >
          <Reveal>
            <div
              className="border border-border bg-surface/40 p-10 md:p-16"
              style={{ borderRadius: theme.cornerRadiusValue }}
            >
              <p
                className="text-2xl leading-snug tracking-tight md:text-3xl"
                style={headingStyle}
              >
                &ldquo;{data.testimonial.quote}&rdquo;
              </p>
              <p className="mt-6 text-sm text-text-muted">
                — {data.testimonial.author},{" "}
                <span className="text-text-subtle">
                  {data.testimonial.role}
                </span>
              </p>
            </div>
          </Reveal>
        </section>

        {/* === PRICING === */}
        <section
          className="px-8 md:px-16"
          style={{
            paddingTop: theme.sectionSpacingValue,
            paddingBottom: theme.sectionSpacingValue,
          }}
        >
          <Reveal>
            <h2
              className="balance mb-12 text-3xl tracking-tight md:text-4xl"
              style={headingStyle}
            >
              Tarieven
            </h2>
          </Reveal>
          <div className="grid gap-3 md:grid-cols-3">
            {data.pricing.map((p, i) => (
              <Reveal
                key={i}
                delay={i * 0.06}
                className="relative border p-6"
                style={{
                  borderColor: p.highlighted
                    ? `${brand.accent}66`
                    : "var(--border, hsl(240 6% 16%))",
                  background: p.highlighted
                    ? `${brand.accent}10`
                    : "var(--surface, hsl(240 6% 7%))",
                  borderRadius: theme.cornerRadiusValue,
                }}
              >
                {p.highlighted ? (
                  <Badge variant="accent" className="absolute right-4 top-4">
                    populair
                  </Badge>
                ) : null}
                <h3 className="text-lg tracking-tight" style={headingStyle}>
                  {p.name}
                </h3>
                <p className="mt-1 text-sm text-text-muted">{p.description}</p>
                <p className="mt-6 text-3xl tracking-tight" style={headingStyle}>
                  {p.price}{" "}
                  <span className="text-sm font-normal text-text-subtle">
                    {p.cadence}
                  </span>
                </p>
                <ul className="mt-6 space-y-2 text-sm text-text-muted">
                  {p.features.map((f, j) => (
                    <li key={j}>· {f}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </section>

        {/* === FAQ === */}
        <section
          className="px-8 md:px-16"
          style={{
            paddingTop: theme.sectionSpacingValue,
            paddingBottom: theme.sectionSpacingValue,
          }}
        >
          <Reveal>
            <h2
              className="balance mb-10 text-3xl tracking-tight md:text-4xl"
              style={headingStyle}
            >
              Veelgestelde vragen
            </h2>
          </Reveal>
          <div
            className="overflow-hidden border border-border"
            style={{ borderRadius: theme.cornerRadiusValue }}
          >
            {data.faq.map((q, i) => (
              <details
                key={i}
                className="group border-b border-border p-6 last:border-b-0"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between text-base tracking-tight">
                  <span style={headingStyle}>{q.question}</span>
                  <span className="font-mono text-text-subtle transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  {q.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* === FINAL CTA === */}
        <section
          className="px-8 text-center md:px-16"
          style={{
            paddingTop: theme.sectionSpacingValue,
            paddingBottom: theme.sectionSpacingValue,
          }}
        >
          <Reveal>
            <h2
              className="balance mx-auto max-w-2xl text-4xl leading-tight tracking-tightest md:text-5xl"
              style={{
                ...headingStyle,
                color: brand.accent,
              }}
            >
              {data.cta.headline}
            </h2>
            <p className="balance mx-auto mt-5 max-w-md text-text-muted">
              {data.cta.body}
            </p>
            <button
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-bg"
              style={{
                background: brand.accent,
                borderRadius: theme.cornerRadius === "pillowed" ? "9999px" : theme.cornerRadiusValue,
              }}
            >
              <CtaIcon className="size-4" />
              {data.cta.button}
            </button>
          </Reveal>
        </section>
      </div>
    </div>
  );
}

function ThemeBackground({
  theme,
  accent,
}: {
  theme: ReturnType<typeof getTheme>;
  accent: string;
}) {
  if (theme.decorPattern === "none") return null;

  if (theme.decorPattern === "gradient-mesh") {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[420px] opacity-40"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${accent}30, transparent 70%)`,
        }}
      />
    );
  }

  if (theme.decorPattern === "grid-lines") {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[600px] opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          color: "white",
        }}
      />
    );
  }

  if (theme.decorPattern === "noise") {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"120\"><filter id=\"n\"><feTurbulence baseFrequency=\"0.9\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23n)\" opacity=\"0.5\"/></svg>')",
        }}
      />
    );
  }

  if (theme.decorPattern === "ornamental") {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[500px]"
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at 20% 30%, ${accent}40, transparent 50%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at 80% 60%, ${accent}30, transparent 60%)`,
          }}
        />
      </div>
    );
  }

  return null;
}

function Hero({
  data,
  theme,
  headingStyle,
  accent,
  ctaTarget,
  CtaIcon,
}: {
  data: LandingPage;
  theme: ReturnType<typeof getTheme>;
  headingStyle: React.CSSProperties;
  accent: string;
  ctaTarget: string;
  CtaIcon: React.ElementType;
}) {
  const sizeClass =
    theme.heroHeadlineSize === "oversized"
      ? "text-5xl md:text-7xl lg:text-8xl"
      : theme.heroHeadlineSize === "compact"
        ? "text-3xl md:text-5xl"
        : "text-4xl md:text-6xl";

  // Layout-variants
  if (theme.heroLayout === "split-image") {
    return (
      <section className="relative grid gap-8 px-8 py-20 md:grid-cols-2 md:px-16 md:py-28">
        <Reveal>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
            {data.hero.eyebrow}
          </span>
          <h1
            className={`balance mt-6 ${sizeClass} leading-[1.04]`}
            style={headingStyle}
          >
            {data.hero.headline}
          </h1>
          <p className="mt-6 max-w-md text-text-muted md:text-lg">
            {data.hero.subheadline}
          </p>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row">
            <CtaButton
              label={data.hero.primaryCta}
              accent={accent}
              icon={CtaIcon}
              theme={theme}
              primary
            />
            <CtaButton
              label={data.hero.secondaryCta}
              accent={accent}
              theme={theme}
            />
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <div
            className="aspect-[4/5] w-full overflow-hidden"
            style={{
              borderRadius: theme.cornerRadiusValue,
              background: `linear-gradient(135deg, ${accent}40, ${accent}10), repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.02) 8px, rgba(255,255,255,0.02) 16px)`,
            }}
          />
        </Reveal>
      </section>
    );
  }

  if (theme.heroLayout === "asymmetric") {
    return (
      <section className="relative px-8 py-20 md:px-16 md:py-32">
        <Reveal>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
            {data.hero.eyebrow}
          </span>
          <h1
            className={`balance mt-8 max-w-4xl ${sizeClass} leading-[1.0]`}
            style={{ ...headingStyle, fontStyle: theme.heroToneClass.includes("italic") ? "italic" : "normal" }}
          >
            {data.hero.headline}
          </h1>
          <div className="mt-12 grid gap-8 md:grid-cols-[1fr_400px] md:items-end">
            <p className="max-w-md text-text-muted md:text-lg">
              {data.hero.subheadline}
            </p>
            <div className="flex flex-col gap-2">
              <CtaButton
                label={data.hero.primaryCta}
                accent={accent}
                icon={CtaIcon}
                theme={theme}
                primary
              />
              <CtaButton
                label={data.hero.secondaryCta}
                accent={accent}
                theme={theme}
              />
            </div>
          </div>
        </Reveal>
      </section>
    );
  }

  if (theme.heroLayout === "stacked-tall") {
    return (
      <section className="relative px-8 py-20 md:px-16 md:py-32">
        <Reveal>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
            {data.hero.eyebrow}
          </span>
          <h1
            className={`balance mt-10 max-w-5xl ${sizeClass} leading-[0.95] ${
              theme.heroToneClass.includes("uppercase") ? "uppercase" : ""
            }`}
            style={headingStyle}
          >
            {data.hero.headline}
          </h1>
          <p className="mt-8 max-w-xl text-text-muted md:text-lg">
            {data.hero.subheadline}
          </p>
          <div className="mt-10 flex flex-col gap-2 sm:flex-row">
            <CtaButton
              label={data.hero.primaryCta}
              accent={accent}
              icon={CtaIcon}
              theme={theme}
              primary
            />
            <CtaButton
              label={data.hero.secondaryCta}
              accent={accent}
              theme={theme}
            />
          </div>
        </Reveal>
      </section>
    );
  }

  // centered (default)
  return (
    <section className="relative px-8 py-20 text-center md:px-16 md:py-28">
      <Reveal>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
          {data.hero.eyebrow}
        </span>
      </Reveal>
      <Reveal delay={0.08}>
        <h1
          className={`balance mx-auto mt-6 max-w-3xl ${sizeClass} leading-[1.04]`}
          style={headingStyle}
        >
          {data.hero.headline}
        </h1>
      </Reveal>
      <Reveal delay={0.16}>
        <p className="balance mx-auto mt-6 max-w-xl text-text-muted md:text-lg">
          {data.hero.subheadline}
        </p>
      </Reveal>
      <Reveal delay={0.24}>
        <div className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <CtaButton
            label={data.hero.primaryCta}
            accent={accent}
            icon={CtaIcon}
            theme={theme}
            primary
          />
          <CtaButton
            label={data.hero.secondaryCta}
            accent={accent}
            theme={theme}
          />
        </div>
      </Reveal>
    </section>
  );
}

function CtaButton({
  label,
  accent,
  icon: Icon,
  theme,
  primary = false,
}: {
  label: string;
  accent: string;
  icon?: React.ElementType;
  theme: ReturnType<typeof getTheme>;
  primary?: boolean;
}) {
  const radius =
    theme.cornerRadius === "pillowed" ? "9999px" : theme.cornerRadiusValue;
  if (primary) {
    return (
      <button
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium tracking-tight text-bg"
        style={{ background: accent, borderRadius: radius }}
      >
        {Icon ? <Icon className="size-4" /> : null}
        {label}
      </button>
    );
  }
  return (
    <button
      className="inline-flex items-center justify-center border border-border px-5 py-2.5 text-sm font-medium tracking-tight text-text"
      style={{ borderRadius: radius }}
    >
      {label}
    </button>
  );
}

function FeatureGrid({
  data,
  theme,
  accent,
}: {
  data: LandingPage;
  theme: ReturnType<typeof getTheme>;
  accent: string;
}) {
  return (
    <div
      className="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3"
      style={{ borderRadius: theme.cornerRadiusValue }}
    >
      {data.features.map((f, i) => (
        <Reveal key={i} delay={i * 0.08} className="bg-elevated p-8">
          <span className="text-xl" style={{ color: accent }}>
            {f.icon}
          </span>
          <h3
            className="mt-6 text-lg tracking-tight"
            style={{
              fontFamily: theme.fontHeading,
              fontWeight: theme.headingWeight,
            }}
          >
            {f.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            {f.description}
          </p>
        </Reveal>
      ))}
    </div>
  );
}

function VerticalSectionView({
  section,
  theme,
  accent,
  headingStyle,
  ctaTarget,
}: {
  section: NonNullable<LandingPage["verticalSection"]>;
  theme: ReturnType<typeof getTheme>;
  accent: string;
  headingStyle: React.CSSProperties;
  ctaTarget: string;
}) {
  const providerLabel = PROVIDER_LABELS[section.bookingProvider] ?? section.bookingProvider;

  return (
    <Reveal>
      <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2
            className="balance text-3xl tracking-tight md:text-4xl"
            style={headingStyle}
          >
            {section.title}
          </h2>
          {section.intro ? (
            <p className="mt-3 max-w-xl text-sm text-text-muted md:text-base">
              {section.intro}
            </p>
          ) : null}
        </div>
        {ctaTarget !== "menu" ? (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              {providerLabel}
            </span>
          </div>
        ) : null}
      </div>

      <div
        className="overflow-hidden border border-border"
        style={{ borderRadius: theme.cornerRadiusValue }}
      >
        {section.items.map((item, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 border-b border-border bg-surface/30 p-5 last:border-b-0 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3
                  className="text-base tracking-tight md:text-lg"
                  style={{
                    fontFamily: theme.fontHeading,
                    fontWeight: theme.headingWeight,
                  }}
                >
                  {item.name}
                </h3>
                {item.badge ? (
                  <Badge variant="accent">{item.badge}</Badge>
                ) : null}
              </div>
              {item.description ? (
                <p className="mt-1 text-sm text-text-muted">
                  {item.description}
                </p>
              ) : null}
              {item.duration ? (
                <p className="mt-1 flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                  <Clock className="size-3" /> {item.duration}
                </p>
              ) : null}
            </div>
            {item.priceFrom ? (
              <div className="flex items-center gap-3">
                <span
                  className="text-lg tracking-tight"
                  style={{ ...headingStyle, color: accent }}
                >
                  {item.priceFrom}
                </span>
                <button
                  className="border border-border bg-elevated px-3 py-1.5 text-xs font-medium"
                  style={{ borderRadius: theme.cornerRadius === "pillowed" ? "9999px" : theme.cornerRadiusValue }}
                >
                  {ctaTarget === "reservation" ? "Reserveer" : ctaTarget === "offerte" ? "Offerte" : "Boek"}
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Reveal>
  );
}

function BrowserChrome({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-surface/80 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="size-2.5 rounded-full bg-danger/70" />
        <span className="size-2.5 rounded-full bg-warning/70" />
        <span className="size-2.5 rounded-full bg-success/70" />
      </div>
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
        {label}
      </span>
      <span className="size-2.5" />
    </div>
  );
}
