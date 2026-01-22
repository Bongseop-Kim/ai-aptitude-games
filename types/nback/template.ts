import { Offset, Tier } from "@/types/nback/rule";

export type PerformancePattern =
    | "performanceDecline"      // 초반 좋고 후반 나쁨
    | "performanceImprovement"   // 초반 나쁘고 후반 좋음
    | "singleStageFailure"      // 한 스테이지에서 크게 실패
    | "inconsistent"            // 일관성 없이 오르내림
    | "stable";                 // 안정적

export type TemplateKey =
    | "headline"
    | "summary"
    | "strength"
    | "weakness"
    | "tip";

export type Templates = Record<
    TemplateKey,
    {
        byTier?: Record<Tier, string[]>;
        byOffset?: Partial<Record<Offset, string[]>>;
        byPattern?: Partial<Record<PerformancePattern, string[]>>;
        generic?: string[];
        noResponse?: string[];
    }
>;