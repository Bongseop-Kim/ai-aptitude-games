create table "public"."game_result_rounds" (
  "id" uuid not null,
  "result_id" uuid not null,
  "user_id" uuid not null,
  "round_index" integer not null,
  "correct" boolean not null,
  "response_ms" integer not null,
  "level_params" jsonb,
  "created_at" timestamp with time zone not null,
  "synced_at" timestamp with time zone not null default now()
);

create table "public"."mock_exam_result_items" (
  "mock_exam_id" uuid not null,
  "item_key" text not null,
  "user_id" uuid not null,
  "result_id" uuid not null,
  "score" integer not null,
  "duration_ms" integer not null,
  "completed_at" timestamp with time zone not null,
  "synced_at" timestamp with time zone not null default now()
);

alter table "public"."game_result_rounds" enable row level security;

alter table "public"."mock_exam_result_items" enable row level security;

CREATE UNIQUE INDEX game_result_rounds_pkey ON public.game_result_rounds USING btree (id);

CREATE INDEX game_result_rounds_result_id_idx ON public.game_result_rounds USING btree (result_id);

CREATE UNIQUE INDEX mock_exam_result_items_pkey ON public.mock_exam_result_items USING btree (mock_exam_id, item_key);

CREATE INDEX mock_exam_result_items_result_id_idx ON public.mock_exam_result_items USING btree (result_id);

alter table "public"."game_result_rounds" add constraint "game_result_rounds_pkey" PRIMARY KEY using index "game_result_rounds_pkey";

alter table "public"."mock_exam_result_items" add constraint "mock_exam_result_items_pkey" PRIMARY KEY using index "mock_exam_result_items_pkey";

alter table "public"."game_result_rounds" add constraint "game_result_rounds_result_id_fkey" FOREIGN KEY (result_id) REFERENCES public.game_results(id) ON DELETE CASCADE not valid;

alter table "public"."game_result_rounds" validate constraint "game_result_rounds_result_id_fkey";

alter table "public"."game_result_rounds" add constraint "game_result_rounds_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."game_result_rounds" validate constraint "game_result_rounds_user_id_fkey";

alter table "public"."mock_exam_result_items" add constraint "mock_exam_result_items_mock_exam_id_fkey" FOREIGN KEY (mock_exam_id) REFERENCES public.mock_exam_results(id) ON DELETE CASCADE not valid;

alter table "public"."mock_exam_result_items" validate constraint "mock_exam_result_items_mock_exam_id_fkey";

alter table "public"."mock_exam_result_items" add constraint "mock_exam_result_items_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."mock_exam_result_items" validate constraint "mock_exam_result_items_user_id_fkey";

grant insert on table "public"."game_result_rounds" to "authenticated";

grant select on table "public"."game_result_rounds" to "authenticated";

grant delete on table "public"."game_result_rounds" to "service_role";

grant insert on table "public"."game_result_rounds" to "service_role";

grant references on table "public"."game_result_rounds" to "service_role";

grant select on table "public"."game_result_rounds" to "service_role";

grant trigger on table "public"."game_result_rounds" to "service_role";

grant truncate on table "public"."game_result_rounds" to "service_role";

grant update on table "public"."game_result_rounds" to "service_role";

revoke delete on table "public"."game_result_rounds" from "anon";

revoke insert on table "public"."game_result_rounds" from "anon";

revoke references on table "public"."game_result_rounds" from "anon";

revoke select on table "public"."game_result_rounds" from "anon";

revoke trigger on table "public"."game_result_rounds" from "anon";

revoke truncate on table "public"."game_result_rounds" from "anon";

revoke update on table "public"."game_result_rounds" from "anon";

grant insert on table "public"."mock_exam_result_items" to "authenticated";

grant select on table "public"."mock_exam_result_items" to "authenticated";

grant delete on table "public"."mock_exam_result_items" to "service_role";

grant insert on table "public"."mock_exam_result_items" to "service_role";

grant references on table "public"."mock_exam_result_items" to "service_role";

grant select on table "public"."mock_exam_result_items" to "service_role";

grant trigger on table "public"."mock_exam_result_items" to "service_role";

grant truncate on table "public"."mock_exam_result_items" to "service_role";

grant update on table "public"."mock_exam_result_items" to "service_role";

revoke delete on table "public"."mock_exam_result_items" from "anon";

revoke insert on table "public"."mock_exam_result_items" from "anon";

revoke references on table "public"."mock_exam_result_items" from "anon";

revoke select on table "public"."mock_exam_result_items" from "anon";

revoke trigger on table "public"."mock_exam_result_items" from "anon";

revoke truncate on table "public"."mock_exam_result_items" from "anon";

revoke update on table "public"."mock_exam_result_items" from "anon";

create policy "users can insert own game result rounds"
on "public"."game_result_rounds"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));

create policy "users can read own game result rounds"
on "public"."game_result_rounds"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));

create policy "users can insert own mock exam result items"
on "public"."mock_exam_result_items"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));

create policy "users can read own mock exam result items"
on "public"."mock_exam_result_items"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));
