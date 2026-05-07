"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { BUSINESS_TYPES } from "@/lib/constants";
import type { WizardData } from "./index";

export function StepBusiness({
  data,
  onChange,
}: {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
}) {
  return (
    <div className="space-y-7">
      <Field label="Type bedrijf">
        <Select
          value={data.businessType ?? ""}
          onValueChange={(v) =>
            onChange({ businessType: (v || undefined) as WizardData["businessType"] })
          }
        >
          <SelectTrigger data-testid="business-type-trigger">
            <SelectValue placeholder="Selecteer een vertical" />
          </SelectTrigger>
          <SelectContent>
            {BUSINESS_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                <span className="mr-2 text-accent">{t.emoji}</span>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Bedrijfsnaam">
          <Input
            value={data.name ?? ""}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Bijv. Atelier Nord"
            data-testid="brief-name"
          />
        </Field>
        <Field label="Stad">
          <Input
            value={data.city ?? ""}
            onChange={(e) => onChange({ city: e.target.value })}
            placeholder="Bijv. Amsterdam"
            data-testid="brief-city"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Website (optioneel)">
          <Input
            type="url"
            value={data.website ?? ""}
            onChange={(e) => onChange({ website: e.target.value })}
            placeholder="https://"
          />
        </Field>
        <Field label="Telefoon (optioneel)">
          <Input
            value={data.phone ?? ""}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+31 ..."
          />
        </Field>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
