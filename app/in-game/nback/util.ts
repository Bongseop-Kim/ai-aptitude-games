import { NbackTrial, StageSummary } from "@/app/in-game/nback/types";

export const pickRandomIndex = (maxExclusive: number) =>
    Math.floor(Math.random() * maxExclusive);

export const getPreCount = (allowedOffsets: number[]) => {
    const offsetsWithoutZero = allowedOffsets.filter((offset) => offset > 0);
    return offsetsWithoutZero.length > 0 ? Math.max(...offsetsWithoutZero) : 1;
};

export const getCurrentSequenceIndex = ({
    questionIndex,
    preCountIndex,
    preCount,
}: {
    questionIndex: number;
    preCountIndex: number;
    preCount: number;
}) => {
    if (questionIndex === 0) {
        return preCountIndex;
    }
    return preCount + (questionIndex - 1);
};

export const getRemainingQuestions = ({
    isPreCountPhase,
    totalQuestions,
    questionIndex,
}: {
    isPreCountPhase: boolean;
    totalQuestions: number;
    questionIndex: number;
}) => (isPreCountPhase ? totalQuestions : totalQuestions - questionIndex);

export const getHeaderText = ({
    isPreCountPhase,
    commonHeader,
    stageHeader,
}: {
    isPreCountPhase: boolean;
    commonHeader: string;
    stageHeader: string;
}) => (isPreCountPhase ? commonHeader : stageHeader);

export const getIsPickerDisabled = ({
    phase,
    isAnswerLocked,
}: {
    phase: "countdown" | "preCount" | "playing" | "rest" | "finished";
    isAnswerLocked: boolean;
}) =>
    phase === "preCount" ||
    phase === "rest" ||
    phase === "countdown" ||
    phase === "finished" ||
    isAnswerLocked;

export const generateShapeSequence = (
    totalQuestions: number,
    allowedOffsets: number[],
    preCount: number,
    shapePoolSize: number
) => {
    const positiveOffsets = allowedOffsets.filter((offset) => offset > 0);
    const allowedWithZero = [0, ...positiveOffsets];
    const totalLength = preCount + totalQuestions;
    const shapeSequence = new Array<number>(totalLength);
    const correctAnswers = new Array<number>(totalQuestions);

    for (let i = 0; i < preCount; i += 1) {
        shapeSequence[i] = pickRandomIndex(shapePoolSize);
    }

    for (let q = 0; q < totalQuestions; q += 1) {
        const i = preCount + q;
        const answer = allowedWithZero[pickRandomIndex(allowedWithZero.length)];
        correctAnswers[q] = answer;

        if (answer > 0) {
            shapeSequence[i] = shapeSequence[i - answer];
            continue;
        }

        const disallowed = new Set<number>();
        for (let idx = 0; idx < positiveOffsets.length; idx += 1) {
            const offset = positiveOffsets[idx];
            disallowed.add(shapeSequence[i - offset]);
        }

        if (disallowed.size === 0 || disallowed.size >= shapePoolSize) {
            shapeSequence[i] = pickRandomIndex(shapePoolSize);
            continue;
        }

        const candidates = [];
        for (let idx = 0; idx < shapePoolSize; idx += 1) {
            if (!disallowed.has(idx)) {
                candidates.push(idx);
            }
        }

        shapeSequence[i] = candidates[pickRandomIndex(candidates.length)];
    }

    return { shapeSequence, correctAnswers };
};

export const summarizeStageTrials = (
    stageIndex: number,
    totalQuestions: number,
    allowedOffsets: number[],
    trials: NbackTrial[]
): StageSummary => {
    let correctCount = 0;
    let rtSum = 0;
    let rtCount = 0;
    const perOffsetRt: Record<number, { sum: number; count: number }> = {};
    const perOffset: StageSummary["perOffset"] = {};
    const offsets = [0, ...allowedOffsets.filter((offset) => offset > 0)];

    for (let idx = 0; idx < offsets.length; idx += 1) {
        perOffset[offsets[idx]] = { total: 0, correct: 0, avgRtMs: null };
        perOffsetRt[offsets[idx]] = { sum: 0, count: 0 };
    }

    for (let idx = 0; idx < trials.length; idx += 1) {
        const trial = trials[idx];
        const bucket = perOffset[trial.correctAnswer];
        if (bucket) {
            bucket.total += 1;
            if (trial.isCorrect) {
                bucket.correct += 1;
            }
            if (trial.rtMs !== undefined) {
                perOffsetRt[trial.correctAnswer].sum += trial.rtMs;
                perOffsetRt[trial.correctAnswer].count += 1;
            }
        }

        if (trial.isCorrect) {
            correctCount += 1;
        }
        if (trial.rtMs !== undefined) {
            rtSum += trial.rtMs;
            rtCount += 1;
        }
    }

    for (const key of Object.keys(perOffset)) {
        const offset = Number(key);
        const bucket = perOffset[offset];
        const offsetRt = perOffsetRt[offset];
        bucket.avgRtMs =
            offsetRt.count > 0 ? Math.round(offsetRt.sum / offsetRt.count) : null;
    }

    return {
        stageIndex,
        totalQuestions,
        correctCount,
        accuracy: totalQuestions > 0 ? correctCount / totalQuestions : 0,
        avgRtMs: rtCount > 0 ? Math.round(rtSum / rtCount) : null,
        perOffset,
    };
};
