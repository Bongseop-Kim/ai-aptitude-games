-- Interview prep assets: private resumes + shared job_postings catalog.
-- status/analysis/error are written only by the analysis server (service_role).

-- resumes: private, owner-only.
create table "public"."resumes" (
  "id" uuid not null,
  "user_id" uuid not null,
  "title" text not null,
  "file_path" text not null,
  "mime_type" text not null,
  "size_bytes" integer,
  "status" text default 'pending',
  "analysis" jsonb,
  "error" text,
  "created_at" timestamp with time zone not null default now(),
  "analyzed_at" timestamp with time zone
);

alter table "public"."resumes" enable row level security;

CREATE UNIQUE INDEX resumes_pkey ON public.resumes USING btree (id);

CREATE INDEX resumes_user_id_created_at_idx ON public.resumes USING btree (user_id, created_at DESC);

alter table "public"."resumes" add constraint "resumes_pkey" PRIMARY KEY using index "resumes_pkey";

alter table "public"."resumes" add constraint "resumes_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'done'::text, 'failed'::text]))) not valid;

alter table "public"."resumes" validate constraint "resumes_status_check";

alter table "public"."resumes" add constraint "resumes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."resumes" validate constraint "resumes_user_id_fkey";

-- authenticated may insert/select/delete own rows; status/analysis are service_role-only (no update grant).
grant insert on table "public"."resumes" to "authenticated";

grant select on table "public"."resumes" to "authenticated";

grant delete on table "public"."resumes" to "authenticated";

grant delete on table "public"."resumes" to "service_role";

grant insert on table "public"."resumes" to "service_role";

grant references on table "public"."resumes" to "service_role";

grant select on table "public"."resumes" to "service_role";

grant trigger on table "public"."resumes" to "service_role";

grant truncate on table "public"."resumes" to "service_role";

grant update on table "public"."resumes" to "service_role";

revoke delete on table "public"."resumes" from "anon";

revoke insert on table "public"."resumes" from "anon";

revoke references on table "public"."resumes" from "anon";

revoke select on table "public"."resumes" from "anon";

revoke trigger on table "public"."resumes" from "anon";

revoke truncate on table "public"."resumes" from "anon";

revoke update on table "public"."resumes" from "anon";

create policy "users can insert own resumes"
on "public"."resumes"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));

create policy "users can read own resumes"
on "public"."resumes"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));

create policy "users can delete own resumes"
on "public"."resumes"
as permissive
for delete
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));

-- job_postings: shared catalog. URL dedupe via url_normalized.
create table "public"."job_postings" (
  "id" uuid not null,
  "url" text,
  "url_normalized" text,
  "source" text default 'url',
  "raw_text" text,
  "company" text,
  "role" text,
  "job_family" text,
  "status" text default 'pending',
  "analysis" jsonb,
  "error" text,
  "created_by" uuid,
  "created_at" timestamp with time zone not null default now(),
  "analyzed_at" timestamp with time zone
);

alter table "public"."job_postings" enable row level security;

CREATE UNIQUE INDEX job_postings_pkey ON public.job_postings USING btree (id);

CREATE UNIQUE INDEX job_postings_url_normalized_key ON public.job_postings USING btree (url_normalized) WHERE (url_normalized IS NOT NULL);

alter table "public"."job_postings" add constraint "job_postings_pkey" PRIMARY KEY using index "job_postings_pkey";

alter table "public"."job_postings" add constraint "job_postings_source_check" CHECK ((source = ANY (ARRAY['url'::text, 'manual'::text]))) not valid;

alter table "public"."job_postings" validate constraint "job_postings_source_check";

alter table "public"."job_postings" add constraint "job_postings_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'done'::text, 'failed'::text]))) not valid;

alter table "public"."job_postings" validate constraint "job_postings_status_check";

alter table "public"."job_postings" add constraint "job_postings_source_url_check" CHECK ((source = 'manual'::text) OR (url IS NOT NULL)) not valid;

alter table "public"."job_postings" validate constraint "job_postings_source_url_check";

alter table "public"."job_postings" add constraint "job_postings_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."job_postings" validate constraint "job_postings_created_by_fkey";

-- authenticated may insert/select; no update/delete (catalog is curated by the analysis server).
grant insert on table "public"."job_postings" to "authenticated";

grant select on table "public"."job_postings" to "authenticated";

grant delete on table "public"."job_postings" to "service_role";

grant insert on table "public"."job_postings" to "service_role";

grant references on table "public"."job_postings" to "service_role";

grant select on table "public"."job_postings" to "service_role";

grant trigger on table "public"."job_postings" to "service_role";

grant truncate on table "public"."job_postings" to "service_role";

grant update on table "public"."job_postings" to "service_role";

revoke delete on table "public"."job_postings" from "anon";

revoke insert on table "public"."job_postings" from "anon";

revoke references on table "public"."job_postings" from "anon";

revoke select on table "public"."job_postings" from "anon";

revoke trigger on table "public"."job_postings" from "anon";

revoke truncate on table "public"."job_postings" from "anon";

revoke update on table "public"."job_postings" from "anon";

create policy "users can register job postings"
on "public"."job_postings"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = created_by));

-- Shared catalog read: analyzed (done) rows are visible to everyone; pending/failed
-- and raw_text stay private to the registering user.
create policy "users can read done or own job postings"
on "public"."job_postings"
as permissive
for select
to authenticated
using ((status = 'done'::text) OR (( SELECT auth.uid() AS uid) = created_by));

-- Link interview_sessions to the chosen prep assets (nullable, set null on delete).
alter table "public"."interview_sessions" add column "resume_id" uuid;

alter table "public"."interview_sessions" add column "job_posting_id" uuid;

alter table "public"."interview_sessions" add constraint "interview_sessions_resume_id_fkey" FOREIGN KEY (resume_id) REFERENCES public.resumes(id) ON DELETE SET NULL not valid;

alter table "public"."interview_sessions" validate constraint "interview_sessions_resume_id_fkey";

alter table "public"."interview_sessions" add constraint "interview_sessions_job_posting_id_fkey" FOREIGN KEY (job_posting_id) REFERENCES public.job_postings(id) ON DELETE SET NULL not valid;

alter table "public"."interview_sessions" validate constraint "interview_sessions_job_posting_id_fkey";
