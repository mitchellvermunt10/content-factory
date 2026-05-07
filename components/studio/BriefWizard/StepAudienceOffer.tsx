"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { WizardData } from "./index";

export function StepAudienceOffer({
  data,
  onChange,
}: {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
}) {
  const usps = data.usps ?? [""];

  function setUsp(i: number, v: string) {
    const next = [...usps];
    next[i] = v;
    onChange({ usps: next });
  }

  function addUsp() {
    if (usps.length >= 6) return;
    onChange({ usps: [...usps, ""] });
  }

  function removeUsp(i: number) {
    onChange({ usps: usps.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="space-y-9">
      <div className="space-y-2.5">
        <Label>Doelgroep</Label>
        <Textarea
          value={data.audience ?? ""}
          onChange={(e) => onChange({ audience: e.target.value })}
          placeholder="Wie zijn je klanten? Leeftijd, lifestyle, urgentie, koopgedrag — hoe specifieker, hoe scherper de copy."
          rows={5}
          data-testid="brief-audience"
        />
        <p className="text-xs text-text-subtle">
          Minimaal 20 tekens.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>USPs / verschilmakers</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addUsp}
            disabled={usps.length >= 6}
          >
            <Plus className="size-3.5" /> USP
          </Button>
        </div>
        <div className="space-y-2">
          {usps.map((u, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={u}
                onChange={(e) => setUsp(i, e.target.value)}
                placeholder={`USP ${i + 1}`}
                data-testid={`brief-usp-${i}`}
              />
              {usps.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeUsp(i)}
                  className="text-text-subtle hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <Label>Aanbieding / promotie (optioneel)</Label>
        <Input
          value={data.offer ?? ""}
          onChange={(e) => onChange({ offer: e.target.value })}
          placeholder="Bijv. -15% op de eerste behandeling tot 30 juni"
        />
      </div>
    </div>
  );
}
