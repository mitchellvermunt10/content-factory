"use client";

import { Badge } from "@/components/ui/badge";
import { BUSINESS_TYPES, TONE_PRESETS } from "@/lib/constants";
import type { WizardData } from "./index";

export function StepReview({ data }: { data: WizardData }) {
  const type = BUSINESS_TYPES.find((t) => t.value === data.businessType);
  const tone = TONE_PRESETS.find((t) => t.value === data.tone);
  const colors = data.brandColors ?? [];
  const usps = (data.usps ?? []).filter((u) => u && u.trim().length > 0);

  return (
    <div className="space-y-7">
      <Section title="Bedrijf">
        <Row label="Type">{type?.label ?? "—"}</Row>
        <Row label="Naam">{data.name || "—"}</Row>
        <Row label="Stad">{data.city || "—"}</Row>
        {data.website ? <Row label="Website">{data.website}</Row> : null}
        {data.phone ? <Row label="Telefoon">{data.phone}</Row> : null}
      </Section>

      <Section title="Merk">
        <Row label="Tone of voice">
          <Badge variant="accent">{tone?.label ?? "—"}</Badge>
        </Row>
        <Row label="Kleuren">
          <div className="flex items-center gap-2">
            {colors.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span
                  className="size-4 rounded-md border border-border"
                  style={{ background: c }}
                />
                <code className="font-mono text-xs text-text-muted">{c}</code>
              </div>
            ))}
          </div>
        </Row>
      </Section>

      <Section title="Doelgroep & aanbod">
        <Row label="Doelgroep">{data.audience || "—"}</Row>
        <Row label="USPs">
          <ul className="space-y-1">
            {usps.length === 0 ? <li>—</li> : null}
            {usps.map((u, i) => (
              <li key={i} className="text-text">
                · {u}
              </li>
            ))}
          </ul>
        </Row>
        {data.offer ? <Row label="Aanbieding">{data.offer}</Row> : null}
      </Section>

      <p className="rounded-xl border border-border bg-surface/40 p-4 text-sm text-text-muted">
        Klopt alles? Klik op{" "}
        <span className="text-text">Genereer campagne</span> en de vier
        deliverables draaien parallel. Dat duurt ongeveer 30-60 seconden in live
        mode, of een halve seconde in mock-mode.
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-6">
      <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
        {title}
      </h3>
      <dl className="mt-4 space-y-3">{children}</dl>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-baseline gap-4 border-t border-border pt-3 first:border-t-0 first:pt-0">
      <dt className="text-xs text-text-subtle">{label}</dt>
      <dd className="text-sm text-text">{children}</dd>
    </div>
  );
}
