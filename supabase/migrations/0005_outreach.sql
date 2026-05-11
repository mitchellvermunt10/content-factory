-- Outreach: één rij per (prospect, campagne) die je benadert.
-- Houdt status, contact-momenten, opens en notes bij.

create table if not exists public.outreach (
  id uuid primary key default gen_random_uuid(),
  owner_email text not null,

  -- Prospect-context
  prospect_name text not null,
  prospect_email text,
  prospect_phone text,
  prospect_city text,
  prospect_vertical text,
  prospect_website text,
  prospect_instagram text,

  -- Spec-link
  campaign_id text, -- /c/[id] URL slug
  research_id text references public.prospect_research(id) on delete set null,

  -- Status & flow
  status text not null default 'draft' check (status in (
    'draft',       -- bedoeld, nog niet verstuurd
    'sent',        -- email verstuurd
    'opened',      -- spec-URL geopend (via /c view event)
    'replied',     -- prospect heeft gereageerd
    'in_call',     -- gesprek lopend
    'closed_won',  -- verkoop gemaakt
    'closed_lost', -- nee gekregen
    'dead'         -- geen reactie, gestopt met volgen
  )),

  -- Email content (we slaan op zodat je kunt zien wat je hebt verstuurd)
  email_subject text,
  email_body text,

  -- Timestamps
  sent_at timestamptz,
  first_opened_at timestamptz,
  last_opened_at timestamptz,
  open_count int default 0,
  replied_at timestamptz,
  closed_at timestamptz,

  -- Follow-up tracking
  followup_count int default 0,
  last_followup_at timestamptz,

  -- Notes
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists outreach_owner_idx on public.outreach(owner_email, created_at desc);
create index if not exists outreach_status_idx on public.outreach(status, sent_at desc);
create index if not exists outreach_campaign_idx on public.outreach(campaign_id);

-- Updated-at trigger
drop trigger if exists outreach_touch on public.outreach;
create trigger outreach_touch
  before update on public.outreach
  for each row execute function public.touch_updated_at();

alter table public.outreach disable row level security;

-- Page-view events op /c/[id] — minimalistische event log voor analytics
create table if not exists public.campaign_views (
  id uuid primary key default gen_random_uuid(),
  campaign_id text not null,
  outreach_id uuid references public.outreach(id) on delete set null,
  user_agent text,
  referrer text,
  viewed_at timestamptz not null default now()
);

create index if not exists campaign_views_campaign_idx
  on public.campaign_views(campaign_id, viewed_at desc);

alter table public.campaign_views disable row level security;
