"use client";

import { Reveal } from "@/components/motion/Reveal";
import { Badge } from "@/components/ui/badge";
import type { LandingPage } from "@/lib/schemas/artifacts/landing";
import type { Brand } from "@/lib/schemas/brand";

export function LandingPagePreview({
  data,
  brand,
}: {
  data: LandingPage;
  brand: Brand;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-elevated">
      <BrowserChrome />
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[420px] opacity-40"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${brand.accent}30, transparent 70%)`,
          }}
        />

        <section className="relative px-8 py-20 text-center md:px-16 md:py-28">
          <Reveal>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
              {data.hero.eyebrow}
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="balance mx-auto mt-6 max-w-3xl text-4xl font-medium leading-[1.04] tracking-tightest md:text-6xl">
              <span className="text-gradient">{data.hero.headline}</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="balance mx-auto mt-6 max-w-xl text-text-muted md:text-lg">
              {data.hero.subheadline}
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row">
              <button
                className="rounded-full px-5 py-2.5 text-sm font-medium tracking-tight text-bg"
                style={{ background: brand.accent }}
              >
                {data.hero.primaryCta}
              </button>
              <button className="rounded-full border border-border px-5 py-2.5 text-sm font-medium tracking-tight text-text">
                {data.hero.secondaryCta}
              </button>
            </div>
          </Reveal>
        </section>

        <div className="border-y border-border bg-surface/40 py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
            {data.marquee.map((m, i) => (
              <span key={i}>· {m}</span>
            ))}
          </div>
        </div>

        <section className="px-8 py-20 md:px-16">
          <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
            {data.features.map((f, i) => (
              <Reveal
                key={i}
                delay={i * 0.08}
                className="bg-elevated p-8"
              >
                <span className="text-xl text-accent">{f.icon}</span>
                <h3 className="mt-6 text-lg font-medium tracking-tight">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {f.description}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="px-8 py-20 md:px-16">
          <Reveal>
            <div className="grid gap-12 md:grid-cols-[1.4fr_1fr] md:items-center">
              <div>
                <h2 className="balance text-3xl font-medium tracking-tight md:text-4xl">
                  <span className="text-gradient">
                    {data.experience.headline}
                  </span>
                </h2>
                <p className="mt-5 leading-relaxed text-text-muted pretty">
                  {data.experience.body}
                </p>
              </div>
              <ul className="space-y-3">
                {data.experience.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-border bg-surface/40 px-4 py-3 text-sm"
                  >
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </section>

        <section className="px-8 py-20 md:px-16">
          <Reveal>
            <div className="rounded-2xl border border-border bg-surface/40 p-10 md:p-16">
              <p className="text-2xl font-medium leading-snug tracking-tight md:text-3xl">
                <span className="text-gradient">
                  &ldquo;{data.testimonial.quote}&rdquo;
                </span>
              </p>
              <p className="mt-6 text-sm text-text-muted">
                — {data.testimonial.author},{" "}
                <span className="text-text-subtle">{data.testimonial.role}</span>
              </p>
            </div>
          </Reveal>
        </section>

        <section className="px-8 py-20 md:px-16">
          <Reveal>
            <h2 className="balance mb-12 text-3xl font-medium tracking-tight md:text-4xl">
              <span className="text-gradient">Tarieven</span>
            </h2>
          </Reveal>
          <div className="grid gap-3 md:grid-cols-3">
            {data.pricing.map((p, i) => (
              <Reveal
                key={i}
                delay={i * 0.06}
                className={`relative rounded-2xl border p-6 ${
                  p.highlighted
                    ? "border-accent/40 bg-accent/5"
                    : "border-border bg-surface/40"
                }`}
              >
                {p.highlighted && (
                  <Badge variant="accent" className="absolute right-4 top-4">
                    populair
                  </Badge>
                )}
                <h3 className="text-lg font-medium tracking-tight">{p.name}</h3>
                <p className="mt-1 text-sm text-text-muted">{p.description}</p>
                <p className="mt-6 text-3xl font-medium tracking-tight">
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

        <section className="px-8 py-20 md:px-16">
          <Reveal>
            <h2 className="balance mb-10 text-3xl font-medium tracking-tight md:text-4xl">
              <span className="text-gradient">Veelgestelde vragen</span>
            </h2>
          </Reveal>
          <div className="overflow-hidden rounded-2xl border border-border">
            {data.faq.map((q, i) => (
              <details
                key={i}
                className="group border-b border-border p-6 last:border-b-0"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between text-base font-medium tracking-tight">
                  {q.question}
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

        <section className="px-8 py-24 text-center md:px-16">
          <Reveal>
            <h2 className="balance mx-auto max-w-2xl text-4xl font-medium leading-tight tracking-tightest md:text-5xl">
              <span className="text-gradient-accent">{data.cta.headline}</span>
            </h2>
            <p className="balance mx-auto mt-5 max-w-md text-text-muted">
              {data.cta.body}
            </p>
            <button
              className="mt-8 rounded-full px-6 py-3 text-sm font-medium text-bg"
              style={{ background: brand.accent }}
            >
              {data.cta.button}
            </button>
          </Reveal>
        </section>
      </div>
    </div>
  );
}

function BrowserChrome() {
  return (
    <div className="flex items-center justify-between border-b border-border bg-surface/80 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="size-2.5 rounded-full bg-danger/70" />
        <span className="size-2.5 rounded-full bg-warning/70" />
        <span className="size-2.5 rounded-full bg-success/70" />
      </div>
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
        landing · preview
      </span>
      <span className="size-2.5" />
    </div>
  );
}
