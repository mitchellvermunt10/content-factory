"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SeoCopy } from "@/lib/schemas/artifacts/seo";

export function SeoPreview({ data }: { data: SeoCopy }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Meta &amp; Open Graph</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-xl border border-border bg-bg/40 p-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              Google preview
            </span>
            <h3 className="mt-3 text-xl text-[#8ab4f8]">{data.metaTitle}</h3>
            <p className="mt-1 text-sm text-success">
              {data.metaDescription.slice(0, 160)}
            </p>
            <p className="mt-2 font-mono text-xs text-text-subtle">
              {data.metaTitle.length} / 70 ·{" "}
              {data.metaDescription.length} / 180
            </p>
          </div>

          <DefRow label="OG title" value={data.ogTitle} />
          <DefRow label="OG description" value={data.ogDescription} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keywords</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              Primair
            </span>
            <Badge variant="accent" className="text-sm">
              {data.primaryKeyword}
            </Badge>
          </div>
          <div className="space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              Secundair
            </span>
            <div className="flex flex-wrap gap-2">
              {data.secondaryKeywords.map((k, i) => (
                <Badge key={i}>{k}</Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              Long-tail
            </span>
            <div className="flex flex-wrap gap-2">
              {data.longTailKeywords.map((k, i) => (
                <Badge key={i} variant="outline">
                  {k}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Headings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              H1
            </span>
            <p className="mt-1 text-lg font-medium tracking-tight">
              {data.headings.h1}
            </p>
          </div>
          <div className="space-y-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
              H2
            </span>
            <ul className="space-y-1 text-sm text-text-muted">
              {data.headings.h2s.map((h, i) => (
                <li key={i}>· {h}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FAQ schema</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {data.faqSchema.map((q, i) => (
            <div key={i} className="py-3 first:pt-0 last:pb-0">
              <p className="text-sm font-medium tracking-tight text-text">
                {q.question}
              </p>
              <p className="mt-1 text-sm text-text-muted">{q.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Image alts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.imageAlts.map((a, i) => (
            <div
              key={i}
              className="flex flex-col gap-1 rounded-xl border border-border bg-bg/40 p-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <Badge variant="outline" className="self-start">
                {a.context}
              </Badge>
              <span className="text-sm text-text-muted">{a.alt}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Local Business schema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <DefRow label="Type" value={data.localSchema.businessType} />
          <DefRow
            label="Beschrijving"
            value={data.localSchema.description}
          />
          <DefRow
            label="Service area"
            value={data.localSchema.serviceArea.join(", ")}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function DefRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-baseline gap-3">
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
        {label}
      </dt>
      <dd className="text-sm text-text">{value}</dd>
    </div>
  );
}
