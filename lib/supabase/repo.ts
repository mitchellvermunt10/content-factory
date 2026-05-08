import { getSupabase, isSupabaseEnabled } from "./server";
import type { Campaign, Artifacts } from "@/lib/schemas/campaign";

export type CampaignStatus = "generating" | "complete" | "failed";

export async function createCampaignRow(input: {
  id: string;
  brief: Campaign["brief"];
  brand: Campaign["brand"];
  ownerEmail?: string | null;
}): Promise<void> {
  if (!isSupabaseEnabled()) return;
  const supa = getSupabase();
  const { error } = await supa.from("campaigns").insert({
    id: input.id,
    owner_email: input.ownerEmail ?? null,
    status: "generating",
    brief: input.brief,
    brand: input.brand,
    artifacts: {},
  });
  if (error) throw new Error(`Supabase create faalde: ${error.message}`);
}

export async function patchArtifact<K extends keyof Artifacts>(
  id: string,
  key: K,
  value: Artifacts[K]
): Promise<void> {
  if (!isSupabaseEnabled()) return;
  const supa = getSupabase();
  const { data: row, error: readErr } = await supa
    .from("campaigns")
    .select("artifacts")
    .eq("id", id)
    .maybeSingle();
  if (readErr) throw new Error(`Supabase read faalde: ${readErr.message}`);
  const current = (row?.artifacts ?? {}) as Partial<Artifacts>;
  const next = { ...current, [key]: value };
  const { error } = await supa
    .from("campaigns")
    .update({ artifacts: next })
    .eq("id", id);
  if (error) throw new Error(`Supabase patch faalde: ${error.message}`);
}

export async function setStatus(
  id: string,
  status: CampaignStatus
): Promise<void> {
  if (!isSupabaseEnabled()) return;
  const supa = getSupabase();
  const { error } = await supa
    .from("campaigns")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(`Supabase status faalde: ${error.message}`);
}

export async function getCampaignRow(id: string): Promise<Campaign | null> {
  if (!isSupabaseEnabled()) return null;
  const supa = getSupabase();
  const { data, error } = await supa
    .from("campaigns")
    .select("id, brief, brand, artifacts, created_at, updated_at, status")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Supabase get faalde: ${error.message}`);
  if (!data) return null;
  return {
    id: data.id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    brief: data.brief,
    brand: data.brand,
    artifacts: data.artifacts,
  } as Campaign;
}

export type BrandBrain = {
  id: string;
  ownerEmail: string;
  businessName: string;
  vertical: string | null;
  tone: string | null;
  briefTemplate: Campaign["brief"] | null;
  contextSummary: string | null;
  campaignCount: number;
  updatedAt: string;
};

export async function upsertBrandBrain(input: {
  ownerEmail: string;
  businessName: string;
  vertical?: string | null;
  tone?: string | null;
  briefTemplate?: Campaign["brief"] | null;
  contextSummary?: string | null;
}): Promise<void> {
  if (!isSupabaseEnabled()) return;
  const supa = getSupabase();
  const { data: existing } = await supa
    .from("brand_brain")
    .select("id, campaign_count")
    .eq("owner_email", input.ownerEmail)
    .eq("business_name", input.businessName)
    .maybeSingle();

  if (existing) {
    await supa
      .from("brand_brain")
      .update({
        vertical: input.vertical ?? null,
        tone: input.tone ?? null,
        brief_template: input.briefTemplate ?? null,
        context_summary: input.contextSummary ?? null,
        campaign_count: (existing.campaign_count ?? 0) + 1,
      })
      .eq("id", existing.id);
  } else {
    await supa.from("brand_brain").insert({
      owner_email: input.ownerEmail,
      business_name: input.businessName,
      vertical: input.vertical ?? null,
      tone: input.tone ?? null,
      brief_template: input.briefTemplate ?? null,
      context_summary: input.contextSummary ?? null,
      campaign_count: 1,
    });
  }
}

export async function getBrandBrain(
  ownerEmail: string,
  businessName: string
): Promise<BrandBrain | null> {
  if (!isSupabaseEnabled()) return null;
  const supa = getSupabase();
  const { data } = await supa
    .from("brand_brain")
    .select(
      "id, owner_email, business_name, vertical, tone, brief_template, context_summary, campaign_count, updated_at"
    )
    .eq("owner_email", ownerEmail)
    .eq("business_name", businessName)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    ownerEmail: data.owner_email,
    businessName: data.business_name,
    vertical: data.vertical,
    tone: data.tone,
    briefTemplate: data.brief_template,
    contextSummary: data.context_summary,
    campaignCount: data.campaign_count,
    updatedAt: data.updated_at,
  };
}

export type Approval = {
  id: string;
  campaignId: string;
  artifactKey: string;
  status: "approved" | "rejected" | "comment";
  comment: string | null;
  createdByEmail: string | null;
  createdByName: string | null;
  createdAt: string;
};

export async function createApproval(input: {
  campaignId: string;
  artifactKey?: string;
  status: "approved" | "rejected" | "comment";
  comment?: string | null;
  createdByEmail?: string | null;
  createdByName?: string | null;
}): Promise<Approval | null> {
  if (!isSupabaseEnabled()) return null;
  const supa = getSupabase();
  const { data, error } = await supa
    .from("approvals")
    .insert({
      campaign_id: input.campaignId,
      artifact_key: input.artifactKey ?? "campaign",
      status: input.status,
      comment: input.comment ?? null,
      created_by_email: input.createdByEmail ?? null,
      created_by_name: input.createdByName ?? null,
    })
    .select(
      "id, campaign_id, artifact_key, status, comment, created_by_email, created_by_name, created_at"
    )
    .single();
  if (error) throw new Error(`Approval insert faalde: ${error.message}`);
  return mapApproval(data);
}

export async function listApprovals(
  campaignId: string
): Promise<Approval[]> {
  if (!isSupabaseEnabled()) return [];
  const supa = getSupabase();
  const { data, error } = await supa
    .from("approvals")
    .select(
      "id, campaign_id, artifact_key, status, comment, created_by_email, created_by_name, created_at"
    )
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Approval list faalde: ${error.message}`);
  return (data ?? []).map(mapApproval);
}

function mapApproval(d: {
  id: string;
  campaign_id: string;
  artifact_key: string;
  status: string;
  comment: string | null;
  created_by_email: string | null;
  created_by_name: string | null;
  created_at: string;
}): Approval {
  return {
    id: d.id,
    campaignId: d.campaign_id,
    artifactKey: d.artifact_key,
    status: d.status as Approval["status"],
    comment: d.comment,
    createdByEmail: d.created_by_email,
    createdByName: d.created_by_name,
    createdAt: d.created_at,
  };
}

export async function listCampaignsForOwner(
  ownerEmail: string
): Promise<Campaign[]> {
  if (!isSupabaseEnabled()) return [];
  const supa = getSupabase();
  const { data, error } = await supa
    .from("campaigns")
    .select("id, brief, brand, artifacts, created_at, updated_at")
    .eq("owner_email", ownerEmail)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Supabase list faalde: ${error.message}`);
  return (data ?? []).map((d) => ({
    id: d.id,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
    brief: d.brief,
    brand: d.brand,
    artifacts: d.artifacts,
  })) as Campaign[];
}
