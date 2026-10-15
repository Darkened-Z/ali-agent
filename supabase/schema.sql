-- =============================================================================
-- Ali Agent — Supabase schema
-- Run once in the Supabase SQL Editor. The app seeds config + KB on first request.
--
-- Every list (conversations, leads, orders, kbArticles, broadcasts, team,
-- customPlans, customDevices) lives in `records`, one row per item.
-- Singletons (botConfig, settings, lastCatalogueSync) live in `app_state`.
-- Only the server touches these tables, via the service-role key.
-- =============================================================================

create table if not exists public.records (
  collection text not null,
  id text not null,
  data jsonb not null,
  sort double precision not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (collection, id)
);

create index if not exists idx_records_collection_sort
  on public.records (collection, sort desc);

create table if not exists public.app_state (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- RLS on with no policies: anon/authenticated clients get nothing; service role bypasses RLS.
alter table public.records enable row level security;
alter table public.app_state enable row level security;

-- Rate limiting for public endpoints (chat, lead form, checkout). Fixed window per key.
create table if not exists public.rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  hits integer not null default 0
);
alter table public.rate_limits enable row level security;

create or replace function public.hit_rate_limit(p_key text, p_window_seconds integer, p_max integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hits integer;
begin
  insert into rate_limits (key, window_start, hits)
  values (p_key, now(), 1)
  on conflict (key) do update set
    hits = case
      when rate_limits.window_start < now() - make_interval(secs => p_window_seconds) then 1
      else rate_limits.hits + 1
    end,
    window_start = case
      when rate_limits.window_start < now() - make_interval(secs => p_window_seconds) then now()
      else rate_limits.window_start
    end
  returning hits into v_hits;
  return v_hits <= p_max;
end;
$$;

revoke execute on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;
