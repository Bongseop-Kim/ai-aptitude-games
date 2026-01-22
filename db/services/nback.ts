import { db } from "@/db/client";
import { sessions, stageOffsets, stages, trials } from "@/db/schema/nback";
import { StageSummary, saveNbackGameDataParams } from "@/types/nback/nback";
import { asc, eq, inArray } from "drizzle-orm";

export const saveNbackGameData = async ({
  summaryList,
  trialsList,
  type,
}: saveNbackGameDataParams): Promise<number> => {
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

export const getStagesBySessionId = async (sessionId: number): Promise<StageSummary[]> => {
  const stageRows = await db
    .select()
    .from(stages)
    .where(eq(stages.sessionId, sessionId))
    .orderBy(asc(stages.stageIndex));

  if (stageRows.length === 0) {
    return [];
  }

  const stageIds = stageRows.map((s) => s.id);

  // 모든 stage에 대한 offset 데이터 한 번에 가져오기
  const allOffsetRows = await db
    .select()
    .from(stageOffsets)
    .where(inArray(stageOffsets.stageId, stageIds));

  // stageId별로 offset 데이터 그룹화
  const offsetsByStageId = new Map<number, typeof allOffsetRows>();
  for (const offset of allOffsetRows) {
    if (offset.stageId !== null) {
      const existing = offsetsByStageId.get(offset.stageId) || [];
      existing.push(offset);
      offsetsByStageId.set(offset.stageId, existing);
    }
  }

  // StageSummary 형식으로 변환
  return stageRows.map((stage) => {
    const offsets = offsetsByStageId.get(stage.id) || [];
    const perOffset: Record<number, { total: number; correct: number; avgRtMs: number | null }> = {};

    for (const offset of offsets) {
      perOffset[offset.offsetN] = {
        total: offset.totalCount,
        correct: offset.correctCount,
        avgRtMs: offset.avgRtMs,
      };
    }

    return {
      stageIndex: stage.stageIndex,
      totalQuestions: stage.totalQuestions,
      correctCount: stage.correctCount,
      accuracy: stage.accuracy,
      avgRtMs: stage.avgRtMs,
      perOffset,
    };
  });
};
