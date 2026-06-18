alter table "public"."game_result_rounds"
add column "difficulty" integer not null default 50;

alter table "public"."game_result_rounds"
add constraint "game_result_rounds_difficulty_range_check"
check ("difficulty" between 0 and 100) not valid;

alter table "public"."game_result_rounds"
validate constraint "game_result_rounds_difficulty_range_check";
