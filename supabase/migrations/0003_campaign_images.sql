-- Campaign images: gegenereerde visuals per artifact-item.
-- Eén rij per gegenereerde image, gekoppeld aan een campaign + artifact.
-- Image-bytes leven in Supabase Storage (bucket 'campaign-images'),
-- deze tabel houdt metadata bij.

create table if not exists public.campaign_images (
  id uuid primary key default gen_random_uuid(),
  campaign_id text not null references public.campaigns(id) on delete cascade,
  artifact_key text not null, -- 'instagram', 'metaAds', 'cinematic', etc.
  item_index int, -- post-nummer of shot-nummer
  prompt text not null, -- de prompt waarmee gegenereerd is
  storage_path text not null, -- pad in Supabase Storage
  public_url text not null, -- publiek bereikbare URL
  width int default 1024,
  height int default 1024,
  cost_cents int default 4, -- richtprijs in eurocent (gpt-image-1 medium ≈ €0.04)
  created_at timestamptz not null default now()
);

create index if not exists campaign_images_campaign_idx
  on public.campaign_images(campaign_id, artifact_key, item_index);

alter table public.campaign_images disable row level security;

-- Storage bucket aanmaken (idempotent — duplicate-key foutje wordt geslikt
-- door on conflict do nothing).
insert into storage.buckets (id, name, public)
values ('campaign-images', 'campaign-images', true)
on conflict (id) do nothing;

-- Public read policy zodat <img src="..."> direct werkt vanuit /c/[id].
-- Service role bypasst RLS, dus alleen public-read is hier nodig.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'campaign_images_public_read'
  ) then
    create policy campaign_images_public_read
      on storage.objects for select
      using (bucket_id = 'campaign-images');
  end if;
end $$;
