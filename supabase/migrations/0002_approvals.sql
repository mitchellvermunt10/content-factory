-- Approvals: feedback van klanten op individuele artifacts.
-- Eén campaign kan meerdere approvals hebben — overall plus per-artifact.

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  campaign_id text not null references public.campaigns(id) on delete cascade,
  artifact_key text not null default 'campaign', -- 'campaign' = overall, anders artifact-veld
  status text not null check (status in ('approved', 'rejected', 'comment')),
  comment text,
  created_by_email text,
  created_by_name text,
  created_at timestamptz not null default now()
);

create index if not exists approvals_campaign_idx
  on public.approvals(campaign_id, artifact_key, created_at desc);

alter table public.approvals disable row level security;
