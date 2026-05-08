import { getSupabase, isSupabaseEnabled } from "./server";
import type {
  ResearchInput,
  ResearchResult,
  ResearchStatus,
} from "@/lib/schemas/prospect";

export type StoredResearch = {
  id: string;
  ownerEmail: string | null;
  city: string;
  vertical: string;
  serviceTier: string;
  extraCriteria: string | null;
  status: ResearchStatus;
  result: ResearchResult | null;
  costCents: number;
  durationMs: number | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
};

export async function createResearchRow(input: {
  id: string;
  research: ResearchInput;
}): Promise<void> {
  if (!isSupabaseEnabled()) return;
  const supa = getSupabase();
  const { error } = await supa.from("prospect_research").insert({
    id: input.id,
    owner_email: input.research.ownerEmail ?? null,
    city: input.research.city,
    vertical: input.research.vertical,
    service_tier: input.research.serviceTier,
    extra_criteria: input.research.extraCriteria ?? null,
    status: "running",
  });
  if (error) throw new Error(`Research insert faalde: ${error.message}`);
}

export async function completeResearch(input: {
  id: string;
  result: ResearchResult;
  costCents: number;
  durationMs: number;
}): Promise<void> {
  if (!isSupabaseEnabled()) return;
  const supa = getSupabase();
  const { error } = await supa
    .from("prospect_research")
    .update({
      status: "complete",
      result: input.result,
      cost_cents: input.costCents,
      duration_ms: input.durationMs,
      completed_at: new Date().toISOString(),
    })
    .eq("id", input.id);
  if (error) throw new Error(`Research complete faalde: ${error.message}`);
}

export async function failResearch(input: {
  id: string;
  errorMessage: string;
}): Promise<void> {
  if (!isSupabaseEnabled()) return;
  const supa = getSupabase();
  await supa
    .from("prospect_research")
    .update({
      status: "failed",
      error_message: input.errorMessage.slice(0, 1000),
      completed_at: new Date().toISOString(),
    })
    .eq("id", input.id);
}

export async function getResearch(id: string): Promise<StoredResearch | null> {
  if (!isSupabaseEnabled()) return null;
  const supa = getSupabase();
  const { data, error } = await supa
    .from("prospect_research")
    .select(
      "id, owner_email, city, vertical, service_tier, extra_criteria, status, result, cost_cents, duration_ms, error_message, created_at, completed_at"
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Research get faalde: ${error.message}`);
  if (!data) return null;
  return mapRow(data);
}

export async function listResearchForOwner(
  ownerEmail: string
): Promise<StoredResearch[]> {
  if (!isSupabaseEnabled()) return [];
  const supa = getSupabase();
  const { data, error } = await supa
    .from("prospect_research")
    .select(
      "id, owner_email, city, vertical, service_tier, extra_criteria, status, result, cost_cents, duration_ms, error_message, created_at, completed_at"
    )
    .eq("owner_email", ownerEmail)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw new Error(`Research list faalde: ${error.message}`);
  return (data ?? []).map(mapRow);
}

function mapRow(d: {
  id: string;
  owner_email: string | null;
  city: string;
  vertical: string;
  service_tier: string;
  extra_criteria: string | null;
  status: string;
  result: ResearchResult | null;
  cost_cents: number;
  duration_ms: number | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}): StoredResearch {
  return {
    id: d.id,
    ownerEmail: d.owner_email,
    city: d.city,
    vertical: d.vertical,
    serviceTier: d.service_tier,
    extraCriteria: d.extra_criteria,
    status: d.status as ResearchStatus,
    result: d.result,
    costCents: d.cost_cents,
    durationMs: d.duration_ms,
    errorMessage: d.error_message,
    createdAt: d.created_at,
    completedAt: d.completed_at,
  };
}
