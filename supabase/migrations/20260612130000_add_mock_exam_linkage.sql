alter table "public"."game_results"
add column "mock_exam_id" uuid;

alter table "public"."interview_sessions"
add column "mock_exam_id" uuid;

alter table "public"."game_results"
add constraint "game_results_mock_exam_id_fkey"
FOREIGN KEY (mock_exam_id) REFERENCES public.mock_exam_results(id) ON DELETE RESTRICT not valid;

alter table "public"."game_results"
validate constraint "game_results_mock_exam_id_fkey";

alter table "public"."interview_sessions"
add constraint "interview_sessions_mock_exam_id_fkey"
FOREIGN KEY (mock_exam_id) REFERENCES public.mock_exam_results(id) ON DELETE RESTRICT not valid;

alter table "public"."interview_sessions"
validate constraint "interview_sessions_mock_exam_id_fkey";

CREATE INDEX game_results_mock_exam_id_idx
ON public.game_results USING btree (mock_exam_id)
WHERE mock_exam_id IS NOT NULL;

CREATE INDEX interview_sessions_mock_exam_id_idx
ON public.interview_sessions USING btree (mock_exam_id)
WHERE mock_exam_id IS NOT NULL;
