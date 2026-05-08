import { getSupabase, isSupabaseEnabled } from "./server";

export type CampaignImage = {
  id: string;
  campaignId: string;
  artifactKey: string;
  itemIndex: number | null;
  prompt: string;
  publicUrl: string;
  storagePath: string;
  width: number;
  height: number;
  createdAt: string;
};

const BUCKET = "campaign-images";

export async function uploadImageBase64(input: {
  campaignId: string;
  artifactKey: string;
  itemIndex: number | null;
  base64: string;
}): Promise<{ storagePath: string; publicUrl: string }> {
  if (!isSupabaseEnabled()) {
    throw new Error("Supabase is niet geconfigureerd.");
  }
  const supa = getSupabase();
  const ts = Date.now();
  const idxPart =
    input.itemIndex === null ? "x" : String(input.itemIndex).padStart(3, "0");
  const filename = `${input.campaignId}/${input.artifactKey}-${idxPart}-${ts}.png`;

  const buffer = Buffer.from(input.base64, "base64");

  const { error: uploadErr } = await supa.storage
    .from(BUCKET)
    .upload(filename, buffer, {
      contentType: "image/png",
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadErr) {
    throw new Error(`Storage upload faalde: ${uploadErr.message}`);
  }

  const { data: urlData } = supa.storage.from(BUCKET).getPublicUrl(filename);
  return { storagePath: filename, publicUrl: urlData.publicUrl };
}

export async function recordImage(input: {
  campaignId: string;
  artifactKey: string;
  itemIndex: number | null;
  prompt: string;
  storagePath: string;
  publicUrl: string;
  width: number;
  height: number;
}): Promise<CampaignImage> {
  if (!isSupabaseEnabled()) {
    throw new Error("Supabase is niet geconfigureerd.");
  }
  const supa = getSupabase();
  const { data, error } = await supa
    .from("campaign_images")
    .insert({
      campaign_id: input.campaignId,
      artifact_key: input.artifactKey,
      item_index: input.itemIndex,
      prompt: input.prompt,
      storage_path: input.storagePath,
      public_url: input.publicUrl,
      width: input.width,
      height: input.height,
    })
    .select(
      "id, campaign_id, artifact_key, item_index, prompt, storage_path, public_url, width, height, created_at"
    )
    .single();
  if (error) throw new Error(`Insert image-record faalde: ${error.message}`);
  return mapImage(data);
}

export async function listImagesForCampaign(
  campaignId: string
): Promise<CampaignImage[]> {
  if (!isSupabaseEnabled()) return [];
  const supa = getSupabase();
  const { data, error } = await supa
    .from("campaign_images")
    .select(
      "id, campaign_id, artifact_key, item_index, prompt, storage_path, public_url, width, height, created_at"
    )
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`List images faalde: ${error.message}`);
  return (data ?? []).map(mapImage);
}

export async function deleteImage(id: string): Promise<void> {
  if (!isSupabaseEnabled()) return;
  const supa = getSupabase();
  // Eerst rij ophalen om storage path te kennen.
  const { data, error } = await supa
    .from("campaign_images")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Lookup image faalde: ${error.message}`);
  if (!data) return;
  await supa.storage.from(BUCKET).remove([data.storage_path]).catch(() => {});
  await supa.from("campaign_images").delete().eq("id", id);
}

function mapImage(d: {
  id: string;
  campaign_id: string;
  artifact_key: string;
  item_index: number | null;
  prompt: string;
  storage_path: string;
  public_url: string;
  width: number;
  height: number;
  created_at: string;
}): CampaignImage {
  return {
    id: d.id,
    campaignId: d.campaign_id,
    artifactKey: d.artifact_key,
    itemIndex: d.item_index,
    prompt: d.prompt,
    storagePath: d.storage_path,
    publicUrl: d.public_url,
    width: d.width,
    height: d.height,
    createdAt: d.created_at,
  };
}
