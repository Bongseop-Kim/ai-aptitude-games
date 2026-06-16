alter table "public"."mock_exam_result_items"
add column if not exists "game_result_id" uuid;

alter table "public"."mock_exam_result_items"
add column if not exists "interview_session_id" uuid;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'mock_exam_result_items'
      and column_name = 'result_id'
  ) then
    execute $sql$
      update "public"."mock_exam_result_items"
      set
        "game_result_id" = case
          when "item_key" = 'interview' then null
          else coalesce("game_result_id", "result_id")
        end,
        "interview_session_id" = case
          when "item_key" = 'interview' then coalesce("interview_session_id", "result_id")
          else null
        end
      where "result_id" is not null
        and ("game_result_id" is null and "interview_session_id" is null)
    $sql$;
  end if;
end $$;

create unique index if not exists game_results_id_user_id_key
on public.game_results using btree (id, user_id);

create unique index if not exists interview_sessions_id_user_id_key
on public.interview_sessions using btree (id, user_id);

drop index if exists public.mock_exam_result_items_result_id_idx;

create index if not exists mock_exam_result_items_game_result_id_idx
on public.mock_exam_result_items using btree (game_result_id)
where game_result_id is not null;

create index if not exists mock_exam_result_items_interview_session_id_idx
on public.mock_exam_result_items using btree (interview_session_id)
where interview_session_id is not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_exam_result_items_game_result_id_fkey'
      and conrelid = 'public.mock_exam_result_items'::regclass
  ) then
    alter table "public"."mock_exam_result_items"
    add constraint "mock_exam_result_items_game_result_id_fkey"
    foreign key ("game_result_id") references public.game_results(id) on delete cascade not valid;
  end if;
end $$;

alter table "public"."mock_exam_result_items"
validate constraint "mock_exam_result_items_game_result_id_fkey";

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_exam_result_items_game_result_owner_fkey'
      and conrelid = 'public.mock_exam_result_items'::regclass
  ) then
    alter table "public"."mock_exam_result_items"
    add constraint "mock_exam_result_items_game_result_owner_fkey"
    foreign key ("game_result_id", "user_id") references public.game_results(id, user_id) on delete cascade not valid;
  end if;
end $$;

alter table "public"."mock_exam_result_items"
validate constraint "mock_exam_result_items_game_result_owner_fkey";

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_exam_result_items_interview_session_id_fkey'
      and conrelid = 'public.mock_exam_result_items'::regclass
  ) then
    alter table "public"."mock_exam_result_items"
    add constraint "mock_exam_result_items_interview_session_id_fkey"
    foreign key ("interview_session_id") references public.interview_sessions(id) on delete cascade not valid;
  end if;
end $$;

alter table "public"."mock_exam_result_items"
validate constraint "mock_exam_result_items_interview_session_id_fkey";

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_exam_result_items_interview_session_owner_fkey'
      and conrelid = 'public.mock_exam_result_items'::regclass
  ) then
    alter table "public"."mock_exam_result_items"
    add constraint "mock_exam_result_items_interview_session_owner_fkey"
    foreign key ("interview_session_id", "user_id") references public.interview_sessions(id, user_id) on delete cascade not valid;
  end if;
end $$;

alter table "public"."mock_exam_result_items"
validate constraint "mock_exam_result_items_interview_session_owner_fkey";

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_exam_result_items_one_result_reference_check'
      and conrelid = 'public.mock_exam_result_items'::regclass
  ) then
    alter table "public"."mock_exam_result_items"
    add constraint "mock_exam_result_items_one_result_reference_check"
    check (
      ((game_result_id is not null) and (interview_session_id is null))
      or ((game_result_id is null) and (interview_session_id is not null))
    ) not valid;
  end if;
end $$;

alter table "public"."mock_exam_result_items"
validate constraint "mock_exam_result_items_one_result_reference_check";

grant update on table "public"."mock_exam_result_items" to "authenticated";

drop policy if exists "users can update own mock exam result items"
on "public"."mock_exam_result_items";

create policy "users can update own mock exam result items"
on "public"."mock_exam_result_items"
as permissive
for update
to authenticated
using (((select auth.uid() as uid) = user_id))
with check (((select auth.uid() as uid) = user_id));

create unique index if not exists game_result_rounds_result_id_round_index_key
on public.game_result_rounds using btree (result_id, round_index);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'game_result_rounds_result_id_round_index_key'
      and conrelid = 'public.game_result_rounds'::regclass
  ) then
    alter table "public"."game_result_rounds"
    add constraint "game_result_rounds_result_id_round_index_key"
    unique using index "game_result_rounds_result_id_round_index_key";
  end if;
end $$;

grant update on table "public"."game_result_rounds" to "authenticated";

drop policy if exists "users can update own game result rounds"
on "public"."game_result_rounds";

create policy "users can update own game result rounds"
on "public"."game_result_rounds"
as permissive
for update
to authenticated
using (((select auth.uid() as uid) = user_id))
with check (((select auth.uid() as uid) = user_id));

alter table "public"."mock_exam_result_items"
drop column if exists "result_id";
