create table "public"."mock_exam_reports" (
  "mock_exam_id" uuid not null,
  "user_id" uuid not null,
  "status" text not null,
  "report_version" integer not null default 1,
  "report" jsonb,
  "error" text,
  "analyzed_at" timestamp with time zone,
  "created_at" timestamp with time zone not null default now()
);

alter table "public"."mock_exam_reports" enable row level security;

CREATE UNIQUE INDEX mock_exam_reports_pkey ON public.mock_exam_reports USING btree (mock_exam_id);

CREATE INDEX mock_exam_reports_user_id_idx ON public.mock_exam_reports USING btree (user_id);

alter table "public"."mock_exam_reports" add constraint "mock_exam_reports_pkey" PRIMARY KEY using index "mock_exam_reports_pkey";

alter table "public"."mock_exam_reports" add constraint "mock_exam_reports_status_check" CHECK ((status = ANY (ARRAY['processing'::text, 'done'::text, 'failed'::text]))) not valid;

alter table "public"."mock_exam_reports" validate constraint "mock_exam_reports_status_check";

alter table "public"."mock_exam_reports" add constraint "mock_exam_reports_mock_exam_id_fkey" FOREIGN KEY (mock_exam_id) REFERENCES public.mock_exam_results(id) ON DELETE CASCADE not valid;

alter table "public"."mock_exam_reports" validate constraint "mock_exam_reports_mock_exam_id_fkey";

alter table "public"."mock_exam_reports" add constraint "mock_exam_reports_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."mock_exam_reports" validate constraint "mock_exam_reports_user_id_fkey";

-- Reports are written only by the analysis server (service_role, bypasses RLS).
-- Authenticated users may read their own rows; no insert/update policies exist.
grant select on table "public"."mock_exam_reports" to "authenticated";

grant delete on table "public"."mock_exam_reports" to "service_role";

grant insert on table "public"."mock_exam_reports" to "service_role";

grant references on table "public"."mock_exam_reports" to "service_role";

grant select on table "public"."mock_exam_reports" to "service_role";

grant trigger on table "public"."mock_exam_reports" to "service_role";

grant truncate on table "public"."mock_exam_reports" to "service_role";

grant update on table "public"."mock_exam_reports" to "service_role";

revoke delete on table "public"."mock_exam_reports" from "anon";

revoke insert on table "public"."mock_exam_reports" from "anon";

revoke references on table "public"."mock_exam_reports" from "anon";

revoke select on table "public"."mock_exam_reports" from "anon";

revoke trigger on table "public"."mock_exam_reports" from "anon";

revoke truncate on table "public"."mock_exam_reports" from "anon";

revoke update on table "public"."mock_exam_reports" from "anon";

create policy "users can read own mock exam reports"
on "public"."mock_exam_reports"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));
