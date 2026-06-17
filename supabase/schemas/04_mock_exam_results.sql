-- ─────────────────────────────────────────────────────────────
-- mock_exam_results: per-user mock exam records, pushed from the device outbox.
-- Local SQLite is the source of truth (AGENTS.md > Data); rows are
-- append-only and idempotently upserted with `on conflict do nothing`,
-- so there are intentionally no update/delete policies.
-- ─────────────────────────────────────────────────────────────
create table public.mock_exam_results (
  id          uuid primary key,                 -- client-generated UUID
  user_id     uuid        not null references auth.users (id) on delete cascade,
  score       integer     not null,
  duration_ms integer     not null,
  created_at  timestamptz not null,             -- mock exam time on device
  synced_at   timestamptz not null default now()
);

create index mock_exam_results_user_id_created_at_idx
  on public.mock_exam_results (user_id, created_at desc);

alter table public.mock_exam_results enable row level security;

grant insert on table public.mock_exam_results to authenticated;
grant select on table public.mock_exam_results to authenticated;
grant insert on table public.mock_exam_results to service_role;
grant select on table public.mock_exam_results to service_role;
grant update on table public.mock_exam_results to service_role;
grant delete on table public.mock_exam_results to service_role;
grant truncate on table public.mock_exam_results to service_role;
grant references on table public.mock_exam_results to service_role;
grant trigger on table public.mock_exam_results to service_role;

revoke delete on table public.mock_exam_results from anon;
revoke insert on table public.mock_exam_results from anon;
revoke references on table public.mock_exam_results from anon;
revoke select on table public.mock_exam_results from anon;
revoke trigger on table public.mock_exam_results from anon;
revoke truncate on table public.mock_exam_results from anon;
revoke update on table public.mock_exam_results from anon;

-- Owner-only access: role check (TO authenticated) + ownership predicate.
create policy "users can insert own mock exam results"
  on public.mock_exam_results for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "users can read own mock exam results"
  on public.mock_exam_results for select
  to authenticated
  using ((select auth.uid()) = user_id);
