-- Prospect research: per onderzoek-run één rij met input + result.
-- Stelt user in staat om eerdere onderzoeken terug te halen zonder
-- opnieuw te betalen.

create table if not exists public.prospect_research (
  id text primary key,
  owner_email text,
  city text not null,
  vertical text not null,
  service_tier text not null,
  extra_criteria text,
  status text not null default 'pending'
    check (status in ('pending', 'running', 'complete', 'failed')),
  result jsonb,
  searched_queries jsonb,
  cost_cents int default 0,
  duration_ms int,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists prospect_research_owner_idx
  on public.prospect_research(owner_email, created_at desc);

create index if not exists prospect_research_status_idx
  on public.prospect_research(status, created_at desc);

alter table public.prospect_research disable row level security;
