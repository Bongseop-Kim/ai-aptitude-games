import { Offset, Tier } from "@/types/nback/rule";
import { PerformancePattern } from "@/types/nback/template";

export type PerOffsetStat = {
    total: number;
    correct: number;
    avgRtMs: number;
};



export type SessionFeedback = {
    headline: string;
    summaryLines: string[];
    highlights: string[]; // strengths + weaknesses
    tip: string;
    debug: {
        overallTier: Tier;
        avgRtMs: number;
        bestOffset?: Offset;
        weakOffset?: Offset;
        pattern?: PerformancePattern;
    };
};