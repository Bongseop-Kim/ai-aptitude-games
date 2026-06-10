
  create table "public"."game_results" (
    "id" uuid not null,
    "user_id" uuid not null,
    "game_id" text not null,
    "score" integer not null,
    "accuracy" real not null,
    "avg_response_ms" integer not null,
    "created_at" timestamp with time zone not null,
    "synced_at" timestamp with time zone not null default now()
      );


alter table "public"."game_results" enable row level security;

CREATE UNIQUE INDEX game_results_pkey ON public.game_results USING btree (id);

CREATE INDEX game_results_user_id_created_at_idx ON public.game_results USING btree (user_id, created_at DESC);

alter table "public"."game_results" add constraint "game_results_pkey" PRIMARY KEY using index "game_results_pkey";

alter table "public"."game_results" add constraint "game_results_game_id_fkey" FOREIGN KEY (game_id) REFERENCES public.games(id) not valid;

alter table "public"."game_results" validate constraint "game_results_game_id_fkey";

alter table "public"."game_results" add constraint "game_results_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."game_results" validate constraint "game_results_user_id_fkey";

grant delete on table "public"."game_results" to "anon";

grant insert on table "public"."game_results" to "anon";

grant references on table "public"."game_results" to "anon";

grant select on table "public"."game_results" to "anon";

grant trigger on table "public"."game_results" to "anon";

grant truncate on table "public"."game_results" to "anon";

grant update on table "public"."game_results" to "anon";

grant delete on table "public"."game_results" to "authenticated";

grant insert on table "public"."game_results" to "authenticated";

grant references on table "public"."game_results" to "authenticated";

grant select on table "public"."game_results" to "authenticated";

grant trigger on table "public"."game_results" to "authenticated";

grant truncate on table "public"."game_results" to "authenticated";

grant update on table "public"."game_results" to "authenticated";

grant delete on table "public"."game_results" to "service_role";

grant insert on table "public"."game_results" to "service_role";

grant references on table "public"."game_results" to "service_role";

grant select on table "public"."game_results" to "service_role";

grant trigger on table "public"."game_results" to "service_role";

grant truncate on table "public"."game_results" to "service_role";

grant update on table "public"."game_results" to "service_role";


  create policy "users can insert own game results"
  on "public"."game_results"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "users can read own game results"
  on "public"."game_results"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



