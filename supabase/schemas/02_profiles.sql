-- 역검 declarative schema — profiles (1:1 with auth.users).
-- Onboarding writes field / daily_minutes / notify_enabled / onboarded_at here.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

-- Auto-create a profile row when a new auth user signs up. SECURITY DEFINER so
-- the trigger inserts as table owner; hardened with empty search_path. The
-- execute revoke (DCL) is not diff-captured — it is applied in a versioned
-- migration alongside this schema.
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
