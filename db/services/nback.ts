import { db } from "@/db/client";
import { sessions, stageOffsets, stages, trials } from "@/db/schema/nback";
import {
  NbackHistoryHeaderData,
  NbackHistoryItem,
  StageSummary,
  saveNbackGameDataParams,
} from "@/types/nback/nback";
import { and, asc, desc, eq, gte, inArray, lt, sql } from "drizzle-orm";

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

export const getStagesBySessionId = async (
  sessionId: number
): Promise<StageSummary[]> => {
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
    const perOffset: Record<
      number,
      { total: number; correct: number; avgRtMs: number | null }
    > = {};

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

const toDayStart = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;

export const getNbackHistoryHeaderData = async (
  sessionType?: "practice" | "real"
): Promise<NbackHistoryHeaderData> => {
  const now = new Date();
  const startOfToday = toDayStart(now);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const startOfSevenDays = new Date(startOfToday);
  startOfSevenDays.setDate(startOfSevenDays.getDate() - 6);

  const typeCondition = sessionType
    ? eq(sessions.type, sessionType)
    : undefined;

  const fetchAvgAccuracy = async (start: Date, end: Date) => {
    const [row] = await db
      .select({
        avgAccuracy: sql<number>`avg(${stages.accuracy})`,
        count: sql<number>`count(${stages.id})`,
      })
      .from(stages)
      .innerJoin(sessions, eq(stages.sessionId, sessions.id))
      .where(
        and(
          typeCondition,
          gte(sessions.createdAt, start),
          lt(sessions.createdAt, end)
        )
      );

    return {
      avgAccuracy: row?.avgAccuracy ?? 0,
      count: row?.count ?? 0,
    };
  };

  const fetchTotalPlays = async () => {
    const baseQuery = db
      .select({ totalPlays: sql<number>`count(*)` })
      .from(sessions);
    return typeCondition ? baseQuery.where(typeCondition) : baseQuery;
  };

  const fetchSessionDates = async () => {
    const baseQuery = db
      .select({ createdAt: sessions.createdAt })
      .from(sessions)
      .orderBy(asc(sessions.createdAt));
    return typeCondition ? baseQuery.where(typeCondition) : baseQuery;
  };

  const [
    todayStats,
    yesterdayStats,
    sevenDayStats,
    totalPlaysRow,
    sessionDates,
  ] = await Promise.all([
    fetchAvgAccuracy(startOfToday, startOfTomorrow),
    fetchAvgAccuracy(startOfYesterday, startOfToday),
    fetchAvgAccuracy(startOfSevenDays, startOfTomorrow),
    fetchTotalPlays(),
    fetchSessionDates(),
  ]);

  const dateKeys = new Set<string>();
  for (const row of sessionDates) {
    if (row.createdAt == null) continue;
    const raw =
      row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt);
    dateKeys.add(toDateKey(raw));
  }

  const dayStarts = Array.from(dateKeys)
    .map((key) => {
      const [year, month, day] = key.split("-").map(Number);
      return new Date(year, month - 1, day).getTime();
    })
    .sort((a, b) => a - b);

  let bestStreak = 0;
  let currentStreak = 0;
  const dayMs = 24 * 60 * 60 * 1000;
  for (let i = 0; i < dayStarts.length; i += 1) {
    if (i === 0 || dayStarts[i] - dayStarts[i - 1] === dayMs) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }
    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }
  }

  const trend =
    todayStats.count === 0 || yesterdayStats.count === 0
      ? "same"
      : todayStats.avgAccuracy > yesterdayStats.avgAccuracy
      ? "up"
      : todayStats.avgAccuracy < yesterdayStats.avgAccuracy
      ? "down"
      : "same";

  return {
    todayAvgAccuracy: todayStats.avgAccuracy,
    sevenDayAvgAccuracy: sevenDayStats.avgAccuracy,
    bestStreakDays: bestStreak,
    totalPlays: totalPlaysRow?.[0]?.totalPlays ?? 0,
    trend,
  };
};

export const getNbackHistoryList = async (
  sessionType?: "practice" | "real"
): Promise<NbackHistoryItem[]> => {
  const typeCondition = sessionType
    ? eq(sessions.type, sessionType)
    : undefined;

  const sessionRows = await db
    .select({
      id: sessions.id,
      type: sessions.type,
      createdAt: sessions.createdAt,
    })
    .from(sessions)
    .where(typeCondition)
    .orderBy(desc(sessions.createdAt));

  if (sessionRows.length === 0) {
    return [];
  }

  const sessionIds = sessionRows.map((s) => s.id);

  // 각 세션의 전체 정답 수와 문제 수 계산
  const stageStats = await db
    .select({
      sessionId: stages.sessionId,
      correctCount: sql<number>`sum(${stages.correctCount})`,
      totalQuestions: sql<number>`sum(${stages.totalQuestions})`,
    })
    .from(stages)
    .where(inArray(stages.sessionId, sessionIds))
    .groupBy(stages.sessionId);

  const statsMap = new Map<
    number,
    { correctCount: number; totalQuestions: number }
  >();
  for (const stat of stageStats) {
    if (stat.sessionId !== null) {
      statsMap.set(stat.sessionId, {
        correctCount: stat.correctCount ?? 0,
        totalQuestions: stat.totalQuestions ?? 0,
      });
    }
  }

  return sessionRows.map((session) => {
    const stats = statsMap.get(session.id) ?? {
      correctCount: 0,
      totalQuestions: 0,
    };
    return {
      id: session.id,
      type: session.type,
      createdAt:
        session.createdAt instanceof Date
          ? session.createdAt
          : new Date(session.createdAt),
      correctCount: stats.correctCount,
      totalQuestions: stats.totalQuestions,
    };
  });
};
