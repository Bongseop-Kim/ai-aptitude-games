-- 역검 core schema — profiles + games master.
-- Scope: minimum to back onboarding + home. Per-user play/report/subscription
-- tables are added in their own flow slices.
--
-- Baseline migration. Structure mirrors supabase/schemas/ (declarative source
-- of truth); future changes: edit schemas/ then `supabase db diff -f <name>`.
-- Game seed rows live in supabase/seed.sql (DML is not diff-captured).

-- ─────────────────────────────────────────────────────────────
-- updated_at helper
-- ─────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- games: 9-game master (read-only catalog)
-- ─────────────────────────────────────────────────────────────
create table public.games (
  id              text primary key,                 -- GameId: rps | rotate | ...
  name            text        not null,
  skill           text        not null,             -- cognitive skill label
  description     text        not null,
  icon            text        not null,
  default_minutes integer     not null check (default_minutes > 0),
  sort_order      integer     not null,
  created_at      timestamptz not null default now()
);

alter table public.games enable row level security;

-- Catalog is public read-only. Writes happen via migrations / service role only.
create policy "games are readable by everyone"
  on public.games for select
  to anon, authenticated
  using (true);

-- ─────────────────────────────────────────────────────────────
-- profiles: 1:1 with auth.users (onboarding writes here)
-- ─────────────────────────────────────────────────────────────
create table public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  field          text        check (field in ('it', 'biz', 'mkt', 'design', 'fin', 'etc')),
  daily_minutes  integer     check (daily_minutes > 0),
  notify_enabled boolean     not null default true,
  onboarded_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.profiles enable row level security;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Owner-only access: role check (TO authenticated) + ownership predicate.
create policy "users can read own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ─────────────────────────────────────────────────────────────
-- Auto-create a profile row when a new auth user signs up.
-- SECURITY DEFINER so the trigger can insert as table owner; hardened with
-- an empty search_path and fully-qualified names. Execute is revoked from
-- callable roles since it is only ever invoked by the auth.users trigger.
-- ─────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
