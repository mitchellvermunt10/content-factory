-- Campaigns: één rij per gegenereerde campagne.
-- artifacts is JSONB, partial-fill toegestaan (wordt tijdens generatie gevuld).

create table if not exists public.campaigns (
  id text primary key,
  owner_email text,
  status text not null default 'generating' check (status in ('generating', 'complete', 'failed')),
  brief jsonb not null,
  brand jsonb not null,
  artifacts jsonb not null default '{}'::jsonb,
  brand_brain_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists campaigns_owner_email_idx on public.campaigns(owner_email);
create index if not exists campaigns_created_at_idx on public.campaigns(created_at desc);

-- Brand Brain: per klant onthouden we toon, USPs, gegenereerde concepten — voor consistentie tussen campagnes.
create table if not exists public.brand_brain (
  id uuid primary key default gen_random_uuid(),
  owner_email text not null,
  business_name text not null,
  vertical text,
  tone text,
  brief_template jsonb,
  context_summary text,
  campaign_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists brand_brain_owner_business_idx
  on public.brand_brain(owner_email, business_name);

-- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists campaigns_touch on public.campaigns;
create trigger campaigns_touch
  before update on public.campaigns
  for each row execute function public.touch_updated_at();

drop trigger if exists brand_brain_touch on public.brand_brain;
create trigger brand_brain_touch
  before update on public.brand_brain
  for each row execute function public.touch_updated_at();

-- RLS uit voor v1: campaigns zijn share-by-id (security through obscurity).
-- Service role bypasses RLS sowieso, dus dit is voor de duidelijkheid.
alter table public.campaigns disable row level security;
alter table public.brand_brain disable row level security;
