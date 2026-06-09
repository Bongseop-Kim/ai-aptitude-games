-- 역검 declarative schema — games master catalog.
-- Structure only. Seed rows live in supabase/seed.sql (DML is not diff-captured).

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
