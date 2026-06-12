alter table "public"."game_results"
add column "mock_exam_id" uuid;

alter table "public"."interview_sessions"
add column "mock_exam_id" uuid;

CREATE INDEX game_results_mock_exam_id_idx
ON public.game_results USING btree (mock_exam_id)
WHERE mock_exam_id IS NOT NULL;

CREATE INDEX interview_sessions_mock_exam_id_idx
ON public.interview_sessions USING btree (mock_exam_id)
WHERE mock_exam_id IS NOT NULL;
