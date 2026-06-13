-- Per-question interview records + media metadata (doc 3-2 server shape).
-- NOTE: media_local_uri is LOCAL-ONLY (SQLite) and intentionally absent here.
create table "public"."interview_answers" (
  "id" uuid not null,
  "session_id" uuid not null,
  "user_id" uuid not null,
  "question_id" text,
  "question_text" text,
  "category" text,
  "question_source" text not null default 'generic',
  "prep_ms" integer,
  "answer_ms" integer,
  "retake_count" integer default 0,
  "media_path" text,
  "media_status" text not null default 'none',
  "created_at" timestamp with time zone not null,
  "synced_at" timestamp with time zone not null default now()
);

alter table "public"."interview_answers" enable row level security;

CREATE UNIQUE INDEX interview_answers_pkey ON public.interview_answers USING btree (id);

CREATE INDEX interview_answers_session_id_idx ON public.interview_answers USING btree (session_id);

CREATE UNIQUE INDEX interview_answers_session_id_question_id_key ON public.interview_answers USING btree (session_id, question_id);

alter table "public"."interview_answers" add constraint "interview_answers_pkey" PRIMARY KEY using index "interview_answers_pkey";

alter table "public"."interview_answers" add constraint "interview_answers_session_id_question_id_key" UNIQUE using index "interview_answers_session_id_question_id_key";

alter table "public"."interview_answers" add constraint "interview_answers_question_source_check" CHECK ((question_source = ANY (ARRAY['generic'::text, 'job_posting'::text, 'resume'::text]))) not valid;

alter table "public"."interview_answers" validate constraint "interview_answers_question_source_check";

alter table "public"."interview_answers" add constraint "interview_answers_media_status_check" CHECK ((media_status = ANY (ARRAY['none'::text, 'uploading'::text, 'uploaded'::text, 'failed'::text]))) not valid;

alter table "public"."interview_answers" validate constraint "interview_answers_media_status_check";

alter table "public"."interview_answers" add constraint "interview_answers_session_id_fkey" FOREIGN KEY (session_id) REFERENCES public.interview_sessions(id) ON DELETE CASCADE not valid;

alter table "public"."interview_answers" validate constraint "interview_answers_session_id_fkey";

-- The composite owner FK needs a unique index on interview_sessions (id, user_id).
-- The local 20260612140000 file declares it, but the remote applied version predates
-- that line — create it idempotently so this migration works on either state.
CREATE UNIQUE INDEX IF NOT EXISTS interview_sessions_id_user_id_key ON public.interview_sessions USING btree (id, user_id);

alter table "public"."interview_answers" add constraint "interview_answers_session_owner_fkey" FOREIGN KEY (session_id, user_id) REFERENCES public.interview_sessions(id, user_id) ON DELETE CASCADE not valid;

alter table "public"."interview_answers" validate constraint "interview_answers_session_owner_fkey";

alter table "public"."interview_answers" add constraint "interview_answers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."interview_answers" validate constraint "interview_answers_user_id_fkey";

grant insert on table "public"."interview_answers" to "authenticated";

grant select on table "public"."interview_answers" to "authenticated";

-- update needed so the client can confirm media upload (media_path/media_status).
grant update on table "public"."interview_answers" to "authenticated";

grant delete on table "public"."interview_answers" to "service_role";

grant insert on table "public"."interview_answers" to "service_role";

grant references on table "public"."interview_answers" to "service_role";

grant select on table "public"."interview_answers" to "service_role";

grant trigger on table "public"."interview_answers" to "service_role";

grant truncate on table "public"."interview_answers" to "service_role";

grant update on table "public"."interview_answers" to "service_role";

revoke delete on table "public"."interview_answers" from "anon";

revoke insert on table "public"."interview_answers" from "anon";

revoke references on table "public"."interview_answers" from "anon";

revoke select on table "public"."interview_answers" from "anon";

revoke trigger on table "public"."interview_answers" from "anon";

revoke truncate on table "public"."interview_answers" from "anon";

revoke update on table "public"."interview_answers" from "anon";

create policy "users can insert own interview answers"
on "public"."interview_answers"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));

create policy "users can read own interview answers"
on "public"."interview_answers"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));

create policy "users can update own interview answers"
on "public"."interview_answers"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));
