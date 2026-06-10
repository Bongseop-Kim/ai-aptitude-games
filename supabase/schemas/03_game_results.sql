-- ─────────────────────────────────────────────────────────────
-- game_results: per-user play records, pushed from the device outbox.
-- Local SQLite is the source of truth (AGENTS.md > Data); rows are
-- append-only and idempotently upserted with `on conflict do nothing`,
-- so there are intentionally no update/delete policies.
-- ─────────────────────────────────────────────────────────────
create table public.game_results (
  id              uuid primary key,                 -- client-generated UUID
  user_id         uuid        not null references auth.users (id) on delete cascade,
  game_id         text        not null references public.games (id),
  score           integer     not null,
  accuracy        real        not null,
  avg_response_ms integer     not null,
  created_at      timestamptz not null,             -- play time on device
  synced_at       timestamptz not null default now()
);

create index game_results_user_id_created_at_idx
  on public.game_results (user_id, created_at desc);

alter table public.game_results enable row level security;

-- Owner-only access: role check (TO authenticated) + ownership predicate.
create policy "users can insert own game results"
  on public.game_results for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "users can read own game results"
  on public.game_results for select
  to authenticated
  using ((select auth.uid()) = user_id);
