alter table "public"."mock_exam_result_items"
drop constraint if exists "mock_exam_result_items_one_result_reference_check";

alter table "public"."mock_exam_result_items"
add constraint "mock_exam_result_items_one_result_reference_check"
check (
  ((game_result_id is not null) and (interview_session_id is null))
  or ((game_result_id is null) and (interview_session_id is not null))
  or ((game_result_id is null) and (interview_session_id is null))
) not valid;

alter table "public"."mock_exam_result_items"
validate constraint "mock_exam_result_items_one_result_reference_check";
