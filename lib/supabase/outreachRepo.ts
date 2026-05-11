import { getSupabase, isSupabaseEnabled } from "./server";

export type OutreachStatus =
  | "draft"
  | "sent"
  | "opened"
  | "replied"
  | "in_call"
  | "closed_won"
  | "closed_lost"
  | "dead";

export interface OutreachRecord {
  id: string;
  ownerEmail: string;
  prospectName: string;
  prospectEmail: string | null;
  prospectPhone: string | null;
  prospectCity: string | null;
  prospectVertical: string | null;
  prospectWebsite: string | null;
  prospectInstagram: string | null;
  campaignId: string | null;
  researchId: string | null;
  status: OutreachStatus;
  emailSubject: string | null;
  emailBody: string | null;
  sentAt: string | null;
  firstOpenedAt: string | null;
  lastOpenedAt: string | null;
  openCount: number;
  repliedAt: string | null;
  closedAt: string | null;
  followupCount: number;
  lastFollowupAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOutreachInput {
  ownerEmail: string;
  prospectName: string;
  prospectEmail?: string | null;
  prospectPhone?: string | null;
  prospectCity?: string | null;
  prospectVertical?: string | null;
  prospectWebsite?: string | null;
  prospectInstagram?: string | null;
  campaignId?: string | null;
  researchId?: string | null;
  emailSubject?: string | null;
  emailBody?: string | null;
  status?: OutreachStatus;
}

export async function createOutreach(
  input: CreateOutreachInput
): Promise<OutreachRecord | null> {
  if (!isSupabaseEnabled()) return null;
  const supa = getSupabase();
  const { data, error } = await supa
    .from("outreach")
    .insert({
      owner_email: input.ownerEmail,
      prospect_name: input.prospectName,
      prospect_email: input.prospectEmail ?? null,
      prospect_phone: input.prospectPhone ?? null,
      prospect_city: input.prospectCity ?? null,
      prospect_vertical: input.prospectVertical ?? null,
      prospect_website: input.prospectWebsite ?? null,
      prospect_instagram: input.prospectInstagram ?? null,
      campaign_id: input.campaignId ?? null,
      research_id: input.researchId ?? null,
      email_subject: input.emailSubject ?? null,
      email_body: input.emailBody ?? null,
      status: input.status ?? "draft",
    })
    .select("*")
    .single();
  if (error) throw new Error(`Outreach create faalde: ${error.message}`);
  return mapRow(data);
}

export async function listOutreach(
  ownerEmail: string
): Promise<OutreachRecord[]> {
  if (!isSupabaseEnabled()) return [];
  const supa = getSupabase();
  const { data, error } = await supa
    .from("outreach")
    .select("*")
    .eq("owner_email", ownerEmail)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(`Outreach list faalde: ${error.message}`);
  return (data ?? []).map(mapRow);
}

export async function getOutreach(id: string): Promise<OutreachRecord | null> {
  if (!isSupabaseEnabled()) return null;
  const supa = getSupabase();
  const { data, error } = await supa
    .from("outreach")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Outreach get faalde: ${error.message}`);
  if (!data) return null;
  return mapRow(data);
}

export async function updateOutreachStatus(
  id: string,
  status: OutreachStatus,
  notes?: string | null
): Promise<void> {
  if (!isSupabaseEnabled()) return;
  const supa = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patch: Record<string, any> = { status };
  if (notes !== undefined) patch.notes = notes;
  // Timestamps per status-overgang
  if (status === "sent") patch.sent_at = new Date().toISOString();
  if (status === "replied") patch.replied_at = new Date().toISOString();
  if (status === "closed_won" || status === "closed_lost") {
    patch.closed_at = new Date().toISOString();
  }
  const { error } = await supa.from("outreach").update(patch).eq("id", id);
  if (error) throw new Error(`Outreach update faalde: ${error.message}`);
}

export async function recordFollowup(id: string): Promise<void> {
  if (!isSupabaseEnabled()) return;
  const supa = getSupabase();
  const { data: current } = await supa
    .from("outreach")
    .select("followup_count")
    .eq("id", id)
    .maybeSingle();
  const newCount = ((current?.followup_count as number | undefined) ?? 0) + 1;
  await supa
    .from("outreach")
    .update({
      followup_count: newCount,
      last_followup_at: new Date().toISOString(),
    })
    .eq("id", id);
}

export async function recordCampaignView(input: {
  campaignId: string;
  outreachId?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
}): Promise<void> {
  if (!isSupabaseEnabled()) return;
  const supa = getSupabase();

  // Insert view event
  await supa.from("campaign_views").insert({
    campaign_id: input.campaignId,
    outreach_id: input.outreachId ?? null,
    user_agent: input.userAgent ?? null,
    referrer: input.referrer ?? null,
  });

  // Update outreach-record als gekoppeld
  const { data: outreaches } = await supa
    .from("outreach")
    .select("id, first_opened_at, open_count, status")
    .eq("campaign_id", input.campaignId);

  for (const row of outreaches ?? []) {
    // Skip eigen-view detectie (zelfde owner): we slaan dit voor v1 over —
    // owner ziet z'n eigen views ook, dat is OK voor tracking.
    const updates: Record<string, unknown> = {
      open_count: ((row.open_count as number | undefined) ?? 0) + 1,
      last_opened_at: new Date().toISOString(),
    };
    if (!row.first_opened_at) {
      updates.first_opened_at = new Date().toISOString();
    }
    // Auto-status-bump: sent → opened (alleen eerste keer)
    if (row.status === "sent" && !row.first_opened_at) {
      updates.status = "opened";
    }
    await supa.from("outreach").update(updates).eq("id", row.id);
  }
}

export async function listFollowupsNeeded(
  ownerEmail: string,
  daysSinceSent: number = 4
): Promise<OutreachRecord[]> {
  if (!isSupabaseEnabled()) return [];
  const supa = getSupabase();
  const cutoff = new Date(
    Date.now() - daysSinceSent * 24 * 60 * 60 * 1000
  ).toISOString();
  const { data, error } = await supa
    .from("outreach")
    .select("*")
    .eq("owner_email", ownerEmail)
    .in("status", ["sent", "opened"])
    .lt("sent_at", cutoff)
    .or(`last_followup_at.is.null,last_followup_at.lt.${cutoff}`)
    .order("sent_at", { ascending: true });
  if (error) throw new Error(`Followups query faalde: ${error.message}`);
  return (data ?? []).map(mapRow);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(d: any): OutreachRecord {
  return {
    id: d.id,
    ownerEmail: d.owner_email,
    prospectName: d.prospect_name,
    prospectEmail: d.prospect_email,
    prospectPhone: d.prospect_phone,
    prospectCity: d.prospect_city,
    prospectVertical: d.prospect_vertical,
    prospectWebsite: d.prospect_website,
    prospectInstagram: d.prospect_instagram,
    campaignId: d.campaign_id,
    researchId: d.research_id,
    status: d.status as OutreachStatus,
    emailSubject: d.email_subject,
    emailBody: d.email_body,
    sentAt: d.sent_at,
    firstOpenedAt: d.first_opened_at,
    lastOpenedAt: d.last_opened_at,
    openCount: d.open_count ?? 0,
    repliedAt: d.replied_at,
    closedAt: d.closed_at,
    followupCount: d.followup_count ?? 0,
    lastFollowupAt: d.last_followup_at,
    notes: d.notes,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}
