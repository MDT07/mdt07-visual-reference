-- Owner-only AI analysis history for app-owned catalog data.
-- Pinterest content, source URLs, images, OAuth tokens, and secrets are never stored here.

create table if not exists public.mdt07_ai_analyses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.mdt07_projects(id) on delete cascade,
  owner_github_id text not null,
  analysis_kind text not null default 'catalog_direction'
    check (analysis_kind in ('catalog_direction')),
  prompt_version text not null,
  model text not null,
  input_fingerprint text not null check (char_length(input_fingerprint) = 64),
  input_summary jsonb not null default '{}'::jsonb,
  result jsonb not null,
  usage jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists mdt07_ai_analyses_owner_project_created_idx
  on public.mdt07_ai_analyses (owner_github_id, project_id, created_at desc);

alter table public.mdt07_ai_analyses enable row level security;

revoke all on table public.mdt07_ai_analyses from public, anon, authenticated;
grant all on table public.mdt07_ai_analyses to service_role;

comment on table public.mdt07_ai_analyses is
  'Owner-only structured AI results derived from explicitly previewed app-owned catalog fields.';
comment on column public.mdt07_ai_analyses.input_summary is
  'Counts and scope metadata only; raw prompts, notes, Pinterest content, URLs, and media are not duplicated.';
