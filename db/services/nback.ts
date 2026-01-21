import { db } from "@/db/client";
import { sessions, stageOffsets, stages, trials } from "@/db/schema/nback";
import { saveNbackGameDataParams } from "@/types/nback/nback";

export const saveNbackGameData = async ({
  summaryList,
  trialsList,
  type,
}: saveNbackGameDataParams) => {
  return db.transaction(async (tx) => {
    // 1. 세션 생성
    const [session] = await tx.insert(sessions).values({ type }).returning();

    for (const summary of summaryList) {
      // 2. 스테이지 저장
      const [stage] = await tx
        .insert(stages)
        .values({
          sessionId: session.id,
          stageIndex: summary.stageIndex,
          accuracy: summary.accuracy,
          avgRtMs: summary.avgRtMs,
          correctCount: summary.correctCount,
          totalQuestions: summary.totalQuestions,
        })
        .returning();

      // 3. 오프셋별 통계 저장 (perOffset 객체 순회)
      for (const [n, data] of Object.entries(summary.perOffset)) {
        const offsetData = data as {
          total: number;
          correct: number;
          avgRtMs: number | null;
        };
        const totalCount = offsetData.total ?? 0;
        await tx.insert(stageOffsets).values({
          stageId: stage.id,
          offsetN: parseInt(n),
          avgRtMs: offsetData.avgRtMs,
          correctCount: offsetData.correct,
          totalCount,
          accuracy: totalCount > 0 ? offsetData.correct / totalCount : 0,
        });
      }

      // 4. 개별 trial 저장
      const stageTrials = trialsList.filter(
        (trial) => trial.stageIndex === summary.stageIndex
      );
      if (stageTrials.length > 0) {
        await tx.insert(trials).values(
          stageTrials.map((trial) => ({
            stageId: stage.id,
            trialIndex: trial.trialIndex,
            offsetN: trial.correctAnswer,
            isCorrect: trial.isCorrect,
            rtMs: trial.rtMs ?? null,
            shownShapeId: trial.shownShapeId,
          }))
        );
      }
    }

    return session.id;
  });
};
