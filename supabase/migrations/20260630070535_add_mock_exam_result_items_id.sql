alter table "public"."mock_exam_result_items"
add column "id" uuid;

update "public"."mock_exam_result_items"
set "id" = gen_random_uuid()
where "id" is null;

alter table "public"."mock_exam_result_items"
alter column "id" set not null;

alter table "public"."mock_exam_result_items"
drop constraint if exists "mock_exam_result_items_pkey";

alter table "public"."mock_exam_result_items"
add constraint "mock_exam_result_items_pkey" primary key ("id");

alter table "public"."mock_exam_result_items"
add constraint "mock_exam_result_items_mock_exam_id_item_key_key"
unique ("mock_exam_id", "item_key");
