create table "public"."interview_sessions" (
  "id" uuid not null,
  "user_id" uuid not null,
  "company" text not null,
  "role" text not null,
  "score" integer not null,
  "question_count" integer not null,
  "duration_ms" integer not null,
  "created_at" timestamp with time zone not null,
  "synced_at" timestamp with time zone not null default now()
);

alter table "public"."interview_sessions" enable row level security;

CREATE UNIQUE INDEX interview_sessions_pkey ON public.interview_sessions USING btree (id);

CREATE INDEX interview_sessions_user_id_created_at_idx ON public.interview_sessions USING btree (user_id, created_at DESC);

alter table "public"."interview_sessions" add constraint "interview_sessions_pkey" PRIMARY KEY using index "interview_sessions_pkey";

alter table "public"."interview_sessions" add constraint "interview_sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."interview_sessions" validate constraint "interview_sessions_user_id_fkey";

grant insert on table "public"."interview_sessions" to "authenticated";

grant select on table "public"."interview_sessions" to "authenticated";

grant delete on table "public"."interview_sessions" to "service_role";

grant insert on table "public"."interview_sessions" to "service_role";

grant references on table "public"."interview_sessions" to "service_role";

grant select on table "public"."interview_sessions" to "service_role";

grant trigger on table "public"."interview_sessions" to "service_role";

grant truncate on table "public"."interview_sessions" to "service_role";

grant update on table "public"."interview_sessions" to "service_role";

revoke delete on table "public"."interview_sessions" from "anon";

revoke insert on table "public"."interview_sessions" from "anon";

revoke references on table "public"."interview_sessions" from "anon";

revoke select on table "public"."interview_sessions" from "anon";

revoke trigger on table "public"."interview_sessions" from "anon";

revoke truncate on table "public"."interview_sessions" from "anon";

revoke update on table "public"."interview_sessions" from "anon";

create policy "users can insert own interview sessions"
on "public"."interview_sessions"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));

create policy "users can read own interview sessions"
on "public"."interview_sessions"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));
