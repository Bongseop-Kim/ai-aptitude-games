create table "public"."mock_exam_results" (
  "id" uuid not null,
  "user_id" uuid not null,
  "score" integer not null,
  "duration_ms" integer not null,
  "pro" boolean not null default false,
  "created_at" timestamp with time zone not null,
  "synced_at" timestamp with time zone not null default now()
);

alter table "public"."mock_exam_results" enable row level security;

CREATE UNIQUE INDEX mock_exam_results_pkey ON public.mock_exam_results USING btree (id);

CREATE INDEX mock_exam_results_user_id_created_at_idx ON public.mock_exam_results USING btree (user_id, created_at DESC);

alter table "public"."mock_exam_results" add constraint "mock_exam_results_pkey" PRIMARY KEY using index "mock_exam_results_pkey";

alter table "public"."mock_exam_results" add constraint "mock_exam_results_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."mock_exam_results" validate constraint "mock_exam_results_user_id_fkey";

grant insert on table "public"."mock_exam_results" to "authenticated";

grant select on table "public"."mock_exam_results" to "authenticated";

grant delete on table "public"."mock_exam_results" to "service_role";

grant insert on table "public"."mock_exam_results" to "service_role";

grant references on table "public"."mock_exam_results" to "service_role";

grant select on table "public"."mock_exam_results" to "service_role";

grant trigger on table "public"."mock_exam_results" to "service_role";

grant truncate on table "public"."mock_exam_results" to "service_role";

grant update on table "public"."mock_exam_results" to "service_role";

revoke delete on table "public"."mock_exam_results" from "anon";

revoke insert on table "public"."mock_exam_results" from "anon";

revoke references on table "public"."mock_exam_results" from "anon";

revoke select on table "public"."mock_exam_results" from "anon";

revoke trigger on table "public"."mock_exam_results" from "anon";

revoke truncate on table "public"."mock_exam_results" from "anon";

revoke update on table "public"."mock_exam_results" from "anon";

create policy "users can insert own mock exam results"
on "public"."mock_exam_results"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));

create policy "users can read own mock exam results"
on "public"."mock_exam_results"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));
