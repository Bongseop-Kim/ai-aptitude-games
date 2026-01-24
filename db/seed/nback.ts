import { db } from "@/db/client";
import { sessions, stageOffsets, stages, trials } from "@/db/schema/nback";
import type {
  NbackTrial,
  StageSummary,
  saveNbackGameDataParams,
} from "@/types/nback/nback";

type SeedOffset = {
  total: number;
  correct: number;
  avgRtMs: number | null;
};

type SeedStageInput = {
  stageIndex: number;
  perOffset: Record<number, SeedOffset>;
};

type SeedSessionInput = {
  type: saveNbackGameDataParams["type"];
  createdAt: Date;
  stages: SeedStageInput[];
};

export type SeedNbackOptions = {
  reset?: boolean;
  now?: Date;
};

const dayMs = 24 * 60 * 60 * 1000;

const buildTrials = (
  stageIndex: number,
  perOffset: Record<number, SeedOffset>
): NbackTrial[] => {
  const shapeIds = [
    "variant-1",
    "variant-2",
    "variant-3",
    "variant-4",
    "variant-5",
    "variant-6",
    "variant-7",
    "variant-8",
  ];

  const trialsSeed: NbackTrial[] = [];

  let trialIndex = 0;
  const offsets = Object.keys(perOffset)
    .map((key) => Number(key))
    .sort((a, b) => a - b);

  for (const offsetN of offsets) {
    const seed = perOffset[offsetN];
    for (let i = 0; i < seed.total; i += 1) {
      const isCorrect = i < seed.correct;
      const baseRt = seed.avgRtMs ?? 0;
      const rtMs =
        seed.avgRtMs == null
          ? null
          : Math.max(200, baseRt + (isCorrect ? -60 : 80) + (i % 3) * 15);
      trialsSeed.push({
        stageIndex,
        trialIndex,
        correctAnswer: offsetN,
        isCorrect,
        rtMs: rtMs ?? undefined,
        shownShapeId: shapeIds[trialIndex % shapeIds.length],
      });
      trialIndex += 1;
    }
  }

  return trialsSeed;
};

const summarizeStage = (input: SeedStageInput): StageSummary => {
  const offsets = Object.values(input.perOffset);
  const totalQuestions = offsets.reduce((sum, o) => sum + o.total, 0);
  const correctCount = offsets.reduce((sum, o) => sum + o.correct, 0);
  const accuracy = totalQuestions > 0 ? correctCount / totalQuestions : 0;

  const avgRtMs = (() => {
    let totalRt = 0;
    let totalCount = 0;
    for (const offset of offsets) {
      if (offset.avgRtMs == null) continue;
      totalRt += offset.avgRtMs * offset.total;
      totalCount += offset.total;
    }
    return totalCount > 0 ? Math.round(totalRt / totalCount) : null;
  })();

  return {
    stageIndex: input.stageIndex,
    totalQuestions,
    correctCount,
    accuracy,
    avgRtMs,
    perOffset: input.perOffset,
  };
};

export const seedNback = async (
  options: SeedNbackOptions = {}
): Promise<number[]> => {
  const now = options.now ?? new Date();
  const sessionsSeed: SeedSessionInput[] = [
    {
      type: "practice",
      createdAt: new Date(now.getTime() - 5 * dayMs),
      stages: [
        {
          stageIndex: 0,
          perOffset: {
            0: { total: 12, correct: 10, avgRtMs: 920 },
          },
        },
        {
          stageIndex: 1,
          perOffset: {
            0: { total: 12, correct: 9, avgRtMs: 980 },
            2: { total: 12, correct: 7, avgRtMs: 1100 },
          },
        },
      ],
    },
    {
      type: "real",
      createdAt: new Date(now.getTime() - 2 * dayMs),
      stages: [
        {
          stageIndex: 0,
          perOffset: {
            0: { total: 10, correct: 9, avgRtMs: 850 },
          },
        },
        {
          stageIndex: 1,
          perOffset: {
            0: { total: 10, correct: 8, avgRtMs: 900 },
            2: { total: 10, correct: 6, avgRtMs: 1050 },
          },
        },
        {
          stageIndex: 2,
          perOffset: {
            0: { total: 12, correct: 8, avgRtMs: 980 },
            2: { total: 12, correct: 7, avgRtMs: 1150 },
            3: { total: 8, correct: 4, avgRtMs: 1250 },
          },
        },
      ],
    },
  ];

  if (options.reset) {
    await db.delete(trials);
    await db.delete(stageOffsets);
    await db.delete(stages);
    await db.delete(sessions);
  }

  const sessionIds: number[] = [];

  for (const sessionSeed of sessionsSeed) {
    await db.transaction(async (tx) => {
      const [session] = await tx
        .insert(sessions)
        .values({
          type: sessionSeed.type,
          createdAt: sessionSeed.createdAt,
        })
        .returning();

      for (const stageSeed of sessionSeed.stages) {
        const summary = summarizeStage(stageSeed);
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

        const offsets = Object.entries(summary.perOffset).map(
          ([key, data]) => ({
            stageId: stage.id,
            offsetN: Number(key),
            avgRtMs: data.avgRtMs,
            correctCount: data.correct,
            totalCount: data.total,
            accuracy: data.total > 0 ? data.correct / data.total : 0,
          })
        );
        if (offsets.length > 0) {
          await tx.insert(stageOffsets).values(offsets);
        }

        const trialsSeed = buildTrials(
          stageSeed.stageIndex,
          stageSeed.perOffset
        );
        if (trialsSeed.length > 0) {
          await tx.insert(trials).values(
            trialsSeed.map((trial) => ({
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

      sessionIds.push(session.id);
    });
  }

  return sessionIds;
};
