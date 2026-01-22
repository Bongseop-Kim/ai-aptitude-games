import { Offset } from "@/types/nback/rule";

export const RULES = {
    accuracyTier: {
        excellent: 0.85,
        good: 0.7,
        ok: 0.55,
    } as const,

    rtTierMs: {
        fast: 1600,
        normal: 2000,
    } as const,

    // "어려운 오프셋" 판단 기준
    hardOffset: 3 as Offset,

    // 한 문장 피드백을 만들기 위한 최소 표본
    minQuestionsPerBucket: 2,
};