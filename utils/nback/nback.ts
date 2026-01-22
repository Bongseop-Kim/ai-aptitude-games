import { NbackTrial, StageSummary } from "@/types/nback/nback";

export const pickRandomIndex = (maxExclusive: number) =>
    Math.floor(Math.random() * maxExclusive);

export const getPreCount = (allowedOffsets: number[]) => {
    const offsetsWithoutZero = allowedOffsets.filter((offset) => offset > 0);
    return offsetsWithoutZero.length > 0 ? Math.max(...offsetsWithoutZero) : 1;
};

const isMultiNbackAnswer = (
    shapeSequence: number[],
    index: number,
    answerOffset: number,
    positiveOffsets: number[]
) => {
    const answerValue = shapeSequence[index - answerOffset];
    for (let idx = 0; idx < positiveOffsets.length; idx += 1) {
        const offset = positiveOffsets[idx];
        if (offset === answerOffset) {
            continue;
        }
        if (shapeSequence[index - offset] === answerValue) {
            return true;
        }
    }
    return false;
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

const pickShapeAvoidingTriple = (
    shapeSequence: number[],
    index: number,
    shapePoolSize: number
) => {
    if (shapePoolSize <= 1) {
        return 0;
    }
    if (index < 2) {
        return pickRandomIndex(shapePoolSize);
    }
    const prev1 = shapeSequence[index - 1];
    const prev2 = shapeSequence[index - 2];
    if (prev1 !== prev2) {
        return pickRandomIndex(shapePoolSize);
    }
    let pick = pickRandomIndex(shapePoolSize - 1);
    if (pick >= prev1) {
        pick += 1;
    }
    return pick;
};

const getAvoidTripleValue = (shapeSequence: number[], index: number) => {
    if (index < 2) {
        return -1;
    }
    const prev1 = shapeSequence[index - 1];
    const prev2 = shapeSequence[index - 2];
    return prev1 === prev2 ? prev1 : -1;
};

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
    const disallowedMarks = new Int32Array(shapePoolSize);
    let mark = 1;

    for (let i = 0; i < preCount; i += 1) {
        shapeSequence[i] = pickShapeAvoidingTriple(
            shapeSequence,
            i,
            shapePoolSize
        );
    }

    for (let q = 0; q < totalQuestions; q += 1) {
        const i = preCount + q;
        const avoidTripleValue = getAvoidTripleValue(shapeSequence, i);
        const hasTripleGuard = avoidTripleValue !== -1;
        const maxRetries = allowedWithZero.length * 2;
        let answer = 0;
        let accepted = false;

        for (let attempt = 0; attempt < maxRetries; attempt += 1) {
            const picked = allowedWithZero[pickRandomIndex(allowedWithZero.length)];
            if (picked === 0) {
                answer = 0;
                accepted = true;
                break;
            }
            const candidate = shapeSequence[i - picked];
            if (
                (!hasTripleGuard || candidate !== avoidTripleValue) &&
                !isMultiNbackAnswer(shapeSequence, i, picked, positiveOffsets)
            ) {
                answer = picked;
                correctAnswers[q] = answer;
                shapeSequence[i] = candidate;
                accepted = true;
                break;
            }
        }

        if (accepted && answer > 0) {
            continue;
        }

        correctAnswers[q] = answer;

        if (mark === 0) {
            disallowedMarks.fill(0);
            mark = 1;
        } else {
            mark += 1;
        }

        for (let idx = 0; idx < positiveOffsets.length; idx += 1) {
            const offset = positiveOffsets[idx];
            disallowedMarks[shapeSequence[i - offset]] = mark;
        }

        let pick = -1;
        let eligible = 0;
        for (let idx = 0; idx < shapePoolSize; idx += 1) {
            if (idx === avoidTripleValue) {
                continue;
            }
            if (disallowedMarks[idx] === mark) {
                continue;
            }
            eligible += 1;
            if (pick === -1 || Math.random() < 1 / eligible) {
                pick = idx;
            }
        }

        if (pick === -1) {
            eligible = 0;
            for (let idx = 0; idx < shapePoolSize; idx += 1) {
                if (idx === avoidTripleValue) {
                    continue;
                }
                eligible += 1;
                if (pick === -1 || Math.random() < 1 / eligible) {
                    pick = idx;
                }
            }
        }

        shapeSequence[i] =
            pick === -1
                ? pickShapeAvoidingTriple(shapeSequence, i, shapePoolSize)
                : pick;
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
