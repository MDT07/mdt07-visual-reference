-- Historical MDT07 catalog tables. The current runtime no longer uses these records.
-- Existing tables in this Supabase project are intentionally left untouched.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.mdt07_projects (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_github_id text not null,
  name text not null check (char_length(name) between 1 and 120),
  brief text not null default '' check (char_length(brief) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mdt07_projects_owner_updated_idx
  on public.mdt07_projects (owner_github_id, updated_at desc);

create table if not exists public.mdt07_collections (
  id uuid primary key default extensions.gen_random_uuid(),
  project_id uuid not null references public.mdt07_projects(id) on delete cascade,
  owner_github_id text not null,
  name text not null check (char_length(name) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, name)
);

create index if not exists mdt07_collections_project_idx
  on public.mdt07_collections (project_id, updated_at desc);

create table if not exists public.mdt07_references (
  id uuid primary key default extensions.gen_random_uuid(),
  project_id uuid not null references public.mdt07_projects(id) on delete cascade,
  collection_id uuid not null references public.mdt07_collections(id) on delete cascade,
  owner_github_id text not null,
  source text not null check (source = 'pinterest'),
  source_id text not null,
  source_url text not null,
  reference_data jsonb not null,
  saved_at timestamptz not null default now(),
  unique (collection_id, source, source_id)
);

create index if not exists mdt07_references_project_idx
  on public.mdt07_references (project_id, saved_at desc);
create index if not exists mdt07_references_collection_idx
  on public.mdt07_references (collection_id, saved_at desc);

create table if not exists public.mdt07_pinterest_connections (
  session_id_hash text primary key check (char_length(session_id_hash) = 64),
  owner_github_id text not null,
  encrypted_payload text not null,
  access_expires_at timestamptz not null,
  refresh_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_used_at timestamptz not null default now()
);

create index if not exists mdt07_pinterest_connections_owner_idx
  on public.mdt07_pinterest_connections (owner_github_id, updated_at desc);
create index if not exists mdt07_pinterest_connections_expiry_idx
  on public.mdt07_pinterest_connections (refresh_expires_at);

create table if not exists public.mdt07_rate_limits (
  namespace text not null,
  subject_hash text not null check (char_length(subject_hash) = 64),
  request_count integer not null check (request_count >= 0),
  reset_at timestamptz not null,
  updated_at timestamptz not null default now(),
  primary key (namespace, subject_hash)
);

create index if not exists mdt07_rate_limits_reset_idx
  on public.mdt07_rate_limits (reset_at);

create table if not exists public.mdt07_audit_events (
  id bigint generated always as identity primary key,
  owner_github_id text,
  action text not null check (char_length(action) between 1 and 120),
  target_type text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists mdt07_audit_events_owner_created_idx
  on public.mdt07_audit_events (owner_github_id, created_at desc);

create or replace function public.mdt07_consume_rate_limit(
  p_namespace text,
  p_subject_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, remaining integer, retry_after integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
  current_reset timestamptz;
  v_now timestamptz := clock_timestamp();
begin
  if p_limit < 1 or p_window_seconds < 1 then
    raise exception 'Rate limit and window must be positive';
  end if;

  insert into public.mdt07_rate_limits (
    namespace, subject_hash, request_count, reset_at, updated_at
  ) values (
    p_namespace,
    p_subject_hash,
    1,
    v_now + make_interval(secs => p_window_seconds),
    v_now
  )
  on conflict (namespace, subject_hash) do update
  set request_count = case
        when public.mdt07_rate_limits.reset_at <= v_now then 1
        else public.mdt07_rate_limits.request_count + 1
      end,
      reset_at = case
        when public.mdt07_rate_limits.reset_at <= v_now
          then v_now + make_interval(secs => p_window_seconds)
        else public.mdt07_rate_limits.reset_at
      end,
      updated_at = v_now
  returning request_count, reset_at into current_count, current_reset;

  return query select
    current_count <= p_limit,
    greatest(0, p_limit - current_count),
    greatest(1, ceil(extract(epoch from (current_reset - v_now)))::integer);
end;
$$;

alter table public.mdt07_projects enable row level security;
alter table public.mdt07_collections enable row level security;
alter table public.mdt07_references enable row level security;
alter table public.mdt07_pinterest_connections enable row level security;
alter table public.mdt07_rate_limits enable row level security;
alter table public.mdt07_audit_events enable row level security;

revoke all on table public.mdt07_projects from anon, authenticated;
revoke all on table public.mdt07_collections from anon, authenticated;
revoke all on table public.mdt07_references from anon, authenticated;
revoke all on table public.mdt07_pinterest_connections from anon, authenticated;
revoke all on table public.mdt07_rate_limits from anon, authenticated;
revoke all on table public.mdt07_audit_events from anon, authenticated;
revoke all on function public.mdt07_consume_rate_limit(text, text, integer, integer)
  from public, anon, authenticated;

grant all on table public.mdt07_projects to service_role;
grant all on table public.mdt07_collections to service_role;
grant all on table public.mdt07_references to service_role;
grant all on table public.mdt07_pinterest_connections to service_role;
grant all on table public.mdt07_rate_limits to service_role;
grant all on table public.mdt07_audit_events to service_role;
grant usage, select on sequence public.mdt07_audit_events_id_seq to service_role;
grant execute on function public.mdt07_consume_rate_limit(text, text, integer, integer)
  to service_role;

comment on table public.mdt07_pinterest_connections is
  'Encrypted Pinterest OAuth sessions. Browser cookies contain only opaque random session IDs.';
comment on table public.mdt07_references is
  'Pinterest reference metadata and source links; no Pinterest media binaries are copied.';
