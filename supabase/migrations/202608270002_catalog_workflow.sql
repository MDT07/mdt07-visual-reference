-- Additive catalog workflow for MDT07 Visual Reference.
-- Existing projects, collections, references, and OAuth records are preserved.

alter table public.mdt07_projects
  add column if not exists status text not null default 'active'
  check (status in ('active', 'archived'));

alter table public.mdt07_collections
  add column if not exists description text not null default ''
  check (char_length(description) <= 1000);

alter table public.mdt07_collections
  add column if not exists sort_order integer not null default 0;

alter table public.mdt07_references
  add column if not exists notes text not null default ''
  check (char_length(notes) <= 4000);

alter table public.mdt07_references
  add column if not exists tags text[] not null default '{}'::text[];

alter table public.mdt07_references
  add column if not exists favorite boolean not null default false;

alter table public.mdt07_references
  add column if not exists workflow_status text not null default 'saved'
  check (workflow_status in ('saved', 'shortlisted', 'archived'));

alter table public.mdt07_references
  add column if not exists updated_at timestamptz not null default now();

create index if not exists mdt07_projects_owner_status_idx
  on public.mdt07_projects (owner_github_id, status, updated_at desc);

create index if not exists mdt07_references_owner_workflow_idx
  on public.mdt07_references (owner_github_id, workflow_status, updated_at desc);

create index if not exists mdt07_references_tags_idx
  on public.mdt07_references using gin (tags);

create or replace function public.mdt07_cleanup_expired_security_state()
returns table (expired_connections integer, expired_rate_limits integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  connection_count integer;
  limiter_count integer;
begin
  delete from public.mdt07_pinterest_connections
  where refresh_expires_at is not null and refresh_expires_at <= clock_timestamp();
  get diagnostics connection_count = row_count;

  delete from public.mdt07_rate_limits
  where reset_at < clock_timestamp() - interval '1 day';
  get diagnostics limiter_count = row_count;

  return query select connection_count, limiter_count;
end;
$$;

revoke all on function public.mdt07_cleanup_expired_security_state()
  from public, anon, authenticated;
grant execute on function public.mdt07_cleanup_expired_security_state()
  to service_role;

comment on column public.mdt07_references.notes is
  'Owner-authored research notes; never populated automatically from Pinterest.';
comment on column public.mdt07_references.tags is
  'Owner-authored catalog tags used for private filtering.';
